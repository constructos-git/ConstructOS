// React Query hooks for Estimate Builder AI Estimates

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estimateBuilderAIEstimatesRepo } from '../data/estimatesRepo';
import type {
  EstimateBrief,
  InternalCosting,
  CustomerEstimate,
  VisibilitySettings,
} from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function useEstimates(companyId?: string) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'estimates', cid],
    queryFn: () => estimateBuilderAIEstimatesRepo.list(cid),
  });
}

export function useEstimate(companyId: string | undefined, estimateId: string | undefined) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'estimate', cid, estimateId],
    queryFn: () => estimateBuilderAIEstimatesRepo.get(cid, estimateId!),
    enabled: !!estimateId,
  });
}

export function useCreateEstimate(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: {
      templateId: string;
      title: string;
      estimateBrief: EstimateBrief;
    }) => estimateBuilderAIEstimatesRepo.create(cid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'estimates', cid] });
    },
  });
}

export function useUpdateEstimate(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: {
      id: string;
      patch: {
        title?: string;
        status?: string;
        internalCosting?: InternalCosting;
        customerEstimate?: CustomerEstimate;
        visibilitySettings?: VisibilitySettings;
        clientId?: string;
        projectId?: string;
        opportunityId?: string;
      };
    }) => estimateBuilderAIEstimatesRepo.update(cid, payload.id, payload.patch),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'estimates', cid] });
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'estimate', cid, variables.id] });
    },
  });
}

export function useSaveAnswers(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: {
      estimateId: string;
      answers: Record<string, any>;
    }) => estimateBuilderAIEstimatesRepo.saveAnswers(cid, payload.estimateId, payload.answers),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'estimate', cid, variables.estimateId] });
    },
  });
}

