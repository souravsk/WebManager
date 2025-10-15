# DevOps Dashboard

A modern, role-based DevOps dashboard for managing Docker Compose applications across multiple servers. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality

- **Server Management**: Configure and monitor multiple application servers with SSH key authentication
- **Project Organization**: Group applications into logical projects (QMS, EBMR, etc.)
- **Domain-Based Apps**: Each app has a domain that opens automatically when started
- **App Control**: Start/stop Docker Compose applications with one click
- **Auto-Stop Timers**: Configurable automatic shutdown after specified duration (Total Run Time)
- **Real-time Monitoring**: 15-second polling for server status and app health
- **Auto-Launch Domains**: Automatically open app domains in new tabs when starting
- **Search & Filter**: Search apps by name, domain, or project

### Security & Access Control

- **Role-Based Access Control (RBAC)**
  - **Admin**: Full access to manage servers, projects, and applications
  - **User**: Can start/stop applications but cannot modify configurations
- **JWT Authentication**: Secure session management
- **Protected Routes**: Admin-only features properly gated

### User Experience

- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode Support**: Beautiful UI in both light and dark themes
- **Real-time Countdowns**: Live timers showing when apps will auto-stop
- **Toast Notifications**: Clear feedback for all actions
- **Server Status Indicators**: Visual indicators for online/offline servers
- **Secure Credential Management**: SSH private keys are encrypted and never displayed after saving

## 🏗️ Architecture

### System Components

1. **Frontend Dashboard** (This Application)
   - React + TypeScript
   - Tailwind CSS + Shadcn UI components
   - Local storage for data persistence (development)
   - Mock API for server interactions

2. **Backend API** (Not Included - Production Requirement)
   - Should provide endpoints for:
     - Server SSH/API connections
     - Docker Compose command execution
     - Server health checks
     - User authentication & authorization

3. **Application Servers**
   - Target servers where apps are deployed
   - Require Docker & Docker Compose installed
   - SSH access or custom API endpoint

### Data Models

```typescript
// Server
{
  id: string;
  name: string;
  address: string; // IP or hostname
  sshUser: string;
  sshPort: number;
  sshPrivateKey: string; // Encrypted, never displayed after saving
  status: 'online' | 'offline' | 'checking';
  runningAppsCount: number;
  lastChecked?: number;
}

// Project
{
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

// App
{
  id: string;
  name: string;
  projectId: string;
  serverId: string;
  domain: string; // e.g., pharma.qms.nexgensis.com
  cdPath: string; // Path to docker-compose.yml directory
  autoStopTimeout: number; // Total Run Time in minutes
  status: 'running' | 'stopped';
  startedAt?: number;
}
```

## 🔐 Authentication

### Demo Credentials

The application includes three demo accounts:

| Username | Password | Role | Capabilities |
|----------|----------|------|-------------|
| `admin` | `admin123` | Admin | Full access to all features |
| `devops` | `devops123` | User | Can start/stop apps only |
| `user` | `user123` | User | Can start/stop apps only |

### Admin Capabilities

- Manage servers (add, edit, delete)
- Manage projects (create, edit, delete)
- Manage applications (add, edit, delete)
- View all system information
- Access admin panel

### User Capabilities

- View all servers and their status
- View all projects and applications
- Start and stop applications
- Edit app auto-stop timers
- View app URLs and details

## 📋 Usage Guide

### For Administrators

#### 1. Configure Servers

1. Click "Add Server" in the Admin Panel
2. Enter server details:
   - Server name (e.g., "Production Server 1")
   - Server address (IP or hostname)
   - Choose connection method:
     - **SSH**: Provide SSH user and port
     - **API**: Provide API endpoint URL
3. Save the server configuration

#### 2. Create Projects

1. Click "Add Project" in the Admin Panel
2. Enter project details:
   - Project name (e.g., "QMS", "EBMR")
   - Optional description
3. Save the project

#### 3. Add Applications

1. Click "Add App" button
2. Fill in app details:
   - App name
   - Select project
   - Select server
   - Docker Compose path (e.g., `/home/user/my-app`)
   - App URL (optional, for auto-launch)
   - Auto-stop timeout in minutes
