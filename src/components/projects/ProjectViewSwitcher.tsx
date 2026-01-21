import { Grid3x3, List, Table, FileText, LayoutGrid } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { ProjectViewType } from '@/types/projects';
import { cn } from '@/lib/utils';

interface ProjectViewSwitcherProps {
  viewType: ProjectViewType;
  onViewChange: (view: ProjectViewType) => void;
}

export default function ProjectViewSwitcher({ viewType, onViewChange }: ProjectViewSwitcherProps) {
  const views: { type: ProjectViewType; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { type: 'kanban', icon: LayoutGrid, label: 'Kanban' },
    { type: 'grid', icon: Grid3x3, label: 'Grid' },
    { type: 'list', icon: List, label: 'List' },
    { type: 'table', icon: Table, label: 'Table' },
    { type: 'detail', icon: FileText, label: 'Detail' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      {views.map((view) => {
        const Icon = view.icon;
        return (
          <Button
            key={view.type}
            variant={viewType === view.type ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewChange(view.type)}
            className={cn(
              'flex items-center gap-2',
              viewType === view.type && 'bg-primary-600 text-white hover:bg-primary-700'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
