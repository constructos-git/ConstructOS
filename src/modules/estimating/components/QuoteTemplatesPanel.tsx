import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { emptyDoc } from './rich/tiptapHelpers';

export function QuoteTemplatesPanel({
  templates,
  onCreate,
  onDelete,
}: {
  templates: any[];
  onCreate: (payload: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState('Standard Domestic Quotation');
  const [desc, setDesc] = useState('Standard template for UK domestic works.');

  return (
    <Card className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Quote templates</div>
          <div className="text-xs text-slate-500">Create templates to standardise your quotations.</div>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="text-xs text-slate-600">Template name</label>
          <input className="w-full rounded border px-2 py-1 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="text-xs text-slate-600 mt-2 block">Description</label>
          <input className="w-full rounded border px-2 py-1 text-sm" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button className="w-full" onClick={async () => {
            await onCreate({
              name,
              description: desc,
              intro_title: 'Quotation',
              intro_body_rich: emptyDoc,
              programme_notes_rich: emptyDoc,
              payment_notes_rich: emptyDoc,
              warranty_notes_rich: emptyDoc,
              terms_body_rich: emptyDoc,
              inclusions: ['Site setup and protection', 'Supply and install as described'],
              exclusions: ['Planning fees', 'Party wall surveyor fees'],
              assumptions: ['Clear access', 'Customer selections confirmed before ordering'],
            });
          }}>
            Create template
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {templates.map((t) => (
          <div key={t.id} className="rounded border px-2 py-2 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{t.name}</div>
              <div className="text-xs text-slate-500 truncate">{t.description || ''}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onDelete(t.id)}>Delete</Button>
          </div>
        ))}
        {templates.length === 0 ? <div className="text-xs text-slate-500">No templates yet.</div> : null}
      </div>
    </Card>
  );
}

