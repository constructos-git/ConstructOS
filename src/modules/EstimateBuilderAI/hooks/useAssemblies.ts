// React Query hooks for Assemblies

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assembliesRepo } from '../data/assembliesRepo';
import type { Assembly } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function useAssemblies(companyId?: string) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'assemblies', cid],
    queryFn: () => assembliesRepo.list(cid),
  });
}

export function useAssembly(companyId: string | undefined, assemblyId: string | undefined) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'assembly', cid, assemblyId],
    queryFn: () => assembliesRepo.get(cid, assemblyId!),
    enabled: !!assemblyId,
  });
}

export function useCreateAssembly(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (assembly: Omit<Assembly, 'id'>) => assembliesRepo.create(cid, assembly),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'assemblies', cid] });
    },
  });
}

