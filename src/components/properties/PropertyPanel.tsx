import { useUIStore } from '../../store/useUIStore';
import { useTopologyStore } from '../../store/useTopologyStore';
import { InterfaceEditor } from './InterfaceEditor';
import { ProtocolSelector } from './ProtocolSelector';
import { RouteTableView } from './RouteTableView';
import { DeviceSettings } from './DeviceSettings';
import type { RightPanelTab } from '../../types';
import clsx from 'clsx';

const TABS: { key: RightPanelTab; label: string }[] = [
  { key: 'interfaces', label: '接口' },
  { key: 'protocols', label: '协议' },
  { key: 'routing', label: '路由' },
  { key: 'settings', label: '设置' },
];

export function PropertyPanel() {
  const isOpen = useUIStore((s) => s.isRightPanelOpen);
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const tab = useUIStore((s) => s.rightPanelTab);
  const setTab = useUIStore((s) => s.setRightPanelTab);
  const selectNode = useUIStore((s) => s.selectNode);

  const node = useTopologyStore(
    (s) => selectedNodeId ? s.nodes.find((n) => n.id === selectedNodeId) ?? null : null
  );

  if (!isOpen || !node) return null;

  return (
    <div className="w-80 bg-surface-alt border-l border-border shrink-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-text-primary">{node.data.hostname}</span>
        <span className="text-[10px] text-text-muted bg-surface px-1.5 py-0.5 rounded">{node.data.model}</span>
        <button
          onClick={() => selectNode(null)}
          className="ml-auto text-text-muted hover:text-text-primary"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'flex-1 text-xs py-2 text-center transition-colors',
              tab === t.key
                ? 'text-brand border-b-2 border-brand font-medium'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'interfaces' && <InterfaceEditor node={node} />}
        {tab === 'protocols' && <ProtocolSelector node={node} />}
        {tab === 'routing' && <RouteTableView node={node} />}
        {tab === 'settings' && <DeviceSettings node={node} />}
      </div>

      {/* Delete button */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => {
            selectNode(null);
            useTopologyStore.getState().removeNodes([node.id]);
          }}
          className="w-full py-1.5 text-xs text-red-500 hover:bg-red-50 rounded border border-red-200"
        >
          删除此设备
        </button>
      </div>
    </div>
  );
}
