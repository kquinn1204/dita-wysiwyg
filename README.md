# MVP DITA Editor

A lightweight, browser-based WYSIWYG editor for creating and editing DITA 1.3 topics with support for paragraphs and unordered lists.

## Features

- **Split-Pane Editor**: Edit in both raw DITA XML and WYSIWYG modes simultaneously
  - Left pane: Raw DITA XML source (editable)
  - Right pane: WYSIWYG visual editor
  - Real-time synchronization between both views
- **WYSIWYG Topic Editing**: Create and edit DITA topics with a visual interface powered by ProseMirror
- **Content Formatting**: Convert between paragraphs and unordered lists
- **Code Block Support**: Proper code blocks with monospace font and preserved formatting
- **DITA 1.3 Compliance**: Generate valid DITA XML output
- **File Operations**: Save and open .dita files using the File System Access API
- **Undo/Redo**: Full history support for all editing operations
- **Keyboard Shortcuts**: Efficient editing with keyboard commands
- **Immutable State**: Built with Zustand + Immer for predictable state management
- **Type-Safe**: Written in TypeScript with strict mode enabled

## Prerequisites

- Node.js 18+ and npm
- Modern browser with File System Access API support (Chrome, Edge) or fallback to download/upload

## Installation

```bash
# Clone or navigate to the repository
cd ~/dita-wysiwyg

# Install dependencies
npm install
```

## Running the Application

### Development Mode (Recommended)

```bash
npm run dev
```

This starts the Vite development server at http://localhost:3000 with hot module replacement enabled.

### Production Build

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The production build is optimized and outputs to the `dist/` directory.

## Usage Guide

### Creating a New Topic

1. Click the **"New Topic"** button in the header
2. A new empty DITA topic will be created with a default ID and timestamp

### Editing Content

The editor provides **two synchronized views**:

#### Left Pane: DITA XML Source
- View and edit raw DITA XML directly
- Changes are immediately reflected in the WYSIWYG editor
- Perfect for advanced users who prefer working with source code
- Invalid XML will not update the visual editor (error logged to console)

#### Right Pane: WYSIWYG Editor

**Title**
- Click the title input field at the top
- Type your topic title

**Body Content**
- Click in the visual editor area to start typing
- Press `Enter` to create new paragraphs
- Type your content directly in the WYSIWYG editor
- Changes are immediately converted to XML in the left pane

### Formatting Content

#### Convert Paragraph to List
- Place cursor in a paragraph
- Click **"Convert to List"** button in toolbar (or press `Ctrl/Cmd+L`)
- The paragraph becomes the first item in an unordered list

#### Convert List Item to Paragraph
- Place cursor in a list item
- Click **"Convert to Paragraph"** button in toolbar (or press `Ctrl/Cmd+P`)
- The list item becomes a standalone paragraph
- If it's the last item in the list, the entire list is replaced

### Saving Topics

1. Click the **"Save"** button in the header
2. Choose a location and filename (defaults to `{topic-id}.dita`)
3. The topic is saved as valid DITA 1.3 XML

**Example Output:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD DITA Topic//EN" "topic.dtd">
<topic id="topic-1729234567890">
  <title>My Topic Title</title>
  <body>
    <p>This is a paragraph.</p>
    <ul>
      <li>First list item</li>
      <li>Second list item</li>
    </ul>
  </body>
