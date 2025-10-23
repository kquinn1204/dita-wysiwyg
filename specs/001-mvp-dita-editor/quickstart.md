# Quickstart Guide: MVP DITA Editor

**Feature**: MVP DITA Editor
**Date**: 2025-10-23
**Audience**: Developers implementing this feature

## Overview

This guide helps you get started implementing the MVP DITA Editor. Follow these steps to set up the development environment, understand the architecture, and begin implementing features.

## Prerequisites

**System Requirements** (per PR4):
- Fedora Linux (latest stable version)
- Node.js 18.x or later
- npm 9.x or later
- Firefox ESR and/or Chrome (latest stable)

**Knowledge Requirements**:
- TypeScript fundamentals
- React 18 (hooks, concurrent features)
- Basic understanding of ProseMirror (will be learned during implementation)
- Familiarity with Zustand or similar state management

## Project Setup

### 1. Initialize Project

```bash
# Create project directory
cd /home/kquinn/dita-wysiwyg

# Initialize npm project
npm init -y

# Install dependencies
npm install \
  react@^18.2.0 \
  react-dom@^18.2.0 \
  zustand@^4.5.0 \
  immer@^10.0.0 \
  prosemirror-model@^1.19.0 \
  prosemirror-state@^1.4.0 \
  prosemirror-view@^1.32.0 \
  prosemirror-transform@^1.8.0 \
  prosemirror-history@^1.3.0 \
  prosemirror-commands@^1.5.0 \
  prosemirror-keymap@^1.2.0 \
  prosemirror-schema-list@^1.3.0

# Install dev dependencies
npm install --save-dev \
  vite@^5.0.0 \
  @vitejs/plugin-react@^4.2.0 \
  typescript@^5.3.0 \
  @types/react@^18.2.0 \
  @types/react-dom@^18.2.0 \
  vitest@^1.1.0 \
  @testing-library/react@^14.1.0 \
  @testing-library/user-event@^14.5.0 \
  @testing-library/jest-dom@^6.1.0 \
  happy-dom@^12.10.0

# Install tree component (choose one)
npm install react-arborist@^3.4.0
# OR
npm install react-complex-tree@^2.3.0
```

### 2. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### 3. Configure Vite

Create `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### 4. Configure Vitest

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

### 5. Create Project Structure

```bash
mkdir -p src/{stores,editor/{schemas,plugins,serializers},components/{TopicEditor,MapEditor,common},models,utils,test}
mkdir -p tests/{unit/{stores,editor,models},integration,fixtures/{sampleTopics,sampleMaps}}
mkdir -p public/styles
```

### 6. Create Entry Points

Create `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MVP DITA Editor</title>
    <link rel="stylesheet" href="/styles/editor.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/App.tsx`:

```typescript
import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>MVP DITA Editor</h1>
      <p>Development in progress...</p>
    </div>
  );
}

export default App;
```

## Implementation Order (by User Story Priority)

Follow this order to implement features incrementally:

### Phase 1: User Story P1 - Basic Topic Editing

**Goal**: Create and edit topics with paragraphs and lists

**Tasks**:
1. **Define DITA types** (`src/models/DitaElements.ts`, `Topic.ts`)
   - Create TypeScript interfaces for Topic, Paragraph, UnorderedList, ListItem
   - See `data-model.md` for type definitions

2. **Create Topic store** (`src/stores/topicStore.ts`)
   - Implement Zustand store with Immer middleware
   - Add actions: createNewTopic, updateTitle, addParagraph, etc.
   - Ensure immutability (CQ1)

3. **Define ProseMirror schema** (`src/editor/schemas/topicSchema.ts`)
   - Create schema for paragraph, bullet_list, list_item nodes
   - Define node specs with DITA-specific attributes

4. **Implement Topic serializer** (`src/editor/serializers/topicSerializer.ts`)
   - Convert Topic model ↔ DITA XML
   - Validate against DITA 1.3 rules

5. **Build TopicEditor component** (`src/components/TopicEditor/`)
   - Create EditorView wrapper for ProseMirror
   - Implement Toolbar with paragraph/list conversion buttons
   - Wire to topicStore

6. **Write tests** (`tests/integration/topicEditing.test.ts`)
   - Test: Create topic, add paragraphs, convert to list
   - Validate generated DITA XML

**Acceptance Criteria**: User Story P1 acceptance scenarios all pass

### Phase 2: User Story P2 - Structural Validation

**Goal**: Prevent invalid DITA structures

**Tasks**:
1. **Create validation plugin** (`src/editor/plugins/validation.ts`)
   - Prevent orphaned list items
   - Auto-remove empty lists
   - Enforce mandatory title

2. **Implement command guards** (`src/editor/plugins/commands.ts`)
   - Add `canExecute` checks for all commands
   - Update toolbar button states based on cursor context

3. **Add visual feedback** (`src/components/TopicEditor/Toolbar.tsx`)
   - Disable invalid buttons
   - Show tooltips explaining why (UX1)

4. **Write tests** (`tests/unit/editor/validation.test.ts`)
   - Test all invalid operations (TS3)
   - Verify 100% prevention of invalid structures

**Acceptance Criteria**: User Story P2 acceptance scenarios all pass