3. Save the application

### For All Users

#### Starting an Application

1. Navigate to the project tab containing your app
2. Click the "Start" button on the app card
3. The app will start on its configured server
4. If an app URL is configured, it will open automatically in a new tab
5. Watch the countdown timer to see when it will auto-stop

#### Stopping an Application

1. Click the "Stop" button on any running app
2. The app will shut down immediately
3. The countdown timer will disappear

#### Adjusting Auto-Stop Timer

1. Click the edit icon next to the auto-stop timeout
2. Enter a new timeout value (in minutes)
3. Click the checkmark to save
4. The new timeout applies immediately, even to running apps

## 🔄 Real-time Monitoring

The dashboard automatically polls for updates every 15 seconds:

- **Server Status**: Online/offline detection
- **Running App Count**: Number of active containers per server
- **App Status**: Running or stopped state
- **Last Check Time**: Timestamp of last status check

## 🛠️ Technical Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Shadcn UI** - Component library
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## 📦 Project Structure

```
/
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── AdminPanel.tsx   # Admin management interface
│   ├── AppCard.tsx      # Individual app display
│   ├── AppManagementDialog.tsx
│   ├── LoginPage.tsx
│   ├── ProjectManagementDialog.tsx
│   ├── ServerManagementDialog.tsx
│   └── ServerOverview.tsx
├── hooks/
│   ├── useApps.ts       # App state management
│   ├── useAuth.ts       # Authentication
│   ├── useProjects.ts   # Project state
│   └── useServers.ts    # Server state
├── lib/
│   └── serverApi.ts     # Mock server API calls
├── types/
│   └── app.ts           # TypeScript interfaces
└── App.tsx              # Main application
```

## 🚧 Production Considerations

### Backend Requirements

This is a **frontend-only prototype**. For production deployment, you need:

1. **Authentication Backend**
   - User management & JWT token generation
   - Role-based access control
   - Secure password storage

2. **Server Management API**
   - SSH connection pooling
   - Docker Compose command execution
   - Health check endpoints
   - Secure credential storage

3. **Database**
   - Persistent storage for servers, projects, and apps
   - User accounts and permissions
   - Audit logs

### Security Recommendations

- Store all credentials securely (never in frontend code)
- Use HTTPS for all communications
- Implement rate limiting
- Add audit logging for all actions
- Use SSH keys instead of passwords
- Implement proper CORS policies
- Add input validation and sanitization
- Use environment variables for configuration

### Deployment Steps

1. Set up a backend API (Node.js, Python, Go, etc.)
2. Implement secure server communication (SSH or REST API)
3. Set up a database (PostgreSQL, MongoDB, etc.)
4. Configure environment-specific settings
5. Deploy backend and frontend separately
6. Set up monitoring and alerting
7. Implement backup and disaster recovery

## 📝 Development Notes

### Mock API Behavior

The current implementation uses mock API calls:

- Server status checks have 90% success rate
- Docker Compose commands have 95% success rate
- All operations include simulated network delays
- No actual SSH connections are made

### Local Storage

Currently uses browser localStorage for data persistence:

- `devops-dashboard-auth` - User session
- `devops-dashboard-servers` - Server configurations
- `devops-dashboard-projects` - Project list
- `devops-dashboard-apps` - Application configurations

## 🎨 Customization

### Changing Polling Intervals

Edit the interval in `App.tsx`:

```typescript
const interval = setInterval(pollServers, 15000); // 15 seconds
```

### Adjusting Auto-Stop Defaults

Edit default timeout in components or types:

```typescript
autoStopTimeout: app.autoStopTimeout ?? 60 // Default 60 minutes
```

## 🐛 Known Limitations

1. **No Real Server Connections**: Uses mock API for demonstration
2. **Local Storage Only**: Data persists in browser only
3. **No Real-time WebSocket**: Uses polling instead of push notifications
4. **Single User Session**: No concurrent session management
5. **No Server Logs**: Cannot view container logs from UI

## 📄 License

This is a prototype application for demonstration purposes.

## 🤝 Contributing

This is a demo project. For production use, implement a proper backend as described in the Production Considerations section.
