import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Grid, List, LayoutGrid, Search, Filter } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

export type TemplateViewMode = 'card' | 'list' | 'detail';

export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  template_type?: string;
  thumbnail_url?: string;
  preview_image_url?: string;
  tags?: string[];
  difficulty?: string;
  estimated_duration_hours?: number;
  typical_price_range?: { min: number; max: number };
}

export function TemplateSelectionStep({
  templates,
  onSelect,
  onCancel,
}: {
  templates: Template[];
  onSelect: (template: Template) => void;
  onCancel: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<TemplateViewMode>('card');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'difficulty'>('name');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    templates.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats).sort();
  }, [templates]);

  const types = useMemo(() => {
    const typs = new Set<string>();
    templates.forEach((t) => {
      if (t.template_type) typs.add(t.template_type);
    });
    return Array.from(typs).sort();
  }, [templates]);

  const filteredAndSorted = useMemo(() => {
    let filtered = templates.filter((t) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

      // Type filter
      if (selectedType !== 'all' && t.template_type !== selectedType) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && t.difficulty !== selectedDifficulty) return false;

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'category') {
        return (a.category || '').localeCompare(b.category || '');
      } else if (sortBy === 'difficulty') {
        const diffOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        return (diffOrder[a.difficulty as keyof typeof diffOrder] ?? 99) - (diffOrder[b.difficulty as keyof typeof diffOrder] ?? 99);
      }
      return 0;
    });

    return filtered;
  }, [templates, searchQuery, selectedCategory, selectedType, selectedDifficulty, sortBy]);

  const fmt = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);

  // Debug: Log templates
  console.log('TemplateSelectionStep - templates received:', templates.length, templates);

  return (
    <div className="space-y-4">
      {templates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No templates available. Please check console for errors.</p>
          </CardContent>
        </Card>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Choose a Template</h2>
          <p className="text-sm text-muted-foreground">Select a template to start building your estimate</p>
        </div>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Difficulty</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sort By</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              >
                <option value="name">Name</option>
                <option value="category">Category</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">View:</span>
            <div className="flex gap-1 rounded-md border p-1">
              <Tooltip content="Card View">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${viewMode === 'card' ? 'bg-accent' : ''}`}
                  onClick={() => setViewMode('card')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </Tooltip>
              <Tooltip content="List View">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-accent' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Detail View">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${viewMode === 'detail' ? 'bg-accent' : ''}`}
                  onClick={() => setViewMode('detail')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
            <div className="flex-1" />
            <div className="text-xs text-muted-foreground">
              {filteredAndSorted.length} template{filteredAndSorted.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </Card>

      {/* Template Grid/List */}
      {viewMode === 'card' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelect(template)}
            >
              {template.thumbnail_url ? (
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <img
                    src={template.thumbnail_url}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg flex items-center justify-center">
                  <div className="text-4xl text-primary/30">🏗️</div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-base">{template.name}</CardTitle>
                {template.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs">
                  {template.category && (
                    <span className="px-2 py-1 rounded bg-muted text-muted-foreground">{template.category}</span>
                  )}
                  {template.typical_price_range && (
                    <span className="text-muted-foreground">
                      {fmt(template.typical_price_range.min)} - {fmt(template.typical_price_range.max)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredAndSorted.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onSelect(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {template.thumbnail_url ? (
                    <img
                      src={template.thumbnail_url}
                      alt={template.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded flex items-center justify-center">
                      <div className="text-2xl text-primary/30">🏗️</div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{template.name}</div>
                    {template.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">{template.description}</div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {template.category && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{template.category}</span>
                      )}
                      {template.difficulty && (
                        <span className="text-xs text-muted-foreground">Difficulty: {template.difficulty}</span>
                      )}
                    </div>
                  </div>
                  {template.typical_price_range && (
                    <div className="text-sm font-medium">
                      {fmt(template.typical_price_range.min)} - {fmt(template.typical_price_range.max)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSorted.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelect(template)}
            >
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    {template.thumbnail_url ? (
                      <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-full aspect-video object-cover rounded"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded flex items-center justify-center">
                        <div className="text-6xl text-primary/30">🏗️</div>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {template.category && (
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">{template.category}</span>
                      )}
                      {template.template_type && (
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">{template.template_type}</span>
                      )}
                      {template.difficulty && (
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">Difficulty: {template.difficulty}</span>
                      )}
                      {template.estimated_duration_hours && (
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                          ~{template.estimated_duration_hours}h
                        </span>
                      )}
                    </div>
                    {template.typical_price_range && (
                      <div className="text-sm">
                        <span className="font-medium">Typical Price Range: </span>
                        <span>{fmt(template.typical_price_range.min)} - {fmt(template.typical_price_range.max)}</span>
                      </div>
                    )}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredAndSorted.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            {templates.length === 0 ? (
              <>
                <p className="text-muted-foreground mb-2">No templates available.</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Templates should be automatically seeded when you open the template builder.
                  Check the browser console for any errors.
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">No templates found matching your criteria.</p>
                <Button variant="secondary" className="mt-4" onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                  setSelectedDifficulty('all');
                }}>
                  Clear Filters
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

