import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import Button from '@/components/ui/Button';
import RoadmapBoard from '@/components/roadmap/RoadmapBoard';
import RoadmapForm from '@/components/roadmap/RoadmapForm';
import RoadmapDetail from '@/components/roadmap/RoadmapDetail';
import GenericKanbanSettings, { type GenericKanbanSettings as GenericKanbanSettingsType } from '@/components/kanban/GenericKanbanSettings';
import { useRoadmapStore } from '@/stores/roadmapStore';
import type { RoadmapItem, RoadmapStage } from '@/types/roadmap';

export default function Roadmap() {
  const { addItem, updateItem, deleteItem, moveItem, getColumns } = useRoadmapStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isKanbanSettingsOpen, setIsKanbanSettingsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | undefined>();
  const [viewingItem, setViewingItem] = useState<RoadmapItem | null>(null);
  const [initialStage, setInitialStage] = useState<RoadmapStage | undefined>();
  const [kanbanSettings, setKanbanSettings] = useState<GenericKanbanSettingsType>({
    autoScroll: true,
    cardWidth: 320,
  });

  const columns = getColumns();

  const handleNewItem = (stage?: RoadmapStage) => {
    setInitialStage(stage);
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: RoadmapItem) => {
    setEditingItem(item);
    setInitialStage(undefined);
    setIsFormOpen(true);
  };

  const handleViewItem = (item: RoadmapItem) => {
    setViewingItem(item);
    setIsDetailOpen(true);
  };

  const handleSaveItem = (
    itemData: Omit<RoadmapItem, 'id' | 'createdAt' | 'updatedAt' | 'position'>
  ) => {
    if (editingItem) {
      updateItem(editingItem.id, itemData);
    } else {
      addItem(itemData);
    }
    setIsFormOpen(false);
    setEditingItem(undefined);
    setInitialStage(undefined);
  };

  const handleDeleteItem = (id: string) => {
    deleteItem(id);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roadmap</h1>
          <p className="text-muted-foreground mt-1">
            Track development ideas, in-progress work, and released features
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsKanbanSettingsOpen(true)} size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Board Settings
          </Button>
          <Button onClick={() => handleNewItem()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Item
          </Button>
        </div>
      </div>

      <RoadmapBoard
        columns={columns}
        onMoveItem={moveItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
        onViewItem={handleViewItem}
        onAddItem={handleNewItem}
      />

      <RoadmapForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(undefined);
          setInitialStage(undefined);
        }}
        onSave={handleSaveItem}
        item={editingItem}
        initialStage={initialStage}
      />

      <RoadmapDetail
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingItem(null);
        }}
        item={viewingItem}
      />

      {/* Kanban Settings Modal */}
      <GenericKanbanSettings
        isOpen={isKanbanSettingsOpen}
        onClose={() => setIsKanbanSettingsOpen(false)}
        onSave={(settings) => {
          setKanbanSettings(settings);
        }}
        currentSettings={kanbanSettings}
        title="Roadmap Kanban Settings"
      />
    </div>
  );
}
