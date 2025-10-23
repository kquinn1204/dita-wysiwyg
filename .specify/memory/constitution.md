<!--
Sync Impact Report:
Version Change: 1.0.0 → 1.1.0
Modified Principles:
  - Project Name: "DITA-WYSIWYG-SpecKit" → "DITA-WYSIWYG-SpecKit (Topics & Maps)"
  - Purpose: Expanded to explicitly cover DITA Topics and DITAMAPs
  - Compliance Review: Updated to include CQ4 verification

Added Sections:
  - CQ4: Separate Map and Topic Models (new architectural principle)
  - UX4: DITAMAP Tree Interface (new UX requirement)
  - PR4: Target Platform Baseline (new performance requirement)

Removed Sections: None

Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section supports new principles
  ✅ spec-template.md - Requirements structure supports Map/Topic separation
  ✅ tasks-template.md - Task structure supports dual-model architecture
  ⚠️ Future consideration: May need Map-specific task templates

Follow-up TODOs:
  - Consider creating Map-specific test fixtures for TS1
  - Consider Map-specific performance test harness for PR4 validation
-->

# DITA-WYSIWYG-SpecKit (Topics & Maps) Constitution

## Metadata

**Project Name**: DITA-WYSIWYG-SpecKit (Topics & Maps)
**Purpose**: To define the minimum enforceable quality, behavior, and structural standards
for all generated components of the DITA XML Editor application, covering both DITA Topics
and DITAMAPs.
**Target DITA Spec**: DITA 1.3 (Topic & Map base)
**Spec Generation Tool**: spec-kit

## Core Principles

### I. Code Quality & Maintainability Principles

These principles focus on generating clean, predictable, and maintainable code artifacts.

#### CQ1: Data Purity and Immutability

**Rule**: All internal data models representing the DITA structure MUST be treated as
immutable. Editing operations must return a new state object rather than modifying the
existing one.

**Enforced By**: The spec-kit data layer must generate functional update methods
(e.g., Redux-like reducers or equivalent state machine logic).

**Target Metric**: 100% adherence to immutable state pattern for DITA tree manipulation.

**Rationale**: Immutability prevents unexpected side effects, enables reliable undo/redo,
simplifies debugging, and ensures predictable state transitions in complex document
editing workflows.

#### CQ2: Strong Typing and Validation

**Rule**: Every data field (e.g., element attributes, node content) must be strictly typed
according to the DITA XSD definitions (e.g., xs:ID, xs:NMTOKEN, xs:string).

**Enforced By**: Generated code must include TypeScript interfaces or PropTypes definitions
derived directly from the spec.

**Target Metric**: No use of `any` or untyped structures in core logic modules.

**Rationale**: Strong typing catches errors at compile time, provides IDE autocomplete,
serves as living documentation, and ensures DITA spec compliance throughout the codebase.

#### CQ3: Modular Separation of Concerns

**Rule**: Logic related to View Rendering must be separate from DITA Tree Manipulation.
The View layer must only observe the Model and dispatch prescribed actions; it must never
directly modify the model.

**Enforced By**: Generated architecture must enforce a unidirectional data flow
(Model → View → Action → Model).

**Rationale**: Clear separation enables independent testing, makes the codebase easier to
reason about, prevents tight coupling, and allows view layer replacement without affecting
business logic.

#### CQ4: Separate Map and Topic Models

**Rule**: The application MUST maintain two distinct, decoupled models: one for Topic
content and one for Map structure and hierarchy (`<topicref>`, `<map>`). Map manipulation
logic MUST be entirely separate from Topic content editing logic.

**Enforced By**: The generated data layer must provide distinct services/modules for Topic
tree state and Map hierarchy state.

**Target Metric**: 100% decoupling between Topic content tree state and Map hierarchy
state.

**Rationale**: DITA Topics and Maps serve fundamentally different purposes—Topics contain
content while Maps define navigation structure. Separating these models prevents accidental
coupling, enables independent optimization of each concern, and mirrors the DITA spec's own
architectural separation. This separation also allows Map operations (reordering,
re-parenting) to execute without touching Topic content state.

