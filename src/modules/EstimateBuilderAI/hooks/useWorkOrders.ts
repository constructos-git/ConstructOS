// React Query hooks for Work Orders

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersRepo } from '../data/workOrdersRepo';
import type { WorkOrder } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function useWorkOrders(companyId?: string, estimateId?: string) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'workOrders', cid, estimateId],
    queryFn: () => workOrdersRepo.list(cid, estimateId),
  });
}

export function useWorkOrder(companyId: string | undefined, woId: string | undefined) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'workOrder', cid, woId],
    queryFn: () => workOrdersRepo.get(cid, woId!),
    enabled: !!woId,
  });
}

export function useCreateWorkOrder(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: {
      estimateId: string;
      contractorName?: string;
      contractorId?: string;
      pricingMode: 'fixed' | 'schedule';
      fixedPrice?: number;
      scopeText?: string;
      notes?: string;
      items?: Array<{
        estimateItemId?: string;
        title: string;
        description?: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        sortOrder?: number;
      }>;
    }) => workOrdersRepo.create(cid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'workOrders', cid] });
    },
  });
}

export function useUpdateWorkOrder(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: { id: string; patch: Partial<WorkOrder> }) =>
      workOrdersRepo.update(cid, payload.id, payload.patch),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'workOrders', cid] });
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'workOrder', cid, variables.id] });
    },
  });
}

