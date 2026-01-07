// Internal Costing Editor Component

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { InternalCosting, InternalCostingItem } from '../../domain/types';
import { formatCurrency, roundMoney } from '../../utils/money';
import { calculateItemTotal, calculateSectionTotal } from '../../utils/totals';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface InternalCostingEditorProps {
  costing: InternalCosting;
  onUpdate: (costing: InternalCosting) => void;
}

export function InternalCostingEditor({ costing, onUpdate }: InternalCostingEditorProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const handleItemUpdate = (sectionId: string, itemId: string, patch: Partial<InternalCostingItem>) => {
    const updatedSections = costing.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: section.items.map((item) =>
          item.id === itemId ? { ...item, ...patch } : item
        ),
      };
    });
    
    // Recalculate totals
    const subtotal = updatedSections.reduce((sum, section) => {
      return sum + section.items.reduce((itemSum, item) => {
        return itemSum + calculateItemTotal(item);
      }, 0);
    }, 0);
    
    const overhead = roundMoney(subtotal * 0.10);
    const margin = roundMoney(subtotal * 0.15);
    const contingency = roundMoney(subtotal * 0.05);
    const vatBase = subtotal + overhead + margin + contingency;
    const vat = roundMoney(vatBase * 0.20);
    const total = roundMoney(vatBase + vat);

    onUpdate({
      ...costing,
      sections: updatedSections,
      subtotal,
      overhead,
      margin,
      contingency,
      vat,
      total,
    });
  };

  const handleAddItem = (sectionId: string) => {
    const newItem: InternalCostingItem = {
      id: `item-${Date.now()}`,
      itemType: 'material',
      title: 'New Item',
      description: '',
      quantity: 1,
      unit: 'no',
      unitCost: 0,
      unitPrice: 0,
      marginPercent: 15,
      overheadPercent: 10,
      contingencyPercent: 5,
      vatRate: 20,
      isProvisional: false,
      isPurchasable: false,
      isWorkOrderEligible: false,
    };

    const updatedSections = costing.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: [...section.items, newItem],
      };
    });

    onUpdate({ ...costing, sections: updatedSections });
    setEditingItem(newItem.id);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    const updatedSections = costing.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: section.items.filter((item) => item.id !== itemId),
      };
    });

    // Recalculate totals
    const subtotal = updatedSections.reduce((sum, section) => {
      return sum + section.items.reduce((itemSum, item) => {
        return itemSum + calculateItemTotal(item);
      }, 0);
    }, 0);
    
    const overhead = roundMoney(subtotal * 0.10);
    const margin = roundMoney(subtotal * 0.15);
    const contingency = roundMoney(subtotal * 0.05);
    const vatBase = subtotal + overhead + margin + contingency;
    const vat = roundMoney(vatBase * 0.20);
    const total = roundMoney(vatBase + vat);

    onUpdate({
      ...costing,
      sections: updatedSections,
      subtotal,
      overhead,
      margin,
      contingency,
      vat,
      total,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Internal Costing</h2>
      </div>

      {costing.sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
            {section.notes && (
              <p className="text-sm text-muted-foreground">{section.notes}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium">Item</th>
                    <th className="text-left p-2 text-sm font-medium">Type</th>
                    <th className="text-right p-2 text-sm font-medium">Qty</th>
                    <th className="text-right p-2 text-sm font-medium">Unit</th>
                    <th className="text-right p-2 text-sm font-medium">Unit Cost</th>
                    <th className="text-right p-2 text-sm font-medium">Unit Price</th>
                    <th className="text-right p-2 text-sm font-medium">Total</th>
                    <th className="text-center p-2 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item) => {
                    const itemTotal = calculateItemTotal(item);
                    const isEditing = editingItem === item.id;

                    return (
                      <tr key={item.id} className="border-b">
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
                        <td className="p-2 text-sm capitalize">{item.itemType}</td>
                        <td className="p-2 text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={item.quantity}
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
                        <td className="p-2 text-right text-sm">{item.unit}</td>
                        <td className="p-2 text-right text-sm">{formatCurrency(item.unitCost)}</td>
                        <td className="p-2 text-right text-sm">{formatCurrency(item.unitPrice)}</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(itemTotal)}</td>
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
                <tfoot>
                  <tr className="border-t font-semibold">
                    <td colSpan={6} className="p-2 text-right">Section Total:</td>
                    <td className="p-2 text-right">{formatCurrency(calculateSectionTotal(section))}</td>
                    <td></td>
                  </tr>
                </tfoot>
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
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(costing.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Overhead (10%):</span>
              <span className="font-medium">{formatCurrency(costing.overhead)}</span>
            </div>
            <div className="flex justify-between">
              <span>Margin (15%):</span>
              <span className="font-medium">{formatCurrency(costing.margin)}</span>
            </div>
            <div className="flex justify-between">
              <span>Contingency (5%):</span>
              <span className="font-medium">{formatCurrency(costing.contingency)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (20%):</span>
              <span className="font-medium">{formatCurrency(costing.vat)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(costing.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assumptions */}
      {costing.assumptions && costing.assumptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assumptions & Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {costing.assumptions.map((assumption, index) => (
                <li key={index}>{assumption}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

