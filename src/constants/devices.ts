import type { DeviceCategory, DeviceInterface } from '../types';

interface DeviceDefaults {
  interfaces: Omit<DeviceInterface, 'id'>[];
  defaultModel: Record<string, string>; // vendor -> model
  defaultHostnamePrefix: string;
}

export const DEVICE_DEFAULTS: Record<DeviceCategory, DeviceDefaults> = {
  router: {
    defaultHostnamePrefix: 'R',
    defaultModel: {
      huawei: 'AR2220',
      h3c: 'MSR36-20',
      cisco: 'ISR4331',
      ruijie: 'RSR30-X',
    },
    interfaces: [
      { name: 'GigabitEthernet0/0/1', type: 'ethernet', status: 'up' },
      { name: 'GigabitEthernet0/0/2', type: 'ethernet', status: 'up' },
      { name: 'Serial0/0/0', type: 'serial', status: 'up' },
      { name: 'Serial0/0/1', type: 'serial', status: 'up' },
    ],
  },
  switch: {
    defaultHostnamePrefix: 'SW',
    defaultModel: {
      huawei: 'S5735-L24P4X',
      h3c: 'S5560X-30C-EI',
      cisco: 'Catalyst 9200L',
      ruijie: 'RG-S2910-24GT4XS-E',
    },
    interfaces: [
      { name: 'GigabitEthernet0/0/1', type: 'ethernet', status: 'up' },
      { name: 'GigabitEthernet0/0/2', type: 'ethernet', status: 'up' },
      { name: 'GigabitEthernet0/0/3', type: 'ethernet', status: 'up' },
      { name: 'GigabitEthernet0/0/4', type: 'ethernet', status: 'up' },
      { name: 'XGigabitEthernet0/0/1', type: 'fiber', status: 'up' },
      { name: 'XGigabitEthernet0/0/2', type: 'fiber', status: 'up' },
    ],
  },
  firewall: {
    defaultHostnamePrefix: 'FW',
    defaultModel: {
      huawei: 'USG6630E',
      h3c: 'SecPath F1000-AI',
      cisco: 'Firepower 2110',
      ruijie: 'RG-Wall 1600',
    },
    interfaces: [
      { name: 'GigabitEthernet1/0/0', type: 'ethernet', status: 'up' },
      { name: 'GigabitEthernet1/0/1', type: 'ethernet', status: 'up' },
      { name: 'GigabitEthernet1/0/2', type: 'ethernet', status: 'up' },
      { name: 'GigabitEthernet1/0/3', type: 'ethernet', status: 'up' },
      { name: 'Management0/0/0', type: 'management', status: 'up' },
    ],
  },
  'access-controller': {
    defaultHostnamePrefix: 'AC',
    defaultModel: {
      huawei: 'AC6805',
      h3c: 'WX5540H',
      cisco: 'Catalyst 9800-L',
      ruijie: 'RG-WS7204-A',
    },
    interfaces: [
      { name: 'GigabitEthernet0/0/1', type: 'ethernet', status: 'up' },
      { name: 'GigabitEthernet0/0/2', type: 'ethernet', status: 'up' },
    ],
  },
  'access-point': {
    defaultHostnamePrefix: 'AP',
    defaultModel: {
      huawei: 'AP7060DN',
      h3c: 'WA6638',
      cisco: 'Catalyst 9130AXI',
      ruijie: 'RG-AP880-I',
    },
    interfaces: [
      { name: 'GigabitEthernet0/0/0', type: 'ethernet', status: 'up' },
    ],
  },
  pc: {
    defaultHostnamePrefix: 'PC',
    defaultModel: {
      huawei: 'PC',
      h3c: 'PC',
      cisco: 'PC',
      ruijie: 'PC',
    },
    interfaces: [
      { name: 'Ethernet0/0/0', type: 'ethernet', status: 'up' },
    ],
  },
  server: {
    defaultHostnamePrefix: 'Server',
    defaultModel: {
      huawei: 'Server',
      h3c: 'Server',
      cisco: 'Server',
      ruijie: 'Server',
    },
    interfaces: [
      { name: 'Ethernet0/0/0', type: 'ethernet', status: 'up' },
      { name: 'Ethernet0/0/1', type: 'ethernet', status: 'up' },
    ],
  },
  cloud: {
    defaultHostnamePrefix: 'Cloud',
    defaultModel: {
      huawei: 'Internet',
      h3c: 'Internet',
      cisco: 'Internet',
      ruijie: 'Internet',
    },
    interfaces: [
      { name: 'GigabitEthernet0/0/0', type: 'ethernet', status: 'up' },
      { name: 'GigabitEthernet0/0/1', type: 'ethernet', status: 'up' },
      { name: 'Serial0/0/0', type: 'serial', status: 'up' },
      { name: 'Serial0/0/1', type: 'serial', status: 'up' },
    ],
  },
};

export const DEVICE_LABELS: Record<DeviceCategory, string> = {
  router: '路由器',
  switch: '交换机',
  firewall: '防火墙',
  'access-controller': 'AC 控制器',
  'access-point': 'AP 接入点',
  pc: 'PC',
  server: 'Server',
  cloud: 'Cloud',
};

export const DEVICE_ICONS: Record<DeviceCategory, string> = {
  router: 'Router',
  switch: 'ArrowLeftRight',
  firewall: 'Shield',
  'access-controller': 'RadioTower',
  'access-point': 'Wifi',
  pc: 'Monitor',
  server: 'Server',
  cloud: 'Cloud',
};
