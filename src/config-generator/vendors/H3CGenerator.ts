import { ConfigGenerator, type ConfigSection } from '../ConfigGenerator';
import type { TopologyNode, TopologyEdge } from '../../types';
import { parseCidr } from '../../utils/ip';

export class H3CGenerator extends ConfigGenerator {
  vendor = 'h3c' as const;

  genBasicSettings(node: TopologyNode): ConfigSection {
    const d = node.data;
    const lines: string[] = [];
    lines.push(`<H3C> ${this.c.systemViewCommand}`);
    lines.push(`[H3C] sysname ${d.hostname}`);
    return {
      title: 'Basic System Settings',
      lines,
      annotation: `系统基本配置：\n- system-view：进入系统视图\n- sysname：设置设备主机名，命名设备以便识别`,
      order: 10,
    };
  }

  genInterfaces(node: TopologyNode, edges: TopologyEdge[]): ConfigSection {
    const lines: string[] = [];
    for (const iface of node.data.interfaces) {
      const name = iface.name;
      lines.push(`[H3C] interface ${name}`);
      if (iface.ipAddress) {
        const parsed = parseCidr(iface.ipAddress);
        if (parsed) lines.push(`[H3C-${name}] ip address ${parsed.ip} ${parsed.mask}`);
      }
      if (iface.portMode) lines.push(`[H3C-${name}] port link-type ${iface.portMode}`);
      if (iface.accessVlan) lines.push(`[H3C-${name}] port access vlan ${iface.accessVlan}`);
      if (iface.status === 'down') lines.push(`[H3C-${name}] shutdown`);
      else lines.push(`[H3C-${name}] undo shutdown`);
      lines.push(`[H3C-${name}] quit`);
    }
    return { title: 'Interface Configuration', lines, annotation: `接口配置：\n- ip address：配置IP地址和掩码\n- undo shutdown：启用接口`, order: 20 };
  }

  genOSPF(node: TopologyNode): ConfigSection {
    const ospf = node.data.protocols.ospf!;
    const lines: string[] = [];
    lines.push(`[H3C] ospf ${ospf.processId} router-id ${ospf.routerId}`);
    for (const area of ospf.areas) {
      lines.push(`[H3C-ospf-${ospf.processId}] area ${area.areaId}`);
      for (const net of area.networks) lines.push(`[H3C-ospf-${ospf.processId}-area-${area.areaId}] network ${net.network} ${net.wildcard}`);
    }
    lines.push(`[H3C-ospf-${ospf.processId}] quit`);
    return { title: 'OSPF Configuration', lines, annotation: `OSPF 动态路由协议\n- area 0 为骨干区域`, order: 30 };
  }

  genBGP(node: TopologyNode): ConfigSection {
    const bgp = node.data.protocols.bgp!;
    const lines: string[] = [];
    lines.push(`[H3C] bgp ${bgp.asn}`);
    lines.push(`[H3C-bgp] router-id ${bgp.routerId}`);
    for (const peer of bgp.neighbors) lines.push(`[H3C-bgp] peer ${peer.ip} as-number ${peer.remoteAsn}`);
    for (const net of bgp.networks) lines.push(`[H3C-bgp] network ${net.network} ${net.mask}`);
    lines.push(`[H3C-bgp] quit`);
    return { title: 'BGP Configuration', lines, annotation: `BGP 边界网关协议`, order: 40 };
  }

  genRIP(node: TopologyNode): ConfigSection {
    const rip = node.data.protocols.rip!;
    const lines: string[] = [];
    lines.push(`[H3C] rip`);
    lines.push(`[H3C-rip-1] version ${rip.version}`);
    for (const net of rip.networks) lines.push(`[H3C-rip-1] network ${net}`);
    lines.push(`[H3C-rip-1] quit`);
    return { title: 'RIP Configuration', lines, annotation: `RIP 使用跳数作为度量`, order: 35 };
  }

  genStaticRoutes(node: TopologyNode): ConfigSection {
    const routes = node.data.protocols.staticRoutes ?? [];
    const lines: string[] = [];
    for (const sr of routes) lines.push(`[H3C] ip route-static ${sr.destination} ${sr.mask} ${sr.nextHop}`);
    return { title: 'Static Route Configuration', lines, annotation: `静态路由：手动指定数据包转发路径`, order: 25 };
  }

  genVLAN(node: TopologyNode): ConfigSection {
    const vlans = node.data.protocols.vlans!;
    const lines: string[] = [];
    for (const v of vlans.vlans) {
      lines.push(`[H3C] vlan ${v.vlanId}`);
      lines.push(`[H3C-vlan${v.vlanId}] name ${v.name}`);
      lines.push(`[H3C-vlan${v.vlanId}] quit`);
    }
    return { title: 'VLAN Configuration', lines, annotation: `VLAN 隔离广播域`, order: 15 };
  }

  genACL(node: TopologyNode): ConfigSection {
    const acls = node.data.protocols.acls!;
    const lines: string[] = [];
    for (const acl of acls.acls) {
      lines.push(`[H3C] acl advanced ${acl.aclNumber}`);
      for (const rule of acl.rules) lines.push(`[H3C-acl-ipv4-adv-${acl.aclNumber}] rule ${rule.sequence} ${rule.action} ${rule.protocol} source ${rule.srcIp} ${rule.srcWildcard} destination ${rule.dstIp} ${rule.dstWildcard}`);
    }
    return { title: 'ACL Configuration', lines, annotation: `ACL 访问控制列表`, order: 50 };
  }

  genNAT(node: TopologyNode): ConfigSection {
    const nat = node.data.protocols.nat!;
    const lines: string[] = [];
    if (nat.outsideInterface) {
      lines.push(`[H3C] interface ${nat.outsideInterface}`);
      lines.push(`[H3C-${nat.outsideInterface}] nat outbound`);
      lines.push(`[H3C-${nat.outsideInterface}] quit`);
    }
    return { title: 'NAT Configuration', lines, annotation: `NAT 网络地址转换`, order: 55 };
  }

  genDHCP(node: TopologyNode): ConfigSection {
    const dhcp = node.data.protocols.dhcp!;
    const lines: string[] = [];
    lines.push(`[H3C] dhcp enable`);
    lines.push(`[H3C] dhcp server ip-pool ${dhcp.poolName}`);
    lines.push(`[H3C-dhcp-pool-${dhcp.poolName}] network ${dhcp.network} mask ${dhcp.mask}`);
    lines.push(`[H3C-dhcp-pool-${dhcp.poolName}] gateway-list ${dhcp.gateway}`);
    lines.push(`[H3C-dhcp-pool-${dhcp.poolName}] quit`);
    return { title: 'DHCP Configuration', lines, annotation: `DHCP 自动分配IP地址`, order: 60 };
  }

  genSTP(node: TopologyNode): ConfigSection {
    const stp = node.data.protocols.stp!;
    const lines: string[] = [];
    lines.push(`[H3C] stp mode ${stp.mode}`);
    return { title: 'STP Configuration', lines, annotation: `STP 防止二层环路`, order: 18 };
  }
}
