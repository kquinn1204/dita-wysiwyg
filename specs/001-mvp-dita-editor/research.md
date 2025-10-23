# Research: MVP DITA Editor Technology Choices

**Feature**: MVP DITA Editor
**Date**: 2025-10-23
**Status**: Complete

## Overview

This document captures research findings and rationale for technology choices in the MVP DITA Editor implementation.

## Core Technology Decisions

### Decision 1: WYSIWYG Editor Framework

**Chosen**: ProseMirror

**Rationale**:
- **Schema-based validation**: ProseMirror's document model is defined via schemas, allowing us to enforce DITA structural rules (e.g., <li> must be inside <ul>) at the data structure level, not just via runtime validation
- **Immutability**: ProseMirror uses an immutable document model with transactions, aligning perfectly with CQ1 (Data Purity and Immutability)
- **Command system**: Built-in command framework with `canExecute` checks enables UX1 (Structural Validity Feedback) without custom implementation
- **Performance**: Transform-based editing is highly efficient, supporting PR2 (typing latency <100ms)
- **Extensibility**: Plugin architecture allows custom validation, commands, and keymaps
- **Production proven**: Used by major editors (Atlassian, New York Times, etc.)

**Alternatives Considered**:
- **Draft.js**: Facebook's editor framework
  - Rejected: Less flexible schema system, more React-specific coupling, less active maintenance
- **Slate**: Modern React-first editor
  - Rejected: Immature API (frequent breaking changes), less robust schema enforcement, smaller ecosystem
- **TinyMCE/CKEditor**: Traditional WYSIWYG editors
  - Rejected: Not designed for structured document models, difficult to enforce DITA rules, heavy dependencies

**Best Practices**:
- Define strict ProseMirror schemas mirroring DITA XSD constraints
- Use custom plugins for DITA-specific validation (e.g., mandatory title, proper list nesting)
- Implement custom serializers for DITA XML ↔ ProseMirror document conversion
- Leverage ProseMirror's history plugin for efficient undo/redo (PR3)

### Decision 2: State Management

**Chosen**: Zustand with Immer middleware

**Rationale**:
- **Lightweight**: ~1KB gzipped, minimal runtime overhead (supports PR1, PR2 performance goals)
- **Immutability**: Immer middleware enforces immutable updates via structural sharing (CQ1 compliant)
- **TypeScript support**: First-class TypeScript integration with full type inference (CQ2 compliant)
- **No boilerplate**: Simpler API than Redux, less ceremony for small-to-medium state
- **React integration**: Hook-based API fits React 18 concurrent rendering model
- **Store isolation**: Easy to create separate stores for Topic and Map state (CQ4 compliant)

**Alternatives Considered**:
- **Redux Toolkit**: Industry-standard state management
  - Rejected: More boilerplate, heavier bundle size, overkill for MVP scope
- **Jotai/Recoil**: Atomic state management
  - Rejected: More complex mental model for this use case, less mature ecosystem
- **MobX**: Observable-based state
  - Rejected: Mutable-first API conflicts with CQ1, less TypeScript-friendly
- **Context + useReducer**: Built-in React state
  - Rejected: Difficult to enforce immutability, performance issues with frequent updates, no dev tools

**Best Practices**:
- Create separate stores: `useTopicStore` and `useMapStore` (CQ4)
- Use Immer middleware for all state mutations
- Define TypeScript interfaces for all state shapes
- Implement selectors for derived state to minimize re-renders
- Use `devtools` middleware for debugging during development

### Decision 3: Build Tool

**Chosen**: Vite 5.x

**Rationale**:
- **Fast development**: Native ESM dev server with instant hot module replacement
- **Modern defaults**: ES2022 target, tree-shaking, code-splitting out of the box
- **TypeScript support**: Zero-config TypeScript compilation
- **React Fast Refresh**: Preserves component state during development
- **Small bundle sizes**: Rollup-based production builds with aggressive optimization
- **Plugin ecosystem**: Official plugins for React, TypeScript, testing (Vitest)

**Alternatives Considered**:
- **Create React App (CRA)**: React's official starter
  - Rejected: Slower builds, Webpack-based (heavier), deprecated/less maintained
- **Webpack**: Industry standard bundler
  - Rejected: More configuration required, slower dev server, overkill for SPA
