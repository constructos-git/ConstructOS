import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import type { RoadmapItem, RoadmapStage } from '@/types/roadmap';

interface RoadmapFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<RoadmapItem, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => void;
  item?: RoadmapItem;
  initialStage?: RoadmapStage;
}

const stageOptions: { value: RoadmapStage; label: string }[] = [
  { value: 'ideas', label: 'Ideas' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'released', label: 'Released' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const categoryOptions = [
  { value: 'Feature', label: 'Feature' },
  { value: 'Bug Fix', label: 'Bug Fix' },
  { value: 'Enhancement', label: 'Enhancement' },
  { value: 'Infrastructure', label: 'Infrastructure' },
  { value: 'UI/UX', label: 'UI/UX' },
  { value: 'Performance', label: 'Performance' },
  { value: 'Security', label: 'Security' },
  { value: 'Other', label: 'Other' },
];

export default function RoadmapForm({
  isOpen,
  onClose,
  onSave,
  item,
  initialStage,
}: RoadmapFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stage: (initialStage || 'ideas') as RoadmapStage,
    priority: '' as 'low' | 'medium' | 'high' | 'critical' | '',
    category: '',
    assignedTo: '',
    tags: [] as string[],
    targetDate: '',
    releaseDate: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || '',
        stage: item.stage,
        priority: item.priority || '',
        category: item.category || '',
        assignedTo: item.assignedTo || '',
        tags: item.tags || [],
        targetDate: item.targetDate
          ? new Date(item.targetDate).toISOString().split('T')[0]
          : '',
        releaseDate: item.releaseDate
          ? new Date(item.releaseDate).toISOString().split('T')[0]
          : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        stage: (initialStage || 'ideas') as RoadmapStage,
        priority: '',
        category: '',
        assignedTo: '',
        tags: [],
        targetDate: '',
        releaseDate: '',
      });
    }
  }, [item, initialStage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Please fill in the title');
      return;
    }

    onSave({
      title: formData.title,
      description: formData.description || undefined,
      stage: formData.stage,
      priority: formData.priority || undefined,
      category: formData.category || undefined,
      assignedTo: formData.assignedTo || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
      releaseDate: formData.releaseDate ? new Date(formData.releaseDate) : undefined,
    });
    onClose();
  };

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData({ ...formData, tags });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Roadmap Item' : 'New Roadmap Item'}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            {item ? 'Update' : 'Create'} Item
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Enhanced Dashboard Analytics"
          required
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe this roadmap item..."
          rows={4}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Stage"
            value={formData.stage}
            onChange={(e) =>
              setFormData({ ...formData, stage: e.target.value as RoadmapStage })
            }
            options={stageOptions}
          />
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) =>
              setFormData({
                ...formData,
                priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' | '',
              })
            }
            options={[{ value: '', label: 'None' }, ...priorityOptions]}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[{ value: '', label: 'None' }, ...categoryOptions]}
          />
          <Input
            label="Assigned To"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            placeholder="Team member or team name"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Target Date"
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
          />
          {formData.stage === 'released' && (
            <Input
              label="Release Date"
              type="date"
              value={formData.releaseDate}
              onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
            />
          )}
        </div>

        <Input
          label="Tags (comma-separated)"
          value={formData.tags.join(', ')}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="Feature, Analytics, Dashboard"
        />
      </form>
    </Modal>
  );
}
