import { useUIStore } from '../../store/useUIStore';
import { useTopologyStore } from '../../store/useTopologyStore';
import { VENDOR_THEMES } from '../../theme/vendorThemes';
import type { Vendor } from '../../types';
import { saveToLocalStorage, loadFromLocalStorage, exportToJson, importFromJson, downloadFile } from '../../utils/storage';
import { useRef } from 'react';
import clsx from 'clsx';

const VENDORS: Vendor[] = ['huawei', 'h3c', 'cisco', 'ruijie'];

export function TopBar() {
  const vendor = useUIStore((s) => s.vendor);
  const setVendor = useUIStore((s) => s.setVendor);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const { nodes, edges, topology } = useTopologyStore.getState();
    saveToLocalStorage({ topology, nodes, edges });
    alert('拓扑已保存到浏览器本地存储');
  };

  const handleLoad = () => {
    const data = loadFromLocalStorage();
    if (!data) {
      alert('没有找到已保存的拓扑');
      return;
    }
    useTopologyStore.getState().loadTopology(data.topology, data.nodes, data.edges);
    useUIStore.getState().selectNode(null);
  };

  const handleExport = () => {
    const { nodes, edges, topology } = useTopologyStore.getState();
    const json = exportToJson({ topology, nodes, edges });
    downloadFile(json, `${topology.name}.json`);
  };

  const handleImport = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = importFromJson(reader.result as string);
        useTopologyStore.getState().loadTopology(data.topology, data.nodes, data.edges);
        useUIStore.getState().selectNode(null);
      } catch {
        alert('文件格式无效');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    if (confirm('确定要清空整个拓扑吗？此操作不可撤销。')) {
      useTopologyStore.getState().clearAll();
      useUIStore.getState().selectNode(null);
    }
  };

  return (
    <div className="h-10 bg-surface-alt border-b border-border flex items-center px-3 gap-2 shrink-0">
      <h1 className="text-sm font-semibold text-text-primary mr-2 whitespace-nowrap">
        网络拓扑学习平台
      </h1>

      <div className="h-5 w-px bg-border" />

      {/* Vendor switcher */}
      <div className="flex items-center gap-0.5">
        {VENDORS.map((v) => {
          const theme = VENDOR_THEMES[v];
          return (
            <button
              key={v}
              onClick={() => setVendor(v)}
              className={clsx(
                'px-2.5 py-1 text-xs rounded-md transition-colors',
                vendor === v
                  ? 'text-white font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              )}
              style={vendor === v ? { backgroundColor: theme.brandColor } : undefined}
            >
              {theme.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <button onClick={handleSave} className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded">
        保存
      </button>
      <button onClick={handleLoad} className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded">
        加载
      </button>
      <button onClick={handleExport} className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded">
        导出
      </button>
      <button onClick={handleImport} className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded">
        导入
      </button>
      <input ref={fileRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
      <button onClick={handleClear} className="px-2 py-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded">
        清空
      </button>
    </div>
  );
}
