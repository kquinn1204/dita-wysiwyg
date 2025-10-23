# Tasks: MVP DITA Editor

**Input**: Design documents from `/home/kquinn/dita-wysiwyg/specs/001-mvp-dita-editor/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are included based on constitutional testing standards (TS1-TS3) planned in plan.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (SPA)**: `src/`, `tests/` at repository root
- Paths shown below follow the structure defined in plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize npm project with package.json in repository root
- [x] T002 Install React, TypeScript, Vite dependencies per quickstart.md
- [x] T003 [P] Install ProseMirror packages (prosemirror-model, prosemirror-state, prosemirror-view, prosemirror-transform, prosemirror-history, prosemirror-commands, prosemirror-keymap, prosemirror-schema-list)
- [x] T004 [P] Install Zustand and Immer for state management
- [x] T005 [P] Install testing dependencies (Vitest, React Testing Library, @testing-library/jest-dom, happy-dom)
- [x] T006 [P] Install tree component library (react-arborist or react-complex-tree)
- [x] T007 Create TypeScript configuration in tsconfig.json with strict mode enabled
- [x] T008 Create TypeScript configuration for Vite in tsconfig.node.json
- [x] T009 Create Vite configuration in vite.config.ts
- [x] T010 Create Vitest setup file in src/test/setup.ts
- [x] T011 Create project structure per plan.md (src/stores, src/editor, src/components, src/models, src/utils, tests directories)
- [x] T012 Create HTML entry point in public/index.html
- [x] T013 Create main application entry in src/main.tsx
- [x] T014 Create basic App component in src/App.tsx
- [x] T015 Create editor styles in public/styles/editor.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T016 [P] Define DITA element types in src/models/DitaElements.ts (Topic, Paragraph, UnorderedList, ListItem per data-model.md)
- [x] T017 [P] Define Topic entity types in src/models/Topic.ts (Topic, TopicMetadata, TopicBody)
- [x] T018 [P] Define Map entity types in src/models/Map.ts (DitaMap, MapNode, MapMetadata)
- [x] T019 Define ProseMirror schema for Topic in src/editor/schemas/topicSchema.ts (paragraph, bullet_list, list_item nodes)
- [x] T020 Define ProseMirror schema for Map in src/editor/schemas/mapSchema.ts (topicref node)
- [x] T021 Create Topic store with Zustand in src/stores/topicStore.ts (createNewTopic, updateTitle, addParagraph actions)
- [x] T022 Create Map store with Zustand in src/stores/mapStore.ts (createNewMap, addChild, addSibling, moveNode, selectNode actions)
- [x] T023 Implement Topic serializer in src/editor/serializers/topicSerializer.ts (toXml, fromXml methods)
- [x] T024 Implement Map serializer in src/editor/serializers/mapSerializer.ts (toXml, fromXml methods)
- [x] T025 Create file system utilities in src/utils/fileSystem.ts (File System Access API with download/upload fallback)
- [x] T026 Create DITA validator utilities in src/utils/ditaValidator.ts (type guards for Topic and Map validation)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Edit Basic Topic Content (Priority: P1) 🎯 MVP

**Goal**: Enable users to create topics and write content with paragraphs and lists

**Independent Test**: Create a new topic, add a title and three paragraphs, convert paragraphs to list items, verify generated DITA XML is valid and contains proper <topic>, <title>, <p>, <ul>, <li> elements

### Tests for User Story 1 (Schema Conformance - TS1)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T027 [P] [US1] Create test fixture for empty topic in tests/fixtures/sampleTopics/empty-topic.xml
- [ ] T028 [P] [US1] Create test fixture for topic with paragraphs in tests/fixtures/sampleTopics/topic-with-paragraphs.xml
- [ ] T029 [P] [US1] Create test fixture for topic with lists in tests/fixtures/sampleTopics/topic-with-lists.xml
- [ ] T030 [P] [US1] Write schema conformance test for topic creation in tests/integration/topicEditing.test.ts (verify empty topic is valid DITA XML)
- [ ] T031 [P] [US1] Write schema conformance test for paragraph addition in tests/integration/topicEditing.test.ts
- [ ] T032 [P] [US1] Write schema conformance test for paragraph-to-list conversion in tests/integration/topicEditing.test.ts
- [ ] T033 [P] [US1] Write schema conformance test for list-to-paragraph conversion in tests/integration/topicEditing.test.ts
- [ ] T034 [P] [US1] Write unit test for Topic store mutations in tests/unit/stores/topicStore.test.ts (verify immutability)
- [ ] T035 [P] [US1] Write unit test for ProseMirror schema in tests/unit/editor/topicSchema.test.ts (verify node definitions)
- [ ] T036 [P] [US1] Write serialization roundtrip test in tests/unit/editor/topicSerializer.test.ts (Topic → XML → Topic)

### Implementation for User Story 1

- [x] T037 [US1] Implement convertToParagraph command in src/editor/plugins/commands.ts
- [x] T038 [US1] Implement convertToList command in src/editor/plugins/commands.ts
- [x] T039 [US1] Implement undo/redo commands in src/editor/plugins/commands.ts
- [x] T040 [US1] Create keymap plugin in src/editor/plugins/keymap.ts (Enter for new paragraph, keyboard shortcuts)
- [x] T041 [P] [US1] Create Toolbar component in src/components/TopicEditor/Toolbar.tsx
- [x] T042 [P] [US1] Create EditorView component in src/components/TopicEditor/EditorView.tsx (ProseMirror wrapper)
- [x] T043 [US1] Create TopicEditor main component in src/components/TopicEditor/TopicEditor.tsx (integrates Toolbar + EditorView)
- [x] T044 [P] [US1] Create Button component in src/components/common/Button.tsx
- [x] T045 [P] [US1] Create Tooltip component in src/components/common/Tooltip.tsx
- [x] T046 [US1] Integrate TopicEditor into App.tsx (wire to topicStore)
- [x] T047 [US1] Add basic toolbar styling to public/styles/editor.css
- [x] T048 [US1] Add WYSIWYG editor styling to public/styles/editor.css

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can create topics, add paragraphs, convert to lists, and save valid DITA XML.

---

## Phase 4: User Story 2 - Validate Topic Structure in Real-Time (Priority: P2)

**Goal**: Prevent invalid DITA structures through real-time validation

**Independent Test**: Attempt to create orphaned <li> elements or delete mandatory <title>, verify editor prevents these operations and provides clear feedback via disabled buttons and tooltips

### Tests for User Story 2 (Error & Boundary - TS3)

- [ ] T049 [P] [US2] Write test for orphaned list item prevention in tests/integration/topicEditing.test.ts
- [ ] T050 [P] [US2] Write test for empty list auto-removal in tests/integration/topicEditing.test.ts
- [ ] T051 [P] [US2] Write test for mandatory title enforcement in tests/integration/topicEditing.test.ts
- [ ] T052 [P] [US2] Write test for command state updates (within 50ms) in tests/integration/topicEditing.test.ts
- [ ] T053 [P] [US2] Write test for tooltip display on disabled buttons in tests/unit/components/Toolbar.test.tsx

### Implementation for User Story 2

- [ ] T054 [US2] Implement validation plugin in src/editor/plugins/validation.ts (prevent orphaned list items, auto-remove empty lists, enforce title)
- [ ] T055 [US2] Add canExecute checks to commands in src/editor/plugins/commands.ts (check cursor context before execution)
- [ ] T056 [US2] Update Toolbar component to enable/disable buttons based on editor state in src/components/TopicEditor/Toolbar.tsx
- [ ] T057 [US2] Add tooltip support to Toolbar buttons in src/components/TopicEditor/Toolbar.tsx (explain why buttons are disabled)
- [ ] T058 [US2] Implement command state tracking hook in src/components/TopicEditor/useCommandState.ts (update within 50ms per UX1)
- [ ] T059 [US2] Add validation error feedback to editor UI in src/components/TopicEditor/EditorView.tsx

**Checkpoint**: At this point, User Story 2 should work independently. Editor prevents all invalid DITA structures and provides clear feedback.

---

## Phase 5: User Story 3 - Create and Manage DITAMAP Hierarchy (Priority: P3)

**Goal**: Enable users to create maps and organize topics hierarchically

**Independent Test**: Create a new map, add 10 topicref nodes in a 3-level hierarchy, drag-drop to reorder and re-parent nodes, verify generated DITAMAP XML is valid

### Tests for User Story 3 (Schema Conformance - TS1)

- [ ] T060 [P] [US3] Create test fixture for empty map in tests/fixtures/sampleMaps/empty-map.xml
- [ ] T061 [P] [US3] Create test fixture for map with hierarchy in tests/fixtures/sampleMaps/map-with-hierarchy.xml
- [ ] T062 [P] [US3] Write schema conformance test for map creation in tests/integration/mapEditing.test.ts
- [ ] T063 [P] [US3] Write schema conformance test for add child operation in tests/integration/mapEditing.test.ts
- [ ] T064 [P] [US3] Write schema conformance test for add sibling operation in tests/integration/mapEditing.test.ts
- [ ] T065 [P] [US3] Write schema conformance test for drag-drop re-parenting in tests/integration/mapEditing.test.ts
- [ ] T066 [P] [US3] Write schema conformance test for drag-drop reordering in tests/integration/mapEditing.test.ts
- [ ] T067 [P] [US3] Write test for circular reference prevention in tests/integration/mapEditing.test.ts
- [ ] T068 [P] [US3] Write test for dropping node onto itself prevention in tests/integration/mapEditing.test.ts
- [ ] T069 [P] [US3] Write test for tree update performance (<200ms) in tests/integration/mapEditing.test.ts
- [ ] T070 [P] [US3] Write unit test for Map store mutations in tests/unit/stores/mapStore.test.ts
- [ ] T071 [P] [US3] Write serialization roundtrip test in tests/unit/editor/mapSerializer.test.ts

### Implementation for User Story 3

- [ ] T072 [P] [US3] Create TopicRefNode component in src/components/MapEditor/TopicRefNode.tsx (individual tree node)
- [ ] T073 [P] [US3] Create DragDropContext provider in src/components/MapEditor/DragDropContext.tsx
- [ ] T074 [US3] Create MapTreeView component in src/components/MapEditor/MapTreeView.tsx (integrate react-arborist)
- [ ] T075 [US3] Implement drag-drop validation logic in src/components/MapEditor/dragDropValidation.ts (prevent circular refs, self-drops)
- [ ] T076 [US3] Add map tree actions (Add Child, Add Sibling buttons) to MapTreeView
- [ ] T077 [US3] Integrate MapTreeView into App.tsx (wire to mapStore)
- [ ] T078 [US3] Add map tree styling to public/styles/editor.css
- [ ] T079 [US3] Optimize tree rendering with React.memo in src/components/MapEditor/TopicRefNode.tsx

**Checkpoint**: All user stories should now be independently functional. Users can create and edit topics, validate structure, and organize maps.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final integration

- [ ] T080 [P] Implement Save function in src/utils/fileSystem.ts (use File System Access API for .dita files)
- [ ] T081 [P] Implement Load function in src/utils/fileSystem.ts (use File System Access API)
- [ ] T082 [P] Implement Save function for maps in src/utils/fileSystem.ts (.ditamap files)
- [ ] T083 [P] Implement Load function for maps in src/utils/fileSystem.ts
- [ ] T084 Add Save/Load buttons to App.tsx (File menu or toolbar)
- [ ] T085 Implement dirty state tracking in topicStore (mark when changes are unsaved)
- [ ] T086 Implement dirty state tracking in mapStore
- [ ] T087 [P] Add auto-save functionality (save on idle after 30 seconds) in src/utils/autoSave.ts
- [ ] T088 [P] Write View Integrity tests (TS2) for TopicEditor component in tests/unit/components/TopicEditor.test.tsx (snapshot tests)
- [ ] T089 [P] Write View Integrity tests for MapTreeView component in tests/unit/components/MapTreeView.test.tsx (snapshot tests)
- [ ] T090 [P] Profile typing latency with React Profiler in tests/integration/performance.test.ts (verify <100ms per PR2)
- [ ] T091 [P] Profile map tree updates with React Profiler in tests/integration/performance.test.ts (verify <200ms per UX4)
- [ ] T092 [P] Profile initial render time in tests/integration/performance.test.ts (verify <1,500ms for 5,000 words per PR1)
- [ ] T093 Optimize editor rendering with React.memo in src/components/TopicEditor/EditorView.tsx
- [ ] T094 Optimize toolbar rendering with React.memo in src/components/TopicEditor/Toolbar.tsx
- [ ] T095 Add UI for switching between Topic and Map editing modes in App.tsx
- [ ] T096 Add keyboard shortcuts documentation in README or help modal
- [ ] T097 Run full integration test suite on Fedora Linux with Firefox (PR4 validation)
- [ ] T098 Run full integration test suite on Fedora Linux with Chrome (PR4 validation)
- [ ] T099 Fix any failing tests or performance issues identified
- [ ] T100 Run final DITA validation against DITA 1.3 XSD for sample documents

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on US1/US2 (separate Map model per CQ4)

### Within Each User Story

- Tests (TS1-TS3) MUST be written and FAIL before implementation
- Models/types before components
- Stores before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models/fixtures within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all test fixtures for User Story 1 together:
Task: "T027 [P] [US1] Create test fixture for empty topic in tests/fixtures/sampleTopics/empty-topic.xml"
Task: "T028 [P] [US1] Create test fixture for topic with paragraphs in tests/fixtures/sampleTopics/topic-with-paragraphs.xml"
Task: "T029 [P] [US1] Create test fixture for topic with lists in tests/fixtures/sampleTopics/topic-with-lists.xml"

# Launch all schema conformance tests together:
Task: "T030 [P] [US1] Write schema conformance test for topic creation"
Task: "T031 [P] [US1] Write schema conformance test for paragraph addition"
Task: "T032 [P] [US1] Write schema conformance test for paragraph-to-list conversion"
Task: "T033 [P] [US1] Write schema conformance test for list-to-paragraph conversion"

# Launch all UI component implementations together (after tests fail):
Task: "T041 [P] [US1] Create Toolbar component"
Task: "T042 [P] [US1] Create EditorView component"
Task: "T044 [P] [US1] Create Button component"
Task: "T045 [P] [US1] Create Tooltip component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T015)
2. Complete Phase 2: Foundational (T016-T026) - CRITICAL
3. Complete Phase 3: User Story 1 (T027-T048)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**MVP Deliverable**: Topic editor with paragraphs and lists, valid DITA XML output

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (adds validation)
4. Add User Story 3 → Test independently → Deploy/Demo (adds map management)
5. Polish (Phase 6) → Final production-ready release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Topic editing)
   - Developer B: User Story 2 (Validation)
   - Developer C: User Story 3 (Map management)
3. Stories complete and integrate independently
4. Team collaborates on Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach per TS1-TS3)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

## Task Count Summary

- **Setup**: 15 tasks
- **Foundational**: 11 tasks (blocking)
- **User Story 1**: 22 tasks (11 tests + 11 implementation)
- **User Story 2**: 11 tasks (5 tests + 6 implementation)
- **User Story 3**: 20 tasks (12 tests + 8 implementation)
- **Polish**: 21 tasks
- **Total**: 100 tasks

## Parallel Opportunities

- Setup phase: 9 tasks can run in parallel
- Foundational phase: 8 tasks can run in parallel
- User Story 1: 10 test tasks + 6 component tasks can run in parallel
- User Story 2: 5 test tasks can run in parallel
- User Story 3: 12 test tasks + 4 component tasks can run in parallel
- Polish phase: 11 tasks can run in parallel

## Constitutional Compliance

All tasks align with constitutional principles:
- **CQ1 (Immutability)**: Enforced by Zustand + Immer in store tasks
- **CQ2 (Strong Typing)**: TypeScript interfaces defined in foundational tasks
- **CQ3 (Separation)**: Components separated from stores
- **CQ4 (Separate Models)**: Topic and Map stores independent (no cross-dependencies)
- **TS1-TS3 (Testing)**: Comprehensive test tasks for schema conformance, view integrity, edge cases
- **UX1-UX4 (UX)**: Command validation, tree interface, performance testing
- **PR1-PR4 (Performance)**: Performance testing tasks, Fedora Linux + Firefox/Chrome validation
