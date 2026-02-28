'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">Auth App</h1>
            <div className="flex gap-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Production-Ready Authentication
          </h2>
          <p className="mt-6 text-xl text-gray-600">
            A secure, scalable authentication system built with Next.js, TypeScript, and modern best practices.
          </p>

          {!isAuthenticated && (
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white hover:bg-blue-700"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="rounded-lg border-2 border-blue-600 px-8 py-3 text-lg font-medium text-blue-600 hover:bg-blue-50"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-8 shadow">
            <div className="text-3xl">🔐</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Secure Authentication</h3>
            <p className="mt-2 text-gray-600">
              HttpOnly cookies with automatic token refresh and CSRF protection.
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow">
            <div className="text-3xl">⚡</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Smart Token Refresh</h3>
            <p className="mt-2 text-gray-600">
              Automatic token refresh with request queuing during refresh.
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow">
            <div className="text-3xl">🛡️</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Rate Limiting</h3>
            <p className="mt-2 text-gray-600">
              Built-in rate limiting with exponential backoff retry strategy.
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow">
            <div className="text-3xl">🎯</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Type-Safe Forms</h3>
            <p className="mt-2 text-gray-600">
              React Hook Form with Zod validation for type-safe form handling.
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow">
            <div className="text-3xl">🔄</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Protected Routes</h3>
            <p className="mt-2 text-gray-600">
              Role-based access control with automatic redirects.
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow">
            <div className="text-3xl">📱</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Responsive Design</h3>
            <p className="mt-2 text-gray-600">
              Mobile-first design with Tailwind CSS styling.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-20 rounded-lg bg-white p-8 shadow">
          <h3 className="text-2xl font-bold text-gray-900">Technology Stack</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="font-semibold text-gray-900">Frontend</p>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Next.js 14 (App Router)</li>
                <li>• React 19</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Forms & Validation</p>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• React Hook Form</li>
                <li>• Zod</li>
                <li>• Form validation</li>
                <li>• Error handling</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900">API & State</p>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Axios</li>
                <li>• Context API</li>
                <li>• Token refresh</li>
                <li>• Request interceptors</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
