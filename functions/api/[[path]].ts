// Added type reference for Cloudflare Workers/Pages environment to fix missing type definitions for KVNamespace and PagesFunction
/// <reference types="@cloudflare/workers-types" />

interface Env {
  CONFIG_KV: KVNamespace;
  PASSWORD?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const pathParts = params.path as string[] || [];
  const fullPath = `/${pathParts.join('/')}`;

  // 1. Auth Interface
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

  // 2. Config Management
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

  // 3. Cloudflare Proxy Logic
  if (fullPath.startsWith('/cf/')) {
    const cfPath = fullPath.replace('/cf/', '');
    const pagesToken = request.headers.get('X-Pages-Token');
    const zoneToken = request.headers.get('X-Zone-Token');
    const accountId = request.headers.get('X-Account-Id');

    if (!pagesToken) return jsonErr('Missing Pages Token', 401);

    // Dynamic routing for Pages API
    // Handle POST domain (Add Domain + DNS)
    if (cfPath.match(/accounts\/[^\/]+\/pages\/projects\/[^\/]+\/domains$/) && request.method === 'POST') {
      const body = await request.json() as any;
      const domainName = body.name;
      const [, , accId, , , projectName] = cfPath.split('/');

      // Add to Pages
      const addResp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId || accId}/pages/projects/${projectName}/domains`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${pagesToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: domainName })
      });
      const addData = await addResp.json() as any;

      if (addData.success && zoneToken) {
        // Find Zone and Add DNS
        try {
          const zoneName = await findParentZone(domainName, zoneToken);
          if (zoneName) {
            const zonesResp = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${zoneName}`, {
              headers: { 'Authorization': `Bearer ${zoneToken}` }
            });
            const zonesData = await zonesResp.json() as any;
            if (zonesData.success && zonesData.result?.length > 0) {
              const zoneId = zonesData.result[0].id;
              const dnsResp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
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
              const dnsData = await dnsResp.json() as any;
              addData.dns_created = dnsData.success;
            }
          }
        } catch (e) {}
      }
      return new Response(JSON.stringify(addData), { headers: { 'Content-Type': 'application/json' } });
    }

    // Handle DELETE domain
    if (cfPath.match(/accounts\/[^\/]+\/pages\/projects\/[^\/]+\/domains\/[^\/]+$/) && request.method === 'DELETE') {
      const [, , accId, , , projectName, , domain] = cfPath.split('/');
      const delResp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId || accId}/pages/projects/${projectName}/domains/${domain}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${pagesToken}` }
      });
      const delData = await delResp.json() as any;

      if (delData.success && zoneToken) {
        try {
          const zoneName = await findParentZone(domain, zoneToken);
          if (zoneName) {
            const zonesResp = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${zoneName}`, {
              headers: { 'Authorization': `Bearer ${zoneToken}` }
            });
            const zonesData = await zonesResp.json() as any;
            if (zonesData.success && zonesData.result?.length > 0) {
              const zoneId = zonesData.result[0].id;
              const dnsList = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${domain}&type=CNAME`, {
                headers: { 'Authorization': `Bearer ${zoneToken}` }
              });
              const dnsListData = await dnsList.json() as any;
              if (dnsListData.success && dnsListData.result?.length > 0) {
                const dnsId = dnsListData.result[0].id;
                const dnsDel = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${dnsId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${zoneToken}` }
                });
                const dnsDelData = await dnsDel.json() as any;
                delData.dns_deleted = dnsDelData.success;
              }
            }
          }
        } catch (e) {}
      }
      return new Response(JSON.stringify(delData), { headers: { 'Content-Type': 'application/json' } });
    }

    // Proxy everything else
    const resp = await fetch(`https://api.cloudflare.com/client/v4/${cfPath}`, {
      method: request.method,
      headers: { 'Authorization': `Bearer ${pagesToken}`, 'Content-Type': 'application/json' },
      body: request.method !== 'GET' ? await request.text() : undefined
    });
    return new Response(resp.body, { 
      status: resp.status, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  return jsonErr('Invalid API Route', 404);
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