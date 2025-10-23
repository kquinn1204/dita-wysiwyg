import { Command } from 'prosemirror-state';
import { wrapInList, liftListItem } from 'prosemirror-schema-list';
import { topicSchema } from '../schemas/topicSchema';
import { undo, redo } from 'prosemirror-history';

// Convert paragraph to list
export const convertToList: Command = (state, dispatch) => {
  const { $from } = state.selection;
  const node = $from.parent;

  if (node.type.name !== 'paragraph') {
    return false;
  }

  // Use ProseMirror's wrapInList helper
  return wrapInList(topicSchema.nodes['bullet_list']!)(state, dispatch);
};

// Convert list item to paragraph
export const convertToParagraph: Command = (state, dispatch) => {
  const { $from } = state.selection;

  // Check if we're in a list item
  if ($from.parent.type.name !== 'list_item') {
    return false;
  }

  // Use liftListItem to convert list item to paragraph
  return liftListItem(topicSchema.nodes['list_item']!)(state, dispatch);
};

// Export undo/redo
export { undo, redo };

// Check if command can execute (for toolbar state)
export function canExecuteCommand(command: Command, state: any): boolean {
  return command(state, undefined);
}
