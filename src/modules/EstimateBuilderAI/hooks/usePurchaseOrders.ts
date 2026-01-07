// React Query hooks for Purchase Orders

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersRepo } from '../data/purchaseOrdersRepo';
import type { PurchaseOrder } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function usePurchaseOrders(companyId?: string, estimateId?: string) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'purchaseOrders', cid, estimateId],
    queryFn: () => purchaseOrdersRepo.list(cid, estimateId),
  });
}

export function usePurchaseOrder(companyId: string | undefined, poId: string | undefined) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'purchaseOrder', cid, poId],
    queryFn: () => purchaseOrdersRepo.get(cid, poId!),
    enabled: !!poId,
  });
}

export function useCreatePurchaseOrder(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: {
      estimateId: string;
      supplierName?: string;
      supplierId?: string;
      deliveryAddress?: string;
      notes?: string;
      items: Array<{
        estimateItemId?: string;
        title: string;
        description?: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        sortOrder?: number;
      }>;
    }) => purchaseOrdersRepo.create(cid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'purchaseOrders', cid] });
    },
  });
}

export function useUpdatePurchaseOrder(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: { id: string; patch: Partial<PurchaseOrder> }) =>
      purchaseOrdersRepo.update(cid, payload.id, payload.patch),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'purchaseOrders', cid] });
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'purchaseOrder', cid, variables.id] });
    },
  });
}

