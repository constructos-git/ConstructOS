import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useKanbanSettingsStore, type CardFieldVisibility } from '@/stores/kanbanSettingsStore';

interface CardSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const fieldLabels: Record<keyof CardFieldVisibility, string> = {
  value: 'Value',
  probability: 'Probability',
  contact: 'Contact',
  expectedCloseDate: 'Expected Close Date',
  assignedTo: 'Assigned To',
  source: 'Source',
  tags: 'Tags',
  daysInStage: 'Days in Stage',
  lastActivity: 'Last Activity',
  createdAt: 'Created Date',
};

export default function CardSettings({ isOpen, onClose }: CardSettingsProps) {
  const { cardFieldVisibility, updateCardFieldVisibility, resetSettings } =
    useKanbanSettingsStore();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Card Display Settings"
      size="md"
      footer={
        <div className="flex justify-between items-center w-full">
          <Button variant="outline" onClick={resetSettings}>
            Reset to Defaults
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Visible Fields</CardTitle>
            <CardDescription className="text-xs">
              Toggle which information is displayed on opportunity cards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.keys(fieldLabels) as Array<keyof CardFieldVisibility>).map((field) => (
              <label
                key={field}
                className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-accent transition-colors"
              >
                <span className="text-sm">{fieldLabels[field]}</span>
                <input
                  type="checkbox"
                  checked={cardFieldVisibility[field]}
                  onChange={(e) => updateCardFieldVisibility(field, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}
