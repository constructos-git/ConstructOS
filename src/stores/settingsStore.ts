import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

// Settings Types
export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;
}

export interface AccountSettings {
  displayName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  language: string;
  profilePicture?: string;
}

export interface GeneralSettings {
  companyName: string;
  companyLogo?: string;
  defaultCurrency: string;
  defaultCountry: string;
  fiscalYearStart: string; // MM-DD format
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  autoSave: boolean;
  autoSaveInterval: number; // seconds
  sessionTimeout: number; // minutes
  defaultView: 'dashboard' | 'projects' | 'opportunities';
  itemsPerPage: number;
  enableNotifications: boolean;
  enableSounds: boolean;
  enableKeyboardShortcuts: boolean;
}

export interface IntegrationSettings {
  googleDrive: {
    enabled: boolean;
    clientId?: string;
    accessToken?: string;
  };
  xero: {
    enabled: boolean;
    clientId?: string;
    accessToken?: string;
    tenantId?: string;
  };
  quickbooks: {
    enabled: boolean;
    clientId?: string;
    accessToken?: string;
  };
  slack: {
    enabled: boolean;
    webhookUrl?: string;
    channel?: string;
  };
  zapier: {
    enabled: boolean;
    apiKey?: string;
  };
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEncryption: 'none' | 'tls' | 'ssl';
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  signature?: string;
  defaultSubjectPrefix?: string;
  autoBcc?: string;
  trackOpens: boolean;
  trackClicks: boolean;
}

export interface FinancialSettings {
  defaultVatRate: number;
  defaultCurrency: string;
  invoiceNumbering: 'sequential' | 'date-based' | 'custom';
  invoicePrefix?: string;
  estimateNumbering: 'sequential' | 'date-based' | 'custom';
  estimatePrefix?: string;
  paymentTerms: number; // days
  lateFeePercentage?: number;
  lateFeeFlat?: number;
  taxYearEnd: string; // MM-DD format
  accountingMethod: 'cash' | 'accrual';
  defaultPaymentMethod?: string;
  invoiceDueDateCalculation: 'days' | 'end-of-month' | 'custom';
  autoSendInvoices: boolean;
  autoSendEstimates: boolean;
}

export interface ProjectSettings {
  defaultProjectStatus: string;
  defaultProjectPriority: string;
  autoCreateTasks: boolean;
  taskReminders: boolean;
  taskReminderDays: number;
  milestoneReminders: boolean;
  milestoneReminderDays: number;
  defaultProjectTemplate?: string;
  enableGanttChart: boolean;
  enableTimeTracking: boolean;
  enableExpenseTracking: boolean;
  defaultProjectCurrency: string;
  projectNumbering: 'sequential' | 'date-based' | 'custom';
  projectPrefix?: string;
  autoArchiveCompleted: boolean;
  archiveAfterDays: number;
}

export interface ChatSettings {
  enableChat: boolean;
  enableNotifications: boolean;
  notificationSound: boolean;
  showOnlineStatus: boolean;
  enableReadReceipts: boolean;
  enableTypingIndicators: boolean;
  messageRetentionDays: number;
  enableFileSharing: boolean;
  maxFileSize: number; // MB
  allowedFileTypes: string[];
  enableVoiceMessages: boolean;
  enableVideoCalls: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  browserNotifications: boolean;
  notifyOnNewMessage: boolean;
  notifyOnNewEmail: boolean;
  notifyOnNewOpportunity: boolean;
  notifyOnNewProject: boolean;
  notifyOnTaskAssigned: boolean;
  notifyOnTaskDue: boolean;
  notifyOnMilestone: boolean;
  notifyOnInvoiceSent: boolean;
  notifyOnPaymentReceived: boolean;
  notifyOnEstimateAccepted: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string; // HH:mm format
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number; // minutes
  requirePasswordChange: number; // days
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecial: boolean;
  loginAttempts: number;
  lockoutDuration: number; // minutes
  enableAuditLog: boolean;
  enableIpWhitelist: boolean;
  ipWhitelist?: string[];
}

export interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime?: string; // HH:mm format
  backupRetention: number; // days
  backupLocation: 'local' | 'cloud' | 'both';
  cloudProvider?: 'google' | 'dropbox' | 'onedrive';
  lastBackup?: Date;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  enableApi: boolean;
  apiRateLimit: number;
  maxFileUploadSize: number; // MB
  allowedFileTypes: string[];
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface AllSettings {
  appearance: AppearanceSettings;
  account: AccountSettings;
  general: GeneralSettings;
  integrations: IntegrationSettings;
  email: EmailSettings;
  financial: FinancialSettings;
  project: ProjectSettings;
  chat: ChatSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  backup: BackupSettings;
  system: SystemSettings;
}

// Default Settings
const defaultAppearance: AppearanceSettings = {
  theme: 'auto',
  fontSize: 'medium',
  compactMode: false,
  sidebarCollapsed: false,
  animationsEnabled: true,
  reducedMotion: false,
};

const defaultAccount: AccountSettings = {
  displayName: '',
  email: '',
  phone: '',
  jobTitle: '',
  department: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  language: 'en-GB',
};

const defaultGeneral: GeneralSettings = {
  companyName: '',
  defaultCurrency: 'GBP',
  defaultCountry: 'United Kingdom',
  fiscalYearStart: '04-01',
  weekStartsOn: 1,
  autoSave: true,
  autoSaveInterval: 30,
  sessionTimeout: 60,
  defaultView: 'dashboard',
  itemsPerPage: 25,
  enableNotifications: true,
  enableSounds: true,
  enableKeyboardShortcuts: true,
};

const defaultIntegrations: IntegrationSettings = {
  googleDrive: { enabled: false },
  xero: { enabled: false },
  quickbooks: { enabled: false },
  slack: { enabled: false },
  zapier: { enabled: false },
};

const defaultEmail: EmailSettings = {
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  smtpEncryption: 'tls',
  fromName: '',
  fromEmail: '',
  replyToEmail: '',
  signature: '',
  defaultSubjectPrefix: '',
  autoBcc: '',
  trackOpens: true,
  trackClicks: true,
};

const defaultFinancial: FinancialSettings = {
  defaultVatRate: 20,
  defaultCurrency: 'GBP',
  invoiceNumbering: 'sequential',
  invoicePrefix: 'INV',
  estimateNumbering: 'sequential',
  estimatePrefix: 'EST',
  paymentTerms: 30,
  lateFeePercentage: 0,
  lateFeeFlat: 0,
  taxYearEnd: '03-31',
  accountingMethod: 'accrual',
  defaultPaymentMethod: '',
  invoiceDueDateCalculation: 'days',
  autoSendInvoices: false,
  autoSendEstimates: false,
};

const defaultProject: ProjectSettings = {
  defaultProjectStatus: 'planning',
  defaultProjectPriority: 'medium',
  autoCreateTasks: false,
  taskReminders: true,
  taskReminderDays: 1,
  milestoneReminders: true,
  milestoneReminderDays: 7,
  defaultProjectTemplate: '',
  enableGanttChart: true,
  enableTimeTracking: true,
  enableExpenseTracking: true,
  defaultProjectCurrency: 'GBP',
  projectNumbering: 'sequential',
  projectPrefix: 'PROJ',
  autoArchiveCompleted: false,
  archiveAfterDays: 90,
};

const defaultChat: ChatSettings = {
  enableChat: true,
  enableNotifications: true,
  notificationSound: true,
  showOnlineStatus: true,
  enableReadReceipts: true,
  enableTypingIndicators: true,
  messageRetentionDays: 365,
  enableFileSharing: true,
  maxFileSize: 50,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'gif'],
  enableVoiceMessages: false,
  enableVideoCalls: false,
};

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  browserNotifications: true,
  notifyOnNewMessage: true,
  notifyOnNewEmail: true,
  notifyOnNewOpportunity: true,
  notifyOnNewProject: true,
  notifyOnTaskAssigned: true,
  notifyOnTaskDue: true,
  notifyOnMilestone: true,
  notifyOnInvoiceSent: true,
  notifyOnPaymentReceived: true,
  notifyOnEstimateAccepted: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

