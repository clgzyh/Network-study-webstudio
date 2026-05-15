import { useState } from 'react';
import type { TopologyNode, ProtocolType } from '../../types';
import { PROTOCOLS_BY_DEVICE, PROTOCOL_LABELS } from '../../constants/protocols';
import { useTopologyStore } from '../../store/useTopologyStore';
import clsx from 'clsx';

interface Props {
  node: TopologyNode;
}

export function ProtocolSelector({ node }: Props) {
  const updateNodeData = useTopologyStore((s) => s.updateNodeData);
  const availableProtocols = PROTOCOLS_BY_DEVICE[node.data.deviceType] ?? [];
  const [expandedProtocol, setExpandedProtocol] = useState<ProtocolType | null>(null);

  if (availableProtocols.length === 0) {
    return <div className="text-xs text-text-muted text-center py-4">此设备没有可配置的协议</div>;
  }

  function toggleProtocol(type: ProtocolType) {
    const protocols = { ...node.data.protocols };
    switch (type) {
      case 'ospf':
        protocols.ospf = protocols.ospf?.enabled
          ? { ...protocols.ospf, enabled: false }
          : { enabled: true, processId: 1, routerId: '1.1.1.1', areas: [] };
        break;
      case 'bgp':
        protocols.bgp = protocols.bgp?.enabled
          ? { ...protocols.bgp, enabled: false }
          : { enabled: true, asn: 65001, routerId: '1.1.1.1', neighbors: [], networks: [] };
        break;
      case 'rip':
        protocols.rip = protocols.rip?.enabled
          ? { ...protocols.rip, enabled: false }
          : { enabled: true, version: 2, networks: [] };
        break;
      case 'static-route':
        protocols.staticRoutes = protocols.staticRoutes ?? [];
        break;
      case 'vlan':
        protocols.vlans = protocols.vlans?.enabled
          ? { ...protocols.vlans, enabled: false }
          : { enabled: true, vlans: [] };
        break;
      case 'stp':
        protocols.stp = protocols.stp?.enabled
          ? { ...protocols.stp, enabled: false }
          : { enabled: true, mode: 'rstp' };
        break;
      case 'acl':
        protocols.acls = protocols.acls?.enabled
          ? { ...protocols.acls, enabled: false }
          : { enabled: true, acls: [] };
        break;
      case 'nat':
        protocols.nat = protocols.nat?.enabled
          ? { ...protocols.nat, enabled: false }
          : { enabled: true, type: 'pat', insideInterfaces: [], outsideInterface: '', staticMappings: [] };
        break;
      case 'dhcp':
        protocols.dhcp = protocols.dhcp?.enabled
          ? { ...protocols.dhcp, enabled: false }
          : { enabled: true, poolName: 'pool1', network: '192.168.1.0', mask: '255.255.255.0', gateway: '192.168.1.1', dnsServers: [] };
        break;
    }
    updateNodeData(node.id, { protocols });
    if (expandedProtocol === type) {
      setExpandedProtocol(null);
    } else {
      setExpandedProtocol(type);
    }
  }

  function isEnabled(type: ProtocolType): boolean {
    const p = node.data.protocols;
    switch (type) {
      case 'ospf': return p.ospf?.enabled ?? false;
      case 'bgp': return p.bgp?.enabled ?? false;
      case 'rip': return p.rip?.enabled ?? false;
      case 'static-route': return (p.staticRoutes?.length ?? 0) > 0;
      case 'vlan': return p.vlans?.enabled ?? false;
      case 'stp': return p.stp?.enabled ?? false;
      case 'acl': return p.acls?.enabled ?? false;
      case 'nat': return p.nat?.enabled ?? false;
      case 'dhcp': return p.dhcp?.enabled ?? false;
    }
  }

  return (
    <div className="space-y-1">
      {availableProtocols.map((type) => {
        const enabled = isEnabled(type);
        const expanded = expandedProtocol === type;
        return (
          <div key={type}>
            <button
              onClick={() => toggleProtocol(type)}
              className={clsx(
                'w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors',
                enabled
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-text-secondary hover:bg-surface-hover'
              )}
            >
              <span className={clsx(
                'w-1.5 h-1.5 rounded-full',
                enabled ? 'bg-blue-500' : 'bg-gray-300'
              )} />
              <span className="flex-1 text-left">{PROTOCOL_LABELS[type]}</span>
              <span className="text-text-muted">{expanded ? '▲' : '▼'}</span>
            </button>

            {enabled && expanded && (
              <div className="ml-4 mt-1 mb-2 p-2 bg-surface rounded border border-border">
                {type === 'ospf' && <OSPFConfigForm node={node} />}
                {type === 'bgp' && <BGPConfigForm node={node} />}
                {type === 'rip' && <RIPConfigForm node={node} />}
                {type === 'static-route' && <StaticRouteConfigForm node={node} />}
                {type === 'vlan' && <VLANConfigForm node={node} />}
                {type === 'acl' && <ACLConfigForm node={node} />}
                {type === 'nat' && <NATConfigForm node={node} />}
                {type === 'dhcp' && <DHCPConfigForm node={node} />}
                {type === 'stp' && <STPConfigForm node={node} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---- Inline protocol forms (kept simple) ---- */

function OSPFConfigForm({ node }: { node: TopologyNode }) {
  const updateNodeData = useTopologyStore((s) => s.updateNodeData);
  const config = node.data.protocols.ospf!;
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-text-secondary">进程ID</label>
      <input type="number" value={config.processId} onChange={(e) => updateNodeData(node.id, { protocols: { ...node.data.protocols, ospf: { ...config, processId: parseInt(e.target.value) || 1 } } })} className="w-full text-xs border rounded px-1.5 py-0.5" />
      <label className="text-[10px] text-text-secondary">Router ID</label>
      <input type="text" value={config.routerId} onChange={(e) => updateNodeData(node.id, { protocols: { ...node.data.protocols, ospf: { ...config, routerId: e.target.value } } })} className="w-full text-xs border rounded px-1.5 py-0.5" />
    </div>
  );
}

function BGPConfigForm({ node }: { node: TopologyNode }) {
  const updateNodeData = useTopologyStore((s) => s.updateNodeData);
  const config = node.data.protocols.bgp!;
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-text-secondary">AS 号码</label>
      <input type="number" value={config.asn} onChange={(e) => updateNodeData(node.id, { protocols: { ...node.data.protocols, bgp: { ...config, asn: parseInt(e.target.value) || 65001 } } })} className="w-full text-xs border rounded px-1.5 py-0.5" />
      <label className="text-[10px] text-text-secondary">Router ID</label>
      <input type="text" value={config.routerId} onChange={(e) => updateNodeData(node.id, { protocols: { ...node.data.protocols, bgp: { ...config, routerId: e.target.value } } })} className="w-full text-xs border rounded px-1.5 py-0.5" />
    </div>
  );
}

function RIPConfigForm({ node }: { node: TopologyNode }) {
  const updateNodeData = useTopologyStore((s) => s.updateNodeData);
  const config = node.data.protocols.rip!;
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-text-secondary">版本</label>
      <select value={config.version} onChange={(e) => updateNodeData(node.id, { protocols: { ...node.data.protocols, rip: { ...config, version: parseInt(e.target.value) as 1 | 2 } } })} className="w-full text-xs border rounded px-1.5 py-0.5">
        <option value={2}>RIPv2</option>
        <option value={1}>RIPv1</option>
      </select>
    </div>
  );
}

function StaticRouteConfigForm({ node }: { node: TopologyNode }) {
  const updateNodeData = useTopologyStore((s) => s.updateNodeData);
  const routes = node.data.protocols.staticRoutes ?? [];
  const [dest, setDest] = useState('');
  const [mask, setMask] = useState('');
  const [nextHop, setNextHop] = useState('');

  function add() {
    if (!dest || !nextHop) return;
    updateNodeData(node.id, {
      protocols: {
        ...node.data.protocols,
        staticRoutes: [...routes, { id: `sr-${Date.now()}`, destination: dest, mask: mask || '0.0.0.0', nextHop }],
      },
    });
    setDest(''); setMask(''); setNextHop('');
  }

  function remove(id: string) {
    updateNodeData(node.id, {
      protocols: { ...node.data.protocols, staticRoutes: routes.filter((r) => r.id !== id) },
    });
  }

  return (
    <div className="space-y-1.5">
      {routes.length > 0 && (
        <div className="space-y-1 mb-2">
          {routes.map((r) => (
            <div key={r.id} className="flex items-center gap-1 text-[10px] bg-gray-50 rounded px-1.5 py-0.5">
              <span className="font-mono flex-1">{r.destination}/{r.mask} → {r.nextHop}</span>
              <button onClick={() => remove(r.id)} className="text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
        </div>
      )}
      <input type="text" placeholder="目标网络 (如 0.0.0.0)" value={dest} onChange={(e) => setDest(e.target.value)} className="w-full text-xs border rounded px-1.5 py-0.5" />
      <input type="text" placeholder="子网掩码 (如 0.0.0.0)" value={mask} onChange={(e) => setMask(e.target.value)} className="w-full text-xs border rounded px-1.5 py-0.5" />
      <input type="text" placeholder="下一跳 (如 10.0.0.2)" value={nextHop} onChange={(e) => setNextHop(e.target.value)} className="w-full text-xs border rounded px-1.5 py-0.5" />
      <button onClick={add} className="w-full py-1 text-xs bg-brand text-white rounded">+ 添加路由</button>
    </div>
  );
}

function VLANConfigForm({ node }: { node: TopologyNode }) {
  const updateNodeData = useTopologyStore((s) => s.updateNodeData);
  const config = node.data.protocols.vlans!;
  const [vlanId, setVlanId] = useState('');
  const [vlanName, setVlanName] = useState('');

  function add() {
    const id = parseInt(vlanId);
    if (!id || id < 1 || id > 4094) return;
    updateNodeData(node.id, {
      protocols: { ...node.data.protocols, vlans: { ...config, vlans: [...config.vlans, { vlanId: id, name: vlanName || `VLAN${id}` }] } },
    });
    setVlanId(''); setVlanName('');
  }

  function remove(vlanId: number) {
    updateNodeData(node.id, {
      protocols: { ...node.data.protocols, vlans: { ...config, vlans: config.vlans.filter((v) => v.vlanId !== vlanId) } },
    });
  }

  return (
    <div className="space-y-1.5">
      {config.vlans.length > 0 && (
        <div className="space-y-1 mb-2">
          {config.vlans.map((v) => (
            <div key={v.vlanId} className="flex items-center gap-1 text-[10px] bg-gray-50 rounded px-1.5 py-0.5">
              <span className="font-mono flex-1">VLAN{v.vlanId} — {v.name}</span>
              <button onClick={() => remove(v.vlanId)} className="text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
        </div>
      )}
      <input type="number" placeholder="VLAN ID (1-4094)" value={vlanId} onChange={(e) => setVlanId(e.target.value)} className="w-full text-xs border rounded px-1.5 py-0.5" />
      <input type="text" placeholder="VLAN 名称" value={vlanName} onChange={(e) => setVlanName(e.target.value)} className="w-full text-xs border rounded px-1.5 py-0.5" />
      <button onClick={add} className="w-full py-1 text-xs bg-brand text-white rounded">+ 添加 VLAN</button>
    </div>
  );
}

function ACLConfigForm({ node }: { node: TopologyNode }) {
  void node;
  return <div className="text-[10px] text-text-muted">ACL 配置（基础版 - 可在高级版中扩展）</div>;
}

function NATConfigForm({ node }: { node: TopologyNode }) {
  const updateNodeData = useTopologyStore((s) => s.updateNodeData);
  const config = node.data.protocols.nat!;
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-text-secondary">NAT 类型</label>
      <select value={config.type} onChange={(e) => updateNodeData(node.id, { protocols: { ...node.data.protocols, nat: { ...config, type: e.target.value as 'static' | 'dynamic' | 'pat' } } })} className="w-full text-xs border rounded px-1.5 py-0.5">
        <option value="pat">PAT (端口复用)</option>
        <option value="dynamic">动态NAT</option>
        <option value="static">静态NAT</option>
      </select>
    </div>
  );
}

function DHCPConfigForm({ node }: { node: TopologyNode }) {
  const updateNodeData = useTopologyStore((s) => s.updateNodeData);
  const config = node.data.protocols.dhcp!;
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-text-secondary">地址池名称</label>
      <input type="text" value={config.poolName} onChange={(e) => updateNodeData(node.id, { protocols: { ...node.data.protocols, dhcp: { ...config, poolName: e.target.value } } })} className="w-full text-xs border rounded px-1.5 py-0.5" />
      <label className="text-[10px] text-text-secondary">网络地址</label>
      <input type="text" value={config.network} onChange={(e) => updateNodeData(node.id, { protocols: { ...node.data.protocols, dhcp: { ...config, network: e.target.value } } })} className="w-full text-xs border rounded px-1.5 py-0.5" />
      <label className="text-[10px] text-text-secondary">子网掩码</label>
      <input type="text" value={config.mask} onChange={(e) => updateNodeData(node.id, { protocols: { ...node.data.protocols, dhcp: { ...config, mask: e.target.value } } })} className="w-full text-xs border rounded px-1.5 py-0.5" />
      <label className="text-[10px] text-text-secondary">网关</label>
      <input type="text" value={config.gateway} onChange={(e) => updateNodeData(node.id, { protocols: { ...node.data.protocols, dhcp: { ...config, gateway: e.target.value } } })} className="w-full text-xs border rounded px-1.5 py-0.5" />
      <label className="text-[10px] text-text-secondary">DNS (逗号分隔)</label>
      <input type="text" value={config.dnsServers.join(',')} onChange={(e) => updateNodeData(node.id, { protocols: { ...node.data.protocols, dhcp: { ...config, dnsServers: e.target.value.split(',').filter(Boolean) } } })} className="w-full text-xs border rounded px-1.5 py-0.5" />
    </div>
  );
}

function STPConfigForm({ node }: { node: TopologyNode }) {
  const updateNodeData = useTopologyStore((s) => s.updateNodeData);
  const config = node.data.protocols.stp!;
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-text-secondary">STP 模式</label>
      <select value={config.mode} onChange={(e) => updateNodeData(node.id, { protocols: { ...node.data.protocols, stp: { ...config, mode: e.target.value as 'stp' | 'rstp' | 'mstp' } } })} className="w-full text-xs border rounded px-1.5 py-0.5">
        <option value="rstp">RSTP (快速生成树)</option>
        <option value="stp">STP (生成树)</option>
        <option value="mstp">MSTP (多实例)</option>
      </select>
    </div>
  );
}