### Phase 3: User Story P3 - DITAMAP Management

**Goal**: Create and manage map hierarchy

**Tasks**:
1. **Define Map types** (`src/models/Map.ts`)
   - Create TypeScript interfaces for DitaMap, MapNode
   - See `data-model.md` for type definitions

2. **Create Map store** (`src/stores/mapStore.ts`)
   - Implement Zustand store with tree operations
   - Add actions: addChild, addSibling, moveNode, etc.
   - Ensure Topic/Map store separation (CQ4)

3. **Implement Map serializer** (`src/editor/serializers/mapSerializer.ts`)
   - Convert DitaMap model ↔ DITAMAP XML

4. **Build MapTreeView component** (`src/components/MapEditor/`)
   - Integrate react-arborist or react-complex-tree
   - Implement drag-and-drop with validation
   - Add node selection and editing

5. **Write tests** (`tests/integration/mapEditing.test.ts`)
   - Test: Create map, add topicrefs, drag-drop reorder
   - Validate generated DITAMAP XML

**Acceptance Criteria**: User Story P3 acceptance scenarios all pass

### Phase 4: File I/O and Polish

**Tasks**:
1. **Implement file system API** (`src/utils/fileSystem.ts`)
   - Use File System Access API with download/upload fallback
   - Handle .dita and .ditamap file extensions

2. **Add Save/Load UI**
   - File menu or toolbar buttons
   - Dirty state tracking

3. **Performance optimization**
   - Profile with React DevTools Profiler
   - Optimize re-renders with React.memo
   - Verify all performance targets (PR1-PR4, UX1, UX4)

4. **Styling** (`public/styles/editor.css`)
   - Style WYSIWYG editor for readability
   - Style map tree for usability

## Development Workflow

### Running Dev Server

```bash
npm run dev
# Opens http://localhost:3000
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/integration/topicEditing.test.ts
```

### Building for Production

```bash
npm run build
# Output in dist/

# Preview production build
npm run preview
```

## Testing on Fedora Linux (PR4)

Ensure you test on the target platform:

```bash
# On Fedora Linux:

# Test in Firefox
firefox http://localhost:3000

# Test in Chrome
google-chrome http://localhost:3000
```

**Performance testing**:
- Use browser DevTools Performance tab
- Measure typing latency (should be <100ms)
- Measure map tree drag-drop time (should be <200ms)
- Validate against constitutional requirements (PR1-PR4)

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/models/Topic.ts` | Topic type definitions |
| `src/models/Map.ts` | Map type definitions |
| `src/stores/topicStore.ts` | Topic state management (CQ4) |
| `src/stores/mapStore.ts` | Map state management (CQ4) |
| `src/editor/schemas/topicSchema.ts` | ProseMirror schema for topics |
| `src/editor/serializers/topicSerializer.ts` | DITA XML serialization |
| `src/components/TopicEditor/TopicEditor.tsx` | Main topic editing component |
| `src/components/MapEditor/MapTreeView.tsx` | Main map editing component |
| `tests/integration/topicEditing.test.ts` | Topic editing integration tests |
| `tests/integration/mapEditing.test.ts` | Map editing integration tests |

## Debugging Tips

### ProseMirror State Inspection

Add this to your component for debugging:

```typescript
useEffect(() => {
  console.log('Editor State:', editorView.state.toJSON());
}, [editorView]);
```

### Zustand DevTools

Install Redux DevTools browser extension, then:

```typescript
import { devtools } from 'zustand/middleware';

const useTopicStore = create(devtools(
  immer((set) => ({
    // ... store definition
  })),
  { name: 'TopicStore' }
));
```

### Performance Profiling

```typescript
import { Profiler } from 'react';

<Profiler id="TopicEditor" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}): ${actualDuration}ms`);
}}>
  <TopicEditor />
</Profiler>
```

## Next Steps

1. **Start with Phase 1** (User Story P1 - Basic Topic Editing)
2. **Follow the implementation order** above
3. **Run tests frequently** to catch regressions early
4. **Profile performance** against constitutional requirements (PR1-PR4, UX1, UX4)
5. **Validate DITA output** with real DITA tools if available

## Common Pitfalls

- ❌ **Don't mutate state**: Always use Immer or return new objects (CQ1)
- ❌ **Don't use `any` types**: Enable strict TypeScript mode (CQ2)
- ❌ **Don't couple Topic and Map stores**: Keep them completely separate (CQ4)
- ❌ **Don't skip validation tests**: Invalid DITA structures violate core requirements (TS1)
- ❌ **Don't ignore performance**: Measure typing latency and tree updates (PR2, UX4)

## Getting Help

- **ProseMirror docs**: https://prosemirror.net/docs/
- **Zustand docs**: https://docs.pmnd.rs/zustand/
- **DITA 1.3 spec**: https://docs.oasis-open.org/dita/dita/v1.3/
- **Constitution**: `.specify/memory/constitution.md` (for principle compliance)
- **Spec**: `specs/001-mvp-dita-editor/spec.md` (for user requirements)
- **Data Model**: `specs/001-mvp-dita-editor/data-model.md` (for type definitions)

Good luck with implementation! Remember to follow the constitutional principles and test against the user acceptance scenarios.
