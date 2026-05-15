import type { Vendor } from './vendor';
import type { DeviceCategory } from './topology';

export type RightPanelTab = 'interfaces' | 'protocols' | 'routing' | 'settings';
export type BottomPanelTab = 'config' | 'summary' | 'validation';
export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  message: string;
  details?: string;
  relatedDeviceId?: string;
  relatedEdgeId?: string;
}

export interface PaletteCategory {
  label: string;
  items: PaletteItem[];
}

export interface PaletteItem {
  deviceType: DeviceCategory;
  label: string;
  icon: string;
  description: string;
}
