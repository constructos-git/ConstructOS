import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { usePermissionsStore } from '@/stores/permissionsStore';
import { clientPacksRepo } from '../data/clientPacks.repo';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function ClientPacksPage() {
  const { currentUser } = usePermissionsStore();
  const companyId = currentUser?.id || SHARED_COMPANY_ID;

  const [packs, setPacks] = useState<any[]>([]);

  useEffect(() => {
    loadPacks();
  }, [companyId]);

  async function loadPacks() {
    try {
      const data = await clientPacksRepo.list(companyId);
      setPacks(data);
    } catch (error) {
      console.error('Failed to load packs:', error);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Client Packs</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {packs.map((pack) => (
          <Card key={pack.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{pack.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(pack.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

