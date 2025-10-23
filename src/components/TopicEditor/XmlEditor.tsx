import React, { useEffect, useRef } from 'react';

interface XmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const XmlEditor: React.FC<XmlEditorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== value) {
      // Preserve cursor position when updating from external changes
      const cursorPos = textareaRef.current.selectionStart;
      textareaRef.current.value = value;
      textareaRef.current.setSelectionRange(cursorPos, cursorPos);
    }
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <textarea
      ref={textareaRef}
      className={`xml-editor ${className}`}
      defaultValue={value}
      onChange={handleChange}
      spellCheck={false}
    />
  );
};
