// Settings hook for Estimate Builder AI

import { useState, useEffect, useCallback } from 'react';

export interface EstimateBuilderSettings {
  autoScrollToNextSection: boolean;
  // Add more settings here as needed
}

const DEFAULT_SETTINGS: EstimateBuilderSettings = {
  autoScrollToNextSection: true, // Default DISABLED (true = disabled, false = enabled)
};

const SETTINGS_STORAGE_KEY = 'estimate-builder-ai-settings';

export function useEstimateBuilderSettings() {
  const [settings, setSettings] = useState<EstimateBuilderSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount and when storage changes
  const loadSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as EstimateBuilderSettings;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings(DEFAULT_SETTINGS);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    
    // Listen for storage changes (e.g., from another tab or when settings are updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) {
        loadSettings();
      }
    };
    
    // Listen for custom settings-updated event (for same-tab updates)
    const handleSettingsUpdate = () => {
      loadSettings();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, [loadSettings]);

  // Save settings to localStorage whenever they change
  const updateSettings = useCallback((newSettings: Partial<EstimateBuilderSettings>) => {
    setSettings((currentSettings) => {
      const updated = { ...DEFAULT_SETTINGS, ...currentSettings, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
        // Debug: log what we're saving
        if (process.env.NODE_ENV === 'development') {
          console.log('[Settings] Saving:', updated);
        }
        // Trigger a custom event to notify other components
        window.dispatchEvent(new Event('settings-updated'));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
      return updated;
    });
  }, []);

  return {
    settings,
    updateSettings,
    isLoaded,
  };
}
