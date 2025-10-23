import React from 'react';
import { EditorState } from 'prosemirror-state';
import { Button } from '../common/Button';
import { convertToList, convertToParagraph, undo, redo, canExecuteCommand } from '../../editor/plugins/commands';

interface ToolbarProps {
  editorState: EditorState;
  onCommand: (command: (state: EditorState, dispatch?: any) => boolean) => void;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  editorState,
  onCommand,
  className = '',
}) => {
  const canConvertToList = canExecuteCommand(convertToList, editorState);
  const canConvertToParagraph = canExecuteCommand(convertToParagraph, editorState);
  const canUndo = canExecuteCommand(undo, editorState);
  const canRedo = canExecuteCommand(redo, editorState);

  return (
    <div className={`toolbar ${className}`}>
      <Button
        onClick={() => onCommand(convertToList)}
        disabled={!canConvertToList}
        tooltip={!canConvertToList ? 'Select a paragraph to convert to list' : undefined}
      >
        Convert to List
      </Button>
      <Button
        onClick={() => onCommand(convertToParagraph)}
        disabled={!canConvertToParagraph}
        tooltip={!canConvertToParagraph ? 'Select a list item to convert to paragraph' : undefined}
      >
        Convert to Paragraph
      </Button>
      <div style={{ flex: 1 }} />
      <Button
        onClick={() => onCommand(undo)}
        disabled={!canUndo}
      >
        Undo
      </Button>
      <Button
        onClick={() => onCommand(redo)}
        disabled={!canRedo}
      >
        Redo
      </Button>
    </div>
  );
};
