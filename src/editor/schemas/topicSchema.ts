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
    // Task-specific nodes
    context: {
      content: 'paragraph+',
      group: 'block',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['div', { class: 'dita-context', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'div.dita-context',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        }
      ],
    },
    steps: {
      content: 'step+',
      group: 'block',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['div', { class: 'dita-steps', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'div.dita-steps',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        }
      ],
    },
    step: {
      content: 'step_cmd step_info* step_example* substeps? step_result?',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['div', { class: 'dita-step', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'div.dita-step',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        }
      ],
    },
    step_cmd: {
      content: 'text*',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['div', { class: 'dita-cmd', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'div.dita-cmd',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        }
      ],
    },
    step_info: {
      content: 'text*',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['div', { class: 'dita-info', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'div.dita-info',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        }
      ],
    },
    step_example: {
      content: 'code_block',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['div', { class: 'dita-stepxmp', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'div.dita-stepxmp',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        }
      ],
    },
    substeps: {
      content: 'substep+',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['div', { class: 'dita-substeps', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'div.dita-substeps',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        }
      ],
    },
    substep: {
      content: 'substep_cmd substep_info* substep_example*',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['div', { class: 'dita-substep', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'div.dita-substep',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        }
      ],
    },
    substep_cmd: {
      content: 'text*',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['div', { class: 'dita-substep-cmd', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'div.dita-substep-cmd',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        }
      ],
    },
    substep_info: {
      content: 'text*',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['div', { class: 'dita-substep-info', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'div.dita-substep-info',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        }
      ],
    },
    substep_example: {
      content: 'code_block',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['div', { class: 'dita-substep-stepxmp', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'div.dita-substep-stepxmp',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
          })
        }
      ],
    },
    step_result: {
      content: 'text*',
      attrs: { id: { default: generateId() } },
      toDOM: (node) => ['div', { class: 'dita-stepresult', 'data-id': node.attrs['id'] }, 0],
      parseDOM: [
        {
          tag: 'div.dita-stepresult',
          getAttrs: (dom) => ({
            id: (dom as HTMLElement).getAttribute('data-id') || generateId()
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
