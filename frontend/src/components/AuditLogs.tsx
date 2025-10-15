import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FileText, Search, RefreshCw, User, Play, Square, Plus, Edit, Trash2 } from 'lucide-react';
import { AuditLog } from '../types/app';
import { auditApi } from '../lib/api';
import { toast } from 'sonner';

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    username: '',
  });

  const pageSize = 20;

  useEffect(() => {
    loadLogs();
  }, [currentPage, filters]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const result = await auditApi.getLogs({
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        action: filters.action || undefined,
        resourceType: filters.resourceType || undefined,
      });
      setLogs(result.logs);
      setTotal(result.total);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'start_app':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'stop_app':
        return <Square className="h-4 w-4 text-red-600" />;
      case 'create_app':
      case 'create_server':
      case 'create_project':
      case 'create_user':
        return <Plus className="h-4 w-4 text-blue-600" />;
      case 'update_app':
      case 'update_server':
      case 'update_project':
      case 'update_user':
        return <Edit className="h-4 w-4 text-orange-600" />;
      case 'delete_app':
      case 'delete_server':
      case 'delete_project':
      case 'delete_user':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('start')) return 'bg-green-100 text-green-800 border-green-200';
    if (action.includes('stop')) return 'bg-red-100 text-red-800 border-red-200';
    if (action.includes('create')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (action.includes('update')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (action.includes('delete')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDuration = (details: string) => {
    const durationMatch = details.match(/Duration: ([^,]+)/);
    if (durationMatch) {
      return durationMatch[1];
    }
    return null;
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Logs
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadLogs} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search by username..."
              value={filters.username}
              onChange={(e) => setFilters({ ...filters, username: e.target.value })}
            />
          </div>
          <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="start_app">Start App</SelectItem>
              <SelectItem value="stop_app">Stop App</SelectItem>
              <SelectItem value="create_app">Create App</SelectItem>
              <SelectItem value="update_app">Update App</SelectItem>
              <SelectItem value="delete_app">Delete App</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.resourceType} onValueChange={(value) => setFilters({ ...filters, resourceType: value })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Resources</SelectItem>
              <SelectItem value="app">Applications</SelectItem>
              <SelectItem value="server">Servers</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs */}
        {isLoading ? (
          <div className="text-center py-8">Loading audit logs...</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    <Badge className={getActionColor(log.action)}>
                      {log.action.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{log.username}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{log.resourceName}</span>
                      <Badge variant="outline">{log.resourceType}</Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mt-1">
                      {log.details}
                      {formatDuration(log.details) && (
                        <span className="ml-2 text-orange-600">
                          Duration: {formatDuration(log.details)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-muted-foreground">
                  <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                  <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            
            {logs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, total)} of {total} logs
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}