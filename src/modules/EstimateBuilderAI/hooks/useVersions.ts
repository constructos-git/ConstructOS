// React Query hooks for Versions

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { versionsRepo } from '../data/versionsRepo';
import type { EstimateVersion } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function useVersions(companyId: string | undefined, estimateId: string | undefined) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'versions', cid, estimateId],
    queryFn: () => versionsRepo.list(cid, estimateId!),
    enabled: !!estimateId,
  });
}

export function useVersion(companyId: string | undefined, versionId: string | undefined) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'version', cid, versionId],
    queryFn: () => versionsRepo.get(cid, versionId!),
    enabled: !!versionId,
  });
}

export function useCreateVersion(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: { estimateId: string; snapshot: EstimateVersion['snapshotJson'] }) =>
      versionsRepo.create(cid, payload.estimateId, payload.snapshot),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'versions', cid, variables.estimateId] });
    },
  });
}

