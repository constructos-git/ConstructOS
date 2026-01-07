import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { SettingsTab } from './SettingsTab';
import { MaterialsTab } from './MaterialsTab';
import { LabourTab } from './LabourTab';
import { PlantTab } from './PlantTab';
import { RegionsTab } from './RegionsTab';
import { ProvidersTab } from './ProvidersTab';
import { usePermissionsStore } from '@/stores/permissionsStore';
import { seedRegionsAndTrades } from '../../rates/seed/seedRegionsAndTrades';
import { seedRateBook } from '../../rates/seed/seedRateBook';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function EstimatingSettingsPage() {
  const { currentUser } = usePermissionsStore();
  const companyId = (currentUser as any)?.companyId || SHARED_COMPANY_ID;
  const [activeTab, setActiveTab] = useState<'settings' | 'materials' | 'labour' | 'plant' | 'regions' | 'providers'>('settings');

  // Seed on mount if needed
  useEffect(() => {
    seedRegionsAndTrades(companyId).catch(console.error);
    seedRateBook(companyId).catch(console.error);
  }, [companyId]);

  return (
    <div className="space-y-4">
      <Card className="p-3">
        <div className="text-lg font-semibold">Rates & Settings</div>
      </Card>

      <div className="flex items-center gap-2 border-b">
        {(['settings', 'materials', 'labour', 'plant', 'regions', 'providers'] as const).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium capitalize ${activeTab === tab ? 'border-b-2 border-slate-900' : 'text-slate-500'}`}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'settings' && <SettingsTab companyId={companyId} />}
        {activeTab === 'materials' && <MaterialsTab companyId={companyId} />}
        {activeTab === 'labour' && <LabourTab companyId={companyId} />}
        {activeTab === 'plant' && <PlantTab companyId={companyId} />}
        {activeTab === 'regions' && <RegionsTab companyId={companyId} />}
        {activeTab === 'providers' && <ProvidersTab companyId={companyId} />}
      </div>
    </div>
  );
}

