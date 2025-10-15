import { useState } from 'react';
import { Settings } from '../hooks/useSettings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { KeyRound, Github, User } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
  username?: string;
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdate,
  username,
}: SettingsDialogProps) {
  const [githubToken, setGithubToken] = useState(settings.githubToken);
  const [githubOwner, setGithubOwner] = useState(settings.githubOwner);
  const [githubRepo, setGithubRepo] = useState(settings.githubRepo);

  const handleSave = () => {
    onUpdate({
      githubToken,
      githubOwner,
      githubRepo,
    });
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Reset form to current settings when opening
      setGithubToken(settings.githubToken);
      setGithubOwner(settings.githubOwner);
      setGithubRepo(settings.githubRepo);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your GitHub repository and access token for webhook integration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          {username && (
            <>
              <div className="flex items-center gap-3 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Logged in as</p>
                  <p className="text-slate-900 dark:text-slate-100">{username}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* GitHub Repository Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Github className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-slate-900 dark:text-slate-100">GitHub Repository</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="githubOwner">Repository Owner</Label>
                <Input
                  id="githubOwner"
                  placeholder="octocat"
                  value={githubOwner}
                  onChange={(e) => setGithubOwner(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubRepo">Repository Name</Label>
                <Input
                  id="githubRepo"
                  placeholder="my-repo"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                />
              </div>
            </div>

            {githubOwner && githubRepo && (
              <p className="text-muted-foreground">
                Repository: <span className="text-indigo-600 dark:text-indigo-400">{githubOwner}/{githubRepo}</span>
              </p>
            )}
          </div>

          <Separator />

          {/* GitHub Token */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-slate-900 dark:text-slate-100">GitHub Personal Access Token</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubToken">Access Token</Label>
              <Input
                id="githubToken"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
              <p className="text-muted-foreground">
                This token will be used for all webhook calls to trigger GitHub Actions workflows.
              </p>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                <strong>Required Permissions:</strong> Your token needs the <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">repo</code> scope to trigger repository dispatch events.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={!githubToken || !githubOwner || !githubRepo}
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
