# CSRF Token Implementation Guide

## Overview

CSRF (Cross-Site Request Forgery) protection has been implemented using the `csurf` middleware with a double-submit cookie pattern. This guide explains how to use it on the client side.

---

## Server Side (Already Implemented)

### Endpoints Protected by CSRF

All state-changing endpoints (POST, PUT, DELETE) now require CSRF tokens:

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/user/change-password
DELETE /api/user/data
DELETE /api/user/account
POST   /api/collections
PUT    /api/collections/:id
DELETE /api/collections/:id
POST   /api/workspaces/create
PUT    /api/workspaces/:id
DELETE /api/workspaces/:id
POST   /api/workspaces/:id/duplicate
POST   /api/workspaces/:id/sync-canvas
POST   /api/workspaces/:id/duplicate-canvas
```

### Getting a CSRF Token

**Endpoint**: `GET /api/csrf-token`

**Response**:
```json
{
  "csrfToken": "eyJjaXBoZXIiOiJhZXMtMjU2LWdjbSIsInNhbHQiOiI0ZjYzYjNmNSIsImFsaXZlIjp0cnVlLCJhdXRoVGFnIjoiZGI3M2IyOWM4NTQ5NzA5NzJhZGMwZjUwZTU4YzY3ZWYifQ==",
  "message": "CSRF token generated"
}
```

The token is also returned in the `X-CSRF-Token` response header.

---

## Client Side Usage

### Option 1: Using the Provided `secureFetch` Helper

This is the **recommended approach** for ease of use:

```typescript
import { secureFetch, storeCsrfToken } from "@/lib/secure-fetch";
import { useCsrfTokenInitializer } from "@/lib/csrf-init";

// In your main App or layout component:
function App() {
  useCsrfTokenInitializer(); // Fetch & store CSRF token on load
  
  return <YourAppContent />;
}

// In your component or hook:
async function registerUser(email: string, password: string) {
  const response = await secureFetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log("Registration successful:", data);
  } else {
    const error = await response.json();
    console.error("Registration failed:", error);
  }
}
```

### Option 2: Manual CSRF Token Management

If you prefer more control:

```typescript
import { useCsrfToken } from "@/hooks/use-csrf-token";

function MyComponent() {
  const { csrfToken, isLoading } = useCsrfToken();
  
  async function handleSubmit(data: any) {
    if (!csrfToken) {
      console.error("CSRF token not loaded");
      return;
    }
    
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken, // Add CSRF token to header
      },
      body: JSON.stringify(data),
      credentials: "include", // Important: include cookies
    });
    
    // Handle response...
  }
  
  if (isLoading) return <div>Loading...</div>;
  
  return <form onSubmit={() => handleSubmit({})}>...</form>;
}
```

### Option 3: Direct Fetch with Token in Body

For form submissions or special cases:

```typescript
async function updateProfile(userId: string, data: any) {
  const csrfToken = getCsrfTokenSync(); // Get from cache
  
  const response = await fetch(`/api/user/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      _csrf: csrfToken, // Include token in body
    }),
    credentials: "include",
  });
  
  return response.json();
}
```

---

## Integration with Existing Hooks

### Updating useCreateWorkspace Hook

```typescript
// Before
export function useCreateWorkspace() {
  return useMutation({
    mutationFn: async (data: CreateWorkspaceRequest) => {
      const res = await fetch(getApiUrl(api.workspaces.create.path), {
        method: api.workspaces.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      // ...
    },
  });
}

// After (using secureFetch)
import { secureFetch } from "@/lib/secure-fetch";

export function useCreateWorkspace() {
  return useMutation({
    mutationFn: async (data: CreateWorkspaceRequest) => {
      const res = await secureFetch(getApiUrl(api.workspaces.create.path), {
        method: api.workspaces.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      // ...
    },
  });
}
```

Or use the `useCsrfToken` hook and manually add the header:

```typescript
export function useCreateWorkspace() {
  const { csrfToken } = useCsrfToken();
  
  return useMutation({
    mutationFn: async (data: CreateWorkspaceRequest) => {
      const res = await fetch(getApiUrl(api.workspaces.create.path), {
        method: api.workspaces.create.method,
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      // ...
    },
  });
}
```

---

## Error Handling

### CSRF Token Validation Failure

If a CSRF token is invalid or missing, the server returns:

```
HTTP 403 Forbidden
{
  "message": "CSRF validation failed",
  "error": "invalid csrf token"  // Only in development
}
```

### Handling CSRF Errors

```typescript
async function handleApiRequest() {
  try {
    const response = await secureFetch("/api/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    if (response.status === 403) {
      // CSRF token likely expired or invalid
      // Try to refresh token and retry
      const newToken = await refreshCsrfToken();
      // Retry with new token...
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("Request failed:", error);
    // Show user-friendly error message
  }
}
```

---

## Browser DevTools Verification

### Checking CSRF Token Storage

1. Open DevTools → Application tab
2. Check SessionStorage:
   - Key: `csrfToken`
   - Value: Token string

### Checking CSRF Cookie

1. Open DevTools → Application tab
2. Cookies → Your domain
3. Look for cookie starting with `_csrf`
4. Should be:
   - HttpOnly: ✅ Yes
   - Secure: ✅ Yes (in production)
   - SameSite: ✅ Strict

### Verifying CSRF Header

1. Open DevTools → Network tab
2. Make a POST request
3. Check Request Headers:
   - Should include: `X-CSRF-Token: <token>`

---

## Best Practices

### ✅ DO

- ✅ Call `useCsrfTokenInitializer()` once in your app root
- ✅ Use `secureFetch` wrapper for all API calls
- ✅ Include `credentials: "include"` in fetch options
- ✅ Handle 403 errors gracefully
- ✅ Refresh token after logout/login

### ❌ DON'T

- ❌ Don't hardcode CSRF tokens in code
- ❌ Don't store tokens in localStorage (use sessionStorage)
- ❌ Don't send tokens in query parameters
- ❌ Don't disable same-site cookie policy
- ❌ Don't trust CSRF tokens across domains

---

## Troubleshooting

### "CSRF validation failed" Error

**Cause**: Token mismatch or expiration

**Solutions**:
1. Ensure token was fetched before making requests
2. Call `useCsrfTokenInitializer()` in app root
3. Check that `credentials: "include"` is set
4. Try refreshing the page

### CSRF Token Always Missing

**Cause**: `/api/csrf-token` endpoint not called or failed

**Solution**:
```typescript
// Add to App.tsx
import { useCsrfTokenInitializer } from "@/lib/csrf-init";

function App() {
  useCsrfTokenInitializer();
  return <YourApp />;
}
```

### "X-CSRF-Token Header Not Sent"

**Cause**: Using wrong fetch implementation

**Solution**: Use `secureFetch` from `@/lib/secure-fetch`:
```typescript
import { secureFetch } from "@/lib/secure-fetch";

const response = await secureFetch("/api/endpoint", {
  method: "POST",
  body: JSON.stringify(data),
});
```

---

## Security Notes

- CSRF tokens are **request-specific** but tied to session
- Tokens are **HttpOnly** - JavaScript cannot access directly (but middleware can)
- Tokens expire with the session
- CSRF protection is **not needed for GET** requests (they're idempotent)
- Always use **HTTPS in production** (Secure flag on cookies)

---

## Related Reading

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Express CSRF Protection](http://expressjs.com/en/resources/middleware/csurf.html)
- [MDN: Cross-Site Request Forgery (CSRF)](https://developer.mozilla.org/en-US/docs/Glossary/CSRF)

