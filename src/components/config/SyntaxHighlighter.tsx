import { useMemo } from 'react';

interface Token {
  text: string;
  type: 'comment' | 'keyword' | 'param' | 'value' | 'prompt' | 'header' | 'plain';
}

interface Props {
  code: string;
}

const KEYWORDS = new Set([
  'system-view', 'sysname', 'interface', 'ip', 'address', 'undo', 'shutdown',
  'ospf', 'bgp', 'rip', 'vlan', 'stp', 'acl', 'nat', 'dhcp', 'enable',
  'configure', 'terminal', 'router', 'exit', 'quit', 'no', 'hostname',
  'ip route', 'ip route-static', 'show', 'display', 'write', 'save',
  'switchport', 'spanning-tree', 'access-list', 'description',
  'network', 'area', 'neighbor', 'version', 'port', 'pool',
  'default-router', 'dns-server', 'end', 'write memory',
]);

export function SyntaxHighlighter({ code }: Props) {
  const tokens = useMemo(() => tokenize(code), [code]);

  return (
    <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
      {tokens.map((t, i) => (
        <span key={i} className={colorClass(t.type)}>{t.text}</span>
      ))}
    </pre>
  );
}

function colorClass(type: Token['type']): string {
  switch (type) {
    case 'comment': return 'text-gray-400 italic';
    case 'keyword': return 'text-cyan-600';
    case 'param': return 'text-yellow-600';
    case 'value': return 'text-green-600';
    case 'prompt': return 'text-gray-400';
    case 'header': return 'text-blue-600 font-bold';
    case 'plain': return 'text-text-primary';
  }
}

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split('\n');

  for (const line of lines) {
    // Comment line
    if (/^\s*[#!]/.test(line)) {
      tokens.push({ text: line + '\n', type: 'comment' });
      continue;
    }

    // Section header
    if (/^={3,}/.test(line.trim())) {
      tokens.push({ text: line + '\n', type: 'header' });
      continue;
    }

    // Prompt detection
    const promptMatch = line.match(/^(\[[^\]]+\]|[\w-]+[>#]\(config[\w-]*\)[#]\s*|[\w-]+>|[\w-]+#)/);
    if (promptMatch) {
      tokens.push({ text: promptMatch[0], type: 'prompt' });
      const rest = line.substring(promptMatch[0].length);
      tokenizeLine(rest, tokens);
      tokens.push({ text: '\n', type: 'plain' });
      continue;
    }

    tokenizeLine(line, tokens);
    tokens.push({ text: '\n', type: 'plain' });
  }

  return tokens;
}

function tokenizeLine(line: string, tokens: Token[]): void {
  const words = line.split(/(\s+)/);
  for (const word of words) {
    if (!word.trim()) {
      tokens.push({ text: word, type: 'plain' });
      continue;
    }

    // IP address like 192.168.1.1
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/.test(word)) {
      tokens.push({ text: word, type: 'param' });
      continue;
    }

    // Subnet mask
    if (/^255\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(word)) {
      tokens.push({ text: word, type: 'param' });
      continue;
    }

    // Wildcard mask
    if (/^0\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(word)) {
      tokens.push({ text: word, type: 'param' });
      continue;
    }

    // Numbers
    if (/^\d+$/.test(word)) {
      tokens.push({ text: word, type: 'param' });
      continue;
    }

    // Keywords (case-insensitive)
    if (KEYWORDS.has(word.toLowerCase())) {
      tokens.push({ text: word, type: 'keyword' });
      continue;
    }

    // Interface names
    if (/^(GigabitEthernet|Serial|LoopBack|Vlanif|Ten-GigabitEthernet|XGigabitEthernet|Management|Ethernet)\d/i.test(word)) {
      tokens.push({ text: word, type: 'value' });
      continue;
    }

    tokens.push({ text: word, type: 'plain' });
  }
}
