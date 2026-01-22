// Define Cloudflare Pages Types for development environment to fix compilation errors
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
}) => Promise<Response>;

interface Env {
  CONFIG_KV: KVNamespace;
  PASSWORD?: string;
}

// Fix: added PagesFunction type definition to resolve "Cannot find name" error on line 6
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const pathParts = params.path as string[] || [];
  const fullPath = `/${pathParts.join('/')}`;

  // 1. 认证接口
  if (fullPath === '/auth' && request.method === 'POST') {
    const { password } = await request.json() as any;
    const correctPassword = env.PASSWORD || 'admin';
    if (password === correctPassword) {
      return new Response(JSON.stringify({ success: true }), { 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    return new Response(JSON.stringify({ success: false }), { 
      status: 401, headers: { 'Content-Type': 'application/json' } 
    });
  }

  // 2. 配置同步
  if (fullPath === '/config') {
    if (request.method === 'POST') {
      const config = await request.json();
      await env.CONFIG_KV.put('user_config', JSON.stringify(config));
      return new Response(JSON.stringify({ success: true }), { 
        headers: { 'Content-Type': 'application/json' } 
      });
    } else {
      const configStr = await env.CONFIG_KV.get('user_config');
      return new Response(JSON.stringify({ success: true, config: configStr ? JSON.parse(configStr) : null }), { 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }

  // 3. Cloudflare 代理逻辑
  if (fullPath.startsWith('/cf/')) {
    const cfPath = fullPath.replace('/cf/', '');
    const pagesToken = request.headers.get('X-Pages-Token');
    const zoneToken = request.headers.get('X-Zone-Token');
    const accountId = request.headers.get('X-Account-Id');

    if (!pagesToken) return jsonErr('Missing API Tokens', 401);

    // 拦截域名添加：自动创建 DNS CNAME
    if (cfPath.includes('/domains') && request.method === 'POST') {
      const body = await request.json() as any;
      const domainName = body.name;
      const pathSegments = cfPath.split('/');
      const targetAccountId = accountId || pathSegments[1];
      const projectName = pathSegments[4];

      // Step 1: 绑定到 Pages
      const addResp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${targetAccountId}/pages/projects/${projectName}/domains`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${pagesToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: domainName })
      });
      const addData = await addResp.json() as any;

      // Step 2: 如果有 Zone Token，尝试自动创建 DNS 记录
      if (addData.success && zoneToken) {
        try {
          const zoneName = await findParentZone(domainName, zoneToken);
          if (zoneName) {
            const zonesResp = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${zoneName}`, {
              headers: { 'Authorization': `Bearer ${zoneToken}` }
            });
            const zonesData = await zonesResp.json() as any;
            if (zonesData.success && zonesData.result?.length > 0) {
              const zoneId = zonesData.result[0].id;
              await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${zoneToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'CNAME',
                  name: domainName,
                  content: `${projectName}.pages.dev`,
                  proxied: true,
                  ttl: 1
                })
              });
              addData.dns_auto_created = true;
            }
          }
        } catch (e) {}
      }
      return new Response(JSON.stringify(addData), { headers: { 'Content-Type': 'application/json' } });
    }

    // 基础代理
    const resp = await fetch(`https://api.cloudflare.com/client/v4/${cfPath}`, {
      method: request.method,
      headers: { 'Authorization': `Bearer ${pagesToken}`, 'Content-Type': 'application/json' },
      body: request.method !== 'GET' ? await request.text() : undefined
    });
    return new Response(resp.body, { status: resp.status, headers: { 'Content-Type': 'application/json' } });
  }

  return jsonErr('Not Found', 404);
};

async function findParentZone(domainName: string, zoneToken: string) {
  try {
    const resp = await fetch(`https://api.cloudflare.com/client/v4/zones`, {
      headers: { 'Authorization': `Bearer ${zoneToken}` }
    });
    const data = await resp.json() as any;
    if (data.success && data.result) {
      const zones = data.result.map((z: any) => z.name).sort((a: string, b: string) => b.length - a.length);
      for (const zone of zones) {
        if (domainName === zone || domainName.endsWith('.' + zone)) return zone;
      }
    }
  } catch (e) {}
  return null;
}

function jsonErr(msg: string, status: number) {
  return new Response(JSON.stringify({ success: false, error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}