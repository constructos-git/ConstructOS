// React Query hooks for Briefs

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { briefsRepo } from '../data/briefsRepo';
import type { EstimateBriefContent } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function useBrief(companyId: string | undefined, estimateId: string | undefined) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'brief', cid, estimateId],
    queryFn: () => briefsRepo.get(cid, estimateId!),
    enabled: !!estimateId,
  });
}

export function useCreateBrief(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: {
      estimateId: string;
      brief: EstimateBriefContent;
      markdown?: string;
      assumptions?: string;
      exclusions?: string;
    }) => briefsRepo.create(cid, payload.estimateId, payload.brief, payload.markdown, payload.assumptions, payload.exclusions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'brief', cid, variables.estimateId] });
    },
  });
}

export function useUpdateBrief(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: {
      estimateId: string;
      updates: {
        briefJson?: EstimateBriefContent;
        briefMarkdown?: string;
        assumptions?: string;
        exclusions?: string;
      };
    }) => briefsRepo.update(cid, payload.estimateId, payload.updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'brief', cid, variables.estimateId] });
    },
  });
}

