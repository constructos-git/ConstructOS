// Recommended Bundles Panel Component

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Package, CheckCircle2 } from 'lucide-react';
import { getRecommendedBundles } from '../../domain/bundlesRegistry';
import { useAssemblies } from '../../hooks/useAssemblies';
import { useRecordBundleApplication } from '../../hooks/useBundles';
import type { Bundle } from '../../domain/types';
import { seedAssemblies } from '../../domain/assembliesRegistry';

interface RecommendedBundlesPanelProps {
  estimateId: string;
  templateId: string;
  answers: Record<string, any>;
  companyId?: string;
  onBundleApplied?: (bundleId: string) => void;
}

export function RecommendedBundlesPanel({
  estimateId,
  templateId,
  answers,
  companyId,
  onBundleApplied,
}: RecommendedBundlesPanelProps) {
  const { data: assemblies } = useAssemblies(companyId);
  const recordApplication = useRecordBundleApplication(companyId);
  const [appliedBundles, setAppliedBundles] = useState<Set<string>>(new Set());
  const [applyingBundle, setApplyingBundle] = useState<string | null>(null);

  const recommendedBundles = getRecommendedBundles(answers, templateId);
  const allAssemblies = assemblies || seedAssemblies;

  const handleApplyBundle = async (bundle: Bundle) => {
    if (appliedBundles.has(bundle.id)) {
      if (!confirm('This bundle has already been applied. Apply again?')) {
        return;
      }
    }

    setApplyingBundle(bundle.id);
    try {
      await recordApplication.mutateAsync({
        estimateId,
        bundleId: bundle.id,
      });

      setAppliedBundles(new Set([...appliedBundles, bundle.id]));
      
      if (onBundleApplied) {
        onBundleApplied(bundle.id);
      }
    } catch (error) {
      console.error('Failed to apply bundle:', error);
      alert('Failed to apply bundle. Please try again.');
    } finally {
      setApplyingBundle(null);
    }
  };

  if (recommendedBundles.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recommended Bundles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendedBundles.map((bundle) => {
            const bundleAssemblies = bundle.assemblyRefs
              .map((ref) => allAssemblies.find((a) => a.id === ref.assemblyId))
              .filter(Boolean);

            const isApplied = appliedBundles.has(bundle.id);

            return (
              <Card key={bundle.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{bundle.name}</CardTitle>
                      {bundle.description && (
                        <p className="text-sm text-muted-foreground mt-1">{bundle.description}</p>
                      )}
                    </div>
                    {isApplied && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Includes:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {bundleAssemblies.map((assembly) => (
                        <li key={assembly?.id}>{assembly?.name || 'Unknown'}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant={isApplied ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleApplyBundle(bundle)}
                    disabled={applyingBundle === bundle.id}
                  >
                    {applyingBundle === bundle.id
                      ? 'Applying...'
                      : isApplied
                      ? 'Applied'
                      : 'Apply Bundle'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

