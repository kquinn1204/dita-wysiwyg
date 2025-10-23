# Data Model: MVP DITA Editor

**Feature**: MVP DITA Editor
**Date**: 2025-10-23
**Status**: Complete

## Overview

This document defines the data structures for the MVP DITA Editor, covering both Topic content and Map hierarchy models. The design enforces CQ4 (Separate Map and Topic Models) by maintaining completely independent state structures.

## Constitutional Alignment

- **CQ1 (Immutability)**: All types are immutable; state updates return new objects
- **CQ2 (Strong Typing)**: TypeScript interfaces derived from DITA 1.3 XSD
- **CQ4 (Separate Models)**: Topic and Map models are completely decoupled

## Topic Content Model

### Topic Entity

Represents a DITA topic document.

```typescript
interface Topic {
  readonly id: string;              // Unique identifier (UUID)
  readonly title: string;           // Required title element (DITA <title>)
  readonly body: TopicBody;         // Topic body content
  readonly metadata: TopicMetadata; // Document metadata
}

interface TopicMetadata {
  readonly createdAt: string;       // ISO 8601 timestamp
  readonly modifiedAt: string;      // ISO 8601 timestamp
  readonly ditaVersion: '1.3';      // DITA specification version
}

interface TopicBody {
  readonly content: BodyElement[];  // Ordered list of body elements
}
```

**Validation Rules**:
- `title` must be non-empty string (min 1 character)
- `body.content` can be empty array (valid empty topic)
- Every topic must have exactly one title (enforced by type structure)

**State Transitions**:
- Create: `new Topic` with empty body
- Update title: Return new `Topic` with updated `title` field
- Add content: Return new `Topic` with modified `body.content` array

### Body Elements

Body elements are the building blocks of topic content.

```typescript
type BodyElement = Paragraph | UnorderedList;

interface Paragraph {
  readonly type: 'paragraph';
  readonly id: string;              // Element ID (UUID)
  readonly content: string;         // Plain text content
}

interface UnorderedList {
  readonly type: 'unorderedList';
  readonly id: string;              // Element ID (UUID)
  readonly items: ListItem[];       // Must have at least 1 item
}

interface ListItem {
  readonly type: 'listItem';
  readonly id: string;              // Element ID (UUID)
  readonly content: string;         // Plain text content
}
```

**Validation Rules**:
- **Paragraph**: `content` can be empty string (valid but unusual)
- **UnorderedList**: `items` array must have length ≥ 1 (no empty lists)
- **ListItem**: Can only exist inside `UnorderedList`, never standalone

**State Transitions**:
- **Create Paragraph**: Add new `Paragraph` to `body.content`
- **Convert Paragraph to List**: Remove `Paragraph`, insert `UnorderedList` with 1 `ListItem`
- **Convert ListItem to Paragraph**: If list has 1 item, remove `UnorderedList` and insert `Paragraph`; if >1 items, remove item from list
- **Add ListItem**: Append to `UnorderedList.items` array
- **Remove empty list**: Automatically triggered when last `ListItem` is removed

### ProseMirror Schema Mapping

The DITA types map to ProseMirror node types:

```typescript
// ProseMirror schema definition (not full implementation)
const topicSchema = new Schema({
  nodes: {
    doc: {           // Maps to Topic.body
      content: "block+",
    },
    paragraph: {     // Maps to Paragraph
      content: "text*",
      attrs: { id: { default: generateId() } },
      toDOM: () => ['p', { class: 'dita-p' }, 0],
      parseDOM: [{ tag: 'p.dita-p' }],
    },
    bullet_list: {   // Maps to UnorderedList
      content: "list_item+",
      attrs: { id: { default: generateId() } },
      toDOM: () => ['ul', { class: 'dita-ul' }, 0],
      parseDOM: [{ tag: 'ul.dita-ul' }],
    },
    list_item: {     // Maps to ListItem
      content: "text*",
      attrs: { id: { default: generateId() } },
      toDOM: () => ['li', { class: 'dita-li' }, 0],
      parseDOM: [{ tag: 'li.dita-li' }],
    },
  },
});
```

