import type { DocumentStats } from '../types';

export function calculateDocumentStats(markdown: string): DocumentStats {
  if (!markdown || !markdown.trim()) {
    return {
      words: 0,
      characters: 0,
      readingTime: 0,
      headings: 0,
      tables: 0,
      codeBlocks: 0,
    };
  }

  const plainText = markdown
    .replace(/```[\s\S]*?```/g, '') // remove code blocks for word count
    .replace(/[#*`_~>\[\]\(\)\-]/g, ' ')
    .trim();

  const words = plainText.length > 0 ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const characters = markdown.length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  // Count headings
  const headings = (markdown.match(/^#{1,6}\s+.+$/gm) || []).length;

  // Count tables (lines with |)
  const tableMarkers = (markdown.match(/\|[\s-:]+\|/g) || []).length;

  // Count code blocks
  const codeBlocks = (markdown.match(/```/g) || []).length / 2;

  return {
    words,
    characters,
    readingTime,
    headings,
    tables: Math.floor(tableMarkers),
    codeBlocks: Math.floor(codeBlocks),
  };
}

export function extractDocumentTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (match && match[1]) {
    return match[1].trim().replace(/[^\w\s-]/g, '').trim() || 'Document';
  }
  return 'Document';
}
