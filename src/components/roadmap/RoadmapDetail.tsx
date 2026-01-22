import { X, Calendar, User, Tag, Flag, Folder } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import type { RoadmapItem } from '@/types/roadmap';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RoadmapDetailProps {
  isOpen: boolean;
  onClose: () => void;
  item: RoadmapItem | null;
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'critical':
      return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    case 'high':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    case 'low':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  }
};

export default function RoadmapDetail({ isOpen, onClose, item }: RoadmapDetailProps) {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.title}
      size="lg"
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex flex-wrap items-center gap-3">
          {item.priority && (
            <Badge
              variant="secondary"
              className={cn('text-sm font-semibold', getPriorityColor(item.priority))}
            >
              <Flag className="h-3 w-3 mr-1" />
              {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
            </Badge>
          )}
          {item.category && (
            <Badge variant="outline" className="text-sm">
              <Folder className="h-3 w-3 mr-1" />
              {item.category}
            </Badge>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Stage</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {item.stage.replace('-', ' ')}
            </p>
          </div>

          {item.assignedTo && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Assigned To
              </h3>
              <p className="text-sm text-muted-foreground">{item.assignedTo}</p>
            </div>
          )}

          {item.targetDate && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Target Date
              </h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(item.targetDate), 'MMMM d, yyyy')}
              </p>
            </div>
          )}

          {item.releaseDate && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Release Date
              </h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(item.releaseDate), 'MMMM d, yyyy')}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold mb-2">Created</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(item.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Last Updated</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(item.updatedAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
