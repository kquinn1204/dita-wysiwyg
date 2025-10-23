import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';
import { convertToList, convertToParagraph } from './commands';

export const ditaKeymap = keymap({
  ...baseKeymap,
  'Mod-z': undo,
  'Mod-y': redo,
  'Mod-Shift-z': redo,
  'Mod-l': convertToList,
  'Mod-p': convertToParagraph,
});