const defaultSecurity: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: 60,
  requirePasswordChange: 90,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecial: true,
  loginAttempts: 5,
  lockoutDuration: 15,
  enableAuditLog: true,
  enableIpWhitelist: false,
  ipWhitelist: [],
};

const defaultBackup: BackupSettings = {
  autoBackup: true,
  backupFrequency: 'daily',
  backupTime: '02:00',
  backupRetention: 30,
  backupLocation: 'cloud',
  cloudProvider: 'google',
};

const defaultSystem: SystemSettings = {
  maintenanceMode: false,
  allowUserRegistration: false,
  requireEmailVerification: true,
  enableApi: false,
  apiRateLimit: 1000,
  maxFileUploadSize: 100,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'gif', 'zip'],
  enableAnalytics: true,
  enableErrorReporting: true,
  logLevel: 'info',
};

interface SettingsState {
  // Settings
  appearance: AppearanceSettings;
  account: AccountSettings;
  general: GeneralSettings;
  integrations: IntegrationSettings;
  email: EmailSettings;
  financial: FinancialSettings;
  project: ProjectSettings;
  chat: ChatSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  backup: BackupSettings;
  system: SystemSettings;
  
  // State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaved?: Date;
  
  // Actions
  updateAppearance: (settings: Partial<AppearanceSettings>) => Promise<void>;
  updateAccount: (settings: Partial<AccountSettings>) => Promise<void>;
  updateGeneral: (settings: Partial<GeneralSettings>) => Promise<void>;
  updateIntegrations: (settings: Partial<IntegrationSettings>) => Promise<void>;
  updateEmail: (settings: Partial<EmailSettings>) => Promise<void>;
  updateFinancial: (settings: Partial<FinancialSettings>) => Promise<void>;
  updateProject: (settings: Partial<ProjectSettings>) => Promise<void>;
  updateChat: (settings: Partial<ChatSettings>) => Promise<void>;
  updateNotifications: (settings: Partial<NotificationSettings>) => Promise<void>;
  updateSecurity: (settings: Partial<SecuritySettings>) => Promise<void>;
  updateBackup: (settings: Partial<BackupSettings>) => Promise<void>;
  updateSystem: (settings: Partial<SystemSettings>) => Promise<void>;
  
