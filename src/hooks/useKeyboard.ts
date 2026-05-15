import { useEffect } from 'react';
import { useTopologyStore } from '../store/useTopologyStore';
import { useUIStore } from '../store/useUIStore';

export function useKeyboard() {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useTopologyStore.getState().undo();
      }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        useTopologyStore.getState().redo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedNodeId, selectedEdgeId } = useUIStore.getState();
        if (selectedNodeId) {
          useTopologyStore.getState().removeNodes([selectedNodeId]);
          useUIStore.getState().selectNode(null);
        } else if (selectedEdgeId) {
          useTopologyStore.getState().removeEdges([selectedEdgeId]);
          useUIStore.getState().selectEdge(null);
        }
      }
      if (e.key === 'Escape') {
        useUIStore.getState().selectNode(null);
        useUIStore.getState().selectEdge(null);
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
