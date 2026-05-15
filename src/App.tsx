import { Component } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TopBar } from './components/layout/TopBar';
import { DevicePalette } from './components/palette/DevicePalette';
import { TopologyCanvas } from './components/canvas/TopologyCanvas';
import { PropertyPanel } from './components/properties/PropertyPanel';
import { BottomPanel } from './components/layout/BottomPanel';
import { useKeyboard } from './hooks/useKeyboard';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-surface">
          <div className="text-center max-w-md p-8">
            <h1 className="text-lg font-semibold text-red-600 mb-3">页面发生错误</h1>
            <p className="text-sm text-text-secondary mb-4 break-all font-mono">
              {this.state.error.message}
            </p>
            <button
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
              className="px-4 py-2 text-sm bg-brand text-white rounded hover:opacity-90"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  useKeyboard();

  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <div className="h-screen w-screen flex flex-col bg-surface">
          <TopBar />
          <div className="flex flex-1 overflow-hidden">
            <DevicePalette />
            <div className="flex-1 relative">
              <TopologyCanvas />
            </div>
            <PropertyPanel />
          </div>
          <BottomPanel />
        </div>
      </ReactFlowProvider>
    </ErrorBoundary>
  );
}
