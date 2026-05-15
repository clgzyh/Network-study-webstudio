import { useMemo, useState } from 'react';
import { useTopologyStore } from '../../store/useTopologyStore';
import { useUIStore } from '../../store/useUIStore';
import { getGenerator } from '../../config-generator/registry';
import { SyntaxHighlighter } from './SyntaxHighlighter';

export function ConfigOutput() {
  const nodes = useTopologyStore((s) => s.nodes);
  const edges = useTopologyStore((s) => s.edges);
  const vendor = useUIStore((s) => s.vendor);
  const showAnnotations = useUIStore((s) => s.showAnnotations);
  const toggleAnnotations = useUIStore((s) => s.toggleAnnotations);

  const [selectedDevice, setSelectedDevice] = useState<string>('all');

  const config = useMemo(() => {
    const generator = getGenerator(vendor);
    return generator.generateFullConfig(nodes, edges, {
      annotations: showAnnotations,
      deviceScope: selectedDevice === 'all' ? 'all' : [selectedDevice],
      lineNumbers: true,
    });
  }, [nodes, edges, vendor, showAnnotations, selectedDevice]);

  const deviceNodes = nodes.filter((n) =>
    ['router', 'switch', 'firewall', 'access-controller'].includes(n.data.deviceType)
  );

  const copyToClipboard = () => {
    const generator = getGenerator(vendor);
    const plainConfig = generator.generateFullConfig(nodes, edges, {
      annotations: false,
      deviceScope: selectedDevice === 'all' ? 'all' : [selectedDevice],
      lineNumbers: false,
    });
    navigator.clipboard.writeText(plainConfig).catch(() => {});
  };

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-text-muted">
        从左侧拖入设备开始构建拓扑，配置将在此处生成
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-border shrink-0">
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="text-xs border border-border rounded px-2 py-1 bg-surface"
        >
          <option value="all">全部设备</option>
          {deviceNodes.map((n) => (
            <option key={n.id} value={n.id}>{n.data.hostname}</option>
          ))}
        </select>

        <label className="flex items-center gap-1 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={showAnnotations}
            onChange={toggleAnnotations}
            className="rounded"
          />
          显示注解
        </label>

        <button
          onClick={copyToClipboard}
          className="ml-auto px-2 py-1 text-xs text-text-secondary hover:bg-surface-hover rounded border border-border"
        >
          复制配置
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 bg-gray-50">
        {config ? (
          <SyntaxHighlighter code={config} />
        ) : (
          <div className="text-xs text-text-muted">暂无配置生成</div>
        )}
      </div>
    </div>
  );
}
