import React, { useRef, useEffect } from 'react';

interface CustomInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onKeyDown'> {
  onEnterPress?: () => void;
  focusCounter: number;
}

const CustomInput: React.FC<CustomInputProps> = ({ 
  className, 
  onEnterPress, 
  focusCounter,
  ...restProps 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [focusCounter]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onEnterPress) {
      onEnterPress();
    }
  };

  return (
    <input
      ref={inputRef}
      className={className || ''}
      onKeyDown={handleKeyDown}
      {...restProps}
    />
  );
};

export default CustomInput;
