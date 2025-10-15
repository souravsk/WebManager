# Changelog

## Recent Updates

### Authentication System (Latest)

#### Added
- **Login System**: Users must authenticate before accessing the dashboard
  - Mock authentication with demo credentials (admin/admin123, devops/devops123)
  - JWT-style token generation and session management
  - Session persistence in localStorage
  - Logout functionality

- **User Context**: Display logged-in username in settings dialog

- **Protected Routes**: Dashboard is only accessible after successful login

#### Modified
- **Settings Dialog**: Now includes:
  - GitHub repository owner configuration
  - GitHub repository name configuration
  - Auto-generated webhook URL preview
  - Current user display

- **App Management**: Simplified app creation
  - Only requires: App Name, Compose Path, and Auto-Stop Timeout
  - Webhook URL is now auto-generated from repository settings
  - Removed per-app webhook URL field

- **Dashboard Header**: Added logout button and current token indicator

#### Fixed
- **React Hooks Order**: Fixed "Rules of Hooks" violation by ensuring all hooks are called unconditionally at the top of components before any early returns

#### Documentation
- Added `AUTH_GUIDE.md` with detailed authentication documentation
- Updated `QUICK_START.md` with login instructions
- Added migration notes for production backends

### Previous Features

#### Centralized GitHub Token
- Single GitHub Personal Access Token used for all webhook calls
- Token configuration in settings (no per-app token entry)

#### Customizable Auto-Stop Timers
- Per-app timeout configuration
- Editable while apps are running
- Default 60-minute timeout
- Live countdown display

#### Real-time Status
- 15-second polling interval
- Status badges (running/stopped)
- Workflow run tracking

#### App Management
- Start/Stop buttons with loading states
- Confirmation dialogs for deletions
- Toast notifications for all actions

## Migration Notes

### From Previous Version

If you're upgrading from a previous version:

1. **Authentication Required**: You'll now need to login with demo credentials
2. **Repository Settings**: Configure owner and repo in Settings (one time)
3. **Existing Apps**: Will continue to work, webhook URLs auto-generated from settings

### For Production Use

⚠️ **Important**: Current authentication is mock-only. For production:

1. Implement a real backend API
2. Use proper JWT validation
3. Secure GitHub token storage (encrypted in database)
4. Never store sensitive data in localStorage

See `AUTH_GUIDE.md` for detailed production migration steps.

## Technical Changes

### New Files
- `/hooks/useAuth.ts` - Authentication hook
- `/components/LoginPage.tsx` - Login UI
- `/lib/webhook.ts` - Webhook URL generation utilities
- `/AUTH_GUIDE.md` - Authentication documentation

### Updated Files
- `/App.tsx` - Added auth gates and fixed hooks order
- `/types/app.ts` - Added AuthUser and LoginCredentials types
- `/hooks/useSettings.ts` - Added githubOwner and githubRepo fields
- `/components/SettingsDialog.tsx` - Added repository configuration
- `/components/AppManagementDialog.tsx` - Removed webhookUrl field
- `/components/AppCard.tsx` - Now receives webhookUrl as prop

### Breaking Changes
- Apps created in previous versions won't have a webhook URL field (this is correct - it's auto-generated now)
- Settings must include githubOwner and githubRepo to function

## Next Steps

Suggested improvements for future versions:

1. **Backend Integration**
   - Real authentication API
   - Secure token storage
   - User management

2. **Enhanced Status Tracking**
   - Store workflow run IDs
   - More granular status states
   - Error state handling

3. **Multi-Repository Support**
   - Multiple GitHub repositories
   - Per-app repository selection
   - Repository grouping

4. **Advanced Features**
   - Deployment history
   - Logs viewer
   - Container health checks
   - Resource usage metrics
