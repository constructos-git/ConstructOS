import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Clock,
  PoundSterling,
  Target,
  Calendar,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectForm from '@/components/projects/ProjectForm';
import ProjectViewSwitcher from '@/components/projects/ProjectViewSwitcher';
import GenericKanbanBoard, { type GenericKanbanColumn } from '@/components/kanban/GenericKanbanBoard';
import GenericKanbanSettings, { type GenericKanbanSettings as GenericKanbanSettingsType } from '@/components/kanban/GenericKanbanSettings';
import { useProjectsStore } from '@/stores/projectsStore';
import type { Project, ProjectStatus, ProjectPriority, ProjectViewType } from '@/types/projects';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Projects() {
  const navigate = useNavigate();
  const {
    projects,
    isLoading,
    error,
    viewType,
    filters,
    sortOptions,
    metrics,
    fetchProjects,
    updateProject,
    setViewType,
    setFilters,
    setSortOptions,
    deleteProject,
    calculateMetrics,
  } = useProjectsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isKanbanSettingsOpen, setIsKanbanSettingsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [viewingProject, setViewingProject] = useState<Project | undefined>();
  const kanbanScrollRef = useRef<HTMLDivElement>(null);
  const [scrollDirection, setScrollDirection] = useState<'left' | 'right' | null>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  const [kanbanSettings, setKanbanSettings] = useState<GenericKanbanSettingsType>({
    autoScroll: true,
    cardWidth: 320,
    showMetrics: true,
  });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Auto-scroll on hover for Kanban
  useEffect(() => {
    const container = kanbanScrollRef.current;
    if (!container || !scrollDirection) {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      return;
    }

    const scrollSpeed = 8; // pixels per frame
    let lastTime = performance.now();

    const scroll = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Smooth scrolling based on frame time
      const pixelsToScroll = (scrollSpeed * deltaTime) / 16; // Normalize to 60fps
      
      if (scrollDirection === 'left') {
        container.scrollLeft = Math.max(0, container.scrollLeft - pixelsToScroll);
      } else if (scrollDirection === 'right') {
        const maxScroll = container.scrollWidth - container.clientWidth;
        container.scrollLeft = Math.min(maxScroll, container.scrollLeft + pixelsToScroll);
      }

      scrollIntervalRef.current = requestAnimationFrame(scroll);
    };

    scrollIntervalRef.current = requestAnimationFrame(scroll);

    return () => {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [scrollDirection]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.reference?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.client_company?.name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((p) => filters.status!.includes(p.status));
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter((p) => filters.priority!.includes(p.priority));
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((p) => p.type && filters.type!.includes(p.type));
    }

    // Client filter
    if (filters.clientCompanyId) {
      filtered = filtered.filter((p) => p.client_company_id === filters.clientCompanyId);
    }

    // Sort
    filtered.sort((a, b) => {
      const { field, direction } = sortOptions;
      let aValue: any = a[field as keyof Project];
      let bValue: any = b[field as keyof Project];

      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [projects, searchQuery, filters, sortOptions]);

  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleSaveProject = async (data: Partial<Project>) => {
    try {
      if (editingProject) {
        await useProjectsStore.getState().updateProject(editingProject.id, data);
      } else {
        await useProjectsStore.getState().addProject(data as any);
      }
      setIsFormOpen(false);
      setEditingProject(undefined);
      await fetchProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  };

  // Convert projects to Kanban columns
  const kanbanColumns = useMemo<GenericKanbanColumn<Project>[]>(() => {
    const statuses: ProjectStatus[] = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];
    const statusLabels: Record<ProjectStatus, string> = {
      planning: 'Planning',
      active: 'Active',
      on_hold: 'On Hold',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    return statuses.map((status) => ({
      id: status,
      title: statusLabels[status],
      items: filteredAndSortedProjects.filter((p) => p.status === status),
    }));
  }, [filteredAndSortedProjects]);

  const defaultProjectCardColor = (status: string): string => {
    const colors: Record<ProjectStatus, string> = {
      planning: '#6b7280',
      active: '#22c55e',
      on_hold: '#eab308',
      completed: '#3b82f6',
      cancelled: '#ef4444',
    };
    return colors[status as ProjectStatus] || '#6b7280';
  };

  const handleMoveProject = async (projectId: string, newStatus: string, newPosition: number) => {
    try {
      await updateProject(projectId, { status: newStatus as ProjectStatus });
      await fetchProjects(); // Refresh to get updated order
    } catch (error) {
      console.error('Error moving project:', error);
    }
  };

  // Render Kanban View
  const renderKanbanView = () => {
    return (
      <div className="relative">
        {/* Left Scroll Arrow */}
        <button
          type="button"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-background transition-colors"
          onMouseEnter={(e) => {
            e.stopPropagation();
            setScrollDirection('left');
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            setScrollDirection(null);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Right Scroll Arrow */}
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-background transition-colors"
          onMouseEnter={(e) => {
            e.stopPropagation();
            setScrollDirection('right');
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            setScrollDirection(null);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div 
          ref={kanbanScrollRef}
          className="border rounded-lg bg-muted/20 h-[calc(100vh-24rem)] scrollbar-thin overflow-x-auto overflow-y-auto"
          style={{ width: '100%' }}
        >
          <GenericKanbanBoard
            columns={kanbanColumns}
            onMoveItem={handleMoveProject}
            onEditItem={handleEditProject}
            onDeleteItem={(project) => handleDeleteProject(project.id)}
            onViewItem={handleViewProject}
            onAddItem={(columnId) => {
              setEditingProject(undefined);
              setIsFormOpen(true);
            }}
            renderCard={(project, dragHandleProps) => (
              <ProjectCard
                project={project}
                onView={handleViewProject}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                dragHandleProps={dragHandleProps}
              />
            )}
            getItemId={(project) => project.id}
            defaultCardColor={defaultProjectCardColor}
            emptyColumnMessage="Drop projects here"
            columnWidth={320}
          />
        </div>
      </div>
    );
  };

  // Render Grid View
  const renderGridView = () => {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAndSortedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onView={handleViewProject}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        ))}
      </div>
    );
  };

  // Render List View
  const renderListView = () => {
    return (
      <div className="space-y-2">
        {filteredAndSortedProjects.map((project) => (
          <Card
            key={project.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleViewProject(project)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <Badge className={cn('text-xs', project.status === 'active' ? 'bg-green-500' : 'bg-gray-500')}>
                      {project.status}
                    </Badge>
                    <Badge variant="outline">{project.priority}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {project.reference && <span>Ref: {project.reference}</span>}
                    {project.client_company?.name && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {project.client_company.name}
                      </span>
                    )}
                    {project.project_value && (
                      <span className="flex items-center gap-1">
                        <PoundSterling className="h-4 w-4" />
                        £{project.project_value.toLocaleString()}
                      </span>
                    )}
                    {project.end_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(project.end_date), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-semibold">{project.progress_percentage.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Progress</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render Table View
  const renderTableView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-semibold">Name</th>
              <th className="text-left p-3 font-semibold">Reference</th>
              <th className="text-left p-3 font-semibold">Client</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">Priority</th>
              <th className="text-left p-3 font-semibold">Value</th>
              <th className="text-left p-3 font-semibold">Progress</th>
              <th className="text-left p-3 font-semibold">Deadline</th>
              <th className="text-left p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProjects.map((project) => (
              <tr
                key={project.id}
                className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleViewProject(project)}
              >
                <td className="p-3 font-medium">{project.name}</td>
                <td className="p-3 text-sm text-muted-foreground">{project.reference || '-'}</td>
                <td className="p-3 text-sm">{project.client_company?.name || '-'}</td>
                <td className="p-3">
                  <Badge className={cn('text-xs', project.status === 'active' ? 'bg-green-500' : 'bg-gray-500')}>
                    {project.status}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge variant="outline">{project.priority}</Badge>
                </td>
                <td className="p-3">
                  {project.project_value ? `£${project.project_value.toLocaleString()}` : '-'}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500"
                        style={{ width: `${project.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm w-12 text-right">{project.progress_percentage.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="p-3 text-sm">
                  {project.end_date ? format(new Date(project.end_date), 'MMM dd, yyyy') : '-'}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render Detail View (similar to list but with more details)
  const renderDetailView = () => {
    return renderListView(); // For now, use list view
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Full project lifecycle tracking with tabs, notes, and collaboration.
          </p>
        </div>
        <div className="flex gap-2">
          {viewType === 'kanban' && (
            <Button variant="outline" onClick={() => setIsKanbanSettingsOpen(true)} size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Board Settings
            </Button>
          )}
          <Button onClick={() => setIsFormOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/10 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <div className="rounded-full bg-gradient-to-br from-green-500 to-teal-500 p-2">
                <FolderKanban className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 font-semibold">{metrics.active}</span> active
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-accent-500/10 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <div className="rounded-full bg-gradient-to-br from-teal-500 to-accent-500 p-2">
                <PoundSterling className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">£{metrics.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Budget: £{metrics.totalBudget.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 via-purple-500/10 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <div className="rounded-full bg-gradient-to-br from-accent-500 to-purple-500 p-2">
                <Target className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">{metrics.averageProgress.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent-600 font-semibold">{metrics.completed}</span> completed
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
              <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-2">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">{metrics.upcomingDeadlines}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600 font-semibold">{metrics.overdueProjects}</span> overdue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and View Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.status?.[0] || 'all'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    status: value === 'all' ? undefined : [value as ProjectStatus],
                  });
                }}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'planning', label: 'Planning' },
                  { value: 'active', label: 'Active' },
                  { value: 'on_hold', label: 'On Hold' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
              <Select
                value={sortOptions.field}
                onChange={(e) => {
                  setSortOptions({
                    ...sortOptions,
                    field: e.target.value as any,
                  });
                }}
                options={[
                  { value: 'updated_at', label: 'Sort by Updated' },
                  { value: 'name', label: 'Sort by Name' },
                  { value: 'status', label: 'Sort by Status' },
                  { value: 'project_value', label: 'Sort by Value' },
                  { value: 'progress_percentage', label: 'Sort by Progress' },
                  { value: 'end_date', label: 'Sort by Deadline' },
                ]}
              />
            </div>
            <ProjectViewSwitcher viewType={viewType} onViewChange={setViewType} />
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center text-red-600">
            Error: {error}
          </CardContent>
        </Card>
      ) : filteredAndSortedProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery ? 'No projects found matching your search.' : 'No projects yet. Create your first project to get started.'}
          </CardContent>
        </Card>
      ) : (
        <>
          {viewType === 'kanban' && renderKanbanView()}
          {viewType === 'grid' && renderGridView()}
          {viewType === 'list' && renderListView()}
          {viewType === 'table' && renderTableView()}
          {viewType === 'detail' && renderDetailView()}
        </>
      )}

      {/* Project Form Modal */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProject(undefined);
          }}
          title={editingProject ? 'Edit Project' : 'New Project'}
          size="xl"
        >
          <ProjectForm
            project={editingProject}
            onSave={handleSaveProject}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingProject(undefined);
            }}
          />
        </Modal>
      )}

      {/* Kanban Settings Modal */}
      <GenericKanbanSettings
        isOpen={isKanbanSettingsOpen}
        onClose={() => setIsKanbanSettingsOpen(false)}
        onSave={(settings) => {
          setKanbanSettings(settings);
        }}
        currentSettings={kanbanSettings}
        title="Project Kanban Settings"
      />
    </div>
  );
}
