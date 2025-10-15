import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Server as ServerIcon, Activity, RefreshCw } from 'lucide-react';
import { Server } from '../types/app';

interface ServerOverviewProps {
  servers: Server[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function ServerOverview({ servers, onRefresh, isRefreshing }: ServerOverviewProps) {
  const onlineServers = servers.filter(s => s.status === 'online').length;
  const totalApps = servers.reduce((sum, s) => sum + s.runningAppsCount, 0);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ServerIcon className="h-5 w-5" />
            Server Overview
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Online Servers */}
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ServerIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Online Servers</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-green-700 dark:text-green-400">{onlineServers}</span>
                  <span className="text-muted-foreground">of {servers.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Running Apps */}
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Total Running Apps</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-orange-700 dark:text-orange-400">{totalApps}</span>
                  <span className="text-muted-foreground">active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
