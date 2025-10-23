import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'icon';
  tooltip?: string;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'secondary',
  tooltip,
  className = '',
}) => {
  return (
    <div className="tooltip">
      <button
        className={`toolbar-button ${variant} ${className}`}
        onClick={onClick}
        disabled={disabled}
        type="button"
      >
        {children}
      </button>
      {tooltip && disabled && (
        <span className="tooltip-content">{tooltip}</span>
      )}
    </div>
  );
};
