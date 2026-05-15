import type { TopologyNode, DeviceInterface } from '../../types';
import { useTopologyStore } from '../../store/useTopologyStore';
import { parseCidr } from '../../utils/ip';

interface Props {
  node: TopologyNode;
}

export function InterfaceEditor({ node }: Props) {
  const updateNodeData = useTopologyStore((s) => s.updateNodeData);
  const allNodes = useTopologyStore((s) => s.nodes);

  function updateIface(ifaceId: string, patch: Partial<DeviceInterface>) {
    const interfaces = node.data.interfaces.map((i) =>
      i.id === ifaceId ? { ...i, ...patch } : i
    );
    updateNodeData(node.id, { interfaces });
  }

  function addInterface() {
    const num = node.data.interfaces.length + 1;
    const newIface: DeviceInterface = {
      id: `iface-${Date.now()}`,
      name: `LoopBack${num}`,
      type: 'loopback',
      status: 'up',
    };
    updateNodeData(node.id, { interfaces: [...node.data.interfaces, newIface] });
  }

  function getConnectedHostname(iface: DeviceInterface): string | null {
    if (!iface.connectedEdgeId) return null;
    const edge = useTopologyStore.getState().edges.find((e) => e.id === iface.connectedEdgeId);
    if (!edge) return null;
    const otherId = edge.source === node.id ? edge.target : edge.source;
    const otherNode = allNodes.find((n) => n.id === otherId);
    return otherNode?.data.hostname ?? null;
  }

  return (
    <div className="space-y-2">
      {node.data.interfaces.map((iface) => {
        const connectedTo = getConnectedHostname(iface);
        const parsed = iface.ipAddress ? parseCidr(iface.ipAddress) : null;
        return (
          <div key={iface.id} className="bg-surface rounded-md border border-border p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${iface.status === 'up' ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className="text-xs font-medium text-text-primary">{iface.name}</span>
              <span className="text-[10px] text-text-muted ml-auto">{iface.type}</span>
            </div>

            <input
              type="text"
              placeholder="IP/CIDR (如 192.168.1.1/24)"
              value={iface.ipAddress ?? ''}
              onChange={(e) => updateIface(iface.id, { ipAddress: e.target.value || undefined })}
              className="w-full text-xs border border-border rounded px-2 py-1 bg-surface"
            />
            {parsed && (
              <div className="text-[10px] text-text-muted font-mono">
                子网掩码: {parsed.mask} / 通配符: {parsed.wildcard}
              </div>
            )}

            <div className="flex items-center gap-2">
              <select
                value={iface.status}
                onChange={(e) => updateIface(iface.id, { status: e.target.value as 'up' | 'down' })}
                className="text-xs border border-border rounded px-1.5 py-0.5 bg-surface flex-1"
              >
                <option value="up">UP</option>
                <option value="down">DOWN</option>
              </select>

              {(node.data.deviceType === 'switch' || node.data.deviceType === 'access-controller') && (
                <select
                  value={iface.portMode ?? ''}
                  onChange={(e) => updateIface(iface.id, { portMode: (e.target.value || undefined) as DeviceInterface['portMode'] })}
                  className="text-xs border border-border rounded px-1.5 py-0.5 bg-surface flex-1"
                >
                  <option value="">--</option>
                  <option value="access">Access</option>
                  <option value="trunk">Trunk</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              )}
            </div>

            {connectedTo && (
              <div className="text-[10px] text-green-600 font-medium">
                ↔ 连接到 {connectedTo}
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={addInterface}
        className="w-full py-1.5 text-xs text-text-secondary border border-dashed border-border rounded hover:bg-surface-hover"
      >
        + 添加接口
      </button>
    </div>
  );
}
