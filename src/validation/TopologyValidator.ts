import type { TopologyNode, TopologyEdge, ValidationIssue } from '../types';
import { generateId } from '../utils/id';

export function validateTopology(nodes: TopologyNode[], edges: TopologyEdge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (nodes.length === 0) {
    issues.push({
      id: generateId(),
      severity: 'info',
      message: '拓扑为空，请从左侧拖入设备开始构建网络',
    });
    return issues;
  }

  for (const node of nodes) {
    const d = node.data;
    const connectedEdges = edges.filter((e) => e.source === node.id || e.target === node.id);

    // Check for devices with no connections
    if (connectedEdges.length === 0 && d.deviceType !== 'cloud') {
      issues.push({
        id: generateId(),
        severity: 'warning',
        message: `${d.hostname} 没有任何连接`,
        relatedDeviceId: node.id,
      });
    }

    // Check for unconfigured interfaces
    const configuredIfaces = d.interfaces.filter((i) => i.ipAddress);
    if (configuredIfaces.length === 0 && ['router', 'switch', 'firewall'].includes(d.deviceType)) {
      issues.push({
        id: generateId(),
        severity: 'warning',
        message: `${d.hostname} 没有配置任何IP地址`,
        relatedDeviceId: node.id,
      });
    }

    // Check for connected interfaces without IP
    for (const iface of d.interfaces) {
      if (iface.connectedEdgeId && !iface.ipAddress && ['router', 'switch', 'firewall'].includes(d.deviceType)) {
        issues.push({
          id: generateId(),
          severity: 'warning',
          message: `${d.hostname} 的接口 ${iface.name} 已连接但未配置IP`,
          relatedDeviceId: node.id,
        });
      }
    }

    // Check OSPF configuration
    if (d.protocols.ospf?.enabled) {
      if (d.protocols.ospf.areas.length === 0) {
        issues.push({
          id: generateId(),
          severity: 'warning',
          message: `${d.hostname} 启用了OSPF但没有配置任何区域`,
          relatedDeviceId: node.id,
        });
      }
    }

    // Check DHCP server without pool
    if (d.protocols.dhcp?.enabled) {
      if (!d.protocols.dhcp.network) {
        issues.push({
          id: generateId(),
          severity: 'error',
          message: `${d.hostname} 启用了DHCP但没有配置地址池`,
          relatedDeviceId: node.id,
        });
      }
    }
  }

  // Check for duplicate IPs
  const ipMap = new Map<string, string[]>();
  for (const node of nodes) {
    for (const iface of node.data.interfaces) {
      if (iface.ipAddress) {
        const ip = iface.ipAddress.split('/')[0];
        if (!ipMap.has(ip)) ipMap.set(ip, []);
        ipMap.get(ip)!.push(`${node.data.hostname}:${iface.name}`);
      }
    }
  }
  for (const [ip, locations] of ipMap) {
    if (locations.length > 1) {
      issues.push({
        id: generateId(),
        severity: 'error',
        message: `IP地址 ${ip} 重复: ${locations.join(', ')}`,
      });
    }
  }

  return issues;
}
