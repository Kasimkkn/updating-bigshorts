import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type = 'text', id, label, name, placeholder, onChange, className, value, min, max, step, autoComplete, maxLength, ...props }, ref) => {
    return (
      <>
        {label && (
          <label htmlFor={id} className='block mb-2 text-sm font-medium text-text-color'>
            {label}
          </label>
        )}
        <input
          {...props}
          ref={ref}
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          className={`rounded-sm linearInput w-full border px-2 py-3 text-text-color border-border-color bg-transparent text-sm focus:outline-none ${className}`}
          value={value}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
        />
      </>
    );
  }
);

Input.displayName = 'Input';

export default Input;
