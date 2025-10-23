# Feature Specification: MVP DITA Editor

**Feature Branch**: `001-mvp-dita-editor`
**Created**: 2025-10-23
**Status**: Draft
**Input**: User description: "Build a Minimum Viable Product (MVP) DITA Editor that supports both DITA Topics and DITAMAPs. For DITA Topic Editing (WYSIWYG): 1. Allow the user to load a new, empty <topic>, set the required <title>, and write content using only <p> (paragraph) and basic unordered lists (<ul> with <li>). 2. Provide dedicated toolbar buttons to toggle the currently focused element between a <p> and an <li>. 3. Implement continuous structural validation to ensure that list items (<li>) can only exist inside lists (<ul>), blocking invalid actions (UX1). For DITAMAP Editing (Tree Interface): 1. Provide a dedicated Tree Interface (UX4) to view the <map> and its nested <topicref> hierarchy. 2. Enable the user to add a new, empty <topicref> as either a sibling or a child to a selected node. 3. Support drag-and-drop actions on <topicref> nodes to reorder the map structure and change nesting, ensuring the map remains structurally valid during and after the operation. The core user story is to quickly draft short procedure topics and organize them into a basic, hierarchical navigation map."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Edit Basic Topic Content (Priority: P1)

As a technical writer, I need to create a new DITA topic and write simple procedure steps using paragraphs and lists, so that I can quickly document basic how-to content.

**Why this priority**: This is the foundational capability - creating content is the primary value of an editor. Without this, no other features matter. This represents the absolute minimum for a viable product.

**Independent Test**: Can be fully tested by creating a new topic, adding a title and paragraphs, converting paragraphs to list items, and verifying the output is valid DITA XML with proper <topic>, <title>, <p>, <ul>, and <li> elements.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** I create a new topic, **Then** I see an empty editing area with a title field and content area
2. **Given** an empty topic, **When** I type a title "Installing Software", **Then** the title appears in the editor and is saved as the <title> element
3. **Given** a topic with a title, **When** I click in the content area and start typing, **Then** a new paragraph (<p>) element is created with my text
4. **Given** I am editing a paragraph, **When** I press Enter, **Then** a new paragraph is created below the current one
5. **Given** my cursor is in a paragraph, **When** I click the "Convert to List Item" toolbar button, **Then** the paragraph becomes a list item within an unordered list
6. **Given** my cursor is in a list item, **When** I click the "Convert to Paragraph" toolbar button, **Then** the list item becomes a paragraph and the parent list is removed if it was the only item
7. **Given** I am typing in a paragraph or list item, **When** I type basic text, **Then** it appears immediately in the editor with typing latency under 100ms (PR2)

---

### User Story 2 - Validate Topic Structure in Real-Time (Priority: P2)

As a technical writer, I need the editor to prevent me from creating invalid DITA structures, so that I don't waste time fixing validation errors later.

**Why this priority**: Structural validation is critical for producing valid DITA, but the editor can function without it if users manually verify structure. This is essential for professional use but not for basic functionality testing.

**Independent Test**: Can be tested by attempting invalid operations (like creating a standalone <li> or nesting invalid elements) and verifying that the editor prevents these actions and provides clear feedback.

**Acceptance Scenarios**:

1. **Given** my cursor is in a paragraph, **When** I click the "Convert to List Item" button, **Then** the editor creates both a <ul> parent and an <li> child, never creating an orphaned <li>
2. **Given** a list with one item, **When** I convert that list item to a paragraph, **Then** the editor removes the now-empty <ul> wrapper
3. **Given** my cursor is in an invalid location for list creation, **When** I hover over the "Convert to List Item" button, **Then** the button is disabled and shows a tooltip explaining why
4. **Given** I am editing content, **When** the structure changes, **Then** the command validity state updates within 50ms of cursor change (UX1)
5. **Given** I perform any editing operation, **When** the operation completes, **Then** the resulting DITA structure is 100% valid against the DITA 1.3 XSD for topic elements used (<topic>, <title>, <p>, <ul>, <li>)

