import React from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Sparkles,
  Columns,
  Eye,
  Edit3,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import type { DocumentStylePreset } from '../types';
import { STYLE_PRESETS } from '../constants/presets';
import { SAMPLE_DOCUMENTS } from '../constants/sampleDocuments';

interface NavbarProps {
  docTitle: string;
  setDocTitle: (title: string) => void;
  activePreset: DocumentStylePreset;
  setActivePreset: (preset: DocumentStylePreset) => void;
  viewMode: 'split' | 'editor' | 'preview';
  setViewMode: (mode: 'split' | 'editor' | 'preview') => void;
  onCopyFormatted: () => void;
  isCopied: boolean;
  onExportDocx: () => void;
  isExporting: boolean;
  onLoadSample: (sampleId: string) => void;
  stats: { words: number; readingTime: number };
}

export const Navbar: React.FC<NavbarProps> = ({
  docTitle,
  setDocTitle,
  activePreset,
  setActivePreset,
  viewMode,
  setViewMode,
  onCopyFormatted,
  isCopied,
  onExportDocx,
  isExporting,
  onLoadSample,
  stats,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="brand">
          <div className="brand-logo">
            <FileText className="brand-icon" size={22} />
            <span className="brand-badge-doc">W</span>
          </div>
          <div className="brand-text">
            <div className="brand-title">
              MarkWord
              <span className="client-badge">
                <ShieldCheck size={12} /> 100% Private
              </span>
            </div>
            <div className="brand-subtitle">Markdown to Word Studio</div>
          </div>
        </div>

        <div className="nav-divider" />

        {/* Document Title Input */}
        <div className="doc-title-wrapper">
          <input
            type="text"
            className="doc-title-input"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            placeholder="Document Title"
            title="Click to rename document"
          />
        </div>
      </div>

      <div className="navbar-center">
        {/* View Mode Switcher */}
        <div className="view-mode-toggle">
          <button
            className={`view-btn ${viewMode === 'editor' ? 'active' : ''}`}
            onClick={() => setViewMode('editor')}
            title="Markdown Editor Only"
          >
            <Edit3 size={15} />
            <span>Editor</span>
          </button>
          <button
            className={`view-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
            title="Side-by-Side Split View"
          >
            <Columns size={15} />
            <span>Side-by-Side</span>
          </button>
          <button
            className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
            title="Word Document View"
          >
            <Eye size={15} />
            <span>Word View</span>
          </button>
        </div>

        {/* Preset Selector Dropdown */}
        <div className="preset-selector-wrapper">
          <Palette size={15} className="preset-icon" />
          <select
            className="preset-select"
            value={activePreset.id}
            onChange={(e) => {
              const selected = STYLE_PRESETS.find((p) => p.id === e.target.value);
              if (selected) setActivePreset(selected);
            }}
            title="Choose Word Document Style Preset"
          >
            {STYLE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                Style: {p.name} ({p.fontFamily})
              </option>
            ))}
          </select>
        </div>

        {/* Sample Docs Dropdown */}
        <div className="sample-selector-wrapper">
          <Sparkles size={14} className="sample-icon" />
          <select
            className="sample-select"
            onChange={(e) => {
              if (e.target.value) {
                onLoadSample(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            title="Load a sample document"
          >
            <option value="" disabled>
              Load Sample...
            </option>
            {SAMPLE_DOCUMENTS.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="navbar-right">
        {/* Quick Document Stats */}
        <div className="nav-stats">
          <span className="stat-item">
            <strong>{stats.words}</strong> words
          </span>
          <span className="stat-separator">•</span>
          <span className="stat-item">
            <strong>{stats.readingTime}</strong> min read
          </span>
        </div>

        {/* PRIMARY ACTION 1: Copy to Word */}
        <button
          className={`action-btn copy-btn ${isCopied ? 'copied' : ''}`}
          onClick={onCopyFormatted}
          title="Copy rich-formatted document to clipboard (paste directly into Word / Google Docs)"
        >
          {isCopied ? (
            <>
              <Check size={16} className="btn-icon" />
              <span>Copied to Word!</span>
            </>
          ) : (
            <>
              <Copy size={16} className="btn-icon" />
              <span>Copy to Word</span>
            </>
          )}
        </button>

        {/* PRIMARY ACTION 2: Download .docx */}
        <button
          className="action-btn export-btn"
          onClick={onExportDocx}
          disabled={isExporting}
          title="Download Microsoft Word (.docx) file"
        >
          {isExporting ? (
            <>
              <div className="spinner" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download size={16} className="btn-icon" />
              <span>Export .docx</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
