# Token Refresh Flow Diagrams

## 1. Standard Request Flow (Happy Path)

```
┌─────────────────────────────────────────────────────────────┐
│ User Makes API Request                                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Axios Interceptor - Response Handler                        │
│                                                              │
│ Check: Is response 200-299 (Success)?                       │
│  ├─ YES: Return response to component                       │
│  └─ Continue...                                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ ✓ SUCCESS - Component receives data                         │
│                                                              │
│ Example: GET /api/auth/me                                   │
│ Response: { user: {...} }                                   │
└─────────────────────────────────────────────────────────────┘
```

## 2. Token Expired Flow (401 Response)

```
┌─────────────────────────────────────────────────────────────┐
│ API Request Returns 401 Unauthorized                        │
│ (Access token expired)                                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Axios Response Interceptor Detects 401                      │
│                                                              │
│ Check: Is already refreshing token?                         │
│  ├─ YES: Queue this request (see flow 3)                    │
│  └─ NO: Continue below                                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ First Request Failing - Start Token Refresh                 │
│                                                              │
│ Set isRefreshing = true                                     │
│ Set originalRequest._retry = true                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Call POST /auth/refresh                                     │
│ (Using axios instance without interceptors)                │
│                                                              │
│ Request payload: {}                                         │
│ Cookies sent: refreshToken (HttpOnly)                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼ HTTPS to Backend
┌─────────────────────────────────────────────────────────────┐
│ Backend Validates Refresh Token                             │
│                                                              │
│ Check: Is refresh token valid?                              │
│  ├─ YES: Generate new accessToken → Continue               │
│  └─ NO: Return 401 → Go to Error Branch                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend Response Success                                    │
│                                                              │
│ {                                                           │
│   "success": true,                                          │
│   "accessToken": "eyJhbGc..."                              │
│ }                                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend Receives New Token                                 │
│                                                              │
│ Extract: accessToken = response.data.accessToken            │
│ Reset: retryCount = 0                                       │
│ Reset: isRefreshing = false                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Process Failed Queue                                        │
│                                                              │
│ For each queued request:                                    │
│  ├─ Add new token to Authorization header                  │
│  ├─ Retry the original request                             │
│  └─ Return response to component                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Retry Original Request                                      │
│                                                              │
│ GET /api/auth/me                                            │
│ Headers: {                                                  │
│   Authorization: "Bearer eyJhbGc..."  (NEW)                │
│ }                                                           │
│ Cookies: accessToken=... (HttpOnly)                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ ✓ SUCCESS - Original Request Succeeds                       │
│                                                              │
│ Response 200 OK with user data                              │
│ Component renders with fresh data                           │
└─────────────────────────────────────────────────────────────┘
```

## 3. Multiple Requests During Token Refresh

```
┌─────────────────────────────────────────────────────────────┐
│ Timeline: Concurrent API Calls During Token Expiry          │
└─────────────────────────────────────────────────────────────┘

Time T0:
┌──────────┐    ┌──────────┐    ┌──────────┐
│Request 1 │    │Request 2 │    │Request 3 │
│GET /user │    │POST/save │    │GET/lists │
└────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
                     ▼
         All return 401 (expired token)

Time T1:
┌──────────────────────────────────────────────┐
│ Interceptor: Queue Management                │
│                                              │
│ failedQueue = [                              │
│   { request: GET /user, ... },               │
│   { request: POST /save, ... },              │
│   { request: GET /lists, ... }               │
│ ]                                            │
│                                              │
│ isRefreshing = true                          │
│ POST /auth/refresh starts...                 │
└──────────────────────────────────────────────┘

Time T2 (Refresh endpoint running):
┌──────────────────────────────────────────────┐
│ ⏳ Waiting for new token...                   │
│                                              │
│ All 3 requests queued and waiting            │
│ No requests re-tried yet                     │
└──────────────────────────────────────────────┘

Time T3:
┌──────────────────────────────────────────────┐
│ ✓ New token received!                        │
│                                              │
│ accessToken = "eyJhbGc..."                   │
│ isRefreshing = false                         │
└──────────────────────────────────────────────┘

Time T4 (Queued requests retry):
┌──────────────────────────────────────────────┐
│ Process Failed Queue                         │
│                                              │
│ Request 1: GET /user         → 200 OK ✓      │
│ Request 2: POST /save        → 200 OK ✓      │
│ Request 3: GET /lists        → 200 OK ✓      │
│                                              │
│ failedQueue = [] (cleared)                   │
└──────────────────────────────────────────────┘

Time T5:
┌──────────────────────────────────────────────┐
│ All requests complete successfully           │
│ User doesn't notice token refresh            │
│ Seamless experience ✓                        │
└──────────────────────────────────────────────┘
```

## 4. Rate Limiting (429) with Exponential Backoff