  // Bulk operations
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  resetSettings: (category?: keyof AllSettings) => void;
  exportSettings: () => string;
  importSettings: (json: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      appearance: defaultAppearance,
      account: defaultAccount,
      general: defaultGeneral,
      integrations: defaultIntegrations,
      email: defaultEmail,
      financial: defaultFinancial,
      project: defaultProject,
      chat: defaultChat,
      notifications: defaultNotifications,
      security: defaultSecurity,
      backup: defaultBackup,
      system: defaultSystem,
      
      isLoading: false,
      isSaving: false,
      error: null,
      
      // Update functions
      updateAppearance: async (settings) => {
        set((state) => ({
          appearance: { ...state.appearance, ...settings },
        }));
        await get().saveSettings();
      },
      
      updateAccount: async (settings) => {
        set((state) => ({
          account: { ...state.account, ...settings },
        }));
        await get().saveSettings();
      },
      
      updateGeneral: async (settings) => {
        set((state) => ({
          general: { ...state.general, ...settings },
        }));
        await get().saveSettings();
      },
      
      updateIntegrations: async (settings) => {
        set((state) => ({
          integrations: { ...state.integrations, ...settings },
        }));
        await get().saveSettings();
      },
      
      updateEmail: async (settings) => {
        set((state) => ({
          email: { ...state.email, ...settings },
        }));
        await get().saveSettings();
      },
      
      updateFinancial: async (settings) => {
        set((state) => ({
          financial: { ...state.financial, ...settings },
        }));
        await get().saveSettings();
      },
      
      updateProject: async (settings) => {
        set((state) => ({
          project: { ...state.project, ...settings },
        }));
        await get().saveSettings();
      },
      
      updateChat: async (settings) => {
        set((state) => ({
          chat: { ...state.chat, ...settings },
        }));
        await get().saveSettings();
      },
      
      updateNotifications: async (settings) => {
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        }));
        await get().saveSettings();
      },
      
      updateSecurity: async (settings) => {
        set((state) => ({
          security: { ...state.security, ...settings },
        }));
        await get().saveSettings();
      },
      
      updateBackup: async (settings) => {
        set((state) => ({
          backup: { ...state.backup, ...settings },
        }));
        await get().saveSettings();
      },
      
      updateSystem: async (settings) => {
        set((state) => ({
          system: { ...state.system, ...settings },
        }));
        await get().saveSettings();
      },
      
      // Load settings from database
      loadSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isLoading: false });
            return;
          }
          
          // In the future, load from database
          // For now, settings are persisted in localStorage via persist middleware
          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to load settings:', error);
          set({ error: 'Failed to load settings', isLoading: false });
        }
      },
      
      // Save settings to database
      saveSettings: async () => {
        set({ isSaving: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isSaving: false });
            return;
          }
          
          const state = get();
          // In the future, save to database
          // For now, settings are persisted in localStorage via persist middleware
          
          set({ 
            isSaving: false, 
            lastSaved: new Date(),
            error: null 
          });
        } catch (error) {
          console.error('Failed to save settings:', error);
          set({ 
            error: 'Failed to save settings', 
            isSaving: false 
          });
        }
      },
      
      // Reset settings
      resetSettings: (category) => {
        if (category) {
          const defaults: Record<keyof AllSettings, any> = {
            appearance: defaultAppearance,
            account: defaultAccount,
            general: defaultGeneral,
            integrations: defaultIntegrations,
            email: defaultEmail,
            financial: defaultFinancial,
            project: defaultProject,
            chat: defaultChat,
            notifications: defaultNotifications,
            security: defaultSecurity,
            backup: defaultBackup,
            system: defaultSystem,
          };
          set({ [category]: defaults[category] });
        } else {
          set({
            appearance: defaultAppearance,
            account: defaultAccount,
            general: defaultGeneral,
            integrations: defaultIntegrations,
            email: defaultEmail,
            financial: defaultFinancial,
            project: defaultProject,
            chat: defaultChat,
            notifications: defaultNotifications,
            security: defaultSecurity,
            backup: defaultBackup,
            system: defaultSystem,
          });
        }
      },
      
      // Export settings
      exportSettings: () => {
        const state = get();
        return JSON.stringify({
          appearance: state.appearance,
          account: state.account,
          general: state.general,
          integrations: state.integrations,
          email: state.email,
          financial: state.financial,
          project: state.project,
          chat: state.chat,
          notifications: state.notifications,
          security: state.security,
          backup: state.backup,
          system: state.system,
        }, null, 2);
      },
      
      // Import settings
      importSettings: async (json) => {
        try {
          const imported = JSON.parse(json);
          set({
            appearance: { ...defaultAppearance, ...imported.appearance },
            account: { ...defaultAccount, ...imported.account },
            general: { ...defaultGeneral, ...imported.general },
            integrations: { ...defaultIntegrations, ...imported.integrations },
            email: { ...defaultEmail, ...imported.email },
            financial: { ...defaultFinancial, ...imported.financial },
            project: { ...defaultProject, ...imported.project },
            chat: { ...defaultChat, ...imported.chat },
            notifications: { ...defaultNotifications, ...imported.notifications },
            security: { ...defaultSecurity, ...imported.security },
            backup: { ...defaultBackup, ...imported.backup },
            system: { ...defaultSystem, ...imported.system },
          });
          await get().saveSettings();
        } catch (error) {
          console.error('Failed to import settings:', error);
          throw new Error('Invalid settings file');
        }
      },
    }),
    {
      name: 'constructos-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        appearance: state.appearance,
        account: state.account,
        general: state.general,
        integrations: state.integrations,
        email: state.email,
        financial: state.financial,
        project: state.project,
        chat: state.chat,
        notifications: state.notifications,
        security: state.security,
        backup: state.backup,
        system: state.system,
      }),
    }
  )
);
