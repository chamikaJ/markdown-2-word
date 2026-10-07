import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { Navbar } from './components/Navbar';
import { MarkdownEditor } from './components/MarkdownEditor';
import { WordPreview } from './components/WordPreview';
import { Toast } from './components/Toast';
import type { DocumentStylePreset, ToastMessage } from './types';
import { STYLE_PRESETS } from './constants/presets';
import { SAMPLE_DOCUMENTS } from './constants/sampleDocuments';
import { copyFormattedDocumentToClipboard } from './utils/clipboardHelper';
import { exportDocxFile } from './utils/docxConverter';
import { calculateDocumentStats, extractDocumentTitle } from './utils/documentStats';

export const App: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_DOCUMENTS[0].markdown);
  const [docTitle, setDocTitle] = useState<string>('CloudSync Architecture & Technical Specification');
  const [activePreset, setActivePreset] = useState<DocumentStylePreset>(STYLE_PRESETS[0]);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Split-pane resizer state
  const [splitRatio, setSplitRatio] = useState<number>(50); // in percent
  const isDraggingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Document statistics
  const stats = calculateDocumentStats(markdown);

  const addToast = useCallback((title: string, description?: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1-Click Copy to Word / Google Docs
  const handleCopyFormatted = async () => {
    if (!markdown.trim()) {
      addToast('Document is empty', 'Add some markdown content to copy.', 'info');
      return;
    }

    try {
      const success = await copyFormattedDocumentToClipboard(markdown, activePreset);
      if (success) {
        setIsCopied(true);
        addToast(
          'Copied formatted document!',
          'Ready to paste (Ctrl+V) directly into Microsoft Word, Google Docs, or Pages.',
          'success'
        );
        setTimeout(() => setIsCopied(false), 2500);
      } else {
        addToast('Copy failed', 'Please try copying raw markdown instead.', 'error');
      }
    } catch (err) {
      console.error('Copy error:', err);
      addToast('Copy error', 'Failed to access clipboard.', 'error');
    }
  };

  // Export .docx file
  const handleExportDocx = async () => {
    if (!markdown.trim()) {
      addToast('Document is empty', 'Add some markdown content before exporting.', 'info');
      return;
    }

    setIsExporting(true);
    try {
      const filename = `${docTitle || 'document'}.docx`;
      await exportDocxFile(markdown, activePreset, filename);
      addToast('Word Document Downloaded', `Successfully created ${filename}`, 'success');
    } catch (err) {
      console.error('Export error:', err);
      addToast('Export Failed', 'There was an error generating the .docx file.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Import Markdown file
  const handleImportFile = (content: string, filename: string) => {
    setMarkdown(content);
    const newTitle = extractDocumentTitle(content) || filename.replace(/\.(md|markdown|txt)$/i, '');
    setDocTitle(newTitle);
    addToast('File Imported', `Loaded "${filename}" successfully.`, 'info');
  };

  // Load sample template
  const handleLoadSample = (sampleId: string) => {
    const found = SAMPLE_DOCUMENTS.find((d) => d.id === sampleId);
    if (found) {
      setMarkdown(found.markdown);
      setDocTitle(extractDocumentTitle(found.markdown));
      addToast('Sample Loaded', `Loaded template: ${found.name}`, 'info');
    }
  };

  // Clear workspace
  const handleClear = () => {
    if (window.confirm('Clear all markdown text?')) {
      setMarkdown('');
      setDocTitle('New Document');
    }
  };

  // Splitter mouse handlers
  const handleMouseDown = () => {
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
    if (newRatio >= 20 && newRatio <= 80) {
      setSplitRatio(newRatio);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="app-shell">
      <Navbar
        docTitle={docTitle}
        setDocTitle={setDocTitle}
        activePreset={activePreset}
        setActivePreset={setActivePreset}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onCopyFormatted={handleCopyFormatted}
        isCopied={isCopied}
        onExportDocx={handleExportDocx}
        isExporting={isExporting}
        onLoadSample={handleLoadSample}
        stats={stats}
      />

      <main className="workspace-main" ref={containerRef}>
        {/* Left Pane: Markdown Editor */}
        <div
          className={`workspace-pane editor-pane ${viewMode === 'preview' ? 'hidden' : ''}`}
          style={{
            flexBasis: viewMode === 'split' ? `${splitRatio}%` : viewMode === 'editor' ? '100%' : '0%',
            maxWidth: viewMode === 'split' ? `${splitRatio}%` : '100%',
          }}
        >
          <MarkdownEditor
            value={markdown}
            onChange={setMarkdown}
            onImportFile={handleImportFile}
            onClear={handleClear}
            stats={stats}
          />
        </div>

        {/* Resizer Handle */}
        {viewMode === 'split' && (
          <div
            className="split-resizer"
            onMouseDown={handleMouseDown}
            title="Drag to resize panes"
          >
            <div className="resizer-handle" />
          </div>
        )}

        {/* Right Pane: Word Preview Canvas */}
        <div
          className={`workspace-pane preview-pane ${viewMode === 'editor' ? 'hidden' : ''}`}
          style={{
            flexBasis: viewMode === 'split' ? `${100 - splitRatio}%` : viewMode === 'preview' ? '100%' : '0%',
            maxWidth: viewMode === 'split' ? `${100 - splitRatio}%` : '100%',
          }}
        >
          <WordPreview
            markdown={markdown}
            preset={activePreset}
            docTitle={docTitle}
            onCopyFormatted={handleCopyFormatted}
            isCopied={isCopied}
          />
        </div>
      </main>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