```
┌─────────────────────────────────────────────────────────────┐
│ API Request Returns 429 Too Many Requests                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Interceptor Detects 429                                     │
│                                                              │
│ Check: retryCount < 3?                                      │
│  ├─ YES: Retry with backoff                                │
│  └─ NO: Return error to component                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
         Attempt 1 (retryCount=0)
┌─────────────────────────────────────────────────────────────┐
│ Calculate delay: 2^0 * 1000 = 1000ms (1 second)            │
│                                                              │
│ ⏳ Wait 1 second...                                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Retry Request (retryCount=1)                                │
│                                                              │
│ Still returns 429...                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
         Attempt 2 (retryCount=1)
┌─────────────────────────────────────────────────────────────┐
│ Calculate delay: 2^1 * 1000 = 2000ms (2 seconds)           │
│                                                              │
│ ⏳ Wait 2 seconds...                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Retry Request (retryCount=2)                                │
│                                                              │
│ Still returns 429...                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
         Attempt 3 (retryCount=2)
┌─────────────────────────────────────────────────────────────┐
│ Calculate delay: 2^2 * 1000 = 4000ms (4 seconds)           │
│                                                              │
│ ⏳ Wait 4 seconds...                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Retry Request (retryCount=3)                                │
│                                                              │
│ Success? (200 OK)                                           │
│  ├─ YES: ✓ Return response                                  │
│  └─ NO: Continue...                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Max Retries Exceeded                                        │
│                                                              │
│ retryCount = 3 (MAX_RETRIES reached)                        │
│ Return error to component                                   │
│                                                              │
│ Show user: "Please try again later"                         │
└─────────────────────────────────────────────────────────────┘

Timeline:
─────────────────────────────────────────────────
Time  Event
─────────────────────────────────────────────────
0ms   Request fails with 429
1000ms   Retry 1 (failed again)
3000ms   Retry 2 (failed again)
7000ms   Retry 3 (success or give up)
─────────────────────────────────────────────────

Total wait time: 1 + 2 + 4 = 7 seconds
Protects server from request flooding ✓
```

## 5. Session Expiry & Refresh Failure

```
┌─────────────────────────────────────────────────────────────┐
│ Request Returns 401 (Token Expired)                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Start Token Refresh Process                                 │
│                                                              │
│ POST /auth/refresh                                          │
│ Cookies: refreshToken=...                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼ HTTPS Request
┌─────────────────────────────────────────────────────────────┐
│ Backend Validation                                          │
│                                                              │
│ Check: Is refresh token valid?                              │
│                                                              │
│ NO - Refresh token expired or invalid                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend Returns 401                                         │
│                                                              │
│ {                                                           │
│   "success": false,                                         │
│   "error": "Invalid refresh token"                          │
│ }                                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend Error Handler                                      │
│                                                              │
│ Refresh failed → User session completely expired           │
│                                                              │
│ Actions:                                                    │
│  ├─ Clear user state                                       │
│  ├─ Clear localStorage                                     │
│  ├─ Process failed queue with error                        │
│  └─ Redirect to /login                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ User Experience                                             │
│                                                              │
│ window.location.href = '/login'                             │
│                                                              │
│ User redirected to login page                               │
│ Message: "Your session has expired. Please log in again."   │
└─────────────────────────────────────────────────────────────┘
```

## 6. Protected Route Access Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User Navigates to Protected Route: /dashboard               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ ProtectedLayout Middleware                                  │
│                                                              │
│ Check: isLoading?                                           │
│  ├─ YES: Show loading spinner                              │
│  └─ Continue...                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Check: isAuthenticated?                                     │
│                                                              │
│  ├─ YES: Render page content                               │
│  │        (User sees dashboard)                             │
│  │        Route: /dashboard (shown)                         │
│  │                                                          │
│  └─ NO: Redirect to /login                                 │
│         (User sees login page)                              │
│         Route: /dashboard → /login (redirected)             │
└─────────────────────────────────────────────────────────────┘

Example Scenarios:

Scenario 1: User Logged In
┌──────────────────────┐
│ Click /dashboard     │
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│ isAuthenticated=true │
└──────┬───────────────┘
       ▼
┌──────────────────────────────────────┐
│ ✓ Dashboard Rendered                 │
│   User profile info displayed        │
│   Can logout                         │
└──────────────────────────────────────┘

Scenario 2: User Not Logged In
┌──────────────────────┐
│ Click /dashboard     │
└──────┬───────────────┘
       ▼
┌──────────────────────────┐
│ isAuthenticated=false    │
└──────┬───────────────────┘
       ▼
┌────────────────────────────────────────┐
│ Redirected to /login                   │
│ Login page shown                       │
│ Can enter credentials to access        │
└────────────────────────────────────────┘

Scenario 3: Auth Check In Progress
┌──────────────────────┐
│ Click /dashboard     │
└──────┬───────────────┘
       ▼
┌──────────────────────────┐
│ isLoading=true           │
└──────┬───────────────────┘
       ▼
┌────────────────────────────────────────┐
│ ⏳ Loading Spinner Shown                │
│ "Loading..."                            │
│                                         │
│ AuthContext initializing...             │
│ GET /auth/me endpoint running...       │
└────────────────────────────────────────┘
       │ (after response)
       ▼
     (Then either scenario 1 or 2)
```

---

## Summary of Flows

| Flow | Trigger | Outcome |
|------|---------|---------|
| **Happy Path** | Request succeeds | 200 OK → Data returned |
| **Token Expired** | Request returns 401 | Auto-refresh → Retry → Success |
| **Multiple Requests** | 3+ requests get 401 | Queue → Refresh once → Retry all |
| **Rate Limit** | Request returns 429 | Backoff 1s → 2s → 4s → Success/Error |
| **Session Expired** | Refresh fails | Clear state → Redirect to login |
| **Protected Route** | Unauthenticated access | Check auth → Redirect to login |

---

## Key Principles

✅ **Seamless Experience**: User doesn't see token refresh  
✅ **Single Refresh**: Only one refresh happens, prevents flooding  
✅ **Request Queuing**: Concurrent requests handled elegantly  
✅ **Graceful Degradation**: Fails safely with redirect  
✅ **Automatic Retry**: Rate limits handled transparently  
✅ **Security**: All tokens in HttpOnly cookies  

These diagrams show exactly how the token refresh mechanism works in your authentication system! 🎯
