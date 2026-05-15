import { ConfigGenerator, type ConfigSection } from '../ConfigGenerator';
import type { TopologyNode, TopologyEdge } from '../../types';
import { parseCidr } from '../../utils/ip';

export class RuijieGenerator extends ConfigGenerator {
  vendor = 'ruijie' as const;

  genBasicSettings(node: TopologyNode): ConfigSection {
    const d = node.data;
    const lines: string[] = [];
    lines.push(`Ruijie> enable`);
    lines.push(`Ruijie# configure terminal`);
    lines.push(`Ruijie(config)# hostname ${d.hostname}`);
    if (d.enablePassword) lines.push(`${d.hostname}(config)# enable secret ${d.enablePassword}`);
    return {
      title: 'Basic System Settings',
      lines,
      annotation: `系统基本配置（锐捷RGOS）：\n- enable：进入特权模式\n- configure terminal：进入全局配置模式\n- hostname：设置主机名`,
      order: 10,
    };
  }

  genInterfaces(node: TopologyNode, _edges: TopologyEdge[]): ConfigSection {
    const hn = node.data.hostname;
    const lines: string[] = [];
    for (const iface of node.data.interfaces) {
      lines.push(`${hn}(config)# interface ${iface.name}`);
      if (iface.ipAddress) {
        const parsed = parseCidr(iface.ipAddress);
        if (parsed) lines.push(`${hn}(config-if)# ip address ${parsed.ip} ${parsed.mask}`);
      }
      if (iface.portMode === 'access') {
        lines.push(`${hn}(config-if)# switchport mode access`);
        if (iface.accessVlan) lines.push(`${hn}(config-if)# switchport access vlan ${iface.accessVlan}`);
      } else if (iface.portMode === 'trunk') {
        lines.push(`${hn}(config-if)# switchport mode trunk`);
      }
      if (iface.status === 'down') lines.push(`${hn}(config-if)# shutdown`);
      else lines.push(`${hn}(config-if)# no shutdown`);
      lines.push(`${hn}(config-if)# exit`);
    }
    return { title: 'Interface Configuration', lines, annotation: `接口配置（锐捷RGOS）`, order: 20 };
  }

  genOSPF(node: TopologyNode): ConfigSection {
    const ospf = node.data.protocols.ospf!;
    const hn = node.data.hostname;
    const lines: string[] = [];
    lines.push(`${hn}(config)# router ospf ${ospf.processId}`);
    lines.push(`${hn}(config-router)# router-id ${ospf.routerId}`);
    for (const area of ospf.areas) {
      for (const net of area.networks) {
        lines.push(`${hn}(config-router)# network ${net.network} ${net.wildcard} area ${area.areaId}`);
      }
    }
    lines.push(`${hn}(config-router)# exit`);
    return { title: 'OSPF Configuration', lines, annotation: `OSPF 动态路由`, order: 30 };
  }

  genBGP(node: TopologyNode): ConfigSection {
    const bgp = node.data.protocols.bgp!;
    const hn = node.data.hostname;
    const lines: string[] = [];
    lines.push(`${hn}(config)# router bgp ${bgp.asn}`);
    lines.push(`${hn}(config-router)# bgp router-id ${bgp.routerId}`);
    for (const peer of bgp.neighbors) lines.push(`${hn}(config-router)# neighbor ${peer.ip} remote-as ${peer.remoteAsn}`);
    for (const net of bgp.networks) lines.push(`${hn}(config-router)# network ${net.network} mask ${net.mask}`);
    lines.push(`${hn}(config-router)# exit`);
    return { title: 'BGP Configuration', lines, annotation: `BGP 边界网关协议`, order: 40 };
  }

  genRIP(node: TopologyNode): ConfigSection {
    const rip = node.data.protocols.rip!;
    const hn = node.data.hostname;
    const lines: string[] = [];
    lines.push(`${hn}(config)# router rip`);
    lines.push(`${hn}(config-router)# version ${rip.version}`);
    for (const net of rip.networks) lines.push(`${hn}(config-router)# network ${net}`);
    lines.push(`${hn}(config-router)# exit`);
    return { title: 'RIP Configuration', lines, annotation: `RIP 路由协议`, order: 35 };
  }

