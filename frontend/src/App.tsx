import { useState, useEffect } from 'react';
import { useApps } from './hooks/useApps';
import { useServers } from './hooks/useServers';
import { useProjects } from './hooks/useProjects';
import { useAuth } from './hooks/useAuth';
import { AppCard } from './components/AppCard';
import { AppManagementDialog } from './components/AppManagementDialog';
import { ServerOverview } from './components/ServerOverview';
import { AdminPanel } from './components/AdminPanel';
import { LoginPage } from './components/LoginPage';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Plus, Activity, LogOut, FolderKanban, Shield, Search } from 'lucide-react';
import { Input } from './components/ui/input';
import { App, Project } from './types/app';
import { Toaster } from './components/ui/sonner';
// Server API calls now handled by backend integration

export default function App() {
  const { user, isLoading: authLoading, isAuthenticated, isAdmin, login, logout } = useAuth();
  const { apps, addApp, updateApp, removeApp, startApp, stopApp, getAppsByProject, getAppsByServer, isLoading: appsLoading, error: appsError } = useApps();
  const { servers, addServer, updateServer, removeServer, isLoading: serversLoading, error: serversError } = useServers();
  const { projects, addProject, updateProject, removeProject, isLoading: projectsLoading, error: projectsError } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [isRefreshingServers, setIsRefreshingServers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Note: Server status polling is now handled by the backend

  // Show login page if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  const handleAddApp = () => {
    setEditingApp(null);
    setDialogOpen(true);
  };

  const handleEditApp = (app: App) => {
    setEditingApp(app);
    setDialogOpen(true);
  };

  const handleRefreshServers = async () => {
    setIsRefreshingServers(true);
    try {
      // Refresh all data from backend
      await Promise.all([
        servers.length > 0 ? Promise.resolve() : Promise.resolve(), // Server refresh handled by useServers
        apps.length > 0 ? Promise.resolve() : Promise.resolve(), // App refresh handled by useApps
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshingServers(false);
    }
  };

  // Group apps by project and filter by search
  const appsByProject = projects.reduce((acc, project) => {
    const projectApps = getAppsByProject(project.id);
    
    // Filter apps by search query (search by app name, domain, or project name)
    const filteredApps = searchQuery
      ? projectApps.filter(app =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : projectApps;
    
    acc[project.id] = filteredApps;
    return acc;
  }, {} as Record<string, App[]>);

  // Filter projects to only show those with apps (after search)
  const visibleProjects = searchQuery
    ? projects.filter(project => appsByProject[project.id]?.length > 0)
    : projects;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-indigo-900 dark:text-indigo-100">DevOps Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage your applications and servers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md mr-2">
                <Shield className={`h-4 w-4 ${isAdmin ? 'text-orange-600 dark:text-orange-500' : 'text-blue-600 dark:text-blue-500'}`} />
                <span className="text-slate-600 dark:text-slate-400">
                  {user?.username} ({isAdmin ? 'Admin' : 'User'})
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={logout}
                className="transition-all duration-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Server Overview */}
        <ServerOverview
          servers={servers}
          onRefresh={handleRefreshServers}
          isRefreshing={isRefreshingServers}
        />

        {/* Admin Panel (Admin Only) */}
        {isAdmin && (
          <AdminPanel
            servers={servers}
            projects={projects}
            onAddServer={addServer}
            onUpdateServer={updateServer}
            onDeleteServer={removeServer}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onDeleteProject={removeProject}
          />
        )}

        {/* Apps Section */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Applications
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by app name or domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {isAdmin && (
                <Button
                  onClick={handleAddApp}
                  className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                  disabled={projects.length === 0 || servers.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add App
                </Button>
              )}
            </div>
          </div>

          {apps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
                <Activity className="h-12 w-12 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-slate-900 dark:text-slate-100 mb-2">No apps yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {isAdmin
                  ? projects.length === 0
                    ? 'Create a project first, then add your first application.'
                    : servers.length === 0
                    ? 'Add a server first, then add your first application.'
                    : 'Add your first application to get started.'
                  : 'No applications have been configured yet. Contact your administrator.'}
              </p>
              {isAdmin && projects.length > 0 && servers.length > 0 && (
                <Button
                  onClick={handleAddApp}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First App
                </Button>
              )}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects available. {isAdmin ? 'Create a project to organize your apps.' : 'Contact your administrator.'}
            </div>
          ) : visibleProjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <h3 className="text-slate-900 dark:text-slate-100 mb-2">No results found</h3>
              <p>No apps found matching "{searchQuery}"</p>
              <p className="mt-2">Try searching by app name, domain, or project name</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <Tabs defaultValue={visibleProjects[0]?.id} className="w-full">
              <TabsList className="mb-4 flex-wrap h-auto">
                {visibleProjects.map((project) => (
                  <TabsTrigger key={project.id} value={project.id}>
                    {project.name}
                    <Badge variant="secondary" className="ml-2">
                      {appsByProject[project.id]?.length || 0}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {visibleProjects.map((project) => (
                <TabsContent key={project.id} value={project.id}>
                  {appsByProject[project.id]?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FolderKanban className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                      <p>No apps in this project yet.</p>
                      {isAdmin && (
                        <Button
                          onClick={handleAddApp}
                          variant="outline"
                          className="mt-4"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add App to {project.name}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {appsByProject[project.id]?.map((app) => (
                        <AppCard
                          key={app.id}
                          app={app}
                          server={servers.find(s => s.id === app.serverId)}
                          project={project}
                          onUpdateApp={updateApp}
                          onStartApp={startApp}
                          onStopApp={stopApp}
                          onEditApp={handleEditApp}
                          isAdmin={isAdmin}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>

      {/* App Management Dialog (Admin Only) */}
      {isAdmin && (
        <AppManagementDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          app={editingApp}
          projects={projects}
          servers={servers}
          onSave={addApp}
          onUpdate={updateApp}
          onDelete={removeApp}
        />
      )}

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
