// React Query hooks for Bundles

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bundlesRepo } from '../data/bundlesRepo';
import type { Bundle } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function useBundles(companyId?: string) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'bundles', cid],
    queryFn: () => bundlesRepo.list(cid),
  });
}

export function useBundle(companyId: string | undefined, bundleId: string | undefined) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'bundle', cid, bundleId],
    queryFn: () => bundlesRepo.get(cid, bundleId!),
    enabled: !!bundleId,
  });
}

export function useCreateBundle(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (bundle: Omit<Bundle, 'id'>) => bundlesRepo.create(cid, bundle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'bundles', cid] });
    },
  });
}

export function useRecordBundleApplication(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: { estimateId: string; bundleId: string }) =>
      bundlesRepo.recordApplication(cid, payload.estimateId, payload.bundleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'bundleApplications', cid, variables.estimateId] });
    },
  });
}

