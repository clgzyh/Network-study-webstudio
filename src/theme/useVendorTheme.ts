import { useUIStore } from '../store/useUIStore';
import { VENDOR_THEMES } from './vendorThemes';
import type { VendorTheme } from '../types';

export function useVendorTheme(): VendorTheme {
  const vendor = useUIStore((s) => s.vendor);
  return VENDOR_THEMES[vendor];
}

export function getVendorTheme(vendor: string): VendorTheme {
  return VENDOR_THEMES[vendor as keyof typeof VENDOR_THEMES] ?? VENDOR_THEMES.huawei;
}
