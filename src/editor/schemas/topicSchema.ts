import { Schema } from 'prosemirror-model';
import { generateId } from '../../models/DitaElements';

export const topicSchema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
    },
    paragraph: {
      content: 'text*',
      group: 'block',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['p', { class: 'dita-p', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'p.dita-p',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        },
        {
          tag: 'p',
          getAttrs: () => ({
            id: generateId()
          })
        }
      ],
    },
    code_block: {
      content: 'text*',
      group: 'block',
      code: true,
      defining: true,
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['pre', { class: 'dita-codeblock', 'data-id': node.attrs['id'] }, ['code', 0]],
      parseDOM: [
        {
          tag: 'pre.dita-codeblock',
          preserveWhitespace: 'full',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        },
        {
          tag: 'pre',
          preserveWhitespace: 'full',
          getAttrs: () => ({
            id: generateId()
          })
        }
      ],
    },
    bullet_list: {
      content: 'list_item+',
      group: 'block',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['ul', { class: 'dita-ul', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'ul.dita-ul',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        },
        {
          tag: 'ul',
          getAttrs: () => ({
            id: generateId()
          })
        }
      ],
    },
    list_item: {
      content: 'text*',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['li', { class: 'dita-li', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'li.dita-li',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        },
        {
          tag: 'li',
          getAttrs: () => ({
            id: generateId()
          })
        }
      ],
    },
    text: {
      group: 'inline',
    },
  },
  marks: {},
});
