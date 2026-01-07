import { useState } from 'react';
import Button from '@/components/ui/Button';
import { exportAuditBundle } from './auditExport';
import { hasEstimatingPermission } from '../security/permissions';

export function AuditExportButton({
  companyId,
  estimateId,
}: {
  companyId: string;
  estimateId: string;
}) {
  const [exporting, setExporting] = useState(false);

  if (!hasEstimatingPermission('estimating.read')) {
    return null;
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportAuditBundle(companyId, estimateId);
    } catch (error) {
      console.error('Failed to export audit bundle:', error);
      alert('Failed to export audit bundle');
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button size="sm" variant="secondary" onClick={handleExport} disabled={exporting}>
      {exporting ? 'Exporting...' : 'Export Audit Bundle'}
    </Button>
  );
}

