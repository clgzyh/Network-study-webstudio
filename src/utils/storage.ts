import type { NetworkTopology, TopologyNode, TopologyEdge } from '../types';

const STORAGE_KEY = 'network-lab-topology';

interface SavedData {
  topology: NetworkTopology;
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export function saveToLocalStorage(data: SavedData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function loadFromLocalStorage(): SavedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedData;
  } catch {
    return null;
  }
}

export function exportToJson(data: SavedData): string {
  return JSON.stringify(data, null, 2);
}

export function importFromJson(json: string): SavedData {
  return JSON.parse(json) as SavedData;
}

export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