### II. Testing Standards

These standards ensure that all generated components are verifiable and maintain
correctness against the DITA specification.

#### TS1: Schema Conformance Testing (Mandatory)

**Rule**: A suite of tests MUST be generated to verify that any complex state mutation
operation (e.g., drag-and-drop, structural pasting) results in a DITA tree that is 100%
valid against the defined DITA XSD/Spec. This applies to both Topic content structures and
Map hierarchy structures.

**Enforced By**: Generation of fixture-based tests for core editing actions (e.g., testing
insertion of `<section>` into a `<topic>`, or nesting of `<topicref>` within a `<map>`).

**Target Metric**: 95% test coverage on all generated DITA manipulation actions (both
Topic and Map operations).

**Rationale**: The editor's primary value is producing valid DITA documents. Schema
conformance testing is the only way to guarantee that complex operations don't violate
DITA structural rules.

#### TS2: View Integrity Testing

**Rule**: Generated UI components MUST include visual regression tests (or simple snapshot
tests) to ensure that the visual representation (WYSIWYG) correctly maps to the underlying
DITA element type.

**Enforced By**: Automated generation of Jest/Snapshot test cases for every DITA element's
rendering component.

**Target Metric**: Zero false-positive visual changes across updates.

**Rationale**: A WYSIWYG editor's fundamental promise is "what you see is what you get."
View integrity tests ensure the visual representation always matches the semantic DITA
structure.

#### TS3: Error and Boundary Condition Testing

**Rule**: All validation errors (e.g., trying to insert a `<fig>` inside a `<shortdesc>`)
must be explicitly tested to ensure the editor correctly prevents the invalid state and
provides helpful feedback.

**Enforced By**: Generation of edge-case test fixtures that attempt invalid operations.

**Rationale**: Users will inevitably attempt invalid operations. Testing error paths
ensures graceful degradation, clear error messages, and prevents data corruption.

### III. User Experience Consistency (WYSIWYG Focus)

These principles ensure the editor feels unified, predictable, and follows established
DITA editing patterns.

#### UX1: Structural Validity Feedback

**Rule**: The editor MUST provide real-time, non-blocking visual feedback when the user's
current cursor position is invalid for a common action (e.g., disabling the "Insert List"
button if the current position does not permit a `<ul>`).

**Enforced By**: The generated command system must expose a `canExecute` property based on
the current context node's DITA rules.

**Target Metric**: Command validity state MUST update within 50ms of a cursor change.

**Rationale**: Real-time feedback prevents user frustration and trial-and-error workflows.
Users should never need to guess whether an action is valid at their current position.

#### UX2: Consistent Visual Mapping

**Rule**: The visual appearance of a DITA element in the WYSIWYG editor MUST be consistent
with the editor's compiled output (e.g., PDF/HTML preview) as defined by the styling spec.

**Enforced By**: The generated rendering styles must derive from a single source definition
file (the View Model spec).

**Rationale**: Inconsistency between editor and output breaks the WYSIWYG promise and
forces users to constantly preview. A single source of truth for styling ensures
consistency.

#### UX3: Atomicity of Interactions

**Rule**: Complex interactions (like inserting a table or a note) must be defined as
atomic, single-step operations that guarantee a valid initial structure, minimizing the
window for the user to create an invalid DITA state.

**Enforced By**: Generated commands must enforce transaction logic derived from the spec.

**Rationale**: Multi-step insertion of complex structures increases cognitive load and
error potential. Atomic operations with valid default structures provide a better starting
point for users.

#### UX4: DITAMAP Tree Interface

**Rule**: DITAMAP editing MUST utilize a hierarchical, tree-based user interface that
visually represents the `<topicref>` nesting. This interface must support direct
manipulation of map elements, including drag-and-drop reordering, nesting, and deletion.

**Enforced By**: The generated UI must include a dedicated Map navigation component that
exposes and operates exclusively on the Map model.

