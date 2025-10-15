# Backend Implementation Guide

This guide explains how to implement a production backend for the DevOps Dashboard.

## 🏗️ Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │ ◄─HTTP─►│   Backend   │ ◄─SSH──►│   Servers   │
│   (React)   │         │     API     │         │  (Docker)   │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │  Database   │
                        └─────────────┘
```

## 🔌 Required API Endpoints

### Authentication

#### POST /api/auth/login
```json
Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "user": {
    "id": "user-123",
    "username": "admin",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/auth/logout
```json
Headers:
{
  "Authorization": "Bearer <token>"
}

Response:
{
  "success": true
}
```

#### GET /api/auth/verify
```json
Headers:
{
  "Authorization": "Bearer <token>"
}

Response:
{
  "user": {
    "id": "user-123",
    "username": "admin",
    "role": "admin"
  }
}
```

### Servers

#### GET /api/servers
```json
Response:
[
  {
    "id": "server-1",
    "name": "Production Server 1",
    "address": "192.168.1.100",
    "sshUser": "root",
    "sshPort": 22,
    "status": "online",
    "runningAppsCount": 3,
    "lastChecked": 1633024800000
  }
]
```

#### POST /api/servers
```json
Request:
{
  "name": "Production Server 1",
  "address": "192.168.1.100",
  "sshUser": "root",
  "sshPort": 22
}

Response:
{
  "id": "server-1",
  "name": "Production Server 1",
  ...
}
```

#### PUT /api/servers/:id
#### DELETE /api/servers/:id

#### GET /api/servers/:id/status
```json
Response:
{
  "status": "online",
  "runningContainers": 3,
  "uptime": 86400,
  "lastChecked": 1633024800000
}
```

### Projects

#### GET /api/projects
#### POST /api/projects
#### PUT /api/projects/:id
#### DELETE /api/projects/:id

### Applications

#### GET /api/apps
```json
Response:
[
  {
    "id": "app-1",
    "name": "QMS Backend",
    "projectId": "project-1",
    "serverId": "server-1",
    "cdPath": "/home/apps/qms-backend",
    "appUrl": "http://192.168.1.100:8080",
    "autoStopTimeout": 60,
    "status": "running",
    "startedAt": 1633024800000
  }
]
```

#### POST /api/apps
#### PUT /api/apps/:id
#### DELETE /api/apps/:id

#### POST /api/apps/:id/start
```json
Request:
{
  "timeout": 60
}

Response:
{
  "success": true,
  "appId": "app-1",
  "status": "running",
  "startedAt": 1633024800000,
  "message": "Application started successfully"
}
```

#### POST /api/apps/:id/stop
```json
Response:
{
  "success": true,
  "appId": "app-1",
  "status": "stopped",
  "message": "Application stopped successfully"
}
```

## 💾 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Servers Table
```sql
CREATE TABLE servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  ssh_user VARCHAR(255),
  ssh_port INTEGER DEFAULT 22,
  api_endpoint VARCHAR(255),
  encrypted_credentials TEXT,
  status VARCHAR(50) DEFAULT 'offline',
  running_apps_count INTEGER DEFAULT 0,
  last_checked TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Apps Table
```sql
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  server_id UUID REFERENCES servers(id) ON DELETE RESTRICT,
  cd_path VARCHAR(500) NOT NULL,
  app_url VARCHAR(500),
  auto_stop_timeout INTEGER NOT NULL DEFAULT 60,
  status VARCHAR(50) DEFAULT 'stopped',
  started_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Security Implementation

### Password Hashing
```javascript
// Node.js example using bcrypt
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

### JWT Token Generation
```javascript
// Node.js example using jsonwebtoken
const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
```

### SSH Credential Encryption
```javascript
// Node.js example using crypto
const crypto = require('crypto');

function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

## 🖥️ Server Communication

### SSH Connection (Node.js)
```javascript
const { NodeSSH } = require('node-ssh');

class ServerManager {
  async executeDockerCompose(server, cdPath, action) {
    const ssh = new NodeSSH();
    
    try {
      await ssh.connect({
        host: server.address,
        username: server.sshUser,
        port: server.sshPort,
        privateKey: decrypt(server.encryptedCredentials)
      });

      const command = action === 'up' 
        ? 'docker-compose up -d' 
        : 'docker-compose down';

      const result = await ssh.execCommand(command, { cwd: cdPath });

      if (result.code !== 0) {
        throw new Error(result.stderr);
      }

      return { success: true, output: result.stdout };
    } finally {
      ssh.dispose();
    }
  }

  async checkServerStatus(server) {
    const ssh = new NodeSSH();
    
    try {
      await ssh.connect({
        host: server.address,
        username: server.sshUser,
        port: server.sshPort,
        privateKey: decrypt(server.encryptedCredentials)
      });

      const result = await ssh.execCommand('docker ps -q | wc -l');
      const runningContainers = parseInt(result.stdout.trim());

      return {
        status: 'online',
        runningContainers
      };
    } catch (error) {
      return {
        status: 'offline',
        runningContainers: 0
      };
    } finally {
      ssh.dispose();
    }
  }
}
```

### SSH Connection (Python)
```python
import paramiko

class ServerManager:
    def execute_docker_compose(self, server, cd_path, action):
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        try:
            ssh.connect(
                hostname=server['address'],
                username=server['sshUser'],
                port=server['sshPort'],
                key_filename=decrypt(server['encryptedCredentials'])
            )
            
            command = 'docker-compose up -d' if action == 'up' else 'docker-compose down'
            full_command = f"cd {cd_path} && {command}"
            
            stdin, stdout, stderr = ssh.exec_command(full_command)
            exit_code = stdout.channel.recv_exit_status()
            
            if exit_code != 0:
                raise Exception(stderr.read().decode())
            
            return {'success': True, 'output': stdout.read().decode()}
        finally:
            ssh.close()
    
    def check_server_status(self, server):
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        try:
            ssh.connect(
                hostname=server['address'],
                username=server['sshUser'],
                port=server['sshPort'],
                key_filename=decrypt(server['encryptedCredentials'])
            )
            
            stdin, stdout, stderr = ssh.exec_command('docker ps -q | wc -l')
            running_containers = int(stdout.read().decode().strip())
            
            return {
                'status': 'online',
                'runningContainers': running_containers
            }
        except Exception:
            return {
                'status': 'offline',
                'runningContainers': 0
            }
        finally:
            ssh.close()
```

## ⏰ Auto-Stop Timer Implementation

### Background Job (Node.js)
```javascript
const cron = require('node-cron');

// Check every minute for apps that should auto-stop
cron.schedule('* * * * *', async () => {
  const runningApps = await db.apps.findAll({ where: { status: 'running' } });
  
  for (const app of runningApps) {
    const elapsed = Date.now() - app.startedAt;
    const timeout = app.autoStopTimeout * 60 * 1000;
    
    if (elapsed >= timeout) {
      await stopApp(app);
      await db.auditLogs.create({
        action: 'AUTO_STOP',
        resourceType: 'app',
        resourceId: app.id,
        details: { reason: 'timeout', timeout: app.autoStopTimeout }
      });
    }
  }
});
```

### Background Job (Python with Celery)
```python
from celery import Celery
from datetime import datetime, timedelta

app = Celery('tasks')

@app.task
def check_auto_stop_apps():
    running_apps = App.query.filter_by(status='running').all()
    
    for app in running_apps:
        elapsed = datetime.now() - app.started_at
        timeout = timedelta(minutes=app.auto_stop_timeout)
        
        if elapsed >= timeout:
            stop_app(app)
            create_audit_log(
                action='AUTO_STOP',
                resource_type='app',
                resource_id=app.id,
                details={'reason': 'timeout', 'timeout': app.auto_stop_timeout}
            )

# Schedule to run every minute
app.conf.beat_schedule = {
    'check-auto-stop': {
        'task': 'tasks.check_auto_stop_apps',
        'schedule': 60.0,  # Every 60 seconds
    },
}
```

## 📊 Example Backend Stack

### Option 1: Node.js + Express
```
Tech Stack:
- Express.js (API framework)
- PostgreSQL (database)
- node-ssh (SSH connections)
- jsonwebtoken (JWT auth)
- bcrypt (password hashing)
- node-cron (scheduled tasks)
```

### Option 2: Python + FastAPI
```
Tech Stack:
- FastAPI (API framework)
- PostgreSQL (database)
- paramiko (SSH connections)
- python-jose (JWT auth)
- passlib (password hashing)
- celery + redis (background tasks)
```

### Option 3: Go + Fiber
```
Tech Stack:
- Fiber (API framework)
- PostgreSQL (database)
- golang.org/x/crypto/ssh (SSH)
- golang-jwt/jwt (JWT auth)
- bcrypt (password hashing)
- cron (scheduled tasks)
```

## 🚀 Deployment Checklist

- [ ] Set up database with proper schema
- [ ] Implement all required API endpoints
- [ ] Add JWT authentication middleware
- [ ] Implement role-based access control
- [ ] Set up SSH connection pooling
- [ ] Implement background job for auto-stop
- [ ] Add comprehensive error handling
- [ ] Set up logging and monitoring
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up CORS properly
- [ ] Use environment variables for secrets
- [ ] Implement database migrations
- [ ] Set up backup strategy
- [ ] Add health check endpoints
- [ ] Configure SSL/TLS
- [ ] Set up CI/CD pipeline
- [ ] Write API documentation
- [ ] Implement audit logging
- [ ] Add unit and integration tests

## 📝 Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/devops_dashboard

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
ENCRYPTION_KEY=your-encryption-key-for-ssh-credentials

# CORS
FRONTEND_URL=https://dashboard.example.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/devops-dashboard/app.log
```

## 🔍 Monitoring & Logging

### What to Monitor
- API response times
- SSH connection success/failure rates
- Docker Compose command execution times
- Server status check failures
- Auto-stop job execution
- Database query performance
- Authentication failures

### What to Log
- All user actions (audit trail)
- App start/stop events
- Server status changes
- SSH connection errors
- Docker Compose command outputs
- Authentication attempts
- API errors

## 🛡️ Security Best Practices

1. **Never store passwords in plain text**
2. **Use SSH keys instead of passwords**
3. **Encrypt all sensitive data at rest**
4. **Use HTTPS for all communications**
5. **Implement rate limiting**
6. **Validate and sanitize all inputs**
7. **Use prepared statements for SQL queries**
8. **Keep dependencies updated**
9. **Implement proper CORS policies**
10. **Use security headers (helmet.js)**
11. **Implement request logging**
12. **Use principle of least privilege**

## 📚 Additional Resources

- [Node-SSH Documentation](https://github.com/steelbrain/node-ssh)
- [Paramiko Documentation](https://www.paramiko.org/)
- [JWT.io](https://jwt.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

This guide provides a foundation for implementing a production-ready backend. Adapt it to your specific requirements and infrastructure.
