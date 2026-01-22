// Generate Work Order Modal

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCreateWorkOrder } from '../../hooks/useWorkOrders';
import type { InternalCostingItem } from '../../domain/types';

interface GenerateWOModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InternalCostingItem[];
  sections: Array<{ id: string; title: string }>;
  estimateId: string;
  companyId?: string;
  onSuccess?: () => void;
}

export function GenerateWOModal({
  isOpen,
  onClose,
  items,
  sections,
  estimateId,
  companyId,
  onSuccess,
}: GenerateWOModalProps) {
  const [contractorName, setContractorName] = useState('');
  const [pricingMode, setPricingMode] = useState<'fixed' | 'schedule'>('schedule');
  const [fixedPrice, setFixedPrice] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(items.filter((item) => item.isWorkOrderEligible).map((item) => item.id))
  );
  const createWO = useCreateWorkOrder(companyId);

  const workOrderEligibleItems = items.filter((item) => item.isWorkOrderEligible);

  const handleGenerate = async () => {
    if (pricingMode === 'schedule' && selectedItems.size === 0) {
      alert('Please select at least one item for schedule pricing');
      return;
    }

    if (pricingMode === 'fixed' && !fixedPrice) {
      alert('Please enter a fixed price');
      return;
    }

    // Build scope text from selected sections/items
    const selectedSectionIds = new Set(
      workOrderEligibleItems
        .filter((item) => selectedItems.has(item.id))
        .map((item) => {
          // Find which section this item belongs to
          const section = sections.find(() =>
            items.some((i) => i.id === item.id)
          );
          return section?.id;
        })
        .filter((id) => id !== undefined)
    );

    const scopeText = Array.from(selectedSectionIds)
      .map((sectionId) => {
        const section = sections.find((s) => s.id === sectionId);
        return section?.title;
      })
      .filter((title) => title !== undefined)
      .join(', ');

    const woItems =
      pricingMode === 'schedule'
        ? workOrderEligibleItems
            .filter((item) => selectedItems.has(item.id))
            .map((item, index) => ({
              estimateItemId: item.id,
              title: item.title,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              sortOrder: index,
            }))
        : undefined;

    try {
      await createWO.mutateAsync({
        estimateId,
        contractorName: contractorName || undefined,
        pricingMode,
        fixedPrice: pricingMode === 'fixed' ? parseFloat(fixedPrice) : undefined,
        scopeText: scopeText || undefined,
        items: woItems,
      });
      onSuccess?.();
      onClose();
      setContractorName('');
      setFixedPrice('');
      setPricingMode('schedule');
    } catch (error) {
      console.error('Failed to create WO:', error);
      alert('Failed to create work order. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Work Order">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Contractor Name</label>
          <Input
            value={contractorName}
            onChange={(e) => setContractorName(e.target.value)}
            placeholder="Enter contractor name"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Pricing Mode</label>
          <select
            value={pricingMode}
            onChange={(e) => setPricingMode(e.target.value as 'fixed' | 'schedule')}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="schedule" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Schedule of Rates</option>
            <option value="fixed" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Fixed Price</option>
          </select>
        </div>

        {pricingMode === 'fixed' ? (
          <div>
            <label className="text-sm font-medium mb-1 block">Fixed Price</label>
            <Input
              type="number"
              value={fixedPrice}
              onChange={(e) => setFixedPrice(e.target.value)}
              placeholder="Enter fixed price"
            />
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium mb-2 block">Select Items</label>
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
              {workOrderEligibleItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No work order eligible items found</p>
              ) : (
                workOrderEligibleItems.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedItems);
                        if (e.target.checked) {
                          newSelected.add(item.id);
                        } else {
                          newSelected.delete(item.id);
                        }
                        setSelectedItems(newSelected);
                      }}
                    />
                    <span className="text-sm">
                      {item.title} - {item.quantity} {item.unit}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={
              (pricingMode === 'schedule' && selectedItems.size === 0) ||
              (pricingMode === 'fixed' && !fixedPrice) ||
              createWO.isPending
            }
          >
            {createWO.isPending ? 'Generating...' : 'Generate WO'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