---

### User Story 3 - Create and Manage DITAMAP Hierarchy (Priority: P3)

As a technical writer, I need to create a map structure and organize my topics into a hierarchical navigation, so that readers can navigate my documentation in a logical order.

**Why this priority**: Map management enables organizing multiple topics, but is not needed to test basic topic editing. A single-topic editor is still viable; maps add value for multi-topic documentation projects.

**Independent Test**: Can be tested independently by creating a new map, adding topicref nodes, arranging them hierarchically, and verifying the output is valid DITAMAP XML with proper <map> and nested <topicref> structures.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** I create a new map, **Then** I see a tree interface showing an empty <map> root node
2. **Given** an empty map, **When** I select the map root and click "Add Child Topic Reference", **Then** a new <topicref> node appears as a child in the tree
3. **Given** a map with one topicref, **When** I select that topicref and click "Add Sibling Topic Reference", **Then** a new <topicref> appears at the same level
4. **Given** a map with one topicref, **When** I select that topicref and click "Add Child Topic Reference", **Then** a new <topicref> appears nested under the selected one
5. **Given** a map with multiple topicref nodes, **When** I drag a topicref node and drop it onto another node, **Then** the dragged node becomes a child of the target node
6. **Given** a map with nested topicref nodes, **When** I drag a child node and drop it between two siblings, **Then** the node is reordered to the new position at the same nesting level
7. **Given** I make a structural change to the map, **When** the operation completes and the tree re-renders, **Then** the total time is under 200ms (UX4)
8. **Given** I perform any map editing operation, **When** the operation completes, **Then** the resulting DITAMAP structure is 100% valid against the DITA 1.3 XSD for map elements used (<map>, <topicref>)

---

### Edge Cases

- What happens when a user tries to delete the title from a topic (title is mandatory in DITA)?
- What happens when a user tries to drag a topicref node onto itself in the map tree?
- What happens when a user tries to create a deeply nested map structure (e.g., 10+ levels of topicref nesting)?
- How does the editor handle an empty list (<ul> with no <li> children) if it occurs during editing?
- What happens when a user performs undo/redo operations that cross the boundary between valid and invalid states?
- How does the system handle large topics (e.g., 5,000+ words) while maintaining the 100ms typing latency requirement (PR2)?

## Requirements *(mandatory)*

### Functional Requirements

**Topic Editing Requirements:**

- **FR-001**: System MUST allow users to create a new, empty DITA topic document
- **FR-002**: System MUST provide an editable title field that maps to the DITA <title> element
- **FR-003**: System MUST enforce that every topic has exactly one title (cannot be deleted or duplicated)
- **FR-004**: System MUST allow users to create paragraph (<p>) elements in the topic body
- **FR-005**: System MUST allow users to create unordered lists (<ul>) containing list items (<li>)
- **FR-006**: System MUST provide a toolbar button to convert the currently focused paragraph to a list item within a new list
- **FR-007**: System MUST provide a toolbar button to convert the currently focused list item back to a paragraph
- **FR-008**: System MUST automatically create a <ul> wrapper when converting a paragraph to a list item if one doesn't exist
- **FR-009**: System MUST automatically remove an empty <ul> wrapper when its last <li> child is converted to a paragraph
- **FR-010**: System MUST prevent creation of <li> elements outside of <ul> parents (structural validation per UX1)
- **FR-011**: System MUST enable/disable toolbar buttons based on the current cursor context, updating within 50ms of cursor movement (UX1)
- **FR-012**: System MUST maintain typing latency under 100ms for documents up to 10,000 words (PR2)

**DITAMAP Editing Requirements:**

