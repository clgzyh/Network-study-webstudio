import type { DeviceCategory, ProtocolType } from '../types';

export const PROTOCOL_LABELS: Record<ProtocolType, string> = {
  ospf: 'OSPF 动态路由',
  bgp: 'BGP 边界网关',
  rip: 'RIP 动态路由',
  'static-route': '静态路由',
  vlan: 'VLAN 虚拟局域网',
  stp: 'STP 生成树',
  acl: 'ACL 访问控制',
  nat: 'NAT 地址转换',
  dhcp: 'DHCP 地址分配',
};

export const PROTOCOLS_BY_DEVICE: Record<DeviceCategory, ProtocolType[]> = {
  router: ['ospf', 'bgp', 'rip', 'static-route', 'nat', 'dhcp', 'acl'],
  switch: ['vlan', 'stp', 'acl', 'static-route'],
  firewall: ['acl', 'nat', 'static-route'],
  'access-controller': ['dhcp', 'vlan'],
  'access-point': [],
  pc: [],
  server: ['dhcp'],
  cloud: [],
};

export const SPEED_OPTIONS: Record<string, string[]> = {
  ethernet: ['100M', '1G'],
  serial: ['64K', '128K', '256K', '512K', '1M', '2M'],
  fiber: ['1G', '10G', '40G', '100G'],
};
