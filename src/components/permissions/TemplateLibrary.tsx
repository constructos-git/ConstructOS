import { useState } from 'react';
import { Sparkles, FileText, Users, Building2, CreditCard, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import type { PermissionTemplate } from '@/types/permissionRules';

interface TemplateLibraryProps {
  templates: PermissionTemplate[];
  onUseTemplate: (templateId: string) => void;
  onCreateFromTemplate?: (template: PermissionTemplate) => void;
}

const categoryIcons = {
  file_access: FileText,
  project_access: Building2,
  client_portal: Users,
  financial: CreditCard,
  communication: MessageSquare,
  custom: Sparkles,
};

const categoryColors = {
  file_access: 'primary',
  project_access: 'secondary',
  client_portal: 'success',
  financial: 'warning',
  communication: 'accent',
  custom: 'outline',
} as const;

export default function TemplateLibrary({
  templates,
  onUseTemplate,
  onCreateFromTemplate,
}: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => {
          const Icon = categoryIcons[template.category] || Sparkles;
          const colorVariant = categoryColors[template.category] || 'outline';

          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  {template.isSystem && (
                    <Badge variant="secondary" className="text-xs">
                      System
                    </Badge>
                  )}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={colorVariant as any}>
                      {template.category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Used {template.usageCount} times
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => onUseTemplate(template.id)}
                    >
                      Use Template
                    </Button>
                    {onCreateFromTemplate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCreateFromTemplate(template)}
                      >
                        Preview
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No templates found matching your search.</p>
        </div>
      )}
    </div>
  );
}

