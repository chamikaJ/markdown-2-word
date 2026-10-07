import { marked } from 'marked';
import type { DocumentStylePreset } from '../types';

/**
 * Transforms standard markdown HTML into Microsoft Word & Google Docs-optimized HTML
 * with explicit inline styles, font specifications, and table formatting.
 */
export function generateWordCompatibleHtml(markdown: string, preset: DocumentStylePreset): string {
  // Parse markdown to HTML
  const rawHtml = marked.parse(markdown, { async: false }) as string;

  // Process Callout syntax in blockquotes
  const processedHtml = rawHtml.replace(
    /<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*<br\s*\/?>)?([\s\S]*?)<\/p>\s*<\/blockquote>/gi,
    (_match, type, content) => {
      const typeUpper = type.toUpperCase();
      let color = '#2563EB';
      let bg = '#EFF6FF';
      let title = 'NOTE';

      if (typeUpper === 'TIP') {
        color = '#059669';
        bg = '#ECFDF5';
        title = 'TIP';
      } else if (typeUpper === 'IMPORTANT') {
        color = '#7C3AED';
        bg = '#F5F3FF';
        title = 'IMPORTANT';
      } else if (typeUpper === 'WARNING') {
        color = '#D97706';
        bg = '#FFFBEB';
        title = 'WARNING';
      } else if (typeUpper === 'CAUTION') {
        color = '#DC2626';
        bg = '#FEF2F2';
        title = 'CAUTION';
      }

      return `
        <div style="border-left: 4px solid ${color}; background-color: ${bg}; padding: 10pt 12pt; margin: 12pt 0; border-radius: 4px;">
          <strong style="color: ${color}; font-size: ${preset.fontSize}pt; text-transform: uppercase; letter-spacing: 0.5px;">${title}:</strong>
          <span style="color: #${preset.textColor}; font-size: ${preset.fontSize}pt;"> ${content.trim()}</span>
        </div>
      `;
    }
  );

  // Return wrapped HTML with inline Word styling rules
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    font-family: '${preset.fontFamily}', 'Aptos', 'Aptos Display', Calibri, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: ${preset.fontSize}pt;
    line-height: ${preset.lineSpacing};
    color: #${preset.textColor};
  }
  h1 {
    font-family: '${preset.headingFontFamily}', 'Aptos Display', 'Aptos', sans-serif;
    color: #${preset.primaryColor};
    font-size: ${Math.round(preset.fontSize * 2.2)}pt;
    margin-top: 18pt;
    margin-bottom: 8pt;
    font-weight: 700;
  }
  h2 {
    font-family: '${preset.headingFontFamily}', sans-serif;
    color: #${preset.secondaryColor};
    font-size: ${Math.round(preset.fontSize * 1.7)}pt;
    margin-top: 14pt;
    margin-bottom: 6pt;
    font-weight: 600;
  }
  h3 {
    font-family: '${preset.headingFontFamily}', sans-serif;
    color: #${preset.secondaryColor};
    font-size: ${Math.round(preset.fontSize * 1.35)}pt;
    margin-top: 12pt;
    margin-bottom: 4pt;
    font-weight: 600;
  }
  h4, h5, h6 {
    font-family: '${preset.headingFontFamily}', sans-serif;
    color: #${preset.primaryColor};
    font-size: ${Math.round(preset.fontSize * 1.15)}pt;
    margin-top: 10pt;
    margin-bottom: 4pt;
    font-weight: 600;
  }
  p {
    margin-top: 0;
    margin-bottom: 8pt;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 12pt 0;
    font-size: ${preset.fontSize}pt;
  }
  th {
    background-color: #${preset.tableHeaderBg};
    color: #ffffff;
    font-weight: bold;
    text-align: left;
    padding: 6pt 10pt;
    border: 1px solid #${preset.tableBorderColor};
  }
  td {
    padding: 6pt 10pt;
    border: 1px solid #${preset.tableBorderColor};
  }
  tr:nth-child(even) td {
    background-color: #f9fafb;
  }
  blockquote {
    border-left: 3.5px solid #${preset.quoteBorderColor};
    padding: 4pt 12pt;
    margin: 10pt 0;
    color: #4b5563;
    font-style: italic;
  }
  pre {
    background-color: #${preset.codeBgColor};
    border-left: 3px solid #${preset.tableBorderColor};
    padding: 8pt 12pt;
    font-family: '${preset.codeFontFamily}', 'Courier New', monospace;
    font-size: ${preset.fontSize - 1}pt;
    overflow-x: auto;
    margin: 10pt 0;
  }
  code {
    font-family: '${preset.codeFontFamily}', 'Courier New', monospace;
    background-color: #${preset.codeBgColor};
    padding: 1.5pt 3pt;
    font-size: ${preset.fontSize - 1}pt;
    color: #b91c1c;
    border-radius: 3px;
  }
  pre code {
    background-color: transparent;
    padding: 0;
    color: #1e293b;
  }
  ul, ol {
    margin-top: 0;
    margin-bottom: 8pt;
    padding-left: 20pt;
  }
  li {
    margin-bottom: 3pt;
  }
  hr {
    border: none;
    border-top: 1px solid #${preset.tableBorderColor};
    margin: 16pt 0;
  }
  a {
    color: #${preset.secondaryColor};
    text-decoration: underline;
  }
</style>
</head>
<body>
  ${processedHtml}
</body>
</html>`;
}

/**
 * Copies formatted document to the user's clipboard using the modern Async Clipboard API
 * with text/html and text/plain representations.
 */
export async function copyFormattedDocumentToClipboard(
  markdown: string,
  preset: DocumentStylePreset
): Promise<boolean> {
  const fullHtml = generateWordCompatibleHtml(markdown, preset);
  const plainText = markdown;

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (err) {
    console.warn('ClipboardItem API write failed, trying fallback', err);
  }

  // Fallback using invisible element + copy command
  try {
    const container = document.createElement('div');
    container.innerHTML = fullHtml;
    container.style.position = 'fixed';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      const success = document.execCommand('copy');
      selection.removeAllRanges();
      document.body.removeChild(container);
      if (success) return true;
    }
  } catch (err) {
    console.error('Fallback copy failed', err);
  }

  return false;
}

/**
 * Copies plain markdown text to clipboard
 */
export async function copyRawMarkdown(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
