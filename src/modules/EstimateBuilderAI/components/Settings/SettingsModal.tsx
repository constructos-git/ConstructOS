// Settings Modal for Estimate Builder AI

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useEstimateBuilderSettings, type EstimateBuilderSettings } from '../../hooks/useEstimateBuilderSettings';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings, isLoaded } = useEstimateBuilderSettings();
  const [localSettings, setLocalSettings] = useState<EstimateBuilderSettings>(settings);

  // Sync local settings when loaded settings change
  useEffect(() => {
    if (isLoaded) {
      setLocalSettings(settings);
    }
  }, [settings, isLoaded]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Save the setting: true = disabled, false = enabled
    // The checkbox value directly represents "disabled" state
    const settingsToSave: EstimateBuilderSettings = {
      autoScrollToNextSection: Boolean(localSettings.autoScrollToNextSection),
    };
    
    // Debug log before saving
    if (process.env.NODE_ENV === 'development') {
      console.log('[Settings Modal] Saving settings:', {
        localSettings,
        settingsToSave,
        checkboxValue: localSettings.autoScrollToNextSection,
        booleanValue: Boolean(localSettings.autoScrollToNextSection),
      });
    }
    
    updateSettings(settingsToSave);
    
    // Force a small delay to ensure localStorage is written
    setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        const stored = localStorage.getItem('estimate-builder-ai-settings');
        console.log('[Settings Modal] Verified localStorage after save:', stored);
      }
    }, 100);
    
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings); // Reset to saved settings
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl">Estimate Builder AI Settings</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-scroll Setting */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Disable Auto-scroll</label>
              <Tooltip content="When checked, auto-scroll is disabled and you'll need to manually expand and scroll to the next section. When unchecked, the wizard will automatically scroll to and expand the next section after you complete the current one.">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoScrollToNextSection}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      autoScrollToNextSection: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  Disable
                </span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              {localSettings.autoScrollToNextSection 
                ? 'Auto-scroll is currently disabled. You will need to manually expand and scroll to the next section.'
                : 'Auto-scroll is currently enabled. The wizard will automatically scroll to and expand the next section when you complete all questions in the current section.'}
            </p>
          </div>

          {/* Add more settings sections here as needed */}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
