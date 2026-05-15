import type { DragEvent } from 'react';
import { Router, ArrowLeftRight, Shield, RadioTower, Wifi, Monitor, Server, Cloud } from 'lucide-react';
import type { DeviceCategory } from '../../types';
import { DEVICE_LABELS } from '../../constants/devices';
import { useVendorTheme } from '../../theme/useVendorTheme';
import clsx from 'clsx';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  router: Router,
  switch: ArrowLeftRight,
  firewall: Shield,
  'access-controller': RadioTower,
  'access-point': Wifi,
  pc: Monitor,
  server: Server,
  cloud: Cloud,
};

const DEVICES: { type: DeviceCategory; icon: string; description: string }[] = [
  { type: 'router', icon: 'router', description: '支持OSPF/BGP/RIP/NAT/DHCP' },
  { type: 'switch', icon: 'switch', description: '支持VLAN/STP/ACL' },
  { type: 'firewall', icon: 'firewall', description: '支持ACL/NAT/静态路由' },
  { type: 'access-controller', icon: 'access-controller', description: 'AC无线控制器' },
  { type: 'access-point', icon: 'access-point', description: 'AP无线接入点' },
  { type: 'pc', icon: 'pc', description: '终端PC设备' },
  { type: 'server', icon: 'server', description: '服务器设备' },
  { type: 'cloud', icon: 'cloud', description: '互联网/云端' },
];

export function DevicePalette() {
  const theme = useVendorTheme();

  function onDragStart(e: DragEvent, type: DeviceCategory) {
    e.dataTransfer.setData('application/topology-device', type);
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div className="w-44 bg-surface-alt border-r border-border flex flex-col shrink-0 overflow-y-auto">
      <div className="p-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
        设备面板
      </div>
      <div className="flex flex-col gap-1 px-2 pb-2">
        {DEVICES.map(({ type, description }) => {
          const IconComp = ICON_MAP[type] ?? Server;
          const label = DEVICE_LABELS[type];
          const color = theme.nodeStyles[type];
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => onDragStart(e, type)}
              className={clsx(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-grab',
                'border border-border bg-surface hover:bg-surface-hover',
                'active:cursor-grabbing transition-colors'
              )}
            >
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}18`, color }}
              >
                <IconComp size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-text-primary">{label}</span>
                <span className="text-[10px] text-text-muted leading-tight">{description}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-2.5 text-[10px] text-text-muted leading-relaxed border-t border-border mt-auto">
        拖拽设备到画布上，然后从设备端口拖线连接
      </div>
    </div>
  );
}