</topic>
```

### Opening Topics

1. Click the **"Open"** button in the header
2. Select a .dita file from your file system
3. The topic will be loaded into the editor

The parser supports:
- **Topic types**: `<topic>`, `<task>`, `<concept>`, `<reference>`
- **Body types**: `<body>`, `<taskbody>`, `<conbody>`, `<refbody>`
- **Content elements**:
  - `<p>` - Paragraphs
  - `<ul>` and `<li>` - Unordered lists
  - `<cmd>`, `<info>`, `<note>`, `<shortdesc>` - Converted to paragraphs
  - `<codeblock>` - Imported as code blocks with formatting preserved

The parser recursively walks through container elements like `<context>`, `<steps>`, `<step>`, `<stepxmp>` to extract content.

**Code Block Features:**
- ✅ Preserves whitespace and line breaks
- ✅ Displays in monospace font with gray background
- ✅ Maintains YAML/code indentation
- ✅ Exports back to `<codeblock>` in DITA XML
- ❌ Syntax highlighting not yet supported

**Note:**
- Empty paragraphs are filtered out during import
- Unsupported elements (tables, images, etc.) are skipped
- When saved, task structure is converted to generic topic format with codeblocks preserved

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo last change |
| `Ctrl+Y` / `Cmd+Y` | Redo last undone change |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo (alternative) |
| `Ctrl+L` / `Cmd+L` | Convert paragraph to list |
| `Ctrl+P` / `Cmd+P` | Convert list item to paragraph |
| `Enter` | Create new paragraph |

## Project Structure

```
dita-wysiwyg/
├── src/
│   ├── models/                  # DITA data models
│   │   ├── DitaElements.ts      # Paragraph, List, ListItem types
│   │   ├── Topic.ts             # Topic entity and metadata
│   │   └── Map.ts               # DITAMAP entity (for future use)
│   ├── stores/                  # State management
│   │   ├── topicStore.ts        # Topic editing state (Zustand + Immer)
│   │   └── mapStore.ts          # Map editing state (for future use)
│   ├── editor/
│   │   ├── schemas/             # ProseMirror schemas
│   │   │   ├── topicSchema.ts   # Topic content schema
│   │   │   └── mapSchema.ts     # Map schema (for future use)
│   │   ├── serializers/         # XML generation
│   │   │   ├── topicSerializer.ts
│   │   │   └── mapSerializer.ts
│   │   └── plugins/             # Editor plugins
│   │       ├── commands.ts      # Editing commands
│   │       └── keymap.ts        # Keyboard shortcuts
│   ├── components/
│   │   ├── common/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   └── Tooltip.tsx
│   │   └── TopicEditor/         # Topic editing interface
│   │       ├── TopicEditor.tsx  # Main editor component
│   │       ├── Toolbar.tsx      # Command toolbar
│   │       └── EditorView.tsx   # ProseMirror wrapper
│   ├── utils/
│   │   ├── fileSystem.ts        # File save/load operations
│   │   └── ditaValidator.ts    # DITA structure validation
│   ├── test/
│   │   └── setup.ts             # Vitest configuration
│   ├── main.tsx                 # Application entry point
│   └── App.tsx                  # Main application component
├── public/
│   └── styles/
│       └── editor.css           # Application styling
├── tests/                       # Test files (to be implemented)
├── specs/                       # Feature specifications
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
└── README.md                    # This file
```

## Technology Stack

- **React 18.2.0** - UI framework
- **TypeScript 5.x** - Type-safe development
- **ProseMirror** - WYSIWYG editor foundation
  - prosemirror-model - Document model
  - prosemirror-state - Editor state management
  - prosemirror-view - View layer
  - prosemirror-history - Undo/redo
  - prosemirror-commands - Editing commands
  - prosemirror-keymap - Keyboard shortcuts
  - prosemirror-schema-list - List support
- **Zustand 4.5.0** - Lightweight state management
- **Immer 10.0.0** - Immutable state updates
- **Vite 5.x** - Build tool and dev server
- **Vitest** - Testing framework (tests to be implemented)

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests (to be implemented)
npm run test
```

### Code Quality Standards

This project follows strict constitutional principles:

- **CQ1 - Immutability**: All state mutations use Zustand + Immer
- **CQ2 - Strong Typing**: TypeScript strict mode, no `any` types
- **CQ3 - Separation of Concerns**: Clear separation of models, stores, and views
- **CQ4 - Separate Models**: Topic and Map stores are completely decoupled

### Project Constitution

Full project principles are documented in `.specify/memory/constitution.md`.

## Architecture

### Data Flow

1. **User Input** → ProseMirror Editor
2. **Editor Changes** → ProseMirror Transactions
3. **Transactions** → Zustand Store Actions
4. **Store Updates** → Immutable State (via Immer)
5. **State Changes** → React Re-render
6. **New State** → ProseMirror Editor Update

### State Management

