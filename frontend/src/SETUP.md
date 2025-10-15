# DevOps Dashboard - GitHub Actions Integration

## Overview

This DevOps Dashboard integrates with GitHub Actions to remotely manage Docker Compose applications. It sends webhook triggers to your GitHub repository, which then executes docker-compose up/down commands on your server.

## Prerequisites

1. **GitHub Personal Access Token (Centralized)**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate a new token with `repo` and `workflow` scopes
   - Save this token securely - you'll configure it once in the dashboard settings
   - All apps will use this single token for authentication

2. **GitHub Actions Workflow**
   - Create a workflow file in your repository: `.github/workflows/docker-compose.yml`
   - See example workflow below

## GitHub Actions Workflow Example

Create this file in your repository at `.github/workflows/docker-compose.yml`:

```yaml
name: Docker Compose Management

on:
  repository_dispatch:
    types: [docker_compose_trigger]

jobs:
  manage-compose:
    runs-on: ubuntu-latest
    steps:
      - name: Execute Docker Compose Command
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ${{ github.event.client_payload.cd_path }}
            docker-compose ${{ github.event.client_payload.action }}
```

## Required GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `SERVER_HOST`: Your server's IP address or hostname
- `SERVER_USERNAME`: SSH username for your server
- `SERVER_SSH_KEY`: SSH private key for authentication

## Initial Setup

### 1. Configure GitHub Token (One-Time Setup)

1. Click the "Settings" button in the top right corner
2. Enter your GitHub Personal Access Token
3. Click "Save Settings"

This token will be used for all webhook calls across all apps.

### 2. Adding an App to the Dashboard

1. Click "Add App" button
2. Fill in the required fields:
   - **Name**: Friendly name for your application (e.g., "Production API")
   - **GitHub Actions Webhook URL**:
     - Format: `https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches`
     - Example: `https://api.github.com/repos/Nexgensis/github-actions/dispatches`
   - **Docker Compose Path**: Absolute path to your docker-compose.yml directory on the server
     - Example: `/home/user/my-app`
   - **Auto-Stop Timeout**: Duration in minutes before the app automatically stops
     - Example: `60` (1 hour), `30` (30 minutes), `120` (2 hours)
     - You can update this value anytime, even while the app is running

3. Click "Add App" to save

## How It Works

### Starting an App

1. Click the "Start" button on an app card
2. The dashboard sends a POST request to GitHub Actions:
   ```json
   {
     "event_type": "docker_compose_trigger",
     "client_payload": {
       "cd_path": "/home/user/my-app",
       "action": "up"
     }
   }
   ```
3. GitHub Actions receives the webhook and executes `docker-compose up` on your server
4. The app status changes to "running" with a 1-hour countdown timer

### Stopping an App

1. Click the "Stop" button (or wait for the 1-hour auto-stop timer)
2. The dashboard sends:
   ```json
   {
     "event_type": "docker_compose_trigger",
     "client_payload": {
       "cd_path": "/home/user/my-app",
       "action": "down"
     }
   }
   ```
3. GitHub Actions executes `docker-compose down` on your server
4. The app status changes to "stopped"

## Auto-Stop Timer

- Each app has a customizable auto-stop timeout (configured per app)
- When you start an app, the countdown timer begins based on the configured timeout
- The timer is displayed on the app card in real-time
- You can edit the timeout value directly from the app card by clicking the edit icon
- Updating the timeout while an app is running will adjust the countdown dynamically
- When the timer reaches 0, the stop webhook is automatically triggered
- This prevents apps from running indefinitely and wasting resources

## Status Polling

- The dashboard polls the GitHub Actions API every 15 seconds
- It checks for the latest workflow runs to update app status
- Status updates happen automatically without manual refresh

## Security Notes

- **Never commit your GitHub token to version control**
- The centralized token is stored in browser localStorage (not secure for production)
- For production use, consider:
  - Using a backend service to store credentials securely
  - Implementing proper authentication
  - Using environment variables or a secrets manager
  - Rotating your GitHub token regularly
- This dashboard is meant for development/internal use, not for handling PII or sensitive data
- All apps share the same GitHub token - ensure your token has appropriate repository access

## Troubleshooting

### Webhook not triggering

- Verify your GitHub token has `repo` and `workflow` scopes
- Check the webhook URL format is correct
- Ensure the repository name matches exactly (case-sensitive)
- Check browser console for error messages

### Status not updating

- Verify the GitHub Actions workflow is properly configured
- Check that workflow runs are appearing in the Actions tab
- Ensure your token is valid and has proper permissions

### Docker commands not executing

- Verify GitHub secrets (SERVER_HOST, SERVER_USERNAME, SERVER_SSH_KEY) are set correctly
- Check that the cd_path is correct and accessible on your server
- Review GitHub Actions workflow run logs for errors
- Ensure docker and docker-compose are installed on your server

## Example cURL for Testing

Test your webhook manually:

```bash
curl -X POST https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -d '{
    "event_type": "docker_compose_trigger",
    "client_payload": {
      "cd_path": "/home/user/my-app",
      "action": "up"
    }
  }'
```

## Features

✅ **Centralized GitHub Token** - Configure once, use for all apps
✅ **Start/Stop Control** - Remotely manage Docker Compose apps via GitHub Actions
✅ **Real-time Status Polling** - Automatically check workflow status every 15 seconds
✅ **Customizable Auto-Stop Timer** - Set per-app timeout in minutes (editable anytime)
✅ **Dynamic Timer Updates** - Adjust timeout while app is running
✅ **Live Countdown Display** - See exact time remaining before auto-stop
✅ **Full App Management** - Add, edit, and delete apps with CRUD operations
✅ **Persistent Storage** - All settings and apps saved in localStorage
✅ **Toast Notifications** - Success/failure feedback for all actions
✅ **Confirmation Dialogs** - Safety checks before destructive actions
✅ **Responsive Layout** - Grid adapts from 1-3 columns based on screen size
✅ **Smooth Animations** - Pulse effect on running badges, hover effects, transitions
✅ **Comprehensive Error Handling** - Detailed error messages with HTTP status codes