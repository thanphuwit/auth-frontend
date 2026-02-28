# Authentication System Architecture

## Overview

This document explains the production-ready authentication system architecture, with special focus on the token refresh mechanism.

## System Components

### 1. Auth Context (`src/context/AuthContext.tsx`)

The central state management for authentication.

**Responsibilities:**
- Store user state globally
- Manage authentication loading state
- Handle login/register/logout operations
- Provide error management
- Initialize auth on app startup

**State Variables:**
```typescript
- user: User | null         // Current authenticated user
- isLoading: boolean        // Loading state for async operations
- error: string | null      // Error message from auth operations
```

**Key Methods:**
```typescript
- login(email, password, rememberMe?)      // Login user
- register(data: RegisterData)             // Create new account
- logout()                                 // Logout user
- refreshUser()                            // Fetch fresh user data
- clearError()                             // Clear error message
```

### 2. Axios Client (`src/lib/axios.ts`)

Handles all HTTP requests with automatic token refresh.

**Key Features:**
- Response interceptor for token refresh
- Request queuing during token refresh
- Rate limiting with exponential backoff
- Automatic retry on 429 responses

### 3. Auth Service (`src/lib/authService.ts`)

API integration layer for all auth endpoints.

**Methods:**
```typescript
- register(data)            // POST /auth/register
- login(credentials)        // POST /auth/login
- getCurrentUser()          // GET /auth/me
- refreshToken()            // POST /auth/refresh
- verifyEmail(token)        // POST /auth/verify-email
- forgotPassword(email)     // POST /auth/forgot-password
- resetPassword(...)        // POST /auth/reset-password
- logout()                  // POST /auth/logout
```

### 4. Custom Hook (`src/hooks/useAuth.ts`)

Convenient access to auth context with error handling.

```typescript
const { user, isLoading, isAuthenticated, error, login, logout } = useAuth();
```

## Token Refresh Mechanism

### How It Works

The token refresh system is implemented through Axios response interceptors. Here's the detailed flow:

#### Phase 1: Request Execution

```
Client Request
    ↓
Axios Request Interceptor (none for auth)
    ↓
API Server
    ↓
Response/Error Handling
```

#### Phase 2: Response Handling

**Case A: Successful Response (200-299)**
```
Response 200 OK
    ↓
Return Response ✓
```

**Case B: Token Expired (401)**
```
Response 401 Unauthorized
    ↓
Is already refreshing?
    ├─ YES → Queue request in failedQueue
    │         ↓
    │         Wait for refresh completion
    │         ↓
    │         Execute with new token ✓
    │
    └─ NO  → Mark isRefreshing = true
             ↓
             POST /auth/refresh
             ↓
             Success?
             ├─ YES → Get new accessToken
             │        ↓
             │        Process failed queue
             │        ↓
             │        Retry original request ✓
             │
             └─ NO  → Clear auth state
                      ↓
                      Redirect to /login
                      ↓
                      Return error
```

**Case C: Rate Limit (429)**
```
Response 429 Too Many Requests
    ↓
Retry count < 3?
    ├─ YES → retryCount++
    │        ↓
    │        Wait: 2^retryCount * 1000ms
    │        ↓
    │        Retry request ✓
    │
    └─ NO  → Return error
```

#### Phase 3: Queue Management

During token refresh, multiple requests might fail with 401. The system queues them:

```typescript
failedQueue = [
  { onSuccess, onFailed },  // Request 1
  { onSuccess, onFailed },  // Request 2
  { onSuccess, onFailed }   // Request 3
]

// After token refresh
processQueue(null, newToken)

// Each queued request:
// 1. Adds token to headers
// 2. Retries original request
// 3. Either succeeds or fails
```

### Code Implementation

**Interceptor Setup:**

```typescript
apiClient.interceptors.response.use(
  (response) => {
    // Success path
    retryCount = 0;
    return response;
  },
  async (error) => {
    // Error handling
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Token expired - refresh
      if (isRefreshing) {
        // Queue the request
        return new Promise((onSuccess, onFailed) => {
          failedQueue.push({
            onSuccess: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              onSuccess(apiClient(originalRequest));
            },
            onFailed: (err) => onFailed(err)
          });
        });
      }

      // First request failing - start refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`);
        const { accessToken } = response.data;
        
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Redirect to login
      }
    }

    return Promise.reject(error);
  }
);
```

## Protected Routes

### Route Protection

Protected routes are wrapped in `(protected)` route group with middleware:

```typescript
// src/app/(protected)/layout.tsx

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');  // Redirect if not authenticated
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
```

### Route Structure

```
Public Routes:
  / (home)
  /login
  /register
  /forgot-password
  /reset-password