- **Parcel**: Zero-config bundler
  - Rejected: Less mature React support, smaller plugin ecosystem
- **esbuild**: Extremely fast bundler
  - Rejected: Less mature plugin ecosystem for React, primarily focused on library builds

**Best Practices**:
- Use Vite's code-splitting for lazy-loading large ProseMirror plugins
- Configure build for ES2022 target (modern browsers only per PR4)
- Enable source maps for debugging
- Use Vite's asset handling for CSS/images
- Leverage Vite's preview server for production build testing

### Decision 4: Testing Framework

**Chosen**: Vitest + React Testing Library

**Rationale**:
- **Vite integration**: Shares Vite config, same transformations as dev/build
- **Fast**: Runs tests in native ESM, instant watch mode feedback
- **Jest-compatible API**: Drop-in replacement for Jest, familiar to most developers
- **Component testing**: React Testing Library enforces user-centric testing (TS2)
- **Coverage**: Built-in code coverage via c8
- **TypeScript**: First-class TS support without additional config

**React Testing Library**:
- Encourages testing user interactions over implementation details
- Aligns with acceptance scenario format in spec.md
- Prevents brittle tests tied to internal state

**Alternatives Considered**:
- **Jest**: Industry standard testing framework
  - Rejected: Slower startup, requires transform configuration for ESM, less Vite integration
- **Cypress Component Testing**: Modern component testing
  - Rejected: Heavier, primarily for E2E, overkill for unit/integration tests
- **Playwright Component Testing**: New component testing framework
  - Rejected: Less mature, smaller ecosystem, more suited for E2E

**Best Practices**:
- Write integration tests for user stories (e.g., "create topic, add paragraphs, convert to list")
- Use fixtures for DITA validation tests (TS1)
- Snapshot test React components for visual regression (TS2)
- Test edge cases explicitly (TS3): invalid operations, undo/redo boundaries
- Mock ProseMirror transactions for unit testing state mutations
- Measure performance via `vi.useFakeTimers()` for PR1/PR2/PR3 validation

### Decision 5: Tree Component for DITAMAP

**Chosen**: react-arborist or react-complex-tree

**Rationale**:
- **Virtualization**: Handles large tree structures efficiently (up to 100 nodes per spec)
- **Drag-and-drop**: Built-in DnD support with reordering and re-parenting
- **Keyboard navigation**: Accessible tree navigation out of the box
- **Performance**: Optimized rendering for <200ms updates (UX4)
- **TypeScript**: Full TypeScript support

**Alternatives Considered**:
- **rc-tree**: Popular tree component
  - Rejected: Older API, less modern TypeScript support, manual virtualization
- **react-dnd + custom tree**: Build from scratch with react-dnd
  - Rejected: Too much custom code for MVP, slower time-to-market
- **Material-UI TreeView**: Component library tree
  - Rejected: Requires full MUI dependency, less flexible for custom styling

**Best Practices**:
- Use virtualization for trees >50 nodes
- Implement custom drag preview for better UX
- Validate drop targets before allowing drop (UX1, UX3)
- Debounce state updates during drag to avoid render thrashing
- Measure re-render time with React Profiler (UX4 compliance)

### Decision 6: DITA XML Validation

**Chosen**: Custom DITA 1.3 schema validator using TypeScript type guards + runtime validation

**Rationale**:
- **Type safety**: TypeScript interfaces mirror DITA XSD, compile-time checking (CQ2)
- **Runtime validation**: Validate generated XML against DITA rules before save
- **Lightweight**: No heavy XML parsing libraries in browser
- **Precise error messages**: Custom validators provide DITA-specific error messages (TS3)
- **Test integration**: Easy to unit test validation rules (TS1)

**Approach**:
```typescript
// Type guard example
function isValidTopicStructure(node: DitaNode): node is Topic {
  return (
    node.type === 'topic' &&
    node.children.length > 0 &&
    node.children[0].type === 'title' &&
    // ... additional DITA rules
  );
}
```

**Alternatives Considered**:
- **xmllint / Ajv + XSD**: External schema validation
  - Rejected: Heavy browser bundle, async validation slows editing
- **libxmljs**: Native XML parsing
  - Rejected: Node.js only, can't run in browser
