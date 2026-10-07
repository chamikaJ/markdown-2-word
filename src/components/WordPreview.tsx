import React, { useMemo } from 'react';
import {
  Copy,
  Check,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react';
import { marked } from 'marked';
import type { DocumentStylePreset } from '../types';

interface WordPreviewProps {
  markdown: string;
  preset: DocumentStylePreset;
  docTitle: string;
  onCopyFormatted: () => void;
  isCopied: boolean;
}

export const WordPreview: React.FC<WordPreviewProps> = ({
  markdown,
  preset,
  docTitle: _docTitle,
  onCopyFormatted,
  isCopied,
}) => {
  // Render markdown to HTML with Callout enhancements
  const renderedHtml = useMemo(() => {
    if (!markdown.trim()) return '';

    const raw = marked.parse(markdown, { async: false }) as string;

    // Transform GitHub alerts into styled callout elements
    return raw.replace(
      /<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*<br\s*\/?>)?([\s\S]*?)<\/p>\s*<\/blockquote>/gi,
      (_match, type, content) => {
        const typeUpper = type.toUpperCase();
        return `<div class="word-callout callout-${typeUpper.toLowerCase()}">
          <div class="callout-header">
            <span class="callout-badge">${typeUpper}</span>
          </div>
          <div class="callout-body">${content.trim()}</div>
        </div>`;
      }
    );
  }, [markdown]);

  return (
    <div className="preview-pane-container">
      {/* Word Document Toolbar Header */}
      <div className="preview-toolbar">
        <div className="preview-info">
          <span className="doc-format-badge">
            <FileText size={14} /> Word Document View
          </span>
          <span className="preset-name-pill">
            <Layers size={13} /> {preset.name} ({preset.fontFamily})
          </span>
        </div>

        <div className="preview-actions">
          {/* Quick Copy Formatted Button */}
          <button
            type="button"
            className={`preview-copy-btn ${isCopied ? 'copied' : ''}`}
            onClick={onCopyFormatted}
            title="Copy formatted document for Word / Google Docs (Ctrl+V)"
          >
            {isCopied ? (
              <>
                <Check size={15} />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={15} />
                <span>Copy to Word</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Continuous Scrollable Word Document View */}
      <div className="preview-scroll-area">
        <div className="word-doc-wrapper">
          <div
            className="word-doc-body"
            style={{
              fontFamily: `"${preset.fontFamily}", "Aptos Display", "Aptos", Calibri, sans-serif`,
              color: `#${preset.textColor}`,
              lineHeight: preset.lineSpacing,
            }}
          >
            {/* Dynamic CSS matching the active Word preset */}
            <style>{`
              .word-document-content {
                font-family: "${preset.fontFamily}", "Aptos Display", "Aptos", Calibri, sans-serif;
                color: #${preset.textColor};
                line-height: ${preset.lineSpacing};
              }
              .word-document-content h1 {
                font-family: "${preset.headingFontFamily}", "Aptos Display", "Aptos", sans-serif;
                color: #${preset.primaryColor};
                font-size: ${Math.round(preset.fontSize * 2.1)}pt;
                border-bottom: 2px solid #${preset.tableBorderColor};
                padding-bottom: 5pt;
                margin-top: 22pt;
                margin-bottom: 10pt;
                font-weight: 700;
              }
              .word-document-content h1:first-child {
                margin-top: 0;
              }
              .word-document-content h2 {
                font-family: "${preset.headingFontFamily}", "Aptos Display", "Aptos", sans-serif;
                color: #${preset.secondaryColor};
                font-size: ${Math.round(preset.fontSize * 1.6)}pt;
                margin-top: 18pt;
                margin-bottom: 8pt;
                font-weight: 600;
              }
              .word-document-content h3 {
                font-family: "${preset.headingFontFamily}", "Aptos Display", "Aptos", sans-serif;
                color: #${preset.secondaryColor};
                font-size: ${Math.round(preset.fontSize * 1.3)}pt;
                margin-top: 14pt;
                margin-bottom: 6pt;
                font-weight: 600;
              }
              .word-document-content h4,
              .word-document-content h5,
              .word-document-content h6 {
                font-family: "${preset.headingFontFamily}", sans-serif;
                color: #${preset.primaryColor};
                font-size: ${Math.round(preset.fontSize * 1.1)}pt;
                margin-top: 12pt;
                margin-bottom: 4pt;
                font-weight: 600;
              }
              .word-document-content p {
                font-size: ${preset.fontSize}pt;
                margin-top: 0;
                margin-bottom: 10pt;
              }
              .word-document-content blockquote {
                border-left: 4px solid #${preset.quoteBorderColor};
                background: #${preset.codeBgColor}60;
                padding: 8pt 16pt;
                margin: 12pt 0;
                color: #4b5563;
                font-style: italic;
                border-radius: 0 4px 4px 0;
              }
              .word-document-content table {
                border-collapse: collapse;
                width: 100%;
                margin: 14pt 0;
                font-size: ${preset.fontSize}pt;
              }
              .word-document-content th {
                background-color: #${preset.tableHeaderBg};
                color: #ffffff;
                font-weight: 600;
                text-align: left;
                padding: 8pt 12pt;
                border: 1px solid #${preset.tableBorderColor};
              }
              .word-document-content td {
                padding: 7pt 12pt;
                border: 1px solid #${preset.tableBorderColor};
              }
              .word-document-content tr:nth-child(even) td {
                background-color: #f9fafb;
              }
              .word-document-content pre {
                background-color: #${preset.codeBgColor};
                border: 1px solid #${preset.tableBorderColor};
                border-left: 4px solid #${preset.secondaryColor};
                border-radius: 4px;
                padding: 12pt 16pt;
                font-family: "${preset.codeFontFamily}", Consolas, monospace;
                font-size: ${preset.fontSize - 1.5}pt;
                line-height: 1.5;
                overflow-x: auto;
                margin: 14pt 0;
                color: #1e293b;
              }
              .word-document-content code {
                font-family: "${preset.codeFontFamily}", Consolas, monospace;
                background-color: #${preset.codeBgColor};
                color: #b91c1c;
                padding: 2pt 4pt;
                border-radius: 3px;
                font-size: 0.9em;
              }
              .word-document-content pre code {
                background: transparent;
                padding: 0;
                color: inherit;
              }
              .word-document-content hr {
                border: none;
                border-top: 1px solid #${preset.tableBorderColor};
                margin: 20pt 0;
              }
              .word-document-content a {
                color: #${preset.secondaryColor};
                text-decoration: underline;
              }
              .word-document-content ul,
              .word-document-content ol {
                padding-left: 24pt;
                margin-bottom: 10pt;
              }
              .word-document-content li {
                margin-bottom: 4pt;
                font-size: ${preset.fontSize}pt;
              }
              .word-document-content input[type="checkbox"] {
                margin-right: 6px;
                transform: scale(1.1);
              }
            `}</style>

            {/* Document Content */}
            {markdown.trim() ? (
              <div
                className="word-document-content"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : (
              <div className="preview-empty-state">
                <Sparkles size={36} className="empty-icon" />
                <h3>Word Document Preview</h3>
                <p>Type or paste markdown in the left editor to preview your live Word-formatted document.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
