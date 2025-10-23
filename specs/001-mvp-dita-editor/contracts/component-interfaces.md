# Component Interfaces (Contracts)

**Feature**: MVP DITA Editor
**Date**: 2025-10-23
**Type**: Frontend Component Contracts

## Overview

This document defines the public interfaces (contracts) for all major React components in the MVP DITA Editor. These contracts specify props, events, and behavior expectations, enabling independent component development and testing (CQ3: Modular Separation of Concerns).

## Topic Editing Components

### TopicEditor

Main component for WYSIWYG topic editing.

```typescript
interface TopicEditorProps {
  /** Current topic being edited (null for new topic) */
  topic: Topic | null;

  /** Callback when topic changes (returns new topic state) */
  onChange: (topic: Topic) => void;

  /** Callback when save is requested */
  onSave?: () => void;

  /** Read-only mode (disables editing) */
  readonly?: boolean;

  /** CSS class for custom styling */
  className?: string;
}

interface TopicEditorRef {
  /** Programmatically focus the editor */
  focus: () => void;

  /** Get current editor state (for testing) */
  getEditorState: () => EditorState;

  /** Execute a command programmatically */
  executeCommand: (command: EditorCommand) => boolean;
}
```

**Behavior Contract**:
- Renders empty editor if `topic` is null
- Calls `onChange` on every edit (immutable update)
- Updates toolbar button states within 50ms of cursor change (UX1)
- Typing latency <100ms for documents up to 10,000 words (PR2)
- Prevents invalid DITA structures (orphaned `<li>`, missing title)

**Usage Example**:
```tsx
const editor = useRef<TopicEditorRef>(null);

<TopicEditor
  ref={editor}
  topic={currentTopic}
  onChange={(newTopic) => setCurrentTopic(newTopic)}
  onSave={() => saveTopic()}
/>
```

### Toolbar

Editing toolbar with command buttons.

```typescript
interface ToolbarProps {
  /** ProseMirror editor state (for command availability) */
  editorState: EditorState;

  /** Callback to dispatch ProseMirror commands */
  onCommand: (command: EditorCommand) => void;

  /** CSS class for custom styling */
  className?: string;
}

type EditorCommand =
  | { type: 'convertToParagraph' }
  | { type: 'convertToList' }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'save' };
```

**Behavior Contract**:
- Enables/disables buttons based on `editorState` (UX1)
- Button state updates within 50ms of `editorState` change
- Shows tooltips explaining why buttons are disabled
- Calls `onCommand` when user clicks enabled button

**Usage Example**:
```tsx
<Toolbar
  editorState={editorView.state}
  onCommand={(cmd) => executeEditorCommand(cmd)}
/>
```

### EditorView

ProseMirror editor view wrapper.

```typescript
interface EditorViewProps {
  /** ProseMirror editor state */
  state: EditorState;

  /** Callback when state changes */
  onStateChange: (newState: EditorState) => void;

  /** Read-only mode */
  readonly?: boolean;

  /** CSS class for editor container */
  className?: string;
}
```

**Behavior Contract**:
- Renders ProseMirror editor DOM
- Handles all keyboard/mouse input
- Calls `onStateChange` on every transaction
- Enforces DITA schema rules via ProseMirror schema

**Usage Example**:
```tsx
<EditorView
  state={editorState}
  onStateChange={(newState) => setEditorState(newState)}
  readonly={false}
/>
```

## Map Editing Components

### MapTreeView

Hierarchical tree view for DITAMAP editing (UX4).

```typescript
interface MapTreeViewProps {
  /** Current map being edited */
  map: DitaMap;

  /** Currently selected node ID */
  selectedNodeId: string | null;

  /** Callback when node selection changes */
  onSelectNode: (nodeId: string | null) => void;

  /** Callback when tree structure changes */
  onTreeChange: (newMap: DitaMap) => void;

  /** CSS class for custom styling */
  className?: string;
}
```

**Behavior Contract**:
- Renders tree with drag-and-drop support
- Highlights selected node
- Calls `onSelectNode` when user clicks node
- Calls `onTreeChange` after drag-drop operation
- Prevents invalid operations (dropping node onto itself)
- Re-renders in <200ms after structure changes (UX4)