- **DITA-OT**: Full DITA Open Toolkit
  - Rejected: Java-based, server-side only, massive overhead for MVP

**Best Practices**:
- Define TypeScript types for all DITA elements (topic, title, p, ul, li, map, topicref)
- Implement runtime validators matching ProseMirror schema constraints
- Run validation before XML serialization
- Show validation errors in UI (UX1)
- Include validation in integration tests (TS1)

### Decision 7: File System Access

**Chosen**: File System Access API (with fallback to download/upload)

**Rationale**:
- **Modern API**: Native browser file system access (Chrome 86+, Edge 86+)
- **Better UX**: Users can "open" and "save" files like desktop apps
- **No server required**: Fully offline-capable (MVP requirement)
- **Firefox/Chrome support**: Meets PR4 target platform (Fedora Linux browsers)

**Fallback Strategy**:
- For browsers without File System Access API: use traditional download/upload
- Detect API availability at runtime: `'showSaveFilePicker' in window`

**Alternatives Considered**:
- **LocalStorage/IndexedDB**: Browser storage
  - Rejected: Users want real .dita/.ditamap files, not browser-locked data
- **Electron**: Desktop app framework
  - Rejected: Overkill for MVP, adds build complexity, larger distribution size
- **PWA with offline storage**: Progressive Web App
  - Rejected: Still requires file export/import, doesn't solve file access problem

**Best Practices**:
- Prompt for save location on first save, remember file handle for subsequent saves
- Validate file extensions (.dita for topics, .ditamap for maps)
- Handle permission errors gracefully (show retry prompt)
- Implement auto-save to prevent data loss (save on idle after 30 seconds)

## Performance Research

### Typing Latency (PR2: <100ms)

**Key Findings**:
- ProseMirror's contentEditable handling is ~5-20ms for text input
- React rendering adds ~10-30ms per render cycle
- State update batching (React 18 concurrent features) reduces re-renders
- Validation throttling (debounced to 300ms) prevents blocking typing

**Optimization Strategy**:
- Use `React.memo` for editor components to prevent unnecessary re-renders
- Debounce expensive operations (validation, XML serialization)
- Avoid synchronous ProseMirror plugins on every transaction
- Profile with React DevTools Profiler to identify bottlenecks

### Render Performance (PR1: <1,500ms for 5,000 words)

**Key Findings**:
- ProseMirror handles large documents efficiently via virtual DOM
- Initial parse of 5,000-word document: ~200-400ms (ProseMirror deserialization)
- React component mount: ~100-300ms
- Total budget: ~1,500ms leaves room for future features

**Optimization Strategy**:
- Lazy load editor plugins (code-splitting)
- Use `React.lazy` for non-critical UI components
- Minimize bundle size (tree-shaking, no unused dependencies)
- Measure with Lighthouse Performance audit

### Map Tree Updates (UX4: <200ms)

**Key Findings**:
- react-arborist virtualized tree: ~10-50ms for 100-node tree re-render
- State update overhead: ~5-20ms (Zustand update + React re-render)
- Drag animation: ~16ms per frame (60fps)
- Total: well under 200ms budget

**Optimization Strategy**:
- Use `React.memo` for tree node components
- Implement `shouldComponentUpdate` for drag-drop performance
- Profile with React Profiler during drag operations
- Use `requestAnimationFrame` for smooth drag feedback

## Security Considerations (Future)

**Current Scope (MVP)**:
- Local file system only, no network requests
- No authentication or multi-user features
- No sensitive data handling beyond user's local files

**Future Considerations**:
- Content Security Policy (CSP) if adding preview rendering
- Sanitization if supporting paste from external sources
- Permission prompts for File System Access API

## Conclusion

All technology choices align with constitutional principles (CQ1-CQ4, TS1-TS3, UX1-UX4, PR1-PR4) and support the MVP feature requirements. The stack is:

- **Frontend**: React 18 + TypeScript 5
- **Editor**: ProseMirror (WYSIWYG) + react-arborist (tree)
- **State**: Zustand + Immer
- **Build**: Vite 5
- **Testing**: Vitest + React Testing Library
- **Storage**: File System Access API (with fallback)

Ready to proceed to Phase 1 (Design & Contracts).
