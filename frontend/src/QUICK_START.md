# Quick Start Guide

Get your DevOps Dashboard up and running in minutes!

## 🎯 First Time Setup

### Step 1: Login

Use one of the demo accounts:

- **Admin Account**: `admin` / `admin123`
- **User Account**: `devops` / `devops123`

For full setup capabilities, log in as **admin**.

### Step 2: Add Your First Server

1. In the Admin Panel, click **"Add Server"** under the Servers section
2. Fill in the details:
   ```
   Server Name: Production Server
   Server Address: 192.168.1.100
   Connection Type: SSH
   SSH User: root
   SSH Port: 22
   ```
3. Click **"Add Server"**

### Step 3: Create a Project

1. In the Admin Panel, click **"Add Project"** under the Projects section
2. Fill in the details:
   ```
   Project Name: QMS
   Description: Quality Management System
   ```
3. Click **"Create Project"**

### Step 4: Add an Application

1. Click the **"Add App"** button at the top right
2. Fill in the details:
   ```
   App Name: QMS Backend
   Project: QMS
   Server: Production Server
   Docker Compose Path: /home/apps/qms-backend
   App URL: http://192.168.1.100:8080 (optional)
   Auto-Stop Timeout: 60
   ```
3. Click **"Add App"**

### Step 5: Start Your App

1. Navigate to the QMS project tab
2. Find your "QMS Backend" app
3. Click the **"Start"** button
4. If you provided an App URL, it will open automatically
5. Watch the countdown timer!

## 🎓 Common Tasks

### Checking Server Status

The dashboard automatically checks server status every 15 seconds. You can also manually refresh by clicking the **"Refresh"** button in the Server Overview section.

### Organizing Multiple Apps

Create different projects for different systems:

```
Projects:
├── QMS (Quality Management)
│   ├── QMS Frontend
│   ├── QMS Backend
│   └── QMS Database
├── EBMR (Electronic Batch Records)
│   ├── EBMR API
│   └── EBMR Worker
└── Monitoring
    ├── Grafana
    └── Prometheus
```

### Managing Auto-Stop Timers

You can change the auto-stop timeout even while an app is running:

1. Click the **edit icon** (✏️) next to "Auto-stop: XX min"
2. Enter new value
3. Click the **checkmark** (✓)
4. The new timeout takes effect immediately

### User vs Admin View

**Admin users see:**
- Full server management panel
- Project creation and editing
- App configuration and deletion
- All settings and controls

**Regular users see:**
- Server status overview
- All projects and apps
- Start/Stop controls only
- Cannot modify configurations

## 💡 Tips & Tricks

### 1. Group Related Apps

Put related applications (frontend, backend, database) in the same project for easy management.

### 2. Use Descriptive Names

Name your apps clearly:
- ✅ "QMS Production Backend"
- ❌ "app1"

### 3. Configure App URLs

Always add the app URL so it opens automatically when you start the app - saves time!

### 4. Set Appropriate Timeouts

Consider the nature of your app:
- Development/testing: 30-60 minutes
- Demos: 2-4 hours
- Long-running tasks: 8-12 hours

### 5. Monitor Server Status

Keep an eye on the Server Overview dashboard - it shows:
- Number of online servers
- Total running apps
- Individual server status

### 6. Check Last Update Time

Each server card shows when it was last checked. If this timestamp is old, click Refresh.

## 🔧 Troubleshooting

### Server Shows as Offline

**Possible causes:**
- Server is actually down
- Network connectivity issues
- SSH credentials incorrect
- Firewall blocking connection

**What to do:**
1. Check if you can ping the server
2. Verify SSH credentials
3. Check firewall rules
4. Click "Refresh" to retry

### App Won't Start

**Possible causes:**
- Server is offline
- Docker Compose path is incorrect
- Docker service not running on server
- Port conflicts

**What to do:**
1. Verify server status is "online"
2. Check the Docker Compose path
3. SSH into the server manually to test
4. Check server logs

### App URL Doesn't Open

**Possible causes:**
- URL not configured
- App takes time to start
- Wrong port or address

**What to do:**
1. Wait a few seconds after starting
2. Verify the app URL in settings
3. Try opening the URL manually
4. Check if the port is correct

### Timer Not Counting Down

**Possible causes:**
- App not actually started
- Page needs refresh
- Browser tab in background

**What to do:**
1. Refresh the page
2. Verify app status shows "running"
3. Keep the browser tab active

## 🚀 Next Steps

Now that you're set up:

1. **Add more servers** - Scale across multiple environments
2. **Create projects** - Organize your applications logically
3. **Invite team members** - Create user accounts for your team
4. **Set up monitoring** - Keep track of app uptime and performance
5. **Plan for production** - Review the main README for production deployment

## 📚 Learn More

- See [README.md](./README.md) for detailed documentation
- Check [SETUP.md](./SETUP.md) for technical setup instructions
- Review [AUTH_GUIDE.md](./AUTH_GUIDE.md) for authentication details

## ❓ Need Help?

Common questions:

**Q: Can regular users add apps?**
A: No, only admins can add, edit, or delete apps. Users can only start/stop them.

**Q: How many apps can I have?**
A: No hard limit in the UI. Depends on your servers and backend capacity.

**Q: Can I change which server an app runs on?**
A: Yes, admins can edit the app and select a different server.

**Q: What happens if I close the browser while an app is running?**
A: The app keeps running on the server. The auto-stop timer is managed by the backend.

**Q: Can multiple people use this at the same time?**
A: In the current prototype, each browser session is independent. For production, implement a proper backend with shared state.

---

Happy deploying! 🎉
