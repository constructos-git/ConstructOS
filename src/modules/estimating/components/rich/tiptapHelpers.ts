// TipTap stores JSON; we keep a consistent shape for empty docs.
export const emptyDoc = { type: 'doc', content: [{ type: 'paragraph' }] };

export function ensureDocJson(v: any) {
  if (!v) return emptyDoc;
  if (typeof v === 'object' && v.type === 'doc') return v;
  return emptyDoc;
}

