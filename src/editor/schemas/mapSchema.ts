import { Schema } from 'prosemirror-model';

// Simplified map schema for MVP
// Maps will primarily be managed via tree component, not ProseMirror
export const mapSchema = new Schema({
  nodes: {
    doc: {
      content: 'topicref*',
    },
    topicref: {
      attrs: {
        id: { default: null },
        navtitle: { default: null },
        href: { default: null },
      },
      toDOM: (node) => [
        'div',
        {
          class: 'dita-topicref',
          'data-id': node.attrs['id'],
          'data-navtitle': node.attrs['navtitle'],
          'data-href': node.attrs['href'],
        },
        0,
      ],
    },
    text: {
      group: 'inline',
    },
  },
  marks: {},
});
