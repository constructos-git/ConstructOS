import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RichTextEditor } from './rich/RichTextEditor';
import Tooltip from '@/components/ui/Tooltip';
import { CollapsibleSection } from './CollapsibleSection';
import { FileText, Edit2, Trash2, Percent } from 'lucide-react';
import { SectionMarginOverride } from './SectionMarginOverride';

type Section = {
  id: string;
  title: string;
  client_narrative_rich?: unknown;
  margin_override_percent?: number | null;
  overhead_override_percent?: number | null;
  labour_burden_override_percent?: number | null;
  wastage_override_percent?: number | null;
};

export function SectionsPanel({
  sections,
  activeSectionId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onEditNarrative,
  onUpdateSection,
}: {
  sections: Section[];
  activeSectionId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onEditNarrative?: (id: string, narrativeRich: unknown) => Promise<void>;
  onUpdateSection?: (id: string, patch: {
    margin_override_percent?: number | null;
    overhead_override_percent?: number | null;
    labour_burden_override_percent?: number | null;
    wastage_override_percent?: number | null;
  }) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [narrativeSectionId, setNarrativeSectionId] = useState<string | null>(null);
  const [narrativeValue, setNarrativeValue] = useState<unknown>(null);
  const [marginOverrideSectionId, setMarginOverrideSectionId] = useState<string | null>(null);

  return (
    <Card className="p-4 space-y-4">
      <CollapsibleSection
        title="Sections"
        tooltip="Organize your estimate into sections. Each section can contain multiple line items and have a client-facing description."
        defaultExpanded={true}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-end">
            <Tooltip content="Add a new section to organize your estimate items">
              <Button size="sm" onClick={onAdd}>Add Section</Button>
            </Tooltip>
          </div>

          <div className="space-y-2">
            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors ${
                activeSectionId === null
                  ? 'bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 font-medium'
                  : 'hover:bg-accent border border-transparent'
              }`}
              onClick={() => onSelect(null)}
              type="button"
            >
              <Tooltip content="View all items across all sections">
                <span>All items</span>
              </Tooltip>
            </button>

            {sections.map((s) => {
              const active = s.id === activeSectionId;
              const editing = s.id === editingId;
              return (
                <div
                  key={s.id}
                  className={`rounded-lg border transition-colors ${
                    active
                      ? 'border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-950/50'
                      : 'border-border hover:border-primary-200 dark:hover:border-primary-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 px-3 py-3">
                    {editing ? (
                      <input
                        className="min-w-0 flex-1 rounded-md border border-primary-300 dark:border-primary-700 bg-background px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                          if (title.trim() && title.trim() !== s.title) {
                            onRename(s.id, title.trim());
                          }
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          } else if (e.key === 'Escape') {
                            setTitle(s.title);
                            setEditingId(null);
                          }
                        }}
                        placeholder="Section name"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <button
                        className={`min-w-0 flex-1 text-left text-sm ${active ? 'font-semibold' : ''} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}
                        onClick={() => onSelect(s.id)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingId(s.id);
                          setTitle(s.title);
                        }}
                        type="button"
                        title="Double-click to rename"
                      >
                        <div className="break-words">{s.title}</div>
                      </button>
                    )}

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {onEditNarrative && (
                        <Tooltip content="Add or edit the client-facing description for this section. This text will appear in quotes to help clients understand the work.">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNarrativeSectionId(s.id);
                              setNarrativeValue(s.client_narrative_rich);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      )}
                      {onUpdateSection && (
                        <Tooltip content="Override profit margins and overheads for all items in this section">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMarginOverrideSectionId(s.id);
                            }}
                          >
                            <Percent className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      )}
                      {!editing && (
                        <Tooltip content="Rename this section (or double-click the title)">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(s.id);
                              setTitle(s.title);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip content="Delete this section. Items in this section will be moved to 'All items'.">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(s.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CollapsibleSection>

      {marginOverrideSectionId && onUpdateSection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMarginOverrideSectionId(null)} />
          <div className="relative w-full max-w-md max-h-[85vh] rounded-lg bg-background shadow-lg overflow-y-auto">
            <SectionMarginOverride
              section={sections.find((s) => s.id === marginOverrideSectionId)!}
              onSave={async (overrides) => {
                if (onUpdateSection) {
                  await onUpdateSection(marginOverrideSectionId, overrides);
                }
                setMarginOverrideSectionId(null);
              }}
              onCancel={() => setMarginOverrideSectionId(null)}
            />
          </div>
        </div>
      )}

      {marginOverrideSectionId && onUpdateSection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMarginOverrideSectionId(null)} />
          <div className="relative w-full max-w-md max-h-[85vh] rounded-lg bg-background shadow-lg overflow-y-auto">
            <SectionMarginOverride
              section={sections.find((s) => s.id === marginOverrideSectionId)!}
              onSave={async (overrides) => {
                if (onUpdateSection) {
                  await onUpdateSection(marginOverrideSectionId, overrides);
                }
                setMarginOverrideSectionId(null);
              }}
              onCancel={() => setMarginOverrideSectionId(null)}
            />
          </div>
        </div>
      )}

      {narrativeSectionId && onEditNarrative && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setNarrativeSectionId(null)} />
          <div className="relative w-full max-w-3xl max-h-[85vh] rounded-lg bg-background shadow-lg flex flex-col">
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
              <div className="text-sm font-semibold">Client Description</div>
              <Button size="sm" variant="ghost" onClick={() => setNarrativeSectionId(null)}>Close</Button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="text-xs text-muted-foreground block mb-2">
                  <Tooltip content="This description will appear in quotes to help clients understand what work is included in this section. Use clear, client-friendly language.">
                    <span>Client description for {sections.find((s) => s.id === narrativeSectionId)?.title}</span>
                  </Tooltip>
                </label>
                <RichTextEditor
                  value={narrativeValue}
                  onChange={(next) => setNarrativeValue(next)}
                  minHeight={200}
                />
              </div>
            </div>
            <div className="p-4 border-t flex gap-2 justify-end flex-shrink-0">
              <Button
                size="sm"
                onClick={async () => {
                  if (onEditNarrative) {
                    await onEditNarrative(narrativeSectionId, narrativeValue);
                    setNarrativeSectionId(null);
                  }
                }}
              >
                Save
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setNarrativeSectionId(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

