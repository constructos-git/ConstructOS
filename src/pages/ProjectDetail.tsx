import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  Calendar,
  Building2,
  PoundSterling,
  Target,
  MapPin,
  Mail,
  MessageSquare,
  FileText,
  CheckSquare,
  Flag,
  Settings,
  Folder,
  StickyNote,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Dropdown from '@/components/ui/Dropdown';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useProjectsStore } from '@/stores/projectsStore';
import type { Project } from '@/types/projects';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProject, fetchProject, isLoading } = useProjectsStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id, fetchProject]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-muted-foreground mb-4">Project not found</div>
        <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  const project = selectedProject;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Target },
    { id: 'customer', label: 'Customer Details', icon: Building2 },
    { id: 'emails', label: 'Emails', icon: Mail },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'milestones', label: 'Milestones', icon: Flag },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'automation', label: 'Automation', icon: Settings },
    { id: 'files', label: 'Files', icon: Folder },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <Badge className={cn('text-xs', project.status === 'active' ? 'bg-green-500' : 'bg-gray-500')}>
                {project.status}
              </Badge>
              <Badge variant="outline">{project.priority}</Badge>
            </div>
            {project.reference && (
              <p className="text-muted-foreground mt-1">Reference: {project.reference}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
            items={[
              { label: 'Duplicate Project', onClick: () => {} },
              { label: 'Archive Project', onClick: () => {} },
              { label: 'Delete Project', onClick: () => {}, variant: 'destructive' },
            ]}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} onClick={() => setActiveTab(tab.id)}>
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dashboard' && <ProjectDashboardTab project={project} />}
        {activeTab === 'customer' && <ProjectCustomerTab project={project} />}
        {activeTab === 'emails' && <ProjectEmailsTab project={project} />}
        {activeTab === 'chat' && <ProjectChatTab project={project} />}
        {activeTab === 'schedule' && <ProjectScheduleTab project={project} />}
        {activeTab === 'notes' && <ProjectNotesTab project={project} />}
        {activeTab === 'milestones' && <ProjectMilestonesTab project={project} />}
        {activeTab === 'tasks' && <ProjectTasksTab project={project} />}
        {activeTab === 'automation' && <ProjectAutomationTab project={project} />}
        {activeTab === 'files' && <ProjectFilesTab project={project} />}
      </div>
    </div>
  );
}

// Dashboard Tab Component
function ProjectDashboardTab({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Value</CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.project_value ? `£${project.project_value.toLocaleString()}` : 'N/A'}
            </div>
            {project.budget && (
              <p className="text-xs text-muted-foreground">
                Budget: £{project.budget.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.progress_percentage.toFixed(0)}%</div>
            <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary-500"
                style={{ width: `${project.progress_percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costs to Date</CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{project.costs_to_date.toLocaleString()}</div>
            {project.budget && (
              <p className="text-xs text-muted-foreground">
                {((project.costs_to_date / project.budget) * 100).toFixed(0)}% of budget
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deadline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.end_date ? format(new Date(project.end_date), 'MMM dd') : 'N/A'}
            </div>
            {project.end_date && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(project.end_date), 'yyyy')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.description && (
              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            )}
            {project.type && (
              <div>
                <p className="text-sm font-medium mb-1">Type</p>
                <p className="text-sm text-muted-foreground">{project.type}</p>
              </div>
            )}
            {project.site_town_city && (
              <div>
                <p className="text-sm font-medium mb-1">Location</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {project.site_address_line1 && `${project.site_address_line1}, `}
                  {project.site_town_city}
                  {project.site_postcode && `, ${project.site_postcode}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.client_company?.name && (
              <div>
                <p className="text-sm font-medium mb-1">Client Company</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {project.client_company.name}
                </p>
              </div>
            )}
            {project.client_contact && (
              <div>
                <p className="text-sm font-medium mb-1">Contact</p>
                <p className="text-sm text-muted-foreground">
                  {project.client_contact.first_name} {project.client_contact.last_name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Latest Emails */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No emails yet. Emails will appear here.</div>
        </CardContent>
      </Card>
    </div>
  );
}

// Customer Tab Component
function ProjectCustomerTab({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          {project.client_company ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Company Name</p>
                <p className="text-sm">{project.client_company.name}</p>
              </div>
              {project.client_company.email && (
                <div>
                  <p className="text-sm font-medium mb-1">Email</p>
                  <p className="text-sm">{project.client_company.email}</p>
                </div>
              )}
              {project.client_company.phone && (
                <div>
                  <p className="text-sm font-medium mb-1">Phone</p>
                  <p className="text-sm">{project.client_company.phone}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No customer assigned to this project.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder Tab Components
function ProjectEmailsTab({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Emails</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Email integration coming soon.</div>
      </CardContent>
    </Card>
  );
}

function ProjectChatTab({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Chat integration coming soon.</div>
      </CardContent>
    </Card>
  );
}

function ProjectScheduleTab({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Schedule (Gantt Chart)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Gantt chart integration coming soon.</div>
      </CardContent>
    </Card>
  );
}

function ProjectNotesTab({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Notes integration coming soon.</div>
      </CardContent>
    </Card>
  );
}

function ProjectMilestonesTab({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Milestones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Milestones coming soon.</div>
      </CardContent>
    </Card>
  );
}

function ProjectTasksTab({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Tasks coming soon.</div>
      </CardContent>
    </Card>
  );
}

function ProjectAutomationTab({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Automation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Automation rules coming soon.</div>
      </CardContent>
    </Card>
  );
}

function ProjectFilesTab({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">File management coming soon.</div>
      </CardContent>
    </Card>
  );
}