- **topicStore**: Manages current topic, editing state, and dirty tracking
- **mapStore**: Manages DITAMAP hierarchy (for future implementation)

All state mutations are immutable thanks to Immer middleware, ensuring predictable state updates and enabling features like undo/redo.

### ProseMirror Integration

The editor uses ProseMirror's schema-based approach:
- **Schema**: Defines valid DITA structures (paragraph, bullet_list, list_item)
- **Commands**: Transform document structure (convert to list, etc.)
- **Plugins**: Add functionality (keyboard shortcuts, history)

## Supported DITA Elements

### Currently Supported

- `<topic>` - Topic root element
- `<title>` - Topic title
- `<body>` - Topic body container
- `<p>` - Paragraph
- `<ul>` - Unordered list
- `<li>` - List item

### Planned for Future Releases

- `<ol>` - Ordered lists
- `<note>` - Notes and admonitions
- `<fig>` - Figures
- `<image>` - Images
- `<table>` - Tables
- `<codeblock>` - Code blocks
- `<xref>` - Cross-references
- DITAMAP editing with tree interface

## Browser Compatibility

### Recommended Browsers

- Chrome 86+ (full File System Access API support)
- Edge 86+ (full File System Access API support)

### Supported with Fallback

- Firefox (uses download/upload fallback for file operations)
- Safari (uses download/upload fallback for file operations)

### File System Access API

The application uses the modern File System Access API when available, providing a native save dialog experience. In browsers without support, it falls back to traditional download/upload methods.

## Roadmap

### Completed (MVP Minimum)

- ✅ Basic topic editing
- ✅ Paragraph and list support
- ✅ DITA 1.3 XML generation
- ✅ File save operations
- ✅ File open/import with XML parsing
- ✅ Undo/redo
- ✅ Keyboard shortcuts

### Planned Features

#### User Story 2 - Real-Time Validation
- Prevent invalid DITA structures
- Real-time command state updates
- Enhanced tooltip feedback
- Disabled button explanations

#### User Story 3 - DITAMAP Management
- Tree-based map editor
- Drag-and-drop hierarchy management
- Add child/sibling topicref operations
- Circular reference prevention
- DITAMAP XML generation

#### Future Enhancements
- Additional DITA elements (tables, images, notes, ordered lists)
- Search and replace
- Auto-save functionality
- Export to PDF/HTML
- Multi-topic workspace
- Collaborative editing

## Testing

### Running Tests

```bash
npm run test
```

**Note:** Test suites are planned but not yet implemented in the MVP minimum. The testing framework (Vitest + React Testing Library) is configured and ready for test development.

### Planned Test Coverage

- Unit tests for stores (immutability verification)
- Unit tests for ProseMirror schemas
- Unit tests for serializers (XML roundtrip)
- Integration tests for topic editing workflows
- Integration tests for validation
- Performance tests for typing latency and rendering

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### TypeScript Errors

The project uses TypeScript strict mode. All code must:
- Have explicit types (no `any`)
- Handle nullable values
- Avoid unused variables

### File Save Issues

If the File System Access API is not working:
- Ensure you're using a supported browser (Chrome/Edge 86+)
- The fallback download method should work in all browsers
- Check browser console for permission errors

## Contributing

This project follows constitutional development principles. Before contributing:

1. Review `.specify/memory/constitution.md` for project principles
2. Review `specs/001-mvp-dita-editor/` for specifications and tasks
3. Ensure all code follows CQ1-CQ4 standards
4. Write tests before implementation (TDD approach)
5. Maintain TypeScript strict mode compliance

## License

[Specify your license here]

## Acknowledgments

- Built with [ProseMirror](https://prosemirror.net/) - Collaborative editing framework
- DITA 1.3 specification by [OASIS](https://www.oasis-open.org/)
- React and the React team
- Zustand and Immer maintainers

## Support

For issues, questions, or contributions, please refer to the project specifications in `specs/001-mvp-dita-editor/` or check the implementation plan in `specs/001-mvp-dita-editor/plan.md`.

---

**Version**: 0.1.0 (MVP Minimum)
**Last Updated**: October 2025
**Status**: Active Development
