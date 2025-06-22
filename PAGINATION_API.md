# User Activity Pagination API

## Available Endpoints

### 1. **User-Specific Activities** (Recommended for regular users)
**Endpoint**: `GET /user-activity/user/:userId`

**Description**: Get paginated user activities for a specific user. Returns 5 items per page by default.

**Authentication**: Requires valid JWT token. Users can only view their own activities (unless admin).

**URL Parameters**:
- `userId` (required): The UUID of the user whose activities to retrieve

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 5, max: 100)
- `startDate` (optional): Filter activities from this date
- `endDate` (optional): Filter activities until this date
- `type` (optional): Filter by activity type

**Example**:
```bash
GET /user-activity/user/be3dd5b5-295c-4e5d-bffd-bc6963cef773?page=1&limit=5
```

### 2. **All Activities** (Admin only)
**Endpoint**: `GET /user-activity`

**Description**: Get all user activities with pagination. Admin only access.

**Authentication**: Requires admin role.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 5, max: 100)
- `startDate` (optional): Filter activities from this date
- `endDate` (optional): Filter activities until this date
- `type` (optional): Filter by activity type
- `userId` (optional): Filter by specific user ID

**Example**:
```bash
GET /user-activity?page=1&limit=5&userId=be3dd5b5-295c-4e5d-bffd-bc6963cef773
```

## Response Format (Both Endpoints)

```json
{
  "activities": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "SYSTEM_ACCESS",
      "description": "User accessed dashboard",
      "metadata": {},
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Frontend Implementation

### For Regular Users (User-Specific Activities)
```javascript
const fetchUserActivities = async (userId, page = 1, limit = 5) => {
  const response = await fetch(
    `/user-activity/user/${userId}?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    }
  );
  
  const data = await response.json();
  return {
    activities: data.activities,
    pagination: data.pagination
  };
};
```

### For Admins (All Activities)
```javascript
const fetchAllActivities = async (page = 1, limit = 5, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  });
  
  const response = await fetch(
    `/user-activity?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    }
  );
  
  const data = await response.json();
  return {
    activities: data.activities,
    pagination: data.pagination
  };
};
```

## Pagination Information
- **Default page size**: 5 items
- **Maximum page size**: 100 items
- **Page numbering**: Starts from 1
- **Ordering**: Activities are ordered by timestamp (newest first)

## Error Responses
- `400 Bad Request`: Invalid parameters or unauthorized access
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient permissions (admin required for all activities)

## Which Endpoint to Use?

- **Regular users**: Use `/user-activity/user/:userId` to view their own activities
- **Admins**: Use `/user-activity` to view all activities, or `/user-activity/user/:userId` for specific users
- **Frontend**: Make sure you're calling the correct endpoint based on user role and requirements 