## Map Hierarchy Model

### Map Entity

Represents a DITAMAP document.

```typescript
interface DitaMap {
  readonly id: string;              // Unique identifier (UUID)
  readonly title?: string;          // Optional map title
  readonly root: MapNode;           // Root node (always present)
  readonly metadata: MapMetadata;   // Document metadata
}

interface MapMetadata {
  readonly createdAt: string;       // ISO 8601 timestamp
  readonly modifiedAt: string;      // ISO 8601 timestamp
  readonly ditaVersion: '1.3';      // DITA specification version
}
```

### Map Node (Tree Structure)

Represents nodes in the map hierarchy (topicref elements).

```typescript
interface MapNode {
  readonly id: string;              // Unique node ID (UUID)
  readonly type: 'topicref';        // Node type (only topicref in MVP)
  readonly navtitle?: string;       // Optional navigation title
  readonly href?: string;           // Optional topic file reference
  readonly children: MapNode[];     // Nested topicrefs (can be empty)
}
```

**Validation Rules**:
- `children` can be empty array (leaf node)
- No circular references (node cannot be ancestor of itself)
- Maximum nesting depth: 10 levels (practical limit per spec edge cases)
- `href` is optional in MVP (placeholder topicrefs allowed)

**State Transitions**:
- **Add Child**: Append new `MapNode` to `children` array
- **Add Sibling**: Insert new `MapNode` at parent's `children` array
- **Move Node**: Remove from old parent, insert into new parent
- **Reorder**: Change index in parent's `children` array
- **Delete**: Remove from parent's `children` array

### Tree Operations

```typescript
// Tree traversal and manipulation types
type MapPath = number[];  // Array of indices from root to node
                          // Example: [0, 2, 1] = root.children[0].children[2].children[1]

interface MoveOperation {
  readonly sourceId: string;        // Node being moved
  readonly targetId: string;        // New parent node
  readonly index: number;           // Position in target's children
}

interface ReorderOperation {
  readonly nodeId: string;          // Node being reordered
  readonly newIndex: number;        // New position in parent's children
}
```

**Validation Rules for Operations**:
- **Move**: `targetId` cannot be `sourceId` or descendant of `sourceId` (prevents circular refs)
- **Reorder**: `newIndex` must be valid (0 ≤ newIndex < parent.children.length)

## State Management Stores

### Topic Store (CQ4: Separate from Map)

```typescript
interface TopicStore {
  // State
  readonly currentTopic: Topic | null;
  readonly isDirty: boolean;        // Has unsaved changes
  readonly lastSaved: string | null; // ISO 8601 timestamp

  // Actions (all return new state, immutable)
  readonly createNewTopic: () => void;
  readonly updateTitle: (title: string) => void;
  readonly addParagraph: (afterId?: string) => void;
  readonly convertToList: (paragraphId: string) => void;
  readonly convertToParagraph: (listItemId: string) => void;
  readonly updateText: (elementId: string, content: string) => void;
  readonly deleteElement: (elementId: string) => void;
  readonly saveTopic: () => Promise<void>;
  readonly loadTopic: (file: File) => Promise<void>;
}
```

### Map Store (CQ4: Separate from Topic)

```typescript
interface MapStore {
  // State
  readonly currentMap: DitaMap | null;
  readonly isDirty: boolean;        // Has unsaved changes
  readonly lastSaved: string | null; // ISO 8601 timestamp
  readonly selectedNodeId: string | null; // Currently selected node

  // Actions (all return new state, immutable)
  readonly createNewMap: () => void;
  readonly addChild: (parentId: string, navtitle?: string) => void;
  readonly addSibling: (siblingId: string, navtitle?: string) => void;
  readonly moveNode: (operation: MoveOperation) => void;
  readonly reorderNode: (operation: ReorderOperation) => void;
  readonly deleteNode: (nodeId: string) => void;
  readonly updateNodeTitle: (nodeId: string, navtitle: string) => void;
  readonly selectNode: (nodeId: string | null) => void;
  readonly saveMap: () => Promise<void>;
  readonly loadMap: (file: File) => Promise<void>;
}
```

