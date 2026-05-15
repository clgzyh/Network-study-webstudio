import { ConfigGenerator, type ConfigSection } from '../ConfigGenerator';
import type { TopologyNode, TopologyEdge } from '../../types';
import { parseCidr } from '../../utils/ip';

export class HuaweiGenerator extends ConfigGenerator {
  vendor = 'huawei' as const;

  genBasicSettings(node: TopologyNode): ConfigSection {
    const d = node.data;
    const lines: string[] = [];
    lines.push(`<Huawei> ${this.c.systemViewCommand}`);
    lines.push(`[Huawei] sysname ${d.hostname}`);
    if (d.banner) {
      lines.push(`[Huawei] header login information "${d.banner}"`);
    }
    return {
      title: 'Basic System Settings',
      lines,
      annotation: `系统基本配置：\n- system-view：进入系统视图，所有配置修改都从此开始\n- sysname：设置设备主机名，用于标识网络中唯一的设备\n使用范例：\n  [Huawei] sysname R1\n  [Huawei] header login information "Welcome to Network Lab"`,
      order: 10,
    };
  }

  genInterfaces(node: TopologyNode, _edges: TopologyEdge[]): ConfigSection {
    const lines: string[] = [];
    for (const iface of node.data.interfaces) {
      const hwName = this.adaptIfaceName(iface.name);
      lines.push(`[Huawei] interface ${hwName}`);

      if (iface.ipAddress) {
        const parsed = parseCidr(iface.ipAddress);
        if (parsed) {
          lines.push(`[Huawei-${hwName}] ip address ${parsed.ip} ${parsed.mask}`);
        }
      }

      if (iface.portMode) {
        lines.push(`[Huawei-${hwName}] port link-type ${iface.portMode}`);
      }
      if (iface.accessVlan) {
        lines.push(`[Huawei-${hwName}] port default vlan ${iface.accessVlan}`);
      }

      if (iface.status === 'down') {
        lines.push(`[Huawei-${hwName}] shutdown`);
      } else {
        lines.push(`[Huawei-${hwName}] undo shutdown`);
      }

      if (iface.description) {
        lines.push(`[Huawei-${hwName}] description ${iface.description}`);
      }

      lines.push(`[Huawei-${hwName}] quit`);
    }
    return {
      title: 'Interface Configuration',
      lines,
      annotation: `接口配置说明：\n- interface <接口名>：进入指定接口的配置视图\n- ip address <IP> <掩码>：为该接口分配IP地址和子网掩码\n- port link-type：设置接口链路类型（access/trunk/hybrid）\n- undo shutdown：激活接口（华为默认接口为关闭状态）\n使用范例：\n  [Huawei] interface GigabitEthernet0/0/1\n  [Huawei-GigabitEthernet0/0/1] ip address 192.168.1.1 24`,
      order: 20,
    };
  }

  genOSPF(node: TopologyNode): ConfigSection {
    const ospf = node.data.protocols.ospf!;
    const lines: string[] = [];
    lines.push(`[Huawei] ospf ${ospf.processId} router-id ${ospf.routerId}`);
    for (const area of ospf.areas) {
      lines.push(`[Huawei-ospf-${ospf.processId}] area ${area.areaId}`);
      for (const net of area.networks) {
        lines.push(`[Huawei-ospf-${ospf.processId}-area-${area.areaId}] network ${net.network} ${net.wildcard}`);
      }
    }
    if (ospf.defaultOriginate) {
      lines.push(`[Huawei-ospf-${ospf.processId}] default-route-advertise always`);
    }
    lines.push(`[Huawei-ospf-${ospf.processId}] quit`);
    return {
      title: 'OSPF Configuration',
      lines,
      annotation: `OSPF 动态路由协议：\n- ospf <进程ID> router-id <路由器ID>：启动OSPF进程并指定Router-ID\n- area <区域ID>：进入OSPF区域视图，Area 0 是骨干区域\n- network <网络> <通配符>：宣告该网络到OSPF中\n- Router-ID必须全网唯一，通常使用Loopback地址\n验证命令：\n  display ospf peer         — 查看OSPF邻居状态\n  display ip routing-table  — 查看路由表`,
      order: 30,
    };
  }