**Usage Example**:
```tsx
<MapTreeView
  map={currentMap}
  selectedNodeId={selectedNode}
  onSelectNode={(id) => setSelectedNode(id)}
  onTreeChange={(newMap) => setCurrentMap(newMap)}
/>
```

### TopicRefNode

Individual node component in the map tree.

```typescript
interface TopicRefNodeProps {
  /** Map node data */
  node: MapNode;

  /** Is this node selected? */
  selected: boolean;

  /** Depth in tree (for indentation) */
  depth: number;

  /** Callback when node is clicked */
  onClick: (nodeId: string) => void;

  /** Callback to update node title */
  onUpdateTitle: (nodeId: string, newTitle: string) => void;

  /** CSS class for custom styling */
  className?: string;
}
```

**Behavior Contract**:
- Renders node with indent based on `depth`
- Shows node title (navtitle or "<Untitled>")
- Highlights if `selected` is true
- Allows inline editing of title
- Calls `onClick` when node is clicked
- Calls `onUpdateTitle` when title is edited

**Usage Example**:
```tsx
<TopicRefNode
  node={mapNode}
  selected={node.id === selectedNodeId}
  depth={2}
  onClick={(id) => selectNode(id)}
  onUpdateTitle={(id, title) => updateNodeTitle(id, title)}
/>
```

### DragDropContext

Context provider for drag-and-drop operations.

```typescript
interface DragDropContextProps {
  /** Children to wrap */
  children: React.ReactNode;

  /** Callback when drag starts */
  onDragStart: (nodeId: string) => void;

  /** Callback when drop occurs */
  onDrop: (sourceId: string, targetId: string, position: DropPosition) => void;

  /** Callback when drag ends (cancelled or completed) */
  onDragEnd: () => void;
}

type DropPosition = 'before' | 'after' | 'inside';
```

**Behavior Contract**:
- Manages global drag-drop state
- Validates drop targets before allowing drop
- Calls appropriate callback based on drag lifecycle
- Shows visual feedback during drag (drag preview)

**Usage Example**:
```tsx
<DragDropContext
  onDragStart={(id) => setDraggingNode(id)}
  onDrop={(src, tgt, pos) => moveNode(src, tgt, pos)}
  onDragEnd={() => setDraggingNode(null)}
>
  <MapTreeView map={currentMap} />
</DragDropContext>
```

## Common UI Components

### Button

Reusable button component.

```typescript
interface ButtonProps {
  /** Button label */
  children: React.ReactNode;

  /** Click handler */
  onClick: () => void;

  /** Disabled state */
  disabled?: boolean;

  /** Button variant */
  variant?: 'primary' | 'secondary' | 'icon';

  /** Tooltip text (shown when disabled) */
  tooltip?: string;

  /** CSS class for custom styling */
  className?: string;
}
```

**Behavior Contract**:
- Renders accessible button element
- Shows tooltip on hover if provided
- Prevents click if disabled
- Applies appropriate styling based on variant

### Tooltip

Tooltip component for hover hints.

```typescript
interface TooltipProps {
  /** Tooltip content */
  content: string;

  /** Element to attach tooltip to */
  children: React.ReactElement;

  /** Tooltip position */
  placement?: 'top' | 'bottom' | 'left' | 'right';

  /** Show delay in ms */
  delay?: number;
}
```

**Behavior Contract**:
- Shows tooltip on hover after delay
- Hides tooltip when mouse leaves
- Positions tooltip based on `placement`
- Accessible via keyboard focus

## Store Hooks

### useTopicStore

Hook to access topic editing state.

```typescript
function useTopicStore(): TopicStore;

// Selector hook for performance
function useTopicStore<T>(selector: (state: TopicStore) => T): T;
```

**Usage Example**:
```tsx
const currentTopic = useTopicStore((state) => state.currentTopic);
const updateTitle = useTopicStore((state) => state.updateTitle);
```

### useMapStore

Hook to access map editing state.

```typescript
function useMapStore(): MapStore;

// Selector hook for performance
function useMapStore<T>(selector: (state: MapStore) => T): T;
```

