'use client';

import React from 'react';

interface FieldErrorProps {
  error?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error }) => {
  if (!error) return null;

  return <p className="mt-1 text-sm text-red-500">{error}</p>;
};

interface FormErrorProps {
  error?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-4 rounded-md bg-red-50 p-4">
      <p className="text-sm font-medium text-red-800">{error}</p>
    </div>
  );
};
