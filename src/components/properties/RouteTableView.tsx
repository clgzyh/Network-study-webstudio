import type { TopologyNode } from '../../types';
import { parseCidr, getNetworkAddress } from '../../utils/ip';

interface RouteEntry {
  destination: string;
  mask: string;
  nextHop: string;
  type: string;
}

interface Props {
  node: TopologyNode;
}

export function RouteTableView({ node }: Props) {
  const routes = computeRoutes(node);

  if (routes.length === 0) {
    return <div className="text-xs text-text-muted text-center py-4">暂无路由条目</div>;
  }

  return (
    <div>
      <table className="w-full text-[10px]">
        <thead>
          <tr className="text-text-muted border-b border-border">
            <th className="text-left font-medium py-1">目标网络</th>
            <th className="text-left font-medium py-1">下一跳</th>
            <th className="text-left font-medium py-1">类型</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((r, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-1 font-mono text-text-primary">{r.destination}/{r.mask}</td>
              <td className="py-1 font-mono text-text-secondary">{r.nextHop}</td>
              <td className="py-1">
                <span className={`px-1 py-0.5 rounded text-[9px] ${
                  r.type === '直连' ? 'bg-green-50 text-green-700' :
                  r.type === '静态' ? 'bg-blue-50 text-blue-700' :
                  'bg-purple-50 text-purple-700'
                }`}>
                  {r.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function computeRoutes(node: TopologyNode): RouteEntry[] {
  const entries: RouteEntry[] = [];

  // Connected routes from interfaces
  for (const iface of node.data.interfaces) {
    if (iface.ipAddress && iface.status === 'up') {
      const parsed = parseCidr(iface.ipAddress);
      if (parsed) {
        entries.push({
          destination: getNetworkAddress(parsed.ip, parsed.mask),
          mask: parsed.mask,
          nextHop: 'Direct (直连)',
          type: '直连',
        });
      }
    }
  }

  // Static routes
  const staticRoutes = node.data.protocols.staticRoutes ?? [];
  for (const sr of staticRoutes) {
    entries.push({
      destination: sr.destination,
      mask: sr.mask,
      nextHop: sr.nextHop,
      type: '静态',
    });
  }

  // Dynamic routes (implied from OSPF/BGP/RIP)
  if (node.data.protocols.ospf?.enabled) {
    entries.push({
      destination: '从OSPF学习',
      mask: '—',
      nextHop: 'OSPF邻居',
      type: '动态',
    });
  }
  if (node.data.protocols.rip?.enabled) {
    entries.push({
      destination: '从RIP学习',
      mask: '—',
      nextHop: 'RIP邻居',
      type: '动态',
    });
  }
  if (node.data.protocols.bgp?.enabled) {
    entries.push({
      destination: '从BGP学习',
      mask: '—',
      nextHop: 'BGP邻居',
      type: '动态',
    });
  }

  return entries;
}
