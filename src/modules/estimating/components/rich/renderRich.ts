import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { ensureDocJson } from './tiptapHelpers';

export function renderRichToHtml(doc: any) {
  return generateHTML(ensureDocJson(doc), [StarterKit]);
}

