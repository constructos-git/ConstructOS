// Customer Estimate Editor Component

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { VisibilitySettingsPanel } from './VisibilitySettingsPanel';
import { ContentLibraryDrawer } from '../Library/ContentLibraryDrawer';
import type {
  CustomerEstimate,
  CustomerEstimateItem,
  VisibilitySettings,
  ContentBlock,
} from '../../domain/types';
import { formatCurrency } from '../../utils/money';
import { Plus, Trash2, Edit2, BookOpen } from 'lucide-react';

interface CustomerEstimateEditorProps {
  estimate: CustomerEstimate;
  visibilitySettings: VisibilitySettings;
  onUpdate: (estimate: CustomerEstimate) => void;
  onVisibilityUpdate: (settings: VisibilitySettings) => void;
  companyId?: string;
}

export function CustomerEstimateEditor({
  estimate,
  visibilitySettings,
  onUpdate,
  onVisibilityUpdate,
  companyId,
}: CustomerEstimateEditorProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showContentLibrary, setShowContentLibrary] = useState(false);
  const [insertTarget, setInsertTarget] = useState<{ sectionId?: string; itemId?: string } | null>(null);

  const handleItemUpdate = (sectionId: string, itemId: string, patch: Partial<CustomerEstimateItem>) => {
    const updatedSections = estimate.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: section.items.map((item) =>
          item.id === itemId ? { ...item, ...patch } : item
        ),
      };
    });

    // Recalculate section totals
    const sectionsWithTotals = updatedSections.map((section) => {
      const sectionTotal = section.items.reduce((sum, item) => {
        return sum + (item.lineTotal || item.quantity! * (item.unitPrice || 0));
      }, 0);
      return { ...section, sectionTotal };
    });

    // Recalculate estimate totals
    const subtotal = sectionsWithTotals.reduce((sum, section) => sum + (section.sectionTotal || 0), 0);
    const vat = subtotal * 0.20; // 20% VAT
    const total = subtotal + vat;

    onUpdate({
      ...estimate,
      sections: sectionsWithTotals,
      subtotal,
      vat,
      total,
    });
  };

  const handleAddItem = (sectionId: string) => {
    const newItem: CustomerEstimateItem = {
      id: `item-${Date.now()}`,
      title: 'New Item',
      description: '',
      quantity: 1,
      unit: 'no',
      unitPrice: 0,
      lineTotal: 0,
    };

    const updatedSections = estimate.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: [...section.items, newItem],
      };
    });

    onUpdate({ ...estimate, sections: updatedSections });
    setEditingItem(newItem.id);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    const updatedSections = estimate.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: section.items.filter((item) => item.id !== itemId),
      };
    });

    // Recalculate totals
    const sectionsWithTotals = updatedSections.map((section) => {
      const sectionTotal = section.items.reduce((sum, item) => {
        return sum + (item.lineTotal || item.quantity! * (item.unitPrice || 0));
      }, 0);
      return { ...section, sectionTotal };
    });

    const subtotal = sectionsWithTotals.reduce((sum, section) => sum + (section.sectionTotal || 0), 0);
    const vat = subtotal * 0.20;
    const total = subtotal + vat;

    onUpdate({
      ...estimate,
      sections: sectionsWithTotals,
      subtotal,
      vat,
      total,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Editor */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Customer Estimate</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowContentLibrary(true)}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Content Library
          </Button>
        </div>

        {estimate.sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              {section.notes && visibilitySettings.showNotes && (
                <p className="text-sm text-muted-foreground">{section.notes}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {visibilitySettings.showDescriptions && (
                        <th className="text-left p-2 text-sm font-medium">Description</th>
                      )}
                      {visibilitySettings.showQuantities && (
                        <th className="text-right p-2 text-sm font-medium">Qty</th>
                      )}
                      {visibilitySettings.showUnits && (
                        <th className="text-right p-2 text-sm font-medium">Unit</th>
                      )}
                      {visibilitySettings.showLineTotals && (
                        <th className="text-right p-2 text-sm font-medium">Price</th>
                      )}
                      <th className="text-center p-2 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item) => {
                      const isEditing = editingItem === item.id;
                      const lineTotal = item.lineTotal || (item.quantity || 0) * (item.unitPrice || 0);

                      return (
                        <tr key={item.id} className="border-b">
                          {visibilitySettings.showDescriptions && (
                            <td className="p-2">
                              {isEditing ? (
                                <Input
                                  value={item.title}
                                  onChange={(e) =>
                                    handleItemUpdate(section.id, item.id, { title: e.target.value })
                                  }
                                  className="w-full"
                                />
                              ) : (
                                <div>
                                  <div className="font-medium">{item.title}</div>
                                  {item.description && (
                                    <div className="text-xs text-muted-foreground">{item.description}</div>
                                  )}
                                </div>
                              )}
                            </td>
                          )}
                          {visibilitySettings.showQuantities && (
                            <td className="p-2 text-right">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={item.quantity || 0}
                                  onChange={(e) =>
                                    handleItemUpdate(section.id, item.id, {
                                      quantity: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-20"
                                />
                              ) : (
                                item.quantity
                              )}
                            </td>
                          )}
                          {visibilitySettings.showUnits && (
                            <td className="p-2 text-right text-sm">{item.unit}</td>
                          )}
                          {visibilitySettings.showLineTotals && (
                            <td className="p-2 text-right font-medium">
                              {formatCurrency(lineTotal)}
                            </td>
                          )}
                          <td className="p-2 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingItem(isEditing ? null : item.id)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(section.id, item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {visibilitySettings.showSectionTotals && (
                    <tfoot>
                      <tr className="border-t font-semibold">
                        <td
                          colSpan={
                            (visibilitySettings.showDescriptions ? 1 : 0) +
                            (visibilitySettings.showQuantities ? 1 : 0) +
                            (visibilitySettings.showUnits ? 1 : 0) +
                            (visibilitySettings.showLineTotals ? 1 : 0)
                          }
                          className="p-2 text-right"
                        >
                          Section Total:
                        </td>
                        {visibilitySettings.showLineTotals && (
                          <td className="p-2 text-right">
                            {formatCurrency(section.sectionTotal || 0)}
                          </td>
                        )}
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddItem(section.id)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Totals Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {!visibilitySettings.showGrandTotalOnly && (
                <>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(estimate.subtotal)}</span>
                  </div>
                  {visibilitySettings.showVat && (
                    <div className="flex justify-between">
                      <span>VAT (20%):</span>
                      <span className="font-medium">{formatCurrency(estimate.vat)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                <span>Total:</span>
                <span>
                  {visibilitySettings.showTotalsWithVat
                    ? formatCurrency(estimate.total)
                    : formatCurrency(estimate.subtotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visibility Settings Sidebar */}
      <div>
        <VisibilitySettingsPanel
          settings={visibilitySettings}
          onUpdate={onVisibilityUpdate}
        />
      </div>

      {/* Content Library Drawer */}
      <ContentLibraryDrawer
        isOpen={showContentLibrary}
        onClose={() => {
          setShowContentLibrary(false);
          setInsertTarget(null);
        }}
        companyId={companyId}
        onInsert={(block: ContentBlock) => {
          if (insertTarget?.itemId && insertTarget.sectionId) {
            // Insert into item description
            const section = estimate.sections.find((s) => s.id === insertTarget.sectionId);
            if (section) {
              const item = section.items.find((i) => i.id === insertTarget.itemId);
              if (item) {
                handleItemUpdate(insertTarget.sectionId, insertTarget.itemId, {
                  description: item.description
                    ? `${item.description}\n\n${block.body}`
                    : block.body,
                });
              }
            }
          } else if (insertTarget?.sectionId) {
            // Insert into section notes
            const updatedSections = estimate.sections.map((section) => {
              if (section.id === insertTarget.sectionId) {
                return {
                  ...section,
                  notes: section.notes
                    ? `${section.notes}\n\n${block.body}`
                    : block.body,
                };
              }
              return section;
            });
            onUpdate({ ...estimate, sections: updatedSections });
          }
        }}
      />
    </div>
  );
}

