import { useUIStore } from '../../store/useUIStore';
import { ConfigOutput } from '../config/ConfigOutput';
import { NetworkSummary } from '../summary/NetworkSummary';
import { TopologyValidatorView } from '../summary/TopologyValidatorView';
import type { BottomPanelTab } from '../../types';
import clsx from 'clsx';

const TABS: { key: BottomPanelTab; label: string }[] = [
  { key: 'config', label: '配置命令' },
  { key: 'summary', label: '通信总结' },
  { key: 'validation', label: '验证检查' },
];

export function BottomPanel() {
  const isOpen = useUIStore((s) => s.isBottomPanelOpen);
  const tab = useUIStore((s) => s.bottomPanelTab);
  const setTab = useUIStore((s) => s.setBottomPanelTab);
  const toggle = useUIStore((s) => s.toggleBottomPanel);

  return (
    <div className="border-t border-border bg-surface shrink-0 flex flex-col" style={{ height: isOpen ? 300 : 32 }}>
      {/* Header */}
      <div className="flex items-center h-8 px-3 border-b border-border shrink-0">
        <div className="flex gap-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { if (!isOpen) toggle(); setTab(t.key); }}
              className={clsx(
                'px-3 py-1 text-xs transition-colors rounded-t',
                tab === t.key && isOpen
                  ? 'text-brand font-medium bg-surface border-b-2 border-brand'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={toggle}
          className="ml-auto text-text-muted hover:text-text-primary text-xs px-2"
        >
          {isOpen ? '▼ 收起' : '▲ 展开'}
        </button>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="flex-1 overflow-hidden">
          {tab === 'config' && <ConfigOutput />}
          {tab === 'summary' && <NetworkSummary />}
          {tab === 'validation' && <TopologyValidatorView />}
        </div>
      )}
    </div>
  );
}