  genBGP(node: TopologyNode): ConfigSection {
    const bgp = node.data.protocols.bgp!;
    const lines: string[] = [];
    lines.push(`[Huawei] bgp ${bgp.asn}`);
    lines.push(`[Huawei-bgp] router-id ${bgp.routerId}`);
    for (const peer of bgp.neighbors) {
      lines.push(`[Huawei-bgp] peer ${peer.ip} as-number ${peer.remoteAsn}`);
    }
    for (const net of bgp.networks) {
      lines.push(`[Huawei-bgp] network ${net.network} ${net.mask}`);
    }
    lines.push(`[Huawei-bgp] quit`);
    return {
      title: 'BGP Configuration',
      lines,
      annotation: `BGP 边界网关协议：\n- BGP在AS之间交换路由信息，是互联网的核心路由协议\n- AS号码（1-65535）：标识一个自治系统\n- peer <IP> as-number <ASN>：指定BGP邻居和其所属的AS\n- network：宣告本地网络给BGP邻居\n验证命令：\n  display bgp peer    — 查看BGP邻居状态\n  display bgp routing-table — 查看BGP路由表`,
      order: 40,
    };
  }

  genRIP(node: TopologyNode): ConfigSection {
    const rip = node.data.protocols.rip!;
    const lines: string[] = [];
    lines.push(`[Huawei] rip`);
    lines.push(`[Huawei-rip-1] version ${rip.version}`);
    for (const net of rip.networks) {
      lines.push(`[Huawei-rip-1] network ${net}`);
    }
    lines.push(`[Huawei-rip-1] quit`);
    return {
      title: 'RIP Configuration',
      lines,
      annotation: `RIP 动态路由协议（小规模网络适用）：\n- RIP使用跳数作为度量值，最大15跳\n- version 2 支持CIDR、认证和组播更新\n- network <主类网络>：在该网络的接口上启用RIP\n验证命令：\n  display rip process — 查看RIP进程状态`,
      order: 35,
    };
  }

  genStaticRoutes(node: TopologyNode): ConfigSection {
    const routes = node.data.protocols.staticRoutes ?? [];
    const lines: string[] = [];
    for (const sr of routes) {
      const ifaceClause = sr.interface ? ` ${sr.interface}` : '';
      const metricClause = sr.metric ? ` preference ${sr.metric}` : '';
      lines.push(`[Huawei] ip route-static ${sr.destination} ${sr.mask} ${sr.nextHop}${ifaceClause}${metricClause}`);
    }
    return {
      title: 'Static Route Configuration',
      lines,
      annotation: `静态路由配置：\n- ip route-static <目标网络> <掩码> <下一跳IP>：手动指定路由\n- 默认路由：0.0.0.0 0.0.0.0 表示匹配所有目标，用于访问外网\n- preference：路由优先级，值越小越优先\n使用范例：\n  [Huawei] ip route-static 0.0.0.0 0.0.0.0 10.0.0.2\n  [Huawei] ip route-static 192.168.2.0 255.255.255.0 10.0.0.2 preference 60`,
      order: 25,
    };
  }

  genVLAN(node: TopologyNode): ConfigSection {
    const vlans = node.data.protocols.vlans!;
    const lines: string[] = [];
    for (const v of vlans.vlans) {
      lines.push(`[Huawei] vlan ${v.vlanId}`);
      lines.push(`[Huawei-vlan${v.vlanId}] name ${v.name}`);
      lines.push(`[Huawei-vlan${v.vlanId}] quit`);
    }
    if (vlans.vlans.length > 0) {
      lines.push(`[Huawei] vlan batch ${vlans.vlans.map(v => v.vlanId).join(' ')}`);
    }
    return {
      title: 'VLAN Configuration',
      lines,
      annotation: `VLAN 虚拟局域网：\n- VLAN将物理网络划分为多个逻辑隔离的广播域\n- vlan <ID>：创建VLAN，ID范围1-4094\n- vlan batch：批量创建多个VLAN\n使用范例：\n  [Huawei] vlan 10\n  [Huawei-vlan10] name Sales\n  [Huawei] vlan batch 10 20 30`,
      order: 15,
    };
  }

  genACL(node: TopologyNode): ConfigSection {
    const acls = node.data.protocols.acls!;
    const lines: string[] = [];
    for (const acl of acls.acls) {
      lines.push(`[Huawei] acl ${acl.aclNumber}`);
      if (acl.name) lines.push(`[Huawei-acl-adv-${acl.aclNumber}] name ${acl.name}`);
      for (const rule of acl.rules) {
        lines.push(`[Huawei-acl-adv-${acl.aclNumber}] rule ${rule.sequence} ${rule.action} ${rule.protocol} source ${rule.srcIp} ${rule.srcWildcard} destination ${rule.dstIp} ${rule.dstWildcard}`);
      }
      if (acl.appliedInterface && acl.appliedDirection) {
        lines.push(`[Huawei] interface ${acl.appliedInterface}`);
        lines.push(`[Huawei-${acl.appliedInterface}] traffic-filter ${acl.appliedDirection} acl ${acl.aclNumber}`);
        lines.push(`[Huawei-${acl.appliedInterface}] quit`);
      }
    }
    return {
      title: 'ACL Configuration',
      lines,
      annotation: `ACL 访问控制列表：\n- ACL用于匹配和过滤数据包，是防火墙策略和NAT的基础\n- 基本ACL（2000-2999）：仅匹配源IP\n- 高级ACL（3000-3999）：可匹配源/目的IP、端口、协议\n使用范例：\n  [Huawei] acl 3000\n  [Huawei-acl-adv-3000] rule 5 permit tcp source 192.168.1.0 0.0.0.255 destination any`,
      order: 50,
    };
  }

