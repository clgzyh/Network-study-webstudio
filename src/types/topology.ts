import type { Node, Edge } from '@xyflow/react';
import type { DeviceProtocols } from './protocols';

export type DeviceCategory =
  | 'router' | 'switch' | 'firewall'
  | 'access-controller' | 'access-point'
  | 'pc' | 'server' | 'cloud';

export type ConnectionMedia = 'ethernet' | 'serial' | 'fiber';

export interface DeviceInterface {
  id: string;
  name: string;
  type: 'ethernet' | 'serial' | 'fiber' | 'management' | 'vlan' | 'loopback';
  status: 'up' | 'down';
  ipAddress?: string;
  portMode?: 'access' | 'trunk' | 'hybrid';
  accessVlan?: number;
  trunkAllowedVlans?: number[];
  description?: string;
  connectedEdgeId?: string;
}

export interface DeviceNodeData {
  deviceType: DeviceCategory;
  hostname: string;
  label: string;
  model: string;
  interfaces: DeviceInterface[];
  protocols: DeviceProtocols;
  enablePassword?: string;
  banner?: string;
  notes?: string;
}

export type TopologyNode = Node<DeviceNodeData, 'device'>;

export interface ConnectionData {
  sourceDeviceId: string;
  targetDeviceId: string;
  sourceInterfaceId: string;
  targetInterfaceId: string;
  mediaType: ConnectionMedia;
  speed: string;
  label?: string;
  status: 'up' | 'down';
}

export type TopologyEdge = Edge<ConnectionData, 'connection'>;

export interface NetworkTopology {
  id: string;
  name: string;
  vendor: string;
  createdAt: string;
  updatedAt: string;
}
