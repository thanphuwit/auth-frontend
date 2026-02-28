# Auth App - Frontend

A production-ready authentication system built with Next.js 14, TypeScript, React Hook Form, Zod, and Axios.

## 🚀 Features

- **Secure Authentication**: HttpOnly cookies with automatic token refresh
- **Smart Token Refresh**: Automatic token refresh with request queuing during refresh
- **Rate Limiting**: Exponential backoff retry strategy for rate-limited requests
- **Type-Safe Forms**: React Hook Form with Zod validation
- **Protected Routes**: Role-based access control with automatic redirects
- **Responsive Design**: Mobile-first Tailwind CSS styling
- **Error Handling**: Comprehensive error handling and user feedback
- **Cookie-Based Auth**: Tokens stored in HttpOnly cookies for security

## 📋 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **API Client**: Axios with interceptors
- **State Management**: Context API

## 🛠️ Installation & Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## 🔐 Token Refresh Logic

The system automatically:
1. Detects when access token expires (401 response)
2. Calls refresh endpoint to get new token
3. Queues failed requests during refresh
4. Retries all queued requests with new token
5. Handles network errors with exponential backoff

## 🚀 Quick Start

1. **Register**: Navigate to `/register` and create account
2. **Login**: Go to `/login` with credentials
3. **Dashboard**: Access protected `/dashboard` route
4. **Logout**: Click sign out button

## 📝 API Endpoints

- `POST /auth/register` - Create account
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `POST /auth/verify-email` - Verify email
- `POST /auth/forgot-password` - Reset password request
- `POST /auth/reset-password` - Reset password

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev)
- [Axios](https://axios-http.com/)
