import { useState } from 'react';
import type { TopologyNode, ConnectionMedia } from '../../types';
import { SPEED_OPTIONS } from '../../constants/protocols';

interface Props {
  sourceDevice: TopologyNode;
  targetDevice: TopologyNode;
  onConfirm: (sourceIface: string, targetIface: string, mediaType: ConnectionMedia, speed: string) => void;
  onCancel: () => void;
}

const MEDIA_LABELS: Record<ConnectionMedia, string> = {
  ethernet: '以太网 Ethernet',
  serial: '串行 Serial',
  fiber: '光纤 Fiber',
};

export function ConnectionModal({ sourceDevice, targetDevice, onConfirm, onCancel }: Props) {
  const availSrc = sourceDevice.data.interfaces.filter((i) => !i.connectedEdgeId);
  const availTgt = targetDevice.data.interfaces.filter((i) => !i.connectedEdgeId);
  const [srcIface, setSrcIface] = useState(availSrc[0]?.id ?? '');
  const [tgtIface, setTgtIface] = useState(availTgt[0]?.id ?? '');
  const [mediaType, setMediaType] = useState<ConnectionMedia>('ethernet');
  const [speed, setSpeed] = useState('1G');

  const canConfirm = srcIface && tgtIface;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl border border-border w-96 p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">连接设备</h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-text-primary">{sourceDevice.data.hostname}</span>
          <span className="text-text-muted">→</span>
          <span className="text-xs font-medium text-text-primary">{targetDevice.data.hostname}</span>
        </div>

        {/* Source interface */}
        <label className="block text-xs text-text-secondary mb-1">源接口 ({sourceDevice.data.hostname})</label>
        <select value={srcIface} onChange={(e) => setSrcIface(e.target.value)}
          className="w-full text-xs border border-border rounded px-2 py-1.5 mb-3 bg-surface">
          {availSrc.length === 0 && <option value="">没有可用接口</option>}
          {availSrc.map((i) => (
            <option key={i.id} value={i.id}>{i.name}{i.ipAddress ? ` (${i.ipAddress})` : ''}</option>
          ))}
        </select>

        {/* Target interface */}
        <label className="block text-xs text-text-secondary mb-1">目标接口 ({targetDevice.data.hostname})</label>
        <select value={tgtIface} onChange={(e) => setTgtIface(e.target.value)}
          className="w-full text-xs border border-border rounded px-2 py-1.5 mb-3 bg-surface">
          {availTgt.length === 0 && <option value="">没有可用接口</option>}
          {availTgt.map((i) => (
            <option key={i.id} value={i.id}>{i.name}{i.ipAddress ? ` (${i.ipAddress})` : ''}</option>
          ))}
        </select>

        {/* Media type */}
        <label className="block text-xs text-text-secondary mb-1">链路类型</label>
        <div className="flex gap-1 mb-3">
          {(Object.entries(MEDIA_LABELS) as [ConnectionMedia, string][]).map(([k, v]) => (
            <button
              key={k}
              onClick={() => { setMediaType(k); setSpeed(SPEED_OPTIONS[k]?.[0] ?? '1G'); }}
              className="flex-1 text-xs py-1.5 px-2 rounded border transition-colors"
              style={{
                borderColor: mediaType === k ? '#3b82f6' : undefined,
                backgroundColor: mediaType === k ? '#eff6ff' : undefined,
                color: mediaType === k ? '#1d4ed8' : undefined,
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Speed */}
        <label className="block text-xs text-text-secondary mb-1">速率</label>
        <select value={speed} onChange={(e) => setSpeed(e.target.value)}
          className="w-full text-xs border border-border rounded px-2 py-1.5 mb-4 bg-surface">
          {(SPEED_OPTIONS[mediaType] ?? []).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel}
            className="px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover rounded">
            取消
          </button>
          <button onClick={() => canConfirm && onConfirm(srcIface, tgtIface, mediaType, speed)}
            disabled={!canConfirm}
            className="px-3 py-1.5 text-xs bg-brand text-white rounded disabled:opacity-40 disabled:cursor-not-allowed">
            确认连接
          </button>
        </div>
      </div>
    </div>
  );
}
