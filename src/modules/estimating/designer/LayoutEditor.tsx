import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { blockDefinitions, defaultLayout, type LayoutBlock } from './blocks';

export function LayoutEditor({
  blocks,
  onChange,
}: {
  blocks: LayoutBlock[];
  onChange: (blocks: LayoutBlock[]) => void;
}) {
  const [localBlocks, setLocalBlocks] = useState<LayoutBlock[]>(blocks.length > 0 ? blocks : defaultLayout);

  function toggleBlock(key: string) {
    setLocalBlocks((prev) => {
      const updated = prev.map((b) => (b.key === key ? { ...b, enabled: !b.enabled } : b));
      onChange(updated);
      return updated;
    });
  }

  function moveBlock(key: string, direction: 'up' | 'down') {
    setLocalBlocks((prev) => {
      const idx = prev.findIndex((b) => b.key === key);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const updated = [...prev];
      [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
      updated[idx].order = (idx + 1) * 10;
      updated[newIdx].order = (newIdx + 1) * 10;
      onChange(updated);
      return updated;
    });
  }

  function updateSettings(key: string, settings: any) {
    setLocalBlocks((prev) => {
      const updated = prev.map((b) => (b.key === key ? { ...b, settings: { ...b.settings, ...settings } } : b));
      onChange(updated);
      return updated;
    });
  }

  const sortedBlocks = [...localBlocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      {sortedBlocks.map((block) => {
        const def = blockDefinitions[block.key];
        return (
          <Card key={block.key} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={block.enabled}
                    onChange={() => toggleBlock(block.key)}
                  />
                  <div>
                    <div className="text-sm font-medium">{def.label}</div>
                    <div className="text-xs text-slate-500">{def.description}</div>
                  </div>
                </div>
                {block.enabled && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(def.defaultSettings).map(([key, defaultValue]) => (
                      <label key={key} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={block.settings[key] ?? defaultValue}
                          onChange={(e) => updateSettings(block.key, { [key]: e.target.checked })}
                        />
                        <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveBlock(block.key, 'up')}
                  disabled={sortedBlocks.indexOf(block) === 0}
                >
                  ↑
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveBlock(block.key, 'down')}
                  disabled={sortedBlocks.indexOf(block) === sortedBlocks.length - 1}
                >
                  ↓
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

