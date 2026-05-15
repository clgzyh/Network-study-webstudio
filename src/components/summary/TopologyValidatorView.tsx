import { useMemo } from 'react';
import { useTopologyStore } from '../../store/useTopologyStore';
import { validateTopology } from '../../validation/TopologyValidator';
import clsx from 'clsx';

export function TopologyValidatorView() {
  const nodes = useTopologyStore((s) => s.nodes);
  const edges = useTopologyStore((s) => s.edges);

  const issues = useMemo(() => validateTopology(nodes, edges), [nodes, edges]);

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-green-600 gap-1">
        <span className="text-lg">✓</span>
        <span>拓扑验证通过，没有发现问题</span>
      </div>
    );
  }

  const severityIcon = { error: '✕', warning: '⚠', info: 'ℹ' };
  const severityColor = {
    error: 'text-red-600 bg-red-50 border-red-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
  };

  return (
    <div className="h-full overflow-auto p-3 bg-gray-50">
      <div className="text-xs text-text-muted mb-2">发现 {issues.length} 个问题</div>
      <div className="space-y-1.5">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className={clsx('flex items-start gap-2 px-2.5 py-2 rounded border text-xs', severityColor[issue.severity])}
          >
            <span className="shrink-0 font-bold">{severityIcon[issue.severity]}</span>
            <span>{issue.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
