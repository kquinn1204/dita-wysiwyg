import React, { useEffect, useRef } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView as PMEditorView } from 'prosemirror-view';

interface EditorViewProps {
  state: EditorState;
  onStateChange: (newState: EditorState) => void;
  readonly?: boolean;
  className?: string;
}

export const EditorView: React.FC<EditorViewProps> = ({
  state,
  onStateChange,
  readonly = false,
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<PMEditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create ProseMirror view
    viewRef.current = new PMEditorView(editorRef.current, {
      state,
      dispatchTransaction(transaction) {
        const newState = viewRef.current!.state.apply(transaction);
        viewRef.current!.updateState(newState);
        onStateChange(newState);
      },
      editable: () => !readonly,
    });

    return () => {
      viewRef.current?.destroy();
    };
  }, []);

  // Update state when prop changes
  useEffect(() => {
    if (viewRef.current && viewRef.current.state !== state) {
      viewRef.current.updateState(state);
    }
  }, [state]);

  return <div ref={editorRef} className={`editor-view ${className}`} />;
};
