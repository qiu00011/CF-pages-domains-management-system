
export interface UserConfig {
  accountId: string;
  pagesToken: string;
  zoneToken: string;
  backgroundUrl: string;
  parentDomain: string;
  paths: Array<{ label: string; value: string }>;
}

export interface DomainInfo {
  name: string;
  status: 'active' | 'pending' | string;
}

export interface ProjectInfo {
  name: string;
  subdomain: string;
}

export enum Tab {
  Domains = 'domains',
  Generator = 'generator',
  Settings = 'settings'
}
