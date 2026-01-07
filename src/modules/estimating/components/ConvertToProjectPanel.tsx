import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { conversionRepo } from '../data/conversion.repo';

export function ConvertToProjectPanel({
  companyId,
  estimateId,
  acceptedVersionId,
  disabledReason,
  onConverted,
}: {
  companyId: string;
  estimateId: string;
  acceptedVersionId: string | null;
  disabledReason?: string;
  onConverted: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Card className="p-3 space-y-2">
      <div className="text-sm font-semibold">Convert to project</div>
      <div className="text-xs text-slate-500">
        Creates a project and generates initial Work Orders and Purchase Orders from the accepted quote version.
      </div>

      {acceptedVersionId ? (
        <Button
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            try {
              await conversionRepo.convertAcceptedVersionToProject(companyId, estimateId, acceptedVersionId);
              await onConverted();
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? 'Converting…' : 'Convert accepted quote to project'}
        </Button>
      ) : (
        <div className="text-xs text-amber-600">
          {disabledReason || 'No accepted quote version found yet.'}
        </div>
      )}
    </Card>
  );
}

