'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout()
      .then(() => {
        router.push('/login');
      })
      .catch((err) => {
        console.error('Logout error:', err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        {user && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome, {user.firstName || user.username}!
              </h2>
              <p className="mt-2 text-gray-600">You have successfully logged in.</p>
            </div>

            {/* User Information */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile Card */}
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Username</dt>
                    <dd className="mt-1 text-gray-900">{user.username}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">User ID</dt>
                    <dd className="mt-1 break-all font-mono text-sm text-gray-600">{user.id}</dd>
                  </div>
                </dl>
              </div>

              {/* Account Status Card */}
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1">
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                        {user.role}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
                    <dd className="mt-1">
                      {user.isEmailVerified ? (
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                          Pending
                        </span>
                      )}
                    </dd>
                  </div>
                  {user.lastLoginAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                      <dd className="mt-1 text-gray-900">
                        {new Date(user.lastLoginAt).toLocaleString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Features */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900">Available Features</h3>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-gray-700">
                  <span className="mr-3 text-blue-600">✓</span>
                  Automatic token refresh on expiration
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="mr-3 text-blue-600">✓</span>
                  Protected routes with role-based access
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="mr-3 text-blue-600">✓</span>
                  Secure cookie-based authentication
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="mr-3 text-blue-600">✓</span>
                  Automatic API request queuing during token refresh
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="mr-3 text-blue-600">✓</span>
                  Rate limiting with exponential backoff
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
