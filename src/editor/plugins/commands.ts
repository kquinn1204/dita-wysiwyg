import { Command } from 'prosemirror-state';
import { wrapInList, liftListItem } from 'prosemirror-schema-list';
import { topicSchema } from '../schemas/topicSchema';
import { undo, redo } from 'prosemirror-history';
import { generateId } from '../../models/DitaElements';

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

// Insert code block
export const insertCodeBlock: Command = (state, dispatch) => {
  const { $from } = state.selection;
  const codeBlock = topicSchema.nodes['code_block']!.create(
    { id: generateId() },
    topicSchema.text('')
  );

  if (dispatch) {
    const tr = state.tr.replaceSelectionWith(codeBlock);
    dispatch(tr);
  }
  return true;
};

// Insert context
export const insertContext: Command = (state, dispatch) => {
  const { $from } = state.selection;
  const paragraph = topicSchema.nodes['paragraph']!.create(
    { id: generateId() },
    topicSchema.text('Enter context...')
  );
  const context = topicSchema.nodes['context']!.create(
    { id: generateId() },
    [paragraph]
  );

  if (dispatch) {
    const tr = state.tr.replaceSelectionWith(context);
    dispatch(tr);
  }
  return true;
};

// Insert steps
export const insertSteps: Command = (state, dispatch) => {
  const { $from } = state.selection;

  // Create a step with cmd
  const stepCmd = topicSchema.nodes['step_cmd']!.create(
    { id: generateId() },
    topicSchema.text('Enter step command...')
  );
  const step = topicSchema.nodes['step']!.create(
    { id: generateId() },
    [stepCmd]
  );
  const steps = topicSchema.nodes['steps']!.create(
    { id: generateId() },
    [step]
  );

  if (dispatch) {
    const tr = state.tr.replaceSelectionWith(steps);
    dispatch(tr);
  }
  return true;
};

// Insert step info
export const insertStepInfo: Command = (state, dispatch) => {
  const { $from } = state.selection;

  // Check if we're inside a step
  let depth = $from.depth;
  let stepDepth = -1;
  while (depth > 0) {
    if ($from.node(depth).type.name === 'step') {
      stepDepth = depth;
      break;
    }
    depth--;
  }

  if (stepDepth === -1) {
    return false;
  }

  const stepInfo = topicSchema.nodes['step_info']!.create(
    { id: generateId() },
    topicSchema.text('Enter additional info...')
  );

  if (dispatch) {
    const pos = $from.after(stepDepth);
    const tr = state.tr.insert(pos, stepInfo);
    dispatch(tr);
  }
  return true;
};

// Insert step example
export const insertStepExample: Command = (state, dispatch) => {
  const { $from } = state.selection;

  // Check if we're inside a step
  let depth = $from.depth;
  let stepDepth = -1;
  while (depth > 0) {
    if ($from.node(depth).type.name === 'step') {
      stepDepth = depth;
      break;
    }
    depth--;
  }

  if (stepDepth === -1) {
    return false;
  }

  const codeBlock = topicSchema.nodes['code_block']!.create(
    { id: generateId() },
    topicSchema.text('Example code...')
  );
  const stepExample = topicSchema.nodes['step_example']!.create(
    { id: generateId() },
    [codeBlock]
  );

  if (dispatch) {
    const pos = $from.after(stepDepth);
    const tr = state.tr.insert(pos, stepExample);
    dispatch(tr);
  }
  return true;
};

// Insert substeps
export const insertSubsteps: Command = (state, dispatch) => {
  const { $from } = state.selection;

  // Check if we're inside a step
  let depth = $from.depth;
  let stepDepth = -1;
  while (depth > 0) {
    if ($from.node(depth).type.name === 'step') {
      stepDepth = depth;
      break;
    }
    depth--;
  }

  if (stepDepth === -1) {
    return false;
  }

  const substepCmd = topicSchema.nodes['substep_cmd']!.create(
    { id: generateId() },
    topicSchema.text('Enter substep command...')
  );
  const substep = topicSchema.nodes['substep']!.create(
    { id: generateId() },
    [substepCmd]
  );
  const substeps = topicSchema.nodes['substeps']!.create(
    { id: generateId() },
    [substep]
  );

  if (dispatch) {
    const pos = $from.after(stepDepth);
    const tr = state.tr.insert(pos, substeps);
    dispatch(tr);
  }
  return true;
};

// Insert step result
export const insertStepResult: Command = (state, dispatch) => {
  const { $from } = state.selection;

  // Check if we're inside a step
  let depth = $from.depth;
  let stepDepth = -1;
  while (depth > 0) {
    if ($from.node(depth).type.name === 'step') {
      stepDepth = depth;
      break;
    }
    depth--;
  }

  if (stepDepth === -1) {
    return false;
  }

  const stepResult = topicSchema.nodes['step_result']!.create(
    { id: generateId() },
    topicSchema.text('Enter step result...')
  );

  if (dispatch) {
    const pos = $from.after(stepDepth);
    const tr = state.tr.insert(pos, stepResult);
    dispatch(tr);
  }
  return true;
};

// Add new step
export const addStep: Command = (state, dispatch) => {
  const { $from } = state.selection;

  // Check if we're inside a steps block
  let depth = $from.depth;
  let stepsDepth = -1;
  while (depth > 0) {
    if ($from.node(depth).type.name === 'steps') {
      stepsDepth = depth;
      break;
    }
    depth--;
  }

  if (stepsDepth === -1) {
    return false;
  }

  const stepCmd = topicSchema.nodes['step_cmd']!.create(
    { id: generateId() },
    topicSchema.text('Enter step command...')
  );
  const step = topicSchema.nodes['step']!.create(
    { id: generateId() },
    [stepCmd]
  );

  if (dispatch) {
    const pos = $from.after(stepsDepth);
    const tr = state.tr.insert(pos, step);
    dispatch(tr);
  }
  return true;
};

// Export undo/redo
export { undo, redo };

// Check if command can execute (for toolbar state)
export function canExecuteCommand(command: Command, state: any): boolean {
  return command(state, undefined);
}
