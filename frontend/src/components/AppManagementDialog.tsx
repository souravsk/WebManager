import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { App, Project, Server } from '../types/app';
import { Trash2, Globe } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AppManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app?: App | null;
  projects: Project[];
  servers: Server[];
  onSave: (app: Omit<App, 'id' | 'status' | 'startedAt'>) => Promise<App>;
  onUpdate: (id: string, updates: Partial<App>) => Promise<App>;
  onDelete: (id: string) => Promise<void>;
}

export function AppManagementDialog({
  open,
  onOpenChange,
  app,
  projects,
  servers,
  onSave,
  onUpdate,
  onDelete,
}: AppManagementDialogProps) {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [serverId, setServerId] = useState('');
  const [domain, setDomain] = useState('');
  const [cdPath, setCdPath] = useState('');
  const [autoStopTimeout, setAutoStopTimeout] = useState('60');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (app) {
      setName(app.name);
      setProjectId(app.projectId);
      setServerId(app.serverId);
      setDomain(app.domain);
      setCdPath(app.cdPath);
      setAutoStopTimeout(app.autoStopTimeout.toString());
    } else {
      setName('');
      setProjectId('');
      setServerId('');
      setDomain('');
      setCdPath('');
      setAutoStopTimeout('60');
    }
  }, [app, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !projectId || !serverId || !domain || !cdPath) {
      toast.error('All required fields must be filled');
      return;
    }

    // Validate domain format
    if (!domain.includes('.')) {
      toast.error('Please enter a valid domain (e.g., pharma.qms.nexgensis.com)');
      return;
    }

    const timeout = parseInt(autoStopTimeout);
    if (isNaN(timeout) || timeout <= 0) {
      toast.error('Total run time must be a positive number');
      return;
    }

    const appData = {
      name,
      projectId,
      serverId,
      domain,
      cdPath,
      autoStopTimeout: timeout,
    };

    if (app) {
      onUpdate(app.id, appData);
      toast.success('App updated successfully');
    } else {
      onSave(appData);
      toast.success('App added successfully');
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (app) {
      onDelete(app.id);
      toast.success('App deleted successfully');
      setShowDeleteDialog(false);
      onOpenChange(false);
    }
  };

  // Format domain display with protocol if needed
  const formatDomain = (dom: string) => {
    if (!dom) return '';
    if (dom.startsWith('http://') || dom.startsWith('https://')) {
      return dom;
    }
    return `https://${dom}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {app ? 'Edit App' : 'Add New App'}
            </DialogTitle>
            <DialogDescription>
              {app
                ? 'Update the app configuration below.'
                : 'Add a new application to your dashboard.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid gap-2">
                <Label htmlFor="project">Project *</Label>
                <Select value={projectId} onValueChange={setProjectId} required>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.length === 0 ? (
                      <div className="p-2 text-muted-foreground text-center">
                        No projects available
                      </div>
                    ) : (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground">
                  The project this app belongs to (e.g., QMS, EBMR)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">App Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="QMS"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="domain">Domain *</Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="pharma.qms.nexgensis.com"
                  required
                />
                <p className="text-muted-foreground">
                  Opens automatically in a new tab when app starts
                  {domain && (
                    <span className="block mt-1 text-indigo-600 dark:text-indigo-400">
                      Will open: {formatDomain(domain)}
                    </span>
                  )}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cdPath">Compose File Path *</Label>
                <Input
                  id="cdPath"
                  value={cdPath}
                  onChange={(e) => setCdPath(e.target.value)}
                  placeholder="/root/qms/qms"
                  required
                />
                <p className="text-muted-foreground">
                  Full path to the directory containing docker-compose.yml
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="server">Server *</Label>
                <Select value={serverId} onValueChange={setServerId} required>
                  <SelectTrigger id="server">
                    <SelectValue placeholder="Select a server" />
                  </SelectTrigger>
                  <SelectContent>
                    {servers.length === 0 ? (
                      <div className="p-2 text-muted-foreground text-center">
                        No servers available
                      </div>
                    ) : (
                      servers.map((server) => (
                        <SelectItem key={server.id} value={server.id}>
                          {server.name} ({server.address})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground">
                  The server where this app is hosted   
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="autoStopTimeout">Total Run Time (minutes) *</Label>
                <Input
                  id="autoStopTimeout"
                  type="number"
                  min="1"
                  value={autoStopTimeout}
                  onChange={(e) => setAutoStopTimeout(e.target.value)}
                  placeholder="60"
                  required
                />
                <p className="text-muted-foreground">
                  App will automatically stop after this duration when started
                  {autoStopTimeout && parseInt(autoStopTimeout) >= 60 && (
                    <span className="block mt-1">
                      ({Math.floor(parseInt(autoStopTimeout) / 60)}h {parseInt(autoStopTimeout) % 60}m)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              {app && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="mr-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={projects.length === 0 || servers.length === 0}
              >
                {app ? 'Update' : 'Add'} App
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{app?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
