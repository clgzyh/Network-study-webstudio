import type { TopologyNode, TopologyEdge } from '../types';

export function generateSummary(nodes: TopologyNode[], edges: TopologyEdge[]): string {
  if (nodes.length === 0) return '';

  const lines: string[] = [];

  // Topology overview
  const deviceCounts: Record<string, number> = {};
  for (const node of nodes) {
    deviceCounts[node.data.deviceType] = (deviceCounts[node.data.deviceType] ?? 0) + 1;
  }

  lines.push('═══════════════════════════════════════════');
  lines.push('  网络拓扑通信原理总结');
  lines.push('═══════════════════════════════════════════');
  lines.push('');
  lines.push('【网络概况】');

  const labels: Record<string, string> = {
    router: '路由器',
    switch: '交换机',
    firewall: '防火墙',
    'access-controller': 'AC控制器',
    'access-point': 'AP接入点',
    pc: '终端PC',
    server: '服务器',
    cloud: '云端/互联网',
  };

  for (const [type, count] of Object.entries(deviceCounts)) {
    lines.push(`  - ${labels[type] ?? type}: ${count} 台`);
  }
  lines.push(`  - 链路连接: ${edges.length} 条`);
  lines.push('');

  // Connection analysis
  const connectionsByType: Record<string, number> = {};
  for (const edge of edges) {
    const t = edge.data.mediaType;
    connectionsByType[t] = (connectionsByType[t] ?? 0) + 1;
  }

  if (edges.length > 0) {
    lines.push('【连接概况】');
    const mediaLabels: Record<string, string> = {
      ethernet: '以太网连接',
      serial: '串行链路',
      fiber: '光纤连接',
    };
    for (const [media, count] of Object.entries(connectionsByType)) {
      lines.push(`  - ${mediaLabels[media] ?? media}: ${count} 条`);
    }
    lines.push('');
  }

  // Per-device role analysis
  lines.push('【设备角色与功能分析】');
  for (const node of nodes) {
    const d = node.data;
    const connectedEdges = edges.filter((e) => e.source === node.id || e.target === node.id);
    const neighbors = connectedEdges.map((e) => {
      const otherId = e.source === node.id ? e.target : e.source;
      const other = nodes.find((n) => n.id === otherId);
      return other?.data.hostname ?? 'Unknown';
    });

    lines.push('');
    lines.push(`  ▸ ${d.hostname} (${labels[d.deviceType] ?? d.deviceType})`);

    const roles: string[] = [];
    if (d.protocols.ospf?.enabled) roles.push('运行OSPF动态路由');
    if (d.protocols.bgp?.enabled) roles.push('运行BGP边界网关协议');
    if (d.protocols.rip?.enabled) roles.push('运行RIP动态路由');
    if ((d.protocols.staticRoutes?.length ?? 0) > 0) roles.push('配置了静态路由');
    if (d.protocols.vlans?.enabled) roles.push('划分了VLAN');
    if (d.protocols.stp?.enabled) roles.push('启用了STP防环');
    if (d.protocols.nat?.enabled) roles.push('配置了NAT地址转换');
    if (d.protocols.dhcp?.enabled) roles.push('提供DHCP地址分配');
    if (d.protocols.acls?.enabled) roles.push('配置了ACL访问控制');

    if (roles.length > 0) {
      for (const r of roles) lines.push(`     ● ${r}`);
    }

    if (neighbors.length > 0) {
      lines.push(`     ↔ 连接设备: ${neighbors.join(', ')}`);
    }

    // Interface summary
    const configuredIps = d.interfaces.filter((i) => i.ipAddress);
    if (configuredIps.length > 0) {
      lines.push(`     ⚊ IP地址:`);
      for (const iface of configuredIps) {
        const neighbor = connectedEdges.find((e) => e.data.sourceInterfaceId === iface.id || e.data.targetInterfaceId === iface.id);
        const edgeLabel = neighbor ? ` (${neighbor.data.mediaType} ${neighbor.data.speed})` : '';
        lines.push(`       ${iface.name}: ${iface.ipAddress}${edgeLabel}`);
      }
    }
  }

  // Communication flow
  lines.push('');
  lines.push('═══════════════════════════════════════════');
  lines.push('【通信流程说明】');
  lines.push('═══════════════════════════════════════════');
  lines.push('');

  const hasRouting = nodes.some((n) => n.data.protocols.ospf?.enabled || n.data.protocols.bgp?.enabled || n.data.protocols.rip?.enabled);
  const hasVlan = nodes.some((n) => n.data.protocols.vlans?.enabled);
  const hasNAT = nodes.some((n) => n.data.protocols.nat?.enabled);
  const hasDHCP = nodes.some((n) => n.data.protocols.dhcp?.enabled);

  if (hasDHCP) {
    lines.push('1. DHCP 地址分配阶段：');
    lines.push('   PC/终端设备启动时发送 DHCP Discover 广播，DHCP 服务器');
    lines.push('   响应并分配 IP 地址、子网掩码、网关和 DNS 给客户端。');
    lines.push('');
  }

  if (hasVlan) {
    lines.push(`${hasDHCP ? '2' : '1'}. VLAN 二层隔离：`);
    lines.push('   交换机通过 VLAN 将网络划分为多个广播域。Access 接口');
    lines.push('   连接终端设备并打上 VLAN 标签，Trunk 接口在交换机之间');
    lines.push('   传输多个 VLAN 的流量。');
    lines.push('');
  }

  const step = (hasDHCP ? 1 : 0) + (hasVlan ? 1 : 0) + 1;

  if (hasRouting) {
    lines.push(`${step}. 路由与转发：`);
    lines.push('   当数据包需要跨网段通信时，设备查询路由表确定下一跳。');
    lines.push('   动态路由协议（OSPF/BGP/RIP）自动学习和交换路由信息，');
    lines.push('   静态路由则由管理员手动配置。路由器根据最长掩码匹配原则');
    lines.push('   选择最优路径，将数据包转发到下一跳设备。');
    lines.push('');
  }

  if (hasNAT) {
    lines.push(`${step + 1}. NAT 地址转换（访问外网）：`);
    lines.push('   当内网设备需要访问互联网时，防火墙/路由器执行 NAT/PAT。');
    lines.push('   将内网私有 IP 地址转换为公网 IP 地址（或端口映射）。');
    lines.push('   回程数据根据 NAT 会话表查找原始内网地址并转发回去。');
    lines.push('');
  }

  lines.push('═══════════════════════════════════════════');
  lines.push('【关键提示】');
  lines.push('═══════════════════════════════════════════');
  lines.push('');
  lines.push('• 请在每台设备上确认接口已正确配置 IP 地址并且状态为 UP');
  lines.push('• 动态路由协议需要在相邻设备上都启用才能建立邻居关系');
  lines.push('• VLAN 跨交换机通信需要 Trunk 链路上允许对应 VLAN 通过');
  lines.push('• 默认路由(0.0.0.0/0)用于将未知目标流量发往上游/互联网');
  lines.push('• 使用 ping/traceroute 命令测试连通性是验证配置的基本方法');

  return lines.join('\n');
}
