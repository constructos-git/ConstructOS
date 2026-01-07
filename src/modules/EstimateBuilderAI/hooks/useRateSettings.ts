// React Query hooks for Rate Settings

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rateSettingsRepo } from '../data/rateSettingsRepo';
import type { RateSettings } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function useRateSettings(companyId: string | undefined, estimateId: string | undefined) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'rateSettings', cid, estimateId],
    queryFn: () => rateSettingsRepo.get(cid, estimateId!),
    enabled: !!estimateId,
  });
}

export function useCreateRateSettings(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: { estimateId: string; settings: RateSettings }) =>
      rateSettingsRepo.create(cid, payload.estimateId, payload.settings),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'rateSettings', cid, variables.estimateId] });
    },
  });
}

export function useUpdateRateSettings(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: { estimateId: string; settings: Partial<RateSettings> }) =>
      rateSettingsRepo.update(cid, payload.estimateId, payload.settings),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'rateSettings', cid, variables.estimateId] });
    },
  });
}

