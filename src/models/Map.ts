export interface DitaMap {
  readonly id: string;
  readonly title?: string;
  readonly root: MapNode;
  readonly metadata: MapMetadata;
}

export interface MapMetadata {
  readonly createdAt: string;
  readonly modifiedAt: string;
  readonly ditaVersion: '1.3';
}

export interface MapNode {
  readonly id: string;
  readonly type: 'topicref';
  readonly navtitle?: string;
  readonly href?: string;
  readonly children: MapNode[];
}

export interface MoveOperation {
  readonly sourceId: string;
  readonly targetId: string;
  readonly index: number;
}

export interface ReorderOperation {
  readonly nodeId: string;
  readonly newIndex: number;
}

export function createEmptyMap(): DitaMap {
  const now = new Date().toISOString();
  return {
    id: `map-${Date.now()}`,
    root: {
      id: `root-${Date.now()}`,
      type: 'topicref',
      children: [],
    },
    metadata: {
      createdAt: now,
      modifiedAt: now,
      ditaVersion: '1.3',
    },
  };
}
