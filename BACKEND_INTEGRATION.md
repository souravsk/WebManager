# Backend Integration Guide

This document explains how the frontend has been integrated with your Go backend API.

## Changes Made

### 1. API Integration (`frontend/src/lib/api.ts`)
- Created a new API service that communicates with your Go backend
- Handles authentication headers automatically
- Provides methods for all CRUD operations on servers, projects, and apps
- Includes proper error handling and response parsing

### 2. Updated Hooks
All hooks now use the backend API instead of localStorage:

- **`useAuth.ts`**: Real authentication with JWT tokens
- **`useServers.ts`**: Server management via API
- **`useProjects.ts`**: Project management via API  
- **`useApps.ts`**: App management and start/stop operations via API

### 3. Updated Components
- **`AppCard.tsx`**: Now uses backend API for start/stop operations
- **`AdminPanel.tsx`**: Updated for async operations
- **`AppManagementDialog.tsx`**: Updated for async operations

### 4. Proxy Configuration
- **`vite.config.ts`**: Added proxy to forward `/api` calls to `http://localhost:8080`

## Setup Instructions

### 1. Backend Setup
Make sure your Go backend is running on port 8080 with the following endpoints:

```
POST /api/auth/login
GET  /api/auth/verify
POST /api/auth/logout

GET    /api/servers
POST   /api/servers
PUT    /api/servers/:id
DELETE /api/servers/:id

GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id

GET    /api/apps
POST   /api/apps
PUT    /api/apps/:id
DELETE /api/apps/:id
POST   /api/apps/:id/start
POST   /api/apps/:id/stop
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on port 3000 and proxy API calls to your backend on port 8080.

### 3. Environment Variables (Optional)
For production deployment, create a `.env` file:

```bash
# Frontend .env
VITE_API_URL=https://your-backend-domain.com
```

## API Response Mapping

### Backend Model vs Frontend Type Mapping

Your backend models need to match the frontend types. Here are the key mappings:

#### Server
```go
// Backend (Go)
type Server struct {
    ID               string `json:"id"`
    Name             string `json:"name"`
    Address          string `json:"address"`
    SSHUser          string `json:"sshUser"`
    SSHPort          int    `json:"sshPort"`
    SSHPrivateKey    string `json:"sshPrivateKey"`
    Status           string `json:"status"`
    RunningAppsCount int    `json:"runningAppsCount"`
    LastChecked      int64  `json:"lastChecked"`
}
```

#### Project
```go
// Backend (Go)
type Project struct {
    ID          string `json:"id"`
    Name        string `json:"name"`
    Description string `json:"description"`
    CreatedAt   int64  `json:"createdAt"`
}
```

#### Application
```go
// Backend (Go)
type Application struct {
    ID              string `json:"id"`
    Name            string `json:"name"`
    ProjectID       string `json:"projectId"`
    ServerID        string `json:"serverId"`
    Domain          string `json:"domain"`
    ComposePath     string `json:"cdPath"`      // Maps to cdPath in frontend
    AutoStopTimeout int    `json:"autoStopTimeout"`
    Status          string `json:"status"`
    StartedAt       int64  `json:"startedAt"`
    AppURL          string `json:"appUrl"`      // Optional, for start response
}
```

## Testing the Integration

### 1. Authentication
- Try logging in with your backend user credentials
- Check that JWT tokens are stored and used for API calls

### 2. CRUD Operations
- Create, edit, and delete servers (admin only)
- Create, edit, and delete projects (admin only)
- Create, edit, and delete apps (admin only)

### 3. App Operations
- Start and stop apps
- Verify that the backend executes docker-compose commands
- Check that app status updates correctly

## Error Handling

The frontend now displays proper error messages from your backend:
- Authentication errors
- Validation errors
- Server connection errors
- Docker compose execution errors

## Next Steps

1. **Test the integration** with your backend
2. **Update backend models** if needed to match frontend expectations
3. **Add CORS configuration** to your Go backend if needed
4. **Deploy both frontend and backend** to production

## Troubleshooting

### Common Issues

1. **CORS Errors**: Add CORS middleware to your Go backend
2. **Authentication Issues**: Ensure JWT tokens are properly generated and validated
3. **API Endpoint Mismatches**: Verify all endpoints match the expected routes
4. **Data Type Mismatches**: Ensure backend JSON responses match frontend TypeScript types

### Debug Tips

1. Check browser Network tab for API calls
2. Verify backend logs for incoming requests
3. Test API endpoints directly with curl or Postman
4. Check console for JavaScript errors