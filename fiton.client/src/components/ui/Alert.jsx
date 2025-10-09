import React from 'react';

export const Alert = ({ children, variant = 'info', className = '', ...props }) => {
  const variants = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
  };

  return (
    <div
      className={`alert ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};