**Store Isolation (CQ4)**:
- Topic and Map stores have NO shared state
- No imports between store modules
- Each store manages its own file I/O independently
- UI components can use both stores, but stores never reference each other

## DITA XML Serialization

### Topic Serialization

```typescript
interface TopicSerializer {
  // Serialize Topic model to DITA XML string
  toXml(topic: Topic): string;

  // Deserialize DITA XML string to Topic model
  fromXml(xml: string): Topic;
}
```

**Example Output**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD DITA Topic//EN" "topic.dtd">
<topic id="topic-abc123">
  <title>Installing Software</title>
  <body>
    <p>Download the installer from the website.</p>
    <ul>
      <li>Click the download link.</li>
      <li>Run the installer.</li>
    </ul>
    <p>Follow the installation wizard.</p>
  </body>
</topic>
```

### Map Serialization

```typescript
interface MapSerializer {
  // Serialize DitaMap model to DITAMAP XML string
  toXml(map: DitaMap): string;

  // Deserialize DITAMAP XML string to DitaMap model
  fromXml(xml: string): DitaMap;
}
```

**Example Output**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE map PUBLIC "-//OASIS//DTD DITA Map//EN" "map.dtd">
<map id="map-xyz789" title="Installation Guide">
  <topicref navtitle="Prerequisites" href="prereqs.dita">
    <topicref navtitle="System Requirements" href="sysreq.dita"/>
    <topicref navtitle="Software Dependencies" href="deps.dita"/>
  </topicref>
  <topicref navtitle="Installation Steps" href="install.dita"/>
  <topicref navtitle="Troubleshooting" href="trouble.dita"/>
</map>
```

## Validation Rules Summary

### Topic Validation

| Rule | Requirement | Enforced By |
|------|-------------|-------------|
| Title required | Every topic must have non-empty title | TypeScript type (not optional) |
| Title uniqueness | Exactly one title per topic | Data structure (single field) |
| List has items | UnorderedList must have ≥1 ListItem | Runtime validator |
| No orphaned ListItems | ListItem must be inside UnorderedList | ProseMirror schema |
| Valid paragraph content | Paragraph content is string (can be empty) | TypeScript type |

### Map Validation

| Rule | Requirement | Enforced By |
|------|-------------|-------------|
| No circular refs | Node cannot be ancestor of itself | Move operation validator |
| Valid tree structure | All nodes reachable from root | Tree construction logic |
| Max nesting depth | ≤10 levels deep | Move operation validator |
| Valid indices | Reorder index within bounds | Reorder operation validator |
| Node ID uniqueness | All node IDs unique within map | ID generation logic (UUID) |

## Change Tracking (for Undo/Redo - PR3)

Both stores maintain a minimal change history for efficient undo/redo:

```typescript
interface ChangeHistory<T> {
  readonly past: T[];     // Previous states (max 50)
  readonly present: T;    // Current state
  readonly future: T[];   // Redo states
}

interface HistoryStore {
  readonly undo: () => void;
  readonly redo: () => void;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}
```

**Implementation Notes**:
- Store diffs, not full state (structural sharing via Immer)
- Limit history to 50 actions (prevents memory bloat)
- Clear future stack on new action
- Undo/redo triggers state replacement (<500ms per PR3)

## Conclusion

The data model enforces all constitutional principles:
- **CQ1**: All types are `readonly`, state transitions return new objects
- **CQ2**: Full TypeScript type coverage, no `any` types
- **CQ4**: Topic and Map models/stores are completely separate

The model supports all functional requirements (FR-001 through FR-026) and aligns with DITA 1.3 spec constraints for the MVP element set.
