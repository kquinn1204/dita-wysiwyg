import React, { useState } from 'react';
import { EditorState } from 'prosemirror-state';
import { Button } from '../common/Button';
import {
  convertToList,
  convertToParagraph,
  insertCodeBlock,
  insertContext,
  insertSteps,
  insertStepInfo,
  insertStepExample,
  insertSubsteps,
  insertStepResult,
  addStep,
  undo,
  redo,
  canExecuteCommand
} from '../../editor/plugins/commands';

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
  const [showTaskMenu, setShowTaskMenu] = useState(false);

  const canConvertToList = canExecuteCommand(convertToList, editorState);
  const canConvertToParagraph = canExecuteCommand(convertToParagraph, editorState);
  const canInsertStepInfo = canExecuteCommand(insertStepInfo, editorState);
  const canInsertStepExample = canExecuteCommand(insertStepExample, editorState);
  const canInsertSubsteps = canExecuteCommand(insertSubsteps, editorState);
  const canInsertStepResult = canExecuteCommand(insertStepResult, editorState);
  const canAddStep = canExecuteCommand(addStep, editorState);
  const canUndo = canExecuteCommand(undo, editorState);
  const canRedo = canExecuteCommand(redo, editorState);

  return (
    <div className={`toolbar ${className}`}>
      <div className="toolbar-group">
        <Button
          onClick={() => onCommand(convertToList)}
          disabled={!canConvertToList}
          tooltip={!canConvertToList ? 'Select a paragraph to convert to list' : undefined}
        >
          List
        </Button>
        <Button
          onClick={() => onCommand(convertToParagraph)}
          disabled={!canConvertToParagraph}
          tooltip={!canConvertToParagraph ? 'Select a list item to convert to paragraph' : undefined}
        >
          Paragraph
        </Button>
        <Button onClick={() => onCommand(insertCodeBlock)}>
          Code Block
        </Button>
      </div>

      <div className="toolbar-group">
        <Button onClick={() => onCommand(insertContext)}>
          Context
        </Button>
        <Button onClick={() => onCommand(insertSteps)}>
          Steps
        </Button>
        <div className="toolbar-dropdown">
          <Button onClick={() => setShowTaskMenu(!showTaskMenu)}>
            Step Elements ▾
          </Button>
          {showTaskMenu && (
            <div className="dropdown-menu">
              <Button
                onClick={() => { onCommand(addStep); setShowTaskMenu(false); }}
                disabled={!canAddStep}
                tooltip={!canAddStep ? 'Position cursor inside a steps block' : undefined}
              >
                Add Step
              </Button>
              <Button
                onClick={() => { onCommand(insertStepInfo); setShowTaskMenu(false); }}
                disabled={!canInsertStepInfo}
                tooltip={!canInsertStepInfo ? 'Position cursor inside a step' : undefined}
              >
                Add Info
              </Button>
              <Button
                onClick={() => { onCommand(insertStepExample); setShowTaskMenu(false); }}
                disabled={!canInsertStepExample}
                tooltip={!canInsertStepExample ? 'Position cursor inside a step' : undefined}
              >
                Add Example
              </Button>
              <Button
                onClick={() => { onCommand(insertSubsteps); setShowTaskMenu(false); }}
                disabled={!canInsertSubsteps}
                tooltip={!canInsertSubsteps ? 'Position cursor inside a step' : undefined}
              >
                Add Substeps
              </Button>
              <Button
                onClick={() => { onCommand(insertStepResult); setShowTaskMenu(false); }}
                disabled={!canInsertStepResult}
                tooltip={!canInsertStepResult ? 'Position cursor inside a step' : undefined}
              >
                Add Result
              </Button>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div className="toolbar-group">
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
    </div>
  );
};