- **FR-013**: System MUST allow users to create a new, empty DITAMAP document
- **FR-014**: System MUST provide a hierarchical tree interface to visualize the <map> and <topicref> structure (UX4)
- **FR-015**: System MUST allow users to add a new <topicref> as a child of a selected node
- **FR-016**: System MUST allow users to add a new <topicref> as a sibling of a selected node
- **FR-017**: System MUST support drag-and-drop reordering of <topicref> nodes within the tree
- **FR-018**: System MUST support drag-and-drop re-parenting of <topicref> nodes (changing nesting level)
- **FR-019**: System MUST prevent invalid drag-and-drop operations (e.g., dropping a node onto itself)
- **FR-020**: System MUST complete map structure changes and re-render the tree view in under 200ms (UX4)
- **FR-021**: System MUST maintain structural validity during and after all drag-and-drop operations

**Cross-Cutting Requirements:**

- **FR-022**: System MUST maintain separate, decoupled models for Topic content and Map hierarchy (CQ4)
- **FR-023**: System MUST use immutable data structures for all DITA tree manipulation (CQ1)
- **FR-024**: System MUST validate all edited content against DITA 1.3 XSD schema rules for elements used
- **FR-025**: System MUST provide immediate visual feedback when an operation would violate DITA structural rules
- **FR-026**: System MUST save topic and map documents as valid DITA 1.3 XML files

### Key Entities

- **Topic**: A DITA topic document containing a title and body content. Attributes include: title (required text), body content (collection of paragraphs and lists). Topics are independent content units that can be referenced by maps.

- **Paragraph**: A block-level content element (<p>) within a topic body. Contains plain text content. Can be converted to/from list items via toolbar actions.

- **Unordered List**: A list structure (<ul>) that contains one or more list items. Created automatically when converting a paragraph to a list item. Removed automatically when empty.

- **List Item**: A single item (<li>) within a list. Contains plain text content. Must always have a <ul> parent; cannot exist independently.

- **Map**: A DITAMAP document that defines the hierarchical organization of topics. Contains a tree structure of topic references.

- **Topic Reference**: A node (<topicref>) within a map hierarchy. Represents a reference to a topic and can be nested to create navigation structure. Attributes include: href (reference to topic file - optional in MVP), navtitle (display title - optional). Can have child topic references to create hierarchical navigation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new topic, add a title, and write three paragraphs in under 2 minutes
- **SC-002**: Users can convert three paragraphs to a bulleted list in under 30 seconds using toolbar buttons
- **SC-003**: The editor prevents 100% of attempts to create invalid DITA structures (orphaned list items, topics without titles)
- **SC-004**: Users can create a map with 10 topic references organized in a 3-level hierarchy in under 5 minutes
- **SC-005**: Users can reorganize a 10-node map structure (via drag-and-drop) in under 3 minutes
- **SC-006**: All saved documents are 100% valid against DITA 1.3 XSD schema for elements implemented
- **SC-007**: 90% of users successfully complete basic topic creation and map organization tasks on first attempt without external help
- **SC-008**: Typing latency remains under 100ms for documents containing up to 10,000 words (PR2)
- **SC-009**: Map tree updates complete in under 200ms after structural changes (UX4)
- **SC-010**: Command button states (enabled/disabled) update within 50ms of cursor position changes (UX1)

### Assumptions

- Users have basic familiarity with text editing and hierarchical navigation structures (like file trees)
- Topics will be relatively short (under 10,000 words) for MVP usage
- Maps will be relatively small (under 100 topic references) for MVP usage
- Documents will be saved locally to the file system (no collaboration or cloud storage in MVP)
- MVP supports only the minimal DITA elements specified (<topic>, <title>, <p>, <ul>, <li>, <map>, <topicref>)
- Additional DITA elements (tables, images, code blocks, etc.) are out of scope for MVP
- Topic references in maps are placeholders; actual href linking to topic files is optional in MVP
- The editor targets the Fedora Linux platform with Firefox and Chrome browsers (PR4)
