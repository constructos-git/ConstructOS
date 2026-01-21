import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { 
  Project, 
  ProjectStatus, 
  ProjectPriority, 
  ProjectType,
  ProjectMetrics,
  ProjectViewType,
  ProjectFilters,
  ProjectSortOptions,
  ProjectMilestone,
  ProjectTask,
  ProjectFile,
  ProjectNote,
  ProjectChatMessage,
  ProjectEmail,
  ProjectScheduleItem
} from '@/types/projects';

interface ProjectsState {
  // State
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  viewType: ProjectViewType;
  filters: ProjectFilters;
  sortOptions: ProjectSortOptions;
  
  // Metrics
  metrics: ProjectMetrics | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'costs_to_date' | 'progress_percentage' | 'completion_percentage' | 'is_template' | 'is_active' | 'currency' | 'site_country' | 'priority' | 'status'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  setViewType: (viewType: ProjectViewType) => void;
  setFilters: (filters: ProjectFilters) => void;
  setSortOptions: (sortOptions: ProjectSortOptions) => void;
  calculateMetrics: () => void;
  
  // Milestones
  fetchMilestones: (projectId: string) => Promise<ProjectMilestone[]>;
  addMilestone: (projectId: string, milestone: Omit<ProjectMilestone, 'id' | 'company_id' | 'project_id' | 'created_at' | 'updated_at' | 'status' | 'progress_percentage' | 'display_order'>) => Promise<ProjectMilestone>;
  updateMilestone: (id: string, updates: Partial<ProjectMilestone>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  
  // Tasks
  fetchTasks: (projectId: string) => Promise<ProjectTask[]>;
  addTask: (projectId: string, task: Omit<ProjectTask, 'id' | 'company_id' | 'project_id' | 'created_at' | 'updated_at' | 'status' | 'priority' | 'progress_percentage' | 'display_order'>) => Promise<ProjectTask>;
  updateTask: (id: string, updates: Partial<ProjectTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Files
  fetchFiles: (projectId: string) => Promise<ProjectFile[]>;
  addFile: (projectId: string, file: Omit<ProjectFile, 'id' | 'company_id' | 'project_id' | 'created_at' | 'updated_at'>) => Promise<ProjectFile>;
  updateFile: (id: string, updates: Partial<ProjectFile>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  
  // Notes
  fetchNotes: (projectId: string) => Promise<ProjectNote[]>;
  addNote: (projectId: string, note: Omit<ProjectNote, 'id' | 'company_id' | 'project_id' | 'created_at' | 'updated_at' | 'is_pinned' | 'color'>) => Promise<ProjectNote>;
  updateNote: (id: string, updates: Partial<ProjectNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Chat Messages
  fetchChatMessages: (projectId: string) => Promise<ProjectChatMessage[]>;
  addChatMessage: (projectId: string, message: Omit<ProjectChatMessage, 'id' | 'company_id' | 'project_id' | 'created_at' | 'updated_at' | 'message_type' | 'is_edited' | 'is_deleted'>) => Promise<ProjectChatMessage>;
  
  // Emails
  fetchEmails: (projectId: string) => Promise<ProjectEmail[]>;
  addEmail: (projectId: string, email: Omit<ProjectEmail, 'id' | 'company_id' | 'project_id' | 'created_at' | 'updated_at' | 'status' | 'direction'>) => Promise<ProjectEmail>;
  
  // Schedule Items
  fetchScheduleItems: (projectId: string) => Promise<ProjectScheduleItem[]>;
  addScheduleItem: (projectId: string, item: Omit<ProjectScheduleItem, 'id' | 'company_id' | 'project_id' | 'created_at' | 'updated_at' | 'item_type' | 'progress_percentage' | 'display_order'>) => Promise<ProjectScheduleItem>;
  updateScheduleItem: (id: string, updates: Partial<ProjectScheduleItem>) => Promise<void>;
  deleteScheduleItem: (id: string) => Promise<void>;
}

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

// Helper to get company_id
const getCompanyId = (): string => {
  return SHARED_COMPANY_ID;
};

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  // Initial State
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  viewType: 'grid',
  filters: {},
  sortOptions: { field: 'updated_at', direction: 'desc' },
  metrics: null,
  
  // Fetch Projects
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const companyId = getCompanyId();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      set({ projects: data || [], isLoading: false });
      get().calculateMetrics();
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch projects', isLoading: false });
    }
  },
  
  // Fetch Single Project
  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const companyId = getCompanyId();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('company_id', companyId)
        .single();
      
      if (error) throw error;
      
      set({ selectedProject: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching project:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch project', isLoading: false });
    }
  },
  
  // Add Project
  addProject: async (projectData) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const newProject: Partial<Project> = {
        ...projectData,
        company_id: companyId,
        costs_to_date: 0,
        progress_percentage: 0,
        completion_percentage: 0,
        is_template: false,
        is_active: true,
        currency: projectData.currency || 'GBP',
        site_country: projectData.site_country || 'United Kingdom',
        priority: projectData.priority || 'medium',
        status: projectData.status || 'planning',
        created_by: user?.id,
        updated_by: user?.id,
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        projects: [data, ...state.projects],
      }));
      
      get().calculateMetrics();
      return data;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  },
  
  // Update Project
  updateProject: async (id: string, updates: Partial<Project>) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? data : p)),
        selectedProject: state.selectedProject?.id === id ? data : state.selectedProject,
      }));
      
      get().calculateMetrics();
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },
  
  // Delete Project
  deleteProject: async (id: string) => {
    try {
      const companyId = getCompanyId();
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);
      
      if (error) throw error;
      
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
      }));
      
      get().calculateMetrics();
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },
  
  // Set Selected Project
  setSelectedProject: (project) => {
    set({ selectedProject: project });
  },
  
  // Set View Type
  setViewType: (viewType) => {
    set({ viewType });
  },
  
  // Set Filters
  setFilters: (filters) => {
    set({ filters });
  },
  
  // Set Sort Options
  setSortOptions: (sortOptions) => {
    set({ sortOptions });
  },
  
  // Calculate Metrics
  calculateMetrics: () => {
    const { projects } = get();
    
    const total = projects.length;
    const active = projects.filter((p) => p.status === 'active').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const onHold = projects.filter((p) => p.status === 'on_hold').length;
    const cancelled = projects.filter((p) => p.status === 'cancelled').length;
    
    const totalValue = projects.reduce((sum, p) => sum + (p.project_value || 0), 0);
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalCosts = projects.reduce((sum, p) => sum + p.costs_to_date, 0);
    const averageProgress = total > 0 
      ? projects.reduce((sum, p) => sum + p.progress_percentage, 0) / total 
      : 0;
    
    const now = new Date();
    const overdueProjects = projects.filter((p) => {
      if (!p.end_date || p.status === 'completed' || p.status === 'cancelled') return false;
      return new Date(p.end_date) < now;
    }).length;
    
    const upcomingDeadlines = projects.filter((p) => {
      if (!p.end_date || p.status === 'completed' || p.status === 'cancelled') return false;
      const daysUntil = Math.ceil((new Date(p.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil > 0 && daysUntil <= 7;
    }).length;
    
    const byStatus: Record<ProjectStatus, { count: number; value: number }> = {
      planning: { count: 0, value: 0 },
      active: { count: 0, value: 0 },
      on_hold: { count: 0, value: 0 },
      completed: { count: 0, value: 0 },
      cancelled: { count: 0, value: 0 },
      archived: { count: 0, value: 0 },
    };
    
    const byPriority: Record<ProjectPriority, { count: number; value: number }> = {
      low: { count: 0, value: 0 },
      medium: { count: 0, value: 0 },
      high: { count: 0, value: 0 },
      urgent: { count: 0, value: 0 },
    };
    
    const byType: Record<string, { count: number; value: number }> = {};
    
    projects.forEach((p) => {
      byStatus[p.status].count++;
      byStatus[p.status].value += p.project_value || 0;
      
      byPriority[p.priority].count++;
      byPriority[p.priority].value += p.project_value || 0;
      
      const type = p.type || 'other';
      if (!byType[type]) {
        byType[type] = { count: 0, value: 0 };
      }
      byType[type].count++;
      byType[type].value += p.project_value || 0;
    });
    
    set({
      metrics: {
        total,
        active,
        completed,
        onHold,
        cancelled,
        totalValue,
        totalBudget,
        totalCosts,
        averageProgress,
        overdueProjects,
        upcomingDeadlines,
        byStatus,
        byPriority,
        byType,
      },
    });
  },
  
  // Milestones
  fetchMilestones: async (projectId: string) => {
    try {
      const companyId = getCompanyId();
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .eq('company_id', companyId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching milestones:', error);
      throw error;
    }
  },
  
  addMilestone: async (projectId: string, milestoneData) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('project_milestones')
        .insert({
          ...milestoneData,
          company_id: companyId,
          project_id: projectId,
          status: 'pending',
          progress_percentage: 0,
          display_order: 0,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding milestone:', error);
      throw error;
    }
  },
  
  updateMilestone: async (id: string, updates: Partial<ProjectMilestone>) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('project_milestones')
        .update({
          ...updates,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  },
  
  deleteMilestone: async (id: string) => {
    try {
      const companyId = getCompanyId();
      const { error } = await supabase
        .from('project_milestones')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw error;
    }
  },
  
  // Tasks
  fetchTasks: async (projectId: string) => {
    try {
      const companyId = getCompanyId();
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('company_id', companyId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },
  
  addTask: async (projectId: string, taskData) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('project_tasks')
        .insert({
          ...taskData,
          company_id: companyId,
          project_id: projectId,
          status: 'todo',
          priority: 'medium',
          progress_percentage: 0,
          display_order: 0,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },
  
  updateTask: async (id: string, updates: Partial<ProjectTask>) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('project_tasks')
        .update({
          ...updates,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },
  
  deleteTask: async (id: string) => {
    try {
      const companyId = getCompanyId();
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
  
  // Files
  fetchFiles: async (projectId: string) => {
    try {
      const companyId = getCompanyId();
      const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },
  
  addFile: async (projectId: string, fileData) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('project_files')
        .insert({
          ...fileData,
          company_id: companyId,
          project_id: projectId,
          uploaded_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding file:', error);
      throw error;
    }
  },
  
  updateFile: async (id: string, updates: Partial<ProjectFile>) => {
    try {
      const companyId = getCompanyId();
      const { data, error } = await supabase
        .from('project_files')
        .update(updates)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  },
  
  deleteFile: async (id: string) => {
    try {
      const companyId = getCompanyId();
      const { error } = await supabase
        .from('project_files')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
  
  // Notes
  fetchNotes: async (projectId: string) => {
    try {
      const companyId = getCompanyId();
      const { data, error } = await supabase
        .from('project_notes')
        .select('*')
        .eq('project_id', projectId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },
  
  addNote: async (projectId: string, noteData) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('project_notes')
        .insert({
          ...noteData,
          company_id: companyId,
          project_id: projectId,
          is_pinned: false,
          color: 'yellow',
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },
  
  updateNote: async (id: string, updates: Partial<ProjectNote>) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('project_notes')
        .update({
          ...updates,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },
  
  deleteNote: async (id: string) => {
    try {
      const companyId = getCompanyId();
      const { error } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },
  
  // Chat Messages
  fetchChatMessages: async (projectId: string) => {
    try {
      const companyId = getCompanyId();
      const { data, error } = await supabase
        .from('project_chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .eq('company_id', companyId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  },
  
  addChatMessage: async (projectId: string, messageData) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('project_chat_messages')
        .insert({
          ...messageData,
          company_id: companyId,
          project_id: projectId,
          message_type: 'text',
          is_edited: false,
          is_deleted: false,
          sender_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding chat message:', error);
      throw error;
    }
  },
  
  // Emails
  fetchEmails: async (projectId: string) => {
    try {
      const companyId = getCompanyId();
      const { data, error } = await supabase
        .from('project_emails')
        .select('*')
        .eq('project_id', projectId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  },
  
  addEmail: async (projectId: string, emailData) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('project_emails')
        .insert({
          ...emailData,
          company_id: companyId,
          project_id: projectId,
          status: 'draft',
          direction: 'outbound',
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding email:', error);
      throw error;
    }
  },
  
  // Schedule Items
  fetchScheduleItems: async (projectId: string) => {
    try {
      const companyId = getCompanyId();
      const { data, error } = await supabase
        .from('project_schedule_items')
        .select('*')
        .eq('project_id', projectId)
        .eq('company_id', companyId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching schedule items:', error);
      throw error;
    }
  },
  
  addScheduleItem: async (projectId: string, itemData) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('project_schedule_items')
        .insert({
          ...itemData,
          company_id: companyId,
          project_id: projectId,
          item_type: 'task',
          progress_percentage: 0,
          display_order: 0,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding schedule item:', error);
      throw error;
    }
  },
  
  updateScheduleItem: async (id: string, updates: Partial<ProjectScheduleItem>) => {
    try {
      const companyId = getCompanyId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('project_schedule_items')
        .update({
          ...updates,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating schedule item:', error);
      throw error;
    }
  },
  
  deleteScheduleItem: async (id: string) => {
    try {
      const companyId = getCompanyId();
      const { error } = await supabase
        .from('project_schedule_items')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      throw error;
    }
  },
}));
