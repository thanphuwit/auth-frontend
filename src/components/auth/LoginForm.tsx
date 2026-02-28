'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { FormError, FieldError } from './FormError';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [formError, setFormError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  } as const);

  const onSubmit = (data: LoginInput) => {
    setFormError(undefined);
    clearError();

    login(data.email, data.password, data.rememberMe)
      .then(() => {
        router.push('/dashboard');
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        setFormError(errorMessage);
      });
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome back</h1>
      <p className="mb-6 text-gray-600">Sign in to your account to continue</p>

      <FormError error={formError || error || undefined} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            autoComplete="current-password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <FieldError error={errors.password?.message} />
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            {...register('rememberMe')}
            id="rememberMe"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isLoading}
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Links */}
      <div className="mt-6 space-y-2 border-t border-gray-200 pt-6">
        <div className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Create one
          </Link>
        </div>
        <div className="text-center text-sm text-gray-600">
          <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
};
