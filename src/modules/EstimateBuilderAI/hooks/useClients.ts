// React Query hooks for Clients

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsRepo } from '../data/clientsRepo';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function useClients(companyId?: string) {
  const cid = companyId || SHARED_COMPANY_ID;
  
  return useQuery({
    queryKey: ['estimateBuilderAI', 'clients', cid],
    queryFn: () => clientsRepo.list(cid),
  });
}

export function useCreateClient(companyId?: string) {
  const queryClient = useQueryClient();
  const cid = companyId || SHARED_COMPANY_ID;

  return useMutation({
    mutationFn: (payload: { name: string; email?: string; phone?: string; address?: string }) =>
      clientsRepo.create(cid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimateBuilderAI', 'clients', cid] });
    },
  });
}