  genNAT(node: TopologyNode): ConfigSection {
    const nat = node.data.protocols.nat!;
    const lines: string[] = [];
    if (nat.type === 'pat') {
      lines.push(`[Huawei] acl ${nat.aclNumber ?? 2000}`);
      lines.push(`[Huawei-acl-basic-${nat.aclNumber ?? 2000}] rule 5 permit source any`);
      lines.push(`[Huawei-acl-basic-${nat.aclNumber ?? 2000}] quit`);
      lines.push(`[Huawei] interface ${nat.outsideInterface}`);
      lines.push(`[Huawei-${nat.outsideInterface}] nat outbound ${nat.aclNumber ?? 2000}`);
      lines.push(`[Huawei-${nat.outsideInterface}] quit`);
    }
    return {
      title: 'NAT Configuration',
      lines,
      annotation: `NAT 网络地址转换：\n- PAT（端口复用）：多个内网IP共享一个公网IP，是最常用的方式\n- nat outbound <ACL号>：在出接口启用NAT，对ACL匹配的流量进行转换\n使用范例：\n  [Huawei] acl 2000\n  [Huawei-acl-basic-2000] rule 5 permit source 192.168.1.0 0.0.0.255\n  [Huawei] interface GigabitEthernet0/0/0\n  [Huawei-GigabitEthernet0/0/0] nat outbound 2000`,
      order: 55,
    };
  }

  genDHCP(node: TopologyNode): ConfigSection {
    const dhcp = node.data.protocols.dhcp!;
    const lines: string[] = [];
    lines.push(`[Huawei] dhcp enable`);
    lines.push(`[Huawei] ip pool ${dhcp.poolName}`);
    lines.push(`[Huawei-ip-pool-${dhcp.poolName}] network ${dhcp.network} mask ${dhcp.mask}`);
    lines.push(`[Huawei-ip-pool-${dhcp.poolName}] gateway-list ${dhcp.gateway}`);
    if (dhcp.dnsServers.length > 0) {
      lines.push(`[Huawei-ip-pool-${dhcp.poolName}] dns-list ${dhcp.dnsServers.join(' ')}`);
    }
    if (dhcp.leaseDays) {
      lines.push(`[Huawei-ip-pool-${dhcp.poolName}] lease day ${dhcp.leaseDays}`);
    }
    lines.push(`[Huawei-ip-pool-${dhcp.poolName}] quit`);
    return {
      title: 'DHCP Configuration',
      lines,
      annotation: `DHCP 动态主机配置协议：\n- DHCP自动为客户端分配IP地址、子网掩码、网关和DNS\n- dhcp enable：全局启用DHCP服务\n- ip pool <名称>：创建地址池，定义可分配的地址范围\n- gateway-list：设置分配给客户端的默认网关\n- dns-list：设置分配给客户端的DNS服务器\n使用范例：\n  display ip pool name pool1 — 查看地址池分配情况`,
      order: 60,
    };
  }

  genSTP(node: TopologyNode): ConfigSection {
    const stp = node.data.protocols.stp!;
    const lines: string[] = [];
    lines.push(`[Huawei] stp mode ${stp.mode}`);
    if (stp.rootPrimary) {
      lines.push(`[Huawei] stp root primary`);
    } else if (stp.priority) {
      lines.push(`[Huawei] stp priority ${stp.priority}`);
    }
    return {
      title: 'STP Configuration',
      lines,
      annotation: `STP 生成树协议：\n- STP防止网络中出现二层环路（广播风暴）\n- RSTP（快速生成树）：STP的改进版，收敛速度更快\n- stp root primary：将本设备设为根桥\n- stp priority：设置桥优先级（0-61440，步长4096），值越小越优先\n验证命令：\n  display stp brief — 查看STP状态和端口角色`,
      order: 18,
    };
  }

  private adaptIfaceName(name: string): string {
    return name
      .replace(/^GigabitEthernet/, 'GigabitEthernet')
      .replace(/^XGigabitEthernet/, 'XGigabitEthernet')
      .replace(/^Serial/, 'Serial')
      .replace(/^LoopBack/, 'LoopBack')
      .replace(/^Management/, 'MEth');
  }
}
