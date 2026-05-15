export type ProtocolType =
  | 'ospf' | 'bgp' | 'rip' | 'static-route'
  | 'vlan' | 'stp' | 'acl' | 'nat' | 'dhcp';

export interface OSPFConfig {
  enabled: boolean;
  processId: number;
  routerId: string;
  areas: OSPFArea[];
  defaultOriginate?: boolean;
}

export interface OSPFArea {
  areaId: string;
  networks: OSPFNetwork[];
}

export interface OSPFNetwork {
  network: string;
  wildcard: string;
}

export interface BGPConfig {
  enabled: boolean;
  asn: number;
  routerId: string;
  neighbors: BGPNeighbor[];
  networks: BGPAdvertisedNetwork[];
}

export interface BGPNeighbor {
  ip: string;
  remoteAsn: number;
  updateSourceInterface?: string;
}

export interface BGPAdvertisedNetwork {
  network: string;
  mask: string;
}

export interface RIPConfig {
  enabled: boolean;
  version: 1 | 2;
  networks: string[];
}

export interface StaticRoute {
  id: string;
  destination: string;
  mask: string;
  nextHop: string;
  interface?: string;
  metric?: number;
}

export interface VLANConfig {
  enabled: boolean;
  vlans: VLAN[];
}

export interface VLAN {
  vlanId: number;
  name: string;
  subnet?: string;
  gateway?: string;
}

export interface ACLConfig {
  enabled: boolean;
  acls: ACL[];
}

export interface ACL {
  aclNumber: number;
  name?: string;
  rules: AclRule[];
  appliedDirection?: 'in' | 'out';
  appliedInterface?: string;
}

export interface AclRule {
  id: string;
  sequence: number;
  action: 'permit' | 'deny';
  protocol: 'ip' | 'tcp' | 'udp' | 'icmp';
  srcIp: string;
  srcWildcard: string;
  dstIp: string;
  dstWildcard: string;
  srcPort?: number;
  dstPort?: number;
}

export interface NATConfig {
  enabled: boolean;
  type: 'static' | 'dynamic' | 'pat';
  insideInterfaces: string[];
  outsideInterface: string;
  aclNumber?: number;
  poolStart?: string;
  poolEnd?: string;
  staticMappings: StaticNATMapping[];
}

export interface StaticNATMapping {
  insideIp: string;
  outsideIp: string;
}

export interface DHCPConfig {
  enabled: boolean;
  poolName: string;
  network: string;
  mask: string;
  gateway: string;
  dnsServers: string[];
  leaseDays?: number;
  excludedIps?: string[];
}

export interface STPConfig {
  enabled: boolean;
  mode: 'stp' | 'rstp' | 'mstp';
  priority?: number;
  rootPrimary?: boolean;
}

export interface DeviceProtocols {
  ospf?: OSPFConfig;
  bgp?: BGPConfig;
  rip?: RIPConfig;
  staticRoutes?: StaticRoute[];
  vlans?: VLANConfig;
  acls?: ACLConfig;
  nat?: NATConfig;
  dhcp?: DHCPConfig;
  stp?: STPConfig;
}