**Usage Example**:
```tsx
const currentMap = useMapStore((state) => state.currentMap);
const addChild = useMapStore((state) => state.addChild);
```

## Command Contracts

### Topic Editor Commands

Commands that can be executed in the topic editor.

```typescript
interface ConvertToParagraphCommand {
  type: 'convertToParagraph';
  listItemId: string;
}

interface ConvertToListCommand {
  type: 'convertToList';
  paragraphId: string;
}

interface UndoCommand {
  type: 'undo';
}

interface RedoCommand {
  type: 'redo';
}

interface SaveCommand {
  type: 'save';
}

type TopicEditorCommand =
  | ConvertToParagraphCommand
  | ConvertToListCommand
  | UndoCommand
  | RedoCommand
  | SaveCommand;
```

**Command Execution Contract**:
- All commands return `boolean` (true if executed, false if can't execute)
- Commands must check `canExecute` before execution
- Failed commands should not modify state
- Commands should complete in <50ms (except Save)

### Map Editor Commands

Commands for map tree operations.

```typescript
interface AddChildCommand {
  type: 'addChild';
  parentId: string;
  navtitle?: string;
}

interface AddSiblingCommand {
  type: 'addSibling';
  siblingId: string;
  navtitle?: string;
}

interface DeleteNodeCommand {
  type: 'deleteNode';
  nodeId: string;
}

interface MoveNodeCommand {
  type: 'moveNode';
  operation: MoveOperation;
}

type MapEditorCommand =
  | AddChildCommand
  | AddSiblingCommand
  | DeleteNodeCommand
  | MoveNodeCommand;
```

**Command Execution Contract**:
- All commands validate before execution
- Invalid operations (circular refs, etc.) return false
- Successful commands update map state immutably
- Tree re-renders complete in <200ms (UX4)

## File I/O Contracts

### File System API

Contracts for file save/load operations.

```typescript
interface FileSystemAPI {
  /** Save topic to file system */
  saveTopic(topic: Topic, fileHandle?: FileSystemFileHandle): Promise<void>;

  /** Load topic from file system */
  loadTopic(file: File): Promise<Topic>;

  /** Save map to file system */
  saveMap(map: DitaMap, fileHandle?: FileSystemFileHandle): Promise<void>;

  /** Load map from file system */
  loadMap(file: File): Promise<DitaMap>;

  /** Check if File System Access API is supported */
  isSupported(): boolean;
}
```

**Behavior Contract**:
- Prompts user for file location on first save
- Remembers file handle for subsequent saves
- Validates file extensions (.dita for topics, .ditamap for maps)
- Throws error if file parsing fails
- Falls back to download/upload if File System Access API unavailable

## Testing Contracts

### Component Test Utilities

```typescript
interface ComponentTestUtils {
  /** Render component with required providers */
  renderWithProviders(
    component: React.ReactElement,
    options?: RenderOptions
  ): RenderResult;

  /** Wait for ProseMirror to finish rendering */
  waitForEditor(): Promise<void>;

  /** Simulate user typing */
  typeInEditor(text: string): Promise<void>;

  /** Simulate toolbar button click */
  clickToolbarButton(command: string): Promise<void>;

  /** Get current DITA XML output */
  getDitaXml(): string;
}
```

## Performance Contracts

All components must meet these performance requirements:

| Component | Requirement | Measurement |
|-----------|-------------|-------------|
| TopicEditor | Typing latency <100ms | Time from keypress to DOM update |
| Toolbar | State update <50ms | Time from cursor change to button state update |
| MapTreeView | Re-render <200ms | Time from drag-drop to tree re-render |
| EditorView | Initial render <1,500ms | Time from mount to interactive (5,000 words) |
| Any command | Execution <50ms | Time from command dispatch to state update |

## Accessibility Contracts

All components must support:
- Keyboard navigation (Tab, Enter, Arrow keys)
- Screen reader labels (ARIA attributes)
- Focus management (visible focus indicators)
- High contrast mode compatibility

## Conclusion

These contracts define the public interfaces for all major components, enabling:
- Independent component development (CQ3)
- Component testing without implementation details (TS2)
- Clear separation between UI and state logic (CQ3)
- Performance validation against constitutional requirements (PR1-PR4, UX1, UX4)
