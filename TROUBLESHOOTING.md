# User Activity Logging Troubleshooting Guide

## Issue: 400 Bad Request - "userId should not be empty,userId must be a UUID"

### Root Cause
The frontend is trying to log user activity but the `userId` field is either empty or not a valid UUID format.

### Backend Fixes Applied

1. **Updated JWT Strategy**: Fixed the JWT strategy to return `id` instead of `sub` to match what controllers expect
2. **Made userId Optional in DTO**: Updated `CreateUserActivityDto` to make `userId` optional since it's set from authenticated user
3. **Enhanced Validation**: Added better validation and error messages in the controller
4. **Added Debug Logging**: Added console logs to help debug authentication issues

### Frontend Fixes Required

#### 1. Ensure Proper Authentication
Make sure your frontend is sending a valid JWT token in the Authorization header:

```javascript
// Example of proper API call
const response = await fetch('http://localhost:7070/user-activity', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}` // Make sure this is a valid token
  },
  body: JSON.stringify({
    type: 'SYSTEM_ACCESS',
    description: 'User accessed dashboard'
    // Don't send userId - it will be set from the JWT token
  })
});
```

#### 2. Check JWT Token Validity
Ensure your JWT token is:
- Not expired
- Contains the correct payload structure
- Is being sent in the correct format

#### 3. Update Frontend Code
If your frontend is currently sending a `userId` in the request body, remove it and let the backend set it from the JWT token:

```javascript
// ❌ Don't do this
const activityData = {
  userId: user.id, // Remove this
  type: 'SYSTEM_ACCESS',
  description: 'User accessed dashboard'
};

// ✅ Do this instead
const activityData = {
  type: 'SYSTEM_ACCESS',
  description: 'User accessed dashboard'
};
```

#### 4. Test Authentication
Use the new test endpoint to verify authentication is working:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:7070/user-activity/test-auth
```

### Debugging Steps

1. **Check JWT Token**: Verify your JWT token is valid and not expired
2. **Test Authentication**: Use the `/user-activity/test-auth` endpoint
3. **Check Network Tab**: Look at the request headers and body in browser dev tools
4. **Check Console Logs**: Look at the backend console logs for detailed error messages

### Common Issues

1. **Missing Authorization Header**: Ensure `Authorization: Bearer <token>` is included
2. **Expired Token**: Check if the JWT token has expired
3. **Invalid Token Format**: Ensure the token is in the correct format
4. **Frontend Sending userId**: Remove userId from request body if present

### Testing the Fix

1. Restart your backend server
2. Ensure you have a valid JWT token
3. Make a request to log user activity without sending `userId` in the body
4. The backend should automatically set the `userId` from the JWT token

### API Endpoints

- `POST /user-activity` - Log user activity (requires authentication)
- `GET /user-activity/test-auth` - Test authentication (requires authentication)
- `GET /user-activity` - Get all activities (admin only)
- `GET /user-activity/user/:userId` - Get user's activities 