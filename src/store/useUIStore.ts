import { create } from 'zustand';
import type { Vendor, RightPanelTab, BottomPanelTab, ValidationIssue } from '../types';

interface UIState {
  vendor: Vendor;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  rightPanelTab: RightPanelTab;
  bottomPanelTab: BottomPanelTab;
  bottomPanelHeight: number;
  isRightPanelOpen: boolean;
  isBottomPanelOpen: boolean;
  showAnnotations: boolean;
  configScope: 'all' | 'selected';
  validationIssues: ValidationIssue[];
  tutorialOpen: boolean;

  setVendor: (v: Vendor) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  setRightPanelTab: (t: RightPanelTab) => void;
  setBottomPanelTab: (t: BottomPanelTab) => void;
  setBottomPanelHeight: (h: number) => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  toggleAnnotations: () => void;
  setConfigScope: (scope: 'all' | 'selected') => void;
  setValidationIssues: (issues: ValidationIssue[]) => void;
  setTutorialOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  vendor: 'huawei',
  selectedNodeId: null,
  selectedEdgeId: null,
  rightPanelTab: 'interfaces',
  bottomPanelTab: 'config',
  bottomPanelHeight: 280,
  isRightPanelOpen: false,
  isBottomPanelOpen: true,
  showAnnotations: true,
  configScope: 'all',
  validationIssues: [],
  tutorialOpen: false,

  setVendor: (vendor) => set({ vendor }),
  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null, isRightPanelOpen: id !== null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null, isRightPanelOpen: false }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab }),
  setBottomPanelHeight: (h) => set({ bottomPanelHeight: h }),
  toggleRightPanel: () => set((s) => ({ isRightPanelOpen: !s.isRightPanelOpen })),
  toggleBottomPanel: () => set((s) => ({ isBottomPanelOpen: !s.isBottomPanelOpen })),
  toggleAnnotations: () => set((s) => ({ showAnnotations: !s.showAnnotations })),
  setConfigScope: (scope) => set({ configScope: scope }),
  setValidationIssues: (issues) => set({ validationIssues: issues }),
  setTutorialOpen: (open) => set({ tutorialOpen: open }),
}));
