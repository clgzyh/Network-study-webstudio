import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Router, ArrowLeftRight, Shield, RadioTower, Wifi, Monitor, Server, Cloud } from 'lucide-react';
import type { DeviceNodeData, DeviceCategory } from '../../../types';
import { useUIStore } from '../../../store/useUIStore';
import { getVendorTheme } from '../../../theme/useVendorTheme';
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

function getConnectedIps(data: DeviceNodeData): string[] {
  return data.interfaces
    .filter((i) => i.connectedEdgeId && i.ipAddress)
    .map((i) => i.ipAddress!.split('/')[0]);
}

export const BaseDeviceNode = memo(function BaseDeviceNode({ data, selected }: NodeProps) {
  const deviceData = data as unknown as DeviceNodeData;
  const vendor = useUIStore((s) => s.vendor);
  const theme = getVendorTheme(vendor);
  const color = theme.nodeStyles[deviceData.deviceType] ?? '#9ca3af';
  const IconComp = ICON_MAP[deviceData.deviceType] ?? Server;
  const connectedIps = getConnectedIps(deviceData);

  // Calculate handles based on interfaces
  const totalIfaces = deviceData.interfaces.length;

  return (
    <div
      className={clsx(
        'relative rounded-lg border-2 bg-white shadow-md min-w-[130px]',
        selected ? 'ring-2 ring-brand ring-offset-1' : ''
      )}
      style={{ borderColor: color }}
    >
      {/* Device header */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-md"
        style={{ backgroundColor: `${color}14` }}
      >
        <IconComp size={15} style={{ color }} className="shrink-0" />
        <span className="text-xs font-semibold text-text-primary truncate">
          {deviceData.hostname}
        </span>
        <span
          className="text-[9px] px-1 py-0.5 rounded font-medium ml-auto shrink-0"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {deviceData.model}
        </span>
      </div>

      {/* Interface list */}
      <div className="px-1.5 py-1">
        {deviceData.interfaces.slice(0, 4).map((iface, idx) => {
          const isConnected = !!iface.connectedEdgeId;
          return (
            <div
              key={iface.id}
              className="flex items-center gap-1 py-0.5 text-[10px]"
            >
              <span
                className={clsx(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  isConnected ? 'bg-green-500' : 'bg-gray-300'
                )}
              />
              <span className="text-text-muted truncate flex-1">{iface.name}</span>
              {iface.ipAddress && (
                <span className="text-text-secondary font-mono ml-1">{iface.ipAddress}</span>
              )}
            </div>
          );
        })}
        {deviceData.interfaces.length > 4 && (
          <div className="text-[9px] text-text-muted text-center">
            +{deviceData.interfaces.length - 4} 更多接口
          </div>
        )}
      </div>

      {/* Connected IP summary */}
      {connectedIps.length > 0 && (
        <div className="border-t border-border px-1.5 py-1 text-[9px] text-text-muted">
          {connectedIps.slice(0, 3).map((ip, i) => (
            <span key={i} className="inline-block bg-gray-100 rounded px-1 py-0.5 mr-0.5 mb-0.5 font-mono">{ip}</span>
          ))}
        </div>
      )}

      {/* Handles for connections */}
      <Handle type="source" position={Position.Right} id="right" className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2.5 !h-2.5 !bg-green-500 !border-2 !border-white" />
      <Handle type="target" position={Position.Top} id="top" className="!w-2.5 !h-2.5 !bg-green-500 !border-2 !border-white" />
    </div>
  );
});
