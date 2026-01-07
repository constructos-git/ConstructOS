// React Query hooks for Measurements

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementsRepo } from '../data/measurementsRepo';
import type { EstimateMeasurements } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function useMeasurements(companyId: string | undefined, estimateId: string | undefined) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'measurements', cid, estimateId],
    queryFn: () => measurementsRepo.get(cid, estimateId!),
    enabled: !!estimateId,
  });
}

export function useCreateMeasurements(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: { estimateId: string; measurements: EstimateMeasurements }) =>
      measurementsRepo.create(cid, payload.estimateId, payload.measurements),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'measurements', cid, variables.estimateId] });
    },
  });
}

export function useUpdateMeasurements(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: { estimateId: string; measurements: Partial<EstimateMeasurements> }) =>
      measurementsRepo.update(cid, payload.estimateId, payload.measurements),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'measurements', cid, variables.estimateId] });
    },
  });
}

