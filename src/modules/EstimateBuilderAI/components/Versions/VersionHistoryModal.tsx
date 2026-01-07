// Version History Modal Component

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { History, RotateCcw, Eye } from 'lucide-react';
import { useVersions } from '../../hooks/useVersions';
import { formatDistanceToNow } from 'date-fns';
import type { EstimateVersion } from '../../domain/types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimateId: string;
  companyId?: string;
  onRestore?: (version: EstimateVersion) => void;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  estimateId,
  companyId,
  onRestore,
}: VersionHistoryModalProps) {
  const { data: versions, isLoading } = useVersions(companyId, estimateId);
  const [viewingVersion, setViewingVersion] = useState<EstimateVersion | null>(null);

  const handleRestore = (version: EstimateVersion) => {
    if (confirm(`Restore version ${version.versionNumber}? This will replace the current estimate.`)) {
      if (onRestore) {
        onRestore(version);
      }
      onClose();
    }
  };

  const getDiffSummary = (version: EstimateVersion) => {
    const snapshot = version.snapshotJson;
    const sections = snapshot.sections || [];
    const items = sections.flatMap((s: any) => s.items || []);
    
    return {
      sections: sections.length,
      items: items.length,
      total: snapshot.sections?.reduce((sum: number, s: any) => {
        const sectionTotal = s.items?.reduce((itemSum: number, item: any) => {
          return itemSum + (item.quantity || 0) * (item.unitPrice || 0);
        }, 0) || 0;
        return sum + sectionTotal;
      }, 0) || 0,
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Version History">
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading versions...</p>
          </div>
        ) : versions && versions.length > 0 ? (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {versions.map((version) => {
              const summary = getDiffSummary(version);
              return (
                <div
                  key={version.id}
                  className="border rounded-lg p-4 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Version {version.versionNumber}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    <div>Sections: {summary.sections}</div>
                    <div>Items: {summary.items}</div>
                    <div>Total: £{summary.total.toFixed(2)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewingVersion(version)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRestore(version)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No versions found
          </div>
        )}

        {viewingVersion && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Version {viewingVersion.versionNumber} Details</h3>
            <pre className="text-xs overflow-auto max-h-[300px]">
              {JSON.stringify(viewingVersion.snapshotJson, null, 2)}
            </pre>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => setViewingVersion(null)}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

