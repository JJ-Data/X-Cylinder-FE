# Authentication Testing Guide

## Prerequisites

1. Make sure the API is running:
```bash
cd /Users/bringforthjoy/Dev/CylinderX/api
pnpm run dev
```

2. Ensure database is set up with seeds:
```bash
cd /Users/bringforthjoy/Dev/CylinderX/api
pnpm run db:create
pnpm run db:migrate
pnpm run db:seed
```

3. Start the client:
```bash
cd /Users/bringforthjoy/Dev/CylinderX/client
npm run dev
```

## Test Credentials

### Admin User
- Email: admin@cylinderx.com
- Password: Test@123

### Staff User
- Email: staff@cylinderx.com
- Password: Test@123

### Operator User
- Email: operator@cylinderx.com
- Password: Test@123

### Customer User
- Email: customer@cylinderx.com
- Password: Test@123

## Testing Sign-In

1. Navigate to http://localhost:3001/sign-in
2. The admin credentials are pre-filled
3. Click "Sign In"
4. You should be redirected to the appropriate dashboard based on role
5. Check browser DevTools > Application > Cookies - you should see HTTP-only cookies set

## Testing Sign-Up

1. Navigate to http://localhost:3001/sign-up
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Password: Test@123 (must include uppercase, lowercase, number, and special character)
   - Confirm Password: Test@123
3. Click "Sign Up"
4. You should see a success message about email verification
5. You'll be redirected to the sign-in page

## Security Features Implemented

✅ **HTTP-Only Cookies**: Tokens stored in secure HTTP-only cookies (not accessible via JavaScript)
✅ **CORS with Credentials**: Properly configured for cross-origin requests
✅ **Server-Side Validation**: All authentication decisions made on server
✅ **No Client-Side JWT Decoding**: User info fetched from secure `/auth/me` endpoint
✅ **Automatic Token Refresh**: Handled via cookies on server
✅ **withCredentials**: All API requests include credentials automatically

## API Changes

### Backend
- Added cookie-parser middleware
- Login/register endpoints now set HTTP-only cookies
- Added GET `/auth/me` endpoint for current user info
- Tokens validated from cookies or Authorization header
- Refresh token restricted to specific path

### Client
- Removed localStorage token storage
- Removed client-side JWT decoding
- Added `useCurrentUser` hook for user info
- All API requests use `withCredentials: true`
- Simplified authentication flow

## Testing Authentication State

```typescript
// Use in any component
import { useCurrentUser } from '@/hooks/useCurrentUser'

function MyComponent() {
  const { user, isLoading, isError } = useCurrentUser()
  
  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Not authenticated</div>
  
  return <div>Welcome {user.firstName}!</div>
}
```

## What's Pending

- Email verification flow (backend sends email, but client needs verification page)
- Password reset flow
- Remember me functionality
- Social login (Google, GitHub)
- CSRF protection implementation