**Target Metric**: Map structure changes (re-parenting a node) must complete and re-render
the tree view in under 200ms.

**Rationale**: Maps are inherently hierarchical navigation structures. A tree interface
provides the most natural mental model for understanding and manipulating topic
relationships. Direct manipulation (drag-and-drop) enables rapid restructuring without
context switching or modal dialogs. The 200ms threshold ensures perceived immediacy for
structural changes.

### IV. Performance Requirements

These requirements ensure the editor is fast and responsive, especially when dealing with
large DITA topics.

#### PR1: Rendering Threshold

**Requirement**: The initial render time for a DITA topic document of up to 5,000 words
MUST not exceed 1,500ms on the target platform.

**Enforced By**: Generated View components must utilize memoization and efficient tree
reconciliation (e.g., optimized React/Angular components).

**Rationale**: Initial render time directly impacts perceived editor responsiveness. Users
expect near-instant document loading for typical documentation topics.

#### PR2: Input Responsiveness (Typing Latency)

**Requirement**: Typing latency (the time between a keypress and the character appearing)
MUST be less than 100ms, regardless of document size (up to 10,000 words).

**Enforced By**: The generated input handler must decouple state updates from UI rendering
wherever possible (e.g., throttling/debouncing background validation).

**Rationale**: Typing latency above 100ms is perceptible and creates a frustrating editing
experience. Responsive typing is the most fundamental requirement for any text editor.

#### PR3: Undo/Redo Speed

**Requirement**: State changes (Undo/Redo) must be executed and the UI re-rendered in
under 500ms.

**Enforced By**: The state management system must generate and manage a minimal diff
history rather than cloning the entire DITA tree for every action.

**Rationale**: Slow undo/redo discourages experimentation and iterative editing. Fast
state transitions are essential for a productive editing workflow.

#### PR4: Target Platform Baseline

**Requirement**: All performance metrics (PR1, PR2, PR3, UX4) must be measured against and
validated on the Fedora Linux operating system. The application MUST function without
degradation in the latest stable version of Firefox and Chrome on this OS.

**Enforced By**: All automated performance tests must be configured to run within a Fedora
Linux environment.

**Rationale**: Establishing a concrete platform baseline ensures consistent, reproducible
performance testing. Fedora Linux represents a common enterprise documentation environment.
Testing on both major browsers (Firefox and Chrome) ensures broad compatibility while
maintaining Linux-native development workflow alignment.

## Governance

### Amendment Process

1. **Proposal**: Any principle amendment must be documented with:
   - Rationale for the change
   - Impact analysis on existing code
   - Migration plan for affected components

2. **Approval**: Constitution amendments require:
   - Review by project technical lead
   - Validation that change doesn't conflict with DITA 1.3 spec requirements
   - Confirmation that automated enforcement mechanisms can be updated

3. **Implementation**:
   - Constitution version must be incremented per semantic versioning rules
   - All dependent templates must be updated in the same commit
   - Sync Impact Report must be generated and prepended to constitution

### Versioning Policy

- **MAJOR**: Backward incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Compliance Review

1. All feature specifications (`spec.md`) MUST reference applicable principles in their
   requirements section
2. All implementation plans (`plan.md`) MUST include a Constitution Check gate before
   Phase 0 research
3. All task lists (`tasks.md`) MUST include verification tasks for testable metrics
   (e.g., schema conformance, performance thresholds)
4. Code reviews MUST verify adherence to:
   - Immutability patterns (CQ1)
   - Type safety (CQ2)
   - Separation of concerns (CQ3)
   - Map/Topic model decoupling (CQ4)
   - Test coverage requirements (TS1-TS3)

### Complexity Justification

Any deviation from constitutional principles MUST be documented in the plan.md Complexity
Tracking table with:
- Which principle is being violated
- Why the violation is necessary
- What simpler alternatives were rejected and why

**Version**: 1.1.0 | **Ratified**: 2025-10-23 | **Last Amended**: 2025-10-23
