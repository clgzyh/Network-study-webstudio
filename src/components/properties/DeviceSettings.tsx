import type { TopologyNode } from '../../types';
import { useTopologyStore } from '../../store/useTopologyStore';
import { DEVICE_DEFAULTS } from '../../constants/devices';
import { useUIStore } from '../../store/useUIStore';
import { VENDOR_THEMES } from '../../theme/vendorThemes';

interface Props {
  node: TopologyNode;
}

export function DeviceSettings({ node }: Props) {
  const updateNodeData = useTopologyStore((s) => s.updateNodeData);
  const vendor = useUIStore((s) => s.vendor);
  const models = DEVICE_DEFAULTS[node.data.deviceType]?.defaultModel ?? {};
  const modelOptions = Object.entries(models);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[10px] text-text-secondary mb-0.5">主机名</label>
        <input
          type="text"
          value={node.data.hostname}
          onChange={(e) => updateNodeData(node.id, { hostname: e.target.value, label: e.target.value })}
          className="w-full text-xs border border-border rounded px-2 py-1.5 bg-surface"
        />
      </div>

      <div>
        <label className="block text-[10px] text-text-secondary mb-0.5">型号</label>
        <select
          value={node.data.model}
          onChange={(e) => updateNodeData(node.id, { model: e.target.value })}
          className="w-full text-xs border border-border rounded px-2 py-1.5 bg-surface"
        >
          {modelOptions.map(([k, v]) => (
            <option key={k} value={v}>{v} ({k === vendor ? '默认' : k})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] text-text-secondary mb-0.5">Enable 密码</label>
        <input
          type="text"
          value={node.data.enablePassword ?? ''}
          onChange={(e) => updateNodeData(node.id, { enablePassword: e.target.value || undefined })}
          className="w-full text-xs border border-border rounded px-2 py-1.5 bg-surface"
          placeholder="留空则使用默认密码"
        />
      </div>

      <div>
        <label className="block text-[10px] text-text-secondary mb-0.5">Banner 标语</label>
        <textarea
          value={node.data.banner ?? ''}
          onChange={(e) => updateNodeData(node.id, { banner: e.target.value || undefined })}
          rows={2}
          className="w-full text-xs border border-border rounded px-2 py-1.5 bg-surface resize-none"
          placeholder="登录横幅信息"
        />
      </div>

      <div>
        <label className="block text-[10px] text-text-secondary mb-0.5">备注</label>
        <textarea
          value={node.data.notes ?? ''}
          onChange={(e) => updateNodeData(node.id, { notes: e.target.value || undefined })}
          rows={3}
          className="w-full text-xs border border-border rounded px-2 py-1.5 bg-surface resize-none"
          placeholder="设备备注信息..."
        />
      </div>
    </div>
  );
}
