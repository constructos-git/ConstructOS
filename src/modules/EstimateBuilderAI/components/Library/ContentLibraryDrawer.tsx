// Content Library Drawer Component

import { useState } from 'react';
import { X, Search, Tag, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useContentBlocks } from '../../hooks/useContentBlocks';
import { seedContentBlocks } from '../../domain/contentBlocksRegistry';
import type { ContentBlock } from '../../domain/types';

interface ContentLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
  onInsert?: (block: ContentBlock) => void;
}

export function ContentLibraryDrawer({
  isOpen,
  onClose,
  companyId,
  onInsert,
}: ContentLibraryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const { data: savedBlocks } = useContentBlocks(companyId, selectedType !== 'all' ? { type: selectedType as any } : undefined);

  // Combine seed and saved blocks
  const allBlocks = [
    ...seedContentBlocks.map((block, index) => ({ ...block, id: `seed-${index}`, isSeed: true })),
    ...(savedBlocks || []),
  ];

  // Filter blocks
  const filteredBlocks = allBlocks.filter((block) => {
    if (selectedType !== 'all' && block.type !== selectedType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        block.title.toLowerCase().includes(query) ||
        block.body.toLowerCase().includes(query) ||
        block.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleInsert = (block: ContentBlock) => {
    if (onInsert) {
      onInsert(block);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-96 bg-background shadow-lg flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Content Library</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="scope">Scope</option>
              <option value="note">Note</option>
              <option value="exclusion">Exclusion</option>
              <option value="ps_wording">Provisional Sum</option>
            </select>
          </div>

          {/* Blocks List */}
          <div className="space-y-2">
            {filteredBlocks.map((block) => (
              <div
                key={block.id}
                className="border rounded-lg p-3 hover:bg-muted cursor-pointer transition-colors"
                onClick={() => handleInsert(block)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium text-sm">{block.title}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{block.type}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{block.body}</p>
                {block.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {block.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