Protected Routes:
  /(protected)/dashboard
  /(protected)/profile
  /(protected)/settings
```

## Security Considerations

### 1. HttpOnly Cookies

- Access token stored in HttpOnly cookie
- Cannot be accessed by JavaScript
- Automatically sent with `credentials: 'include'`
- Protected from XSS attacks

### 2. Token Refresh Strategy

- Refresh token held in memory (short-lived)
- Access token short-lived (15 minutes)
- Refresh happens seamlessly in background
- No user interaction required

### 3. CSRF Protection

- Cookies sent only on same-origin requests
- Ready for CSRF token header implementation
- Secure cookie flag enabled

### 4. Rate Limiting

- Exponential backoff prevents abuse
- Max 3 retries per request
- Progressive delay: 2s → 4s → 8s

## Error Handling

### Error Types

**Form Validation Errors:**
```typescript
// Displayed per-field
{
  "email": ["Invalid email address"],
  "password": ["Must be at least 8 characters"]
}
```

**API Errors:**
```typescript
// Generic error response
{
  "error": "Invalid email or password"
}
```

**Rate Limit:**
```typescript
// Automatically retried with backoff
// User sees: "Please try again later"
```

**Session Expired:**
```typescript
// Automatically refreshes token
// If refresh fails → redirect to login
```

## Data Flow Examples

### Login Flow

```
User fills form
    ↓
Submit → LoginForm.onSubmit()
    ↓
Call auth.login(email, password)
    ↓
authService.login()
    ↓
POST /api/auth/login
    ↓
Success:
  ├─ Set user state
  ├─ Store tokens in cookies
  └─ Redirect to /dashboard
    
Failure:
  ├─ Display error
  └─ Show error message
```

### Protected Route Access

```
Navigate to /dashboard
    ↓
Check useAuth() hook
    ↓
isAuthenticated?
    ├─ YES & loaded → Render dashboard
    ├─ NO  → Redirect to /login
    └─ Loading → Show spinner
```

### API Request with Token Refresh

```
User loads dashboard
    ↓
Component calls: apiClient.get('/auth/me')
    ↓
Request with Authorization header
    ↓
Response 401 (token expired)
    ↓
Interceptor: POST /auth/refresh
    ↓
Success → Get new token
    ↓
Retry GET /auth/me with new token
    ↓
Response 200 → Dashboard renders
```

## Performance Considerations

### Optimization Strategies

1. **Token Refresh Queuing**
   - Prevents multiple refresh calls
   - Queues requests during refresh
   - Single refresh for multiple failures

2. **Lazy Loading**
   - Auth state loaded on app start
   - Protected routes lazy loaded
   - Code splitting per route

3. **Memoization**
   - Context value memoized with useCallback
   - Prevents unnecessary re-renders

4. **Error Recovery**
   - Rate limiting respects server limits
   - Exponential backoff prevents hammering
   - Graceful degradation on failures

## Testing Strategy

### Unit Tests

```typescript
// Test token refresh
- Mock axios
- Simulate 401 response
- Verify refresh call
- Verify retry

// Test error handling
- Mock failure responses
- Verify error state
- Verify user feedback

// Test validation
- Test schema validation
- Test field errors
```

### Integration Tests

```typescript
// Test full auth flow
- Register → Login → Dashboard → Logout

// Test token refresh
- Login → Wait → Make request → Auto-refresh

// Test protected routes
- Access without auth → Redirect
- Access with auth → Render
```

### Manual Tests

```typescript
// Browser dev tools
- Monitor Network tab
- Watch cookie changes
- Observe token refresh timing
```

## Deployment Considerations

### Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourserver.com/api
```

### Production Checklist

- [ ] API base URL configured
- [ ] Cookies secure flag enabled
- [ ] HTTPS enforced
- [ ] Rate limiting configured
- [ ] Error logging setup
- [ ] Session timeout configured
- [ ] CSRF tokens enabled
- [ ] Monitoring in place

## Future Enhancements

1. **Multi-tab Session Management**
   - Sync auth state across tabs
   - Single sign-out across browser

2. **Social Authentication**
   - OAuth 2.0 integration
   - Third-party provider support

3. **Biometric Authentication**
   - Fingerprint/Face ID support
   - Device-based auth

4. **Advanced Error Recovery**
   - Automatic retry with backoff
   - Circuit breaker pattern

5. **Offline Support**
   - Service worker caching
   - Offline token validation

## References

- [HTTP Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- [Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication-and-authorization)
