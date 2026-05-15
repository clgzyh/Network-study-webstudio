import { useMemo } from 'react';
import { useTopologyStore } from '../../store/useTopologyStore';
import { generateSummary } from '../../summary/SummaryGenerator';

export function NetworkSummary() {
  const nodes = useTopologyStore((s) => s.nodes);
  const edges = useTopologyStore((s) => s.edges);

  const summary = useMemo(() => generateSummary(nodes, edges), [nodes, edges]);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-text-muted">
        请先构建网络拓扑，总结将在此显示
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4 bg-gray-50">
      <pre className="text-xs font-mono text-text-primary leading-relaxed whitespace-pre-wrap">
        {summary}
      </pre>
    </div>
  );
}
