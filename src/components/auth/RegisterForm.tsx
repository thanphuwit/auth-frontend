'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { FormError, FieldError } from './FormError';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const [formError, setFormError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  } as const);

  const onSubmit = (data: RegisterInput) => {
    setFormError(undefined);
    clearError();

    registerUser(data)
      .then(() => {
        router.push('/dashboard');
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed';
        setFormError(errorMessage);
      });
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Create account</h1>
      <p className="mb-6 text-gray-600">Join us today and get started</p>

      <FormError error={formError || error || undefined} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            {...register('firstName')}
            id="firstName"
            type="text"
            placeholder="John"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <FieldError error={errors.firstName?.message} />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            {...register('lastName')}
            id="lastName"
            type="text"
            placeholder="Doe"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <FieldError error={errors.lastName?.message} />
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            {...register('username')}
            id="username"
            type="text"
            placeholder="johndoe"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <FieldError error={errors.username?.message} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <FieldError error={errors.email?.message} />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <FieldError error={errors.password?.message} />
          <p className="mt-2 text-xs text-gray-500">
            Must be at least 8 characters with uppercase, lowercase, number, and special character
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <FieldError error={errors.confirmPassword?.message} />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {/* Links */}
      <div className="mt-6 border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </div>
    </div>
  );
};
