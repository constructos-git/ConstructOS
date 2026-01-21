import { List, Grid, Table, LayoutGrid } from 'lucide-react';
import Button from '@/components/ui/Button';

export type ViewType = 'list' | 'kanban' | 'table' | 'grid';

export function EstimateListToolbar({
  viewType,
  onViewChange,
}: {
  viewType: ViewType;
  onViewChange: (view: ViewType) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border p-1">
        <Button
          variant={viewType === 'list' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('list')}
          className="h-8 px-3"
        >
          <List className="h-4 w-4 mr-1" />
          List
        </Button>
        <Button
          variant={viewType === 'kanban' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('kanban')}
          className="h-8 px-3"
        >
          <Grid className="h-4 w-4 mr-1" />
          Kanban
        </Button>
        <Button
          variant={viewType === 'grid' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('grid')}
          className="h-8 px-3"
        >
          <LayoutGrid className="h-4 w-4 mr-1" />
          Grid
        </Button>
        <Button
          variant={viewType === 'table' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('table')}
          className="h-8 px-3"
        >
          <Table className="h-4 w-4 mr-1" />
          Table
        </Button>
      </div>
    </div>
  );
}

