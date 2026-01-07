import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { tokensRepo } from '../data/tokens.repo';
import { activityRepo } from '../data/activity.repo';
import { versionsRepo } from '../data/versions.repo';
import { supabase } from '@/lib/supabase';

export function QuoteSendPanel({
  companyId,
  estimateId,
  versions,
  onSent,
}: {
  companyId: string;
  estimateId: string;
  versions: any[];
  onSent: () => Promise<void>;
}) {
  const shareUrl = (token: string) => `${window.location.origin}/shared/quote/${token}`;

  async function send() {
    // Ensure a version exists
    let versionId: string;
    if (versions.length === 0) {
      const version = await versionsRepo.createRevision(companyId, estimateId, { label: 'Initial quotation' });
      versionId = version.id;
    } else {
      // Use latest version
      versionId = versions[0].id;
    }

    // Create token for this version
    const tokenRow = await tokensRepo.createQuoteToken(companyId, estimateId, versionId, null);
    const url = shareUrl(tokenRow.token);

    await navigator.clipboard.writeText(url);

    // Update version status to sent
    await versionsRepo.markStatus(companyId, versionId, 'sent');

    // Update estimate status to sent
    await supabase
      .from('estimates')
      .update({ status: 'sent' })
      .eq('company_id', companyId)
      .eq('id', estimateId);

    const version = versions.find((v) => v.id === versionId) || await versionsRepo.get(companyId, versionId);
    await activityRepo.log(companyId, estimateId, 'estimate', estimateId, 'sent', 'Quote link generated and copied to clipboard.', { url, version_number: version.version_number });

    await onSent();
  }

  return (
    <Card className="p-3 space-y-2">
      <div className="text-sm font-semibold">Send quote</div>
      <div className="text-xs text-slate-500">
        Creates a version snapshot (if needed) and generates a client share link.
      </div>
      <Button size="sm" onClick={send}>
        Generate version link + mark sent
      </Button>
    </Card>
  );
}

