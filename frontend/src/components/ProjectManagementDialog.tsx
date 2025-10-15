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
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Project } from '../types/app';
import { Trash2, FolderKanban } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProjectManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSave: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onDelete: (id: string) => void;
}

export function ProjectManagementDialog({
  open,
  onOpenChange,
  project,
  onSave,
  onUpdate,
  onDelete,
}: ProjectManagementDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error('Project name is required');
      return;
    }

    const projectData = {
      name,
      description: description || undefined,
    };

    if (project) {
      onUpdate(project.id, projectData);
      toast.success('Project updated successfully');
    } else {
      onSave(projectData);
      toast.success('Project created successfully');
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (project) {
      onDelete(project.id);
      toast.success('Project deleted successfully');
      setShowDeleteDialog(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              {project ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
            <DialogDescription>
              {project
                ? 'Update the project details below.'
                : 'Create a new project to organize your applications.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="QMS"
                  required
                />
                <p className="text-muted-foreground">
                  A unique name for the project (e.g., QMS, EBMR, CRM)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Quality Management System applications"
                  rows={3}
                />
                <p className="text-muted-foreground">
                  Brief description of what this project contains
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              {project && (
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
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {project ? 'Update' : 'Create'} Project
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
              This will permanently delete "{project?.name}". All apps in this project will need to be reassigned to another project.
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
