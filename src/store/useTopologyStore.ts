import { create } from 'zustand';
import { produce } from 'immer';
import type { TopologyNode, TopologyEdge, DeviceCategory, DeviceInterface, ConnectionMedia, NetworkTopology } from '../types';
import { generateId, generateHostname } from '../utils/id';
import { DEVICE_DEFAULTS } from '../constants/devices';


interface Snapshot {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

interface TopologyState {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  topology: NetworkTopology;
  past: Snapshot[];
  future: Snapshot[];

  addNode: (type: DeviceCategory, x: number, y: number, vendor: string) => string;
  updateNodeData: (nodeId: string, patch: Partial<TopologyNode['data']>) => void;
  removeNodes: (nodeIds: string[]) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  addEdge: (source: string, target: string, sourceIface: string, targetIface: string, mediaType: ConnectionMedia, speed: string) => string;
  removeEdges: (edgeIds: string[]) => void;
  setNodes: (nodes: TopologyNode[]) => void;
  setEdges: (edges: TopologyEdge[]) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  pushSnapshot: () => void;
  loadTopology: (topology: NetworkTopology, nodes: TopologyNode[], edges: TopologyEdge[]) => void;
}

export const useTopologyStore = create<TopologyState>((set, get) => {
  function pushSnapshot() {
    const { nodes, edges } = get();
    set((s) => ({
      past: [...s.past.slice(-49), { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
      future: [],
    }));
  }

  return {
    nodes: [],
    edges: [],
    topology: {
      id: generateId(),
      name: '未命名拓扑',
      vendor: 'huawei',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    past: [],
    future: [],

    addNode: (type, x, y, vendor) => {
      pushSnapshot();
      const { nodes } = get();
      const defaults = DEVICE_DEFAULTS[type];
      const id = generateId();
      const hostname = generateHostname(
        defaults.defaultHostnamePrefix,
        nodes.map((n) => n.data.hostname)
      );
      const model = defaults.defaultModel[vendor] ?? Object.values(defaults.defaultModel)[0];

      const interfaces: DeviceInterface[] = defaults.interfaces.map((iface) => ({
        ...iface,
        id: generateId(),
      }));

      const node: TopologyNode = {
        id,
        type: 'device',
        position: { x, y },
        data: {
          deviceType: type,
          hostname,
          label: hostname,
          model,
          interfaces,
          protocols: {},
        },
        selected: false,
      };

      set(
        produce((state: TopologyState) => {
          state.nodes.push(node);
          state.topology.updatedAt = new Date().toISOString();
          state.topology.vendor = vendor;
        })
      );
      return id;
    },

    updateNodeData: (nodeId, patch) => {
      pushSnapshot();
      set(
        produce((state: TopologyState) => {
          const node = state.nodes.find((n) => n.id === nodeId);
          if (node) {
            Object.assign(node.data, patch);
          }
          state.topology.updatedAt = new Date().toISOString();
        })
      );
    },

    removeNodes: (nodeIds) => {
      pushSnapshot();
      set(
        produce((state: TopologyState) => {
          state.nodes = state.nodes.filter((n) => !nodeIds.includes(n.id));
          state.edges = state.edges.filter(
            (e) => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)
          );
          state.topology.updatedAt = new Date().toISOString();
        })
      );
    },

    updateNodePosition: (nodeId, x, y) => {
      set(
        produce((state: TopologyState) => {
          const node = state.nodes.find((n) => n.id === nodeId);
          if (node) {
            node.position = { x, y };
          }
        })
      );
    },

    addEdge: (source, target, sourceIface, targetIface, mediaType, speed) => {
      pushSnapshot();
      const id = `edge-${generateId()}`;
      set(
        produce((state: TopologyState) => {
          const edge: TopologyEdge = {
            id,
            source,
            target,
            type: 'connection',
            data: {
              sourceDeviceId: source,
              targetDeviceId: target,
              sourceInterfaceId: sourceIface,
              targetInterfaceId: targetIface,
              mediaType,
              speed,
              status: 'up',
            },
          };
          state.edges.push(edge);

          // Mark interfaces as connected
          const srcNode = state.nodes.find((n) => n.id === source);
          const tgtNode = state.nodes.find((n) => n.id === target);
          if (srcNode) {
            const iface = srcNode.data.interfaces.find((i) => i.id === sourceIface);
            if (iface) iface.connectedEdgeId = id;
          }
          if (tgtNode) {
            const iface = tgtNode.data.interfaces.find((i) => i.id === targetIface);
            if (iface) iface.connectedEdgeId = id;
          }

          state.topology.updatedAt = new Date().toISOString();
        })
      );
      return id;
    },

    removeEdges: (edgeIds) => {
      pushSnapshot();
      set(
        produce((state: TopologyState) => {
          const removed = state.edges.filter((e) => edgeIds.includes(e.id));
          state.edges = state.edges.filter((e) => !edgeIds.includes(e.id));

          // Clear interface connections
          for (const edge of removed) {
            const srcNode = state.nodes.find((n) => n.id === edge.source);
            const tgtNode = state.nodes.find((n) => n.id === edge.target);
            if (srcNode) {
              const iface = srcNode.data.interfaces.find(
                (i) => i.id === edge.data?.sourceInterfaceId
              );
              if (iface) iface.connectedEdgeId = undefined;
            }
            if (tgtNode) {
              const iface = tgtNode.data.interfaces.find(
                (i) => i.id === edge.data?.targetInterfaceId
              );
              if (iface) iface.connectedEdgeId = undefined;
            }
          }
          state.topology.updatedAt = new Date().toISOString();
        })
      );
    },

    setNodes: (nodes) => {
      set((state) => ({ ...state, nodes }));
    },

    setEdges: (edges) => {
      set((state) => ({ ...state, edges }));
    },

    clearAll: () => {
      pushSnapshot();
      set({
        nodes: [],
        edges: [],
        topology: {
          id: generateId(),
          name: '未命名拓扑',
          vendor: 'huawei',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    },

    undo: () => {
      const { past } = get();
      if (past.length === 0) return;
      const snapshot = past[past.length - 1];
      const { nodes: currentNodes, edges: currentEdges } = get();
      set({
        past: past.slice(0, -1),
        future: [
          { nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)) },
          ...get().future,
        ],
        nodes: snapshot.nodes,
        edges: snapshot.edges,
      });
    },

    redo: () => {
      const { future } = get();
      if (future.length === 0) return;
      const snapshot = future[0];
      const { nodes: currentNodes, edges: currentEdges } = get();
      set({
        future: future.slice(1),
        past: [
          ...get().past,
          { nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)) },
        ],
        nodes: snapshot.nodes,
        edges: snapshot.edges,
      });
    },

    pushSnapshot: () => {
      pushSnapshot();
    },

    loadTopology: (topology, nodes, edges) => {
      set({ topology, nodes, edges, past: [], future: [] });
    },
  };
});
