import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Play, Square, Loader2, Clock, Settings, Edit2, Check, X, ExternalLink, Server as ServerIcon, Globe } from 'lucide-react';
import { App, Server, Project } from '../types/app';
import { executeDockerCompose } from '../lib/serverApi';
import { toast } from 'sonner@2.0.3';

interface AppCardProps {
  app: App;
  server?: Server;
  project?: Project;
  onUpdateApp: (id: string, updates: Partial<App>) => Promise<void>;
  onStartApp: (id: string, timeoutMinutes: number) => Promise<any>;
  onStopApp: (id: string) => Promise<any>;
  onEditApp: (app: App) => void;
  isAdmin: boolean;
}

export function AppCard({ app, server, project, onUpdateApp, onStartApp, onStopApp, onEditApp, isAdmin }: AppCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isEditingTimeout, setIsEditingTimeout] = useState(false);
  const [newTimeout, setNewTimeout] = useState((app.autoStopTimeout ?? 60).toString());

  // Calculate time remaining
  useEffect(() => {
    if (app.status === 'running' && app.startedAt) {
      const updateTimer = () => {
        const elapsed = Date.now() - app.startedAt!;
        const timeout = app.autoStopTimeout ?? 60;
        const timeoutMs = timeout * 60 * 1000;
        const remaining = Math.max(0, timeoutMs - elapsed);
        setTimeRemaining(remaining);

        if (remaining === 0) {
          handleStop();
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeRemaining(null);
    }
  }, [app.status, app.startedAt, app.autoStopTimeout]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDomain = (domain: string) => {
    if (!domain) return '';
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      return domain;
    }
    return `https://${domain}`;
  };

  const handleStart = async () => {
    if (!server) {
      toast.error('Server not found for this app');
      return;
    }

    if (server.status === 'offline') {
      toast.error(`Server "${server.name}" is offline`);
      return;
    }

    setIsLoading(true);

    try {
      const result = await onStartApp(app.id, app.autoStopTimeout ?? 60);
      toast.success(`${app.name} started successfully`);

      // Open app domain in new tab if starting and app_url is provided
      if (result.app_url) {
        setTimeout(() => {
          window.open(result.app_url, '_blank');
          toast.success(`Opening ${result.app_url} in new tab`);
        }, 1500); // Small delay to let the app start
      } else if (app.domain) {
        setTimeout(() => {
          const url = formatDomain(app.domain);
          window.open(url, '_blank');
          toast.success(`Opening ${app.domain} in new tab`);
        }, 1500);
      }
    } catch (error) {
      console.error('Start app error:', error);
      toast.error(`Failed to start ${app.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!server) {
      toast.error('Server not found for this app');
      return;
    }

    setIsLoading(true);

    try {
      await onStopApp(app.id);
      toast.success(`${app.name} stopped successfully`);
    } catch (error) {
      console.error('Stop app error:', error);
      toast.error(`Failed to stop ${app.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTimeout = async () => {
    const timeout = parseInt(newTimeout);
    if (isNaN(timeout) || timeout <= 0) {
      toast.error('Timeout must be a positive number');
      return;
    }

    try {
      await onUpdateApp(app.id, { autoStopTimeout: timeout });
      setIsEditingTimeout(false);
      toast.success('Total run time updated');
    } catch (error) {
      toast.error('Failed to update timeout');
    }
  };

  const handleCancelTimeout = () => {
    setNewTimeout(app.autoStopTimeout.toString());
    setIsEditingTimeout(false);
  };

  const formatRunTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {app.name}
              <Badge
                variant={app.status === 'running' ? 'default' : 'secondary'}
                className={`
                  transition-all duration-300
                  ${app.status === 'running' 
                    ? 'bg-green-500 hover:bg-green-600 animate-pulse' 
                    : 'bg-gray-400 hover:bg-gray-500'
                  }
                `}
              >
                {app.status}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {project?.name || 'No Project'}
            </CardDescription>
          </div>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditApp(app)}
              className="h-8 w-8 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-muted-foreground space-y-2">
            {/* Domain */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-500" />
              <a
                href={formatDomain(app.domain)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline truncate flex-1"
              >
                {app.domain}
              </a>
              <ExternalLink className="h-3 w-3 text-indigo-500" />
            </div>

            {/* Server info */}
            <div className="flex items-center gap-2">
              <ServerIcon className="h-4 w-4 text-slate-500" />
              <span className="text-slate-500 truncate flex-1">
                {server?.name || 'Unknown Server'}
              </span>
              {server && (
                <Badge 
                  variant="outline" 
                  className={server.status === 'online' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}
                >
                  {server.status}
                </Badge>
              )}
            </div>

            {/* Compose path */}
            <p className="text-slate-500 truncate pl-6" title={app.cdPath}>
              {app.cdPath}
            </p>
            
            {/* Total run time display/edit */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              {isEditingTimeout ? (
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    type="number"
                    min="1"
                    value={newTimeout}
                    onChange={(e) => setNewTimeout(e.target.value)}
                    className="h-7 w-20"
                  />
                  <span className="text-slate-500">min</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={handleUpdateTimeout}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={handleCancelTimeout}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-slate-500">
                    Run time: {formatRunTime(app.autoStopTimeout ?? 60)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => {
                      setIsEditingTimeout(true);
                      setNewTimeout((app.autoStopTimeout ?? 60).toString());
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Countdown timer */}
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 text-orange-500">
                <Clock className="h-4 w-4 animate-pulse" />
                <span>Stops in {formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {app.status === 'stopped' ? (
              <Button
                onClick={handleStart}
                disabled={isLoading || !server || server.status !== 'online'}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleStop}
                disabled={isLoading || !server}
                variant="destructive"
                className="flex-1 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
