// React Query hooks for Content Blocks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentBlocksRepo } from '../data/contentBlocksRepo';
import type { ContentBlock } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function useContentBlocks(companyId?: string, filters?: { type?: string; tags?: string[] }) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'contentBlocks', cid, filters],
    queryFn: () => contentBlocksRepo.list(cid, filters),
  });
}

export function useContentBlock(companyId: string | undefined, blockId: string | undefined) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'contentBlock', cid, blockId],
    queryFn: () => contentBlocksRepo.get(cid, blockId!),
    enabled: !!blockId,
  });
}

export function useCreateContentBlock(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (block: Omit<ContentBlock, 'id' | 'isSeed'>) => contentBlocksRepo.create(cid, block),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'contentBlocks', cid] });
    },
  });
}

export function useUpdateContentBlock(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: { blockId: string; updates: Partial<Omit<ContentBlock, 'id' | 'isSeed'>> }) =>
      contentBlocksRepo.update(cid, payload.blockId, payload.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'contentBlocks', cid] });
    },
  });
}

