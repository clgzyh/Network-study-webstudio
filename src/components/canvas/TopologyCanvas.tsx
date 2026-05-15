import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeMouseHandler,
  type OnConnect,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTopologyStore } from '../../store/useTopologyStore';
import { useUIStore } from '../../store/useUIStore';
import { BaseDeviceNode } from './nodes/BaseDeviceNode';
import { CustomEdge } from './edges/CustomEdge';
import { ConnectionModal } from './ConnectionModal';
import type { DeviceCategory, ConnectionMedia } from '../../types';

const nodeTypes = { device: BaseDeviceNode };
const edgeTypes = { connection: CustomEdge };

export function TopologyCanvas() {
  const nodes = useTopologyStore((s) => s.nodes);
  const edges = useTopologyStore((s) => s.edges);
  const setNodes = useTopologyStore((s) => s.setNodes);
  const setEdges = useTopologyStore((s) => s.setEdges);
  const addNode = useTopologyStore((s) => s.addNode);
  const addEdge = useTopologyStore((s) => s.addEdge);
  const vendor = useUIStore((s) => s.vendor);
  const selectNode = useUIStore((s) => s.selectNode);
  const selectEdge = useUIStore((s) => s.selectEdge);

  const rfInstance = useReactFlow();
  const [connectingEdge, setConnectingEdge] = useState<Connection | null>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData('application/topology-device');
      if (!raw) return;
      const deviceType = raw as DeviceCategory;
      const pos = rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const nodeId = addNode(deviceType, pos.x, pos.y, vendor);
      selectNode(nodeId);
    },
    [rfInstance, vendor, addNode, selectNode]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string }) => {
      selectEdge(edge.id);
    },
    [selectEdge]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setConnectingEdge(connection);
    },
    []
  );

  const handleConnectionConfirm = (sourceIface: string, targetIface: string, mediaType: ConnectionMedia, speed: string) => {
    if (!connectingEdge) return;
    addEdge(connectingEdge.source, connectingEdge.target, sourceIface, targetIface, mediaType, speed);
    setConnectingEdge(null);
  };

  const handleConnectionCancel = () => {
    setConnectingEdge(null);
  };

  // Find device data for connection modal
  const sourceDevice = connectingEdge
    ? nodes.find((n) => n.id === connectingEdge.source)
    : null;
  const targetDevice = connectingEdge
    ? nodes.find((n) => n.id === connectingEdge.target)
    : null;

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes as any}
        edges={edges as any}
        onNodesChange={(changes) => {
          const currentNodes = useTopologyStore.getState().nodes;
          // Filter out 'add' changes for nodes already in the store, since
          // nodes are added via addNode() — not through ReactFlow internally.
          // Applying them again would create duplicates and an infinite loop.
          const filtered = changes.filter((ch) => {
            if (ch.type === 'add') {
              return !currentNodes.some((n) => n.id === ch.item.id);
            }
            return true;
          });
          if (filtered.length === 0) return;
          setNodes(applyNodeChanges(filtered, currentNodes as any) as typeof currentNodes);
        }}
        onEdgesChange={(changes) => {
          const currentEdges = useTopologyStore.getState().edges;
          const filtered = changes.filter((ch) => {
            if (ch.type === 'add') {
              return !currentEdges.some((e) => e.id === ch.item.id);
            }
            return true;
          });
          if (filtered.length === 0) return;
          setEdges(applyEdgeChanges(filtered, currentEdges as any) as typeof currentEdges);
        }}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={null} // handled by useKeyboard
        multiSelectionKeyCode="Shift"
        snapToGrid
        snapGrid={[20, 20]}
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            const data = n.data as { deviceType?: string } | undefined;
            if (data?.deviceType) {
              const colors: Record<string, string> = {
                router: '#cf0a2c',
                switch: '#0a6ecf',
                firewall: '#e8781a',
                'access-controller': '#6b2fa0',
                'access-point': '#0a8f5c',
                pc: '#4b5563',
                server: '#1d4ed8',
                cloud: '#0891b2',
              };
              return colors[data.deviceType] ?? '#9ca3af';
            }
            return '#9ca3af';
          }}
        />
      </ReactFlow>

      {connectingEdge && sourceDevice && targetDevice && (
        <ConnectionModal
          sourceDevice={sourceDevice}
          targetDevice={targetDevice}
          onConfirm={handleConnectionConfirm}
          onCancel={handleConnectionCancel}
        />
      )}
    </div>
  );
}