  genStaticRoutes(node: TopologyNode): ConfigSection {
    const routes = node.data.protocols.staticRoutes ?? [];
    const hn = node.data.hostname;
    const lines: string[] = [];
    for (const sr of routes) lines.push(`${hn}(config)# ip route ${sr.destination} ${sr.mask} ${sr.nextHop}`);
    return { title: 'Static Route Configuration', lines, annotation: `静态路由`, order: 25 };
  }

  genVLAN(node: TopologyNode): ConfigSection {
    const vlans = node.data.protocols.vlans!;
    const hn = node.data.hostname;
    const lines: string[] = [];
    for (const v of vlans.vlans) {
      lines.push(`${hn}(config)# vlan ${v.vlanId}`);
      lines.push(`${hn}(config-vlan)# name ${v.name}`);
      lines.push(`${hn}(config-vlan)# exit`);
    }
    return { title: 'VLAN Configuration', lines, annotation: `VLAN 虚拟局域网`, order: 15 };
  }

  genACL(node: TopologyNode): ConfigSection {
    const acls = node.data.protocols.acls!;
    const hn = node.data.hostname;
    const lines: string[] = [];
    for (const acl of acls.acls) {
      lines.push(`${hn}(config)# ip access-list extended ${acl.aclNumber}`);
      for (const rule of acl.rules) lines.push(`${hn}(config-ext-nacl)# ${rule.sequence} ${rule.action} ${rule.protocol} ${rule.srcIp} ${rule.srcWildcard} ${rule.dstIp} ${rule.dstWildcard}`);
    }
    return { title: 'ACL Configuration', lines, annotation: `ACL 访问控制列表`, order: 50 };
  }

  genNAT(node: TopologyNode): ConfigSection {
    const nat = node.data.protocols.nat!;
    const hn = node.data.hostname;
    const lines: string[] = [];
    for (const iface of nat.insideInterfaces) {
      lines.push(`${hn}(config)# interface ${iface}`);
      lines.push(`${hn}(config-if)# ip nat inside`);
      lines.push(`${hn}(config-if)# exit`);
    }
    if (nat.outsideInterface) {
      lines.push(`${hn}(config)# interface ${nat.outsideInterface}`);
      lines.push(`${hn}(config-if)# ip nat outside`);
      lines.push(`${hn}(config-if)# exit`);
    }
    lines.push(`${hn}(config)# ip nat inside source list ${nat.aclNumber ?? 1} interface ${nat.outsideInterface} overload`);
    return { title: 'NAT Configuration', lines, annotation: `NAT 网络地址转换`, order: 55 };
  }

  genDHCP(node: TopologyNode): ConfigSection {
    const dhcp = node.data.protocols.dhcp!;
    const hn = node.data.hostname;
    const lines: string[] = [];
    lines.push(`${hn}(config)# service dhcp`);
    lines.push(`${hn}(config)# ip dhcp pool ${dhcp.poolName}`);
    lines.push(`${hn}(dhcp-config)# network ${dhcp.network} ${dhcp.mask}`);
    lines.push(`${hn}(dhcp-config)# default-router ${dhcp.gateway}`);
    if (dhcp.dnsServers.length > 0) lines.push(`${hn}(dhcp-config)# dns-server ${dhcp.dnsServers.join(' ')}`);
    lines.push(`${hn}(dhcp-config)# exit`);
    return { title: 'DHCP Configuration', lines, annotation: `DHCP 地址分配`, order: 60 };
  }

  genSTP(node: TopologyNode): ConfigSection {
    const stp = node.data.protocols.stp!;
    const hn = node.data.hostname;
    const modeMap = { stp: 'stp', rstp: 'rstp', mstp: 'mstp' } as const;
    const lines: string[] = [];
    lines.push(`${hn}(config)# spanning-tree mode ${modeMap[stp.mode]}`);
    return { title: 'STP Configuration', lines, annotation: `STP 防止环路`, order: 18 };
  }
}
