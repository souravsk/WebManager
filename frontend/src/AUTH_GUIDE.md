# Authentication Guide

## Overview

The DevOps Dashboard now requires authentication before accessing the application. This ensures secure access to your GitHub tokens and application configurations.

## Demo Credentials

For demonstration purposes, the following mock users are available:

- **Username:** `admin` / **Password:** `admin123`
- **Username:** `devops` / **Password:** `devops123`

## How Authentication Works

### 1. Login Flow

1. Open the DevOps Dashboard
2. Enter your username and password
3. Click "Sign In"
4. On successful authentication, you'll see the main dashboard

### 2. Session Management

- Your session is stored in browser localStorage
- The session includes a mock JWT token that "expires" after 24 hours
- You can logout at any time using the "Logout" button in the header

### 3. Protected Features

After logging in, you can:

- Configure GitHub repository settings (owner, repo, and token)
- Add/edit/delete applications
- Start/stop applications via GitHub Actions webhooks
- View real-time status updates

## Security Notes

### For Demo/Development

This implementation uses **mock authentication** with hardcoded credentials stored in the frontend. This is suitable for:

- Local development
- Proof of concept
- Testing GitHub Actions integration

**⚠️ DO NOT use this in production!**

### For Production

To use this dashboard in production, you need to:

1. **Replace Mock Auth with Real Backend**
   - Implement a backend API (Node.js, Python, Go, etc.)
   - Store user credentials securely (hashed passwords)
   - Use proper JWT token generation and validation
   - Implement token refresh mechanisms

2. **Example Production Flow**
   ```
   Frontend                    Backend                     Database
   --------                    -------                     --------
   Login request    →     Validate credentials     →     Query users
                     ←     Generate JWT token       ←     Return user
   Store JWT
   
   API request      →     Verify JWT token
   (with token)     →     Process request
                    ←     Return data
   ```

3. **Backend Endpoints Needed**
   - `POST /auth/login` - Authenticate user, return JWT
   - `POST /auth/logout` - Invalidate token (optional)
   - `GET /auth/me` - Verify token, return user info
   - `GET /apps` - Get user's apps
   - `POST /apps` - Create new app
   - `PUT /apps/:id` - Update app
   - `DELETE /apps/:id` - Delete app
   - `GET /settings` - Get user settings
   - `PUT /settings` - Update settings

4. **Environment Variables**
   Instead of storing GitHub tokens in localStorage, store them securely in your backend:
   ```env
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   GITHUB_TOKEN=ghp_... # Encrypted in DB per user
   ```

## Current Mock Implementation

### Files

- `/hooks/useAuth.ts` - Authentication hook with mock login
- `/components/LoginPage.tsx` - Login UI component
- `/types/app.ts` - AuthUser and LoginCredentials types

### How to Change Mock Users

Edit `/hooks/useAuth.ts`:

```typescript
const MOCK_USERS = [
  { username: 'admin', password: 'admin123' },
  { username: 'devops', password: 'devops123' },
  // Add more users here
];
```

### How Mock JWT Works

The current implementation generates a fake JWT token:

```typescript
function generateMockJWT(username: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    username, 
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    iat: Date.now() 
  }));
  const signature = btoa(`mock-signature-${username}-${Date.now()}`);
  return `${header}.${payload}.${signature}`;
}
```

**Note:** This token is not cryptographically signed and should not be used in production!

## Session Storage

Currently, all data is stored in localStorage:

```javascript
{
  "devops-dashboard-auth": {
    "username": "admin",
    "token": "eyJ..."
  },
  "devops-dashboard-settings": {
    "githubToken": "ghp_...",
    "githubOwner": "Nexgensis",
    "githubRepo": "github-actions"
  },
  "devops-dashboard-apps": [
    // App configurations
  ]
}
```

## Migrating to Production Backend

### Step 1: Set up Backend API

Choose your stack (examples):

- **Node.js + Express + PostgreSQL**
- **Python + FastAPI + PostgreSQL**
- **Go + Gin + PostgreSQL**

### Step 2: Replace useAuth Hook

```typescript
// Production version
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (credentials: LoginCredentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    setUser({ username: data.username, token: data.token });
    return true;
  };
  
  // ... rest of implementation
}
```

### Step 3: Update API Calls

All GitHub Actions webhook calls should include the JWT token:

```typescript
const response = await fetch('/api/apps/trigger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`,
  },
  body: JSON.stringify({ appId, action: 'up' }),
});
```

Your backend then:
1. Validates the JWT token
2. Retrieves the user's GitHub token from the database
3. Makes the webhook call to GitHub Actions
4. Returns the result

### Step 4: Secure GitHub Tokens

Never store GitHub tokens in plain text:

```sql
-- Example schema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  github_token_encrypted TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Use encryption libraries like:
- Node.js: `crypto` module
- Python: `cryptography` library
- Go: `crypto/aes` package

## Troubleshooting

### "Invalid username or password"

Check that you're using the correct demo credentials:
- `admin` / `admin123`
- `devops` / `devops123`

### Session Expired

- Mock sessions "expire" after 24 hours
- Clear localStorage and login again
- Or just refresh the page and login

### Can't Access Dashboard

- Make sure you're logged in
- Check browser console for errors
- Clear localStorage and try again

## Next Steps

1. ✅ Login works with mock authentication
2. ✅ Settings configured with GitHub repository
3. ✅ Apps can be created with just compose path and timeout
4. 🔄 Set up production backend (your responsibility)
5. 🔄 Replace mock auth with real auth (your responsibility)
6. 🔄 Secure GitHub token storage (your responsibility)
