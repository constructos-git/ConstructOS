// Generate Purchase Order Modal

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCreatePurchaseOrder } from '../../hooks/usePurchaseOrders';
import type { InternalCostingItem } from '../../domain/types';

interface GeneratePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InternalCostingItem[];
  estimateId: string;
  companyId?: string;
  onSuccess?: () => void;
}

export function GeneratePOModal({
  isOpen,
  onClose,
  items,
  estimateId,
  companyId,
  onSuccess,
}: GeneratePOModalProps) {
  const [supplierName, setSupplierName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(items.filter((item) => item.isPurchasable && item.itemType === 'material').map((item) => item.id))
  );
  const createPO = useCreatePurchaseOrder(companyId);

  const purchasableItems = items.filter((item) => item.isPurchasable && item.itemType === 'material');

  const handleGenerate = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item');
      return;
    }

    const poItems = purchasableItems
      .filter((item) => selectedItems.has(item.id))
      .map((item, index) => ({
        estimateItemId: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitCost, // Use cost price for PO
        sortOrder: index,
      }));

    try {
      await createPO.mutateAsync({
        estimateId,
        supplierName: supplierName || undefined,
        deliveryAddress: deliveryAddress || undefined,
        items: poItems,
      });
      onSuccess?.();
      onClose();
      setSupplierName('');
      setDeliveryAddress('');
    } catch (error) {
      console.error('Failed to create PO:', error);
      alert('Failed to create purchase order. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Purchase Order">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Supplier Name</label>
          <Input
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="Enter supplier name"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Delivery Address</label>
          <Input
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Enter delivery address"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Select Items</label>
          <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
            {purchasableItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No purchasable items found</p>
            ) : (
              purchasableItems.map((item) => (
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

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={selectedItems.size === 0 || createPO.isPending}
          >
            {createPO.isPending ? 'Generating...' : 'Generate PO'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

