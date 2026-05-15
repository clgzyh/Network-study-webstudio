export function parseCidr(cidr: string): { ip: string; prefix: number; mask: string; wildcard: string } | null {
  const parts = cidr.split('/');
  if (parts.length !== 2) return null;
  const ip = parts[0];
  const prefix = parseInt(parts[1], 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null;
  if (!isValidIp(ip)) return null;
  const mask = prefixToMask(prefix);
  const wildcard = maskToWildcard(mask);
  return { ip, prefix, mask, wildcard };
}

export function prefixToMask(prefix: number): string {
  const mask = ~(2 ** (32 - prefix) - 1) >>> 0;
  return [mask >>> 24, (mask >> 16) & 0xff, (mask >> 8) & 0xff, mask & 0xff].join('.');
}

export function maskToWildcard(mask: string): string {
  return mask.split('.').map(o => 255 - parseInt(o, 10)).join('.');
}

export function isValidIp(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(p => {
    const n = parseInt(p, 10);
    return !isNaN(n) && n >= 0 && n <= 255 && p === String(n);
  });
}

export function getNetworkAddress(ip: string, mask: string): string {
  const ipParts = ip.split('.').map(Number);
  const maskParts = mask.split('.').map(Number);
  return ipParts.map((o, i) => o & maskParts[i]).join('.');
}

export function cidrToDisplay(subnet: string): string {
  const parsed = parseCidr(subnet);
  if (!parsed) return subnet;
  return `${parsed.ip}/${parsed.prefix}`;
}
