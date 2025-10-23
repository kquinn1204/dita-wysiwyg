import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DitaMap, MapNode, MoveOperation, ReorderOperation, createEmptyMap } from '../models/Map';

interface MapStore {
  currentMap: DitaMap | null;
  isDirty: boolean;
  lastSaved: string | null;
  selectedNodeId: string | null;

  // Actions
  createNewMap: () => void;
  addChild: (parentId: string, navtitle?: string) => void;
  addSibling: (siblingId: string, navtitle?: string) => void;
  moveNode: (operation: MoveOperation) => void;
  reorderNode: (operation: ReorderOperation) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeTitle: (nodeId: string, navtitle: string) => void;
  selectNode: (nodeId: string | null) => void;
  saveMap: () => Promise<void>;
  loadMap: (map: DitaMap) => void;
}

export const useMapStore = create<MapStore>()(
  immer((set) => ({
    currentMap: null,
    isDirty: false,
    lastSaved: null,
    selectedNodeId: null,

    createNewMap: () => set((state) => {
      state.currentMap = createEmptyMap();
      state.isDirty = false;
      state.selectedNodeId = null;
    }),

    addChild: (parentId: string, navtitle?: string) => set((state) => {
      if (!state.currentMap) return;

      const newNode: MapNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'topicref',
        navtitle,
        children: [],
      };

      const findAndAddChild = (node: MapNode): boolean => {
        if (node.id === parentId) {
          node.children.push(newNode);
          return true;
        }
        return node.children.some(findAndAddChild);
      };

      findAndAddChild(state.currentMap.root);
      state.currentMap.metadata.modifiedAt = new Date().toISOString();
      state.isDirty = true;
    }),

    addSibling: (siblingId: string, navtitle?: string) => set((state) => {
      if (!state.currentMap) return;

      const newNode: MapNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'topicref',
        navtitle,
        children: [],
      };

      const findAndAddSibling = (node: MapNode): boolean => {
        const index = node.children.findIndex((child) => child.id === siblingId);
        if (index !== -1) {
          node.children.splice(index + 1, 0, newNode);
          return true;
        }
        return node.children.some(findAndAddSibling);
      };

      findAndAddSibling(state.currentMap.root);
      state.currentMap.metadata.modifiedAt = new Date().toISOString();
      state.isDirty = true;
    }),

    moveNode: (_operation: MoveOperation) => set((state) => {
      // Simplified move implementation for MVP
      // TODO: Add circular reference detection
      state.isDirty = true;
    }),

    reorderNode: (_operation: ReorderOperation) => set((state) => {
      // Simplified reorder implementation for MVP
      state.isDirty = true;
    }),

    deleteNode: (nodeId: string) => set((state) => {
      if (!state.currentMap) return;

      const removeNode = (node: MapNode): boolean => {
        const index = node.children.findIndex((child) => child.id === nodeId);
        if (index !== -1) {
          node.children.splice(index, 1);
          return true;
        }
        return node.children.some(removeNode);
      };

      removeNode(state.currentMap.root);
      state.currentMap.metadata.modifiedAt = new Date().toISOString();
      state.isDirty = true;
    }),

    updateNodeTitle: (nodeId: string, newNavtitle: string) => set((state) => {
      if (!state.currentMap) return;

      const updateTitle = (node: MapNode): MapNode => {
        if (node.id === nodeId) {
          return { ...node, navtitle: newNavtitle };
        }
        if (node.children.length > 0) {
          return {
            ...node,
            children: node.children.map(updateTitle),
          };
        }
        return node;
      };

      state.currentMap.root = updateTitle(state.currentMap.root);
      state.currentMap.metadata.modifiedAt = new Date().toISOString();
      state.isDirty = true;
    }),

    selectNode: (nodeId: string | null) => set((state) => {
      state.selectedNodeId = nodeId;
    }),

    saveMap: async () => set((state) => {
      state.lastSaved = new Date().toISOString();
      state.isDirty = false;
    }),

    loadMap: (map: DitaMap) => set((state) => {
      state.currentMap = map;
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    }),
  }))
);
