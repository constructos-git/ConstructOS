import { useState } from 'react';
import { Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import type { OpportunityStage } from '@/types/opportunities';

interface KanbanSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: KanbanSettings) => void;
  currentSettings?: KanbanSettings;
}

export interface KanbanSettings {
  autoScroll: boolean;
  cardWidth: number;
  showMetrics: boolean;
  showProbability: boolean;
  showTags: boolean;
  columnOrder: OpportunityStage[];
  collapsedColumns: OpportunityStage[];
}

const defaultSettings: KanbanSettings = {
  autoScroll: true,
  cardWidth: 320,
  showMetrics: true,
  showProbability: true,
  showTags: true,
  columnOrder: ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
  collapsedColumns: [],
};

export default function KanbanSettings({
  isOpen,
  onClose,
  onSave,
  currentSettings = defaultSettings,
}: KanbanSettingsProps) {
  const [settings, setSettings] = useState<KanbanSettings>(currentSettings);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kanban Board Settings"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Display Options</CardTitle>
            <CardDescription>Customize what information is shown on cards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Show Probability</span>
              <input
                type="checkbox"
                checked={settings.showProbability}
                onChange={(e) => setSettings({ ...settings, showProbability: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Show Tags</span>
              <input
                type="checkbox"
                checked={settings.showTags}
                onChange={(e) => setSettings({ ...settings, showTags: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Show Metrics</span>
              <input
                type="checkbox"
                checked={settings.showMetrics}
                onChange={(e) => setSettings({ ...settings, showMetrics: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Board Behavior</CardTitle>
            <CardDescription>Configure how the board behaves</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Auto-scroll on Drag</span>
              <input
                type="checkbox"
                checked={settings.autoScroll}
                onChange={(e) => setSettings({ ...settings, autoScroll: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </label>
            <div>
              <label className="block text-sm font-medium mb-2">Card Width (px)</label>
              <Input
                type="number"
                value={settings.cardWidth}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cardWidth: Number.parseInt(e.target.value, 10) || 320,
                  })
                }
                min={200}
                max={500}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}
