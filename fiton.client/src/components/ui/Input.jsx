import React from 'react';

export const Input = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <input
        className={`form-input ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
};