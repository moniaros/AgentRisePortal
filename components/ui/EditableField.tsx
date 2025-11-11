
import React, { useState, KeyboardEvent } from 'react';

interface EditableFieldProps {
  initialValue: string;
  onSave: (newValue: string) => void;
  label?: string;
  className?: string;
  inputClassName?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  initialValue,
  onSave,
  label,
  className = 'text-sm',
  inputClassName = 'p-1 border rounded w-full'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const handleSave = () => {
    if (value.trim() !== initialValue.trim()) {
      onSave(value.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        aria-label={label || 'Editable field'}
        className={`${inputClassName} dark:bg-gray-700 dark:border-gray-600`}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`${className} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded`}
      aria-label={`Click to edit ${label || 'field'}`}
    >
      {value || '...'}
    </span>
  );
};

export default EditableField;
