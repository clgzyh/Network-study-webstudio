let counter = 0;

export function generateId(): string {
  counter += 1;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}-${counter}`;
}

export function generateHostname(
  prefix: string,
  existing: string[]
): string {
  let num = 1;
  const pattern = new RegExp(`^${prefix}(\\d+)$`);
  for (const name of existing) {
    const match = name.match(pattern);
    if (match) {
      num = Math.max(num, parseInt(match[1], 10) + 1);
    }
  }
  return `${prefix}${num}`;
}
