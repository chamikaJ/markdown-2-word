import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  FileCode,
  Quote,
  Table as TableIcon,
  Minus,
  Link as LinkIcon,
  UploadCloud,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  onImportFile: (content: string, filename: string) => void;
  onClear: () => void;
  stats: { words: number; characters: number };
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onImportFile,
  onClear,
  stats,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Sync scroll of line numbers with textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Generate line numbers
  const linesCount = Math.max(1, value.split('\n').length);
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  // Helper to insert markdown syntax at cursor
  const insertSyntax = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;

    const replacement = `${before}${selectedText}${after}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        insertSyntax('**', '**', 'bold text');
      } else if (e.key === 'i') {
        e.preventDefault();
        insertSyntax('*', '*', 'italic text');
      } else if (e.key === 'k') {
        e.preventDefault();
        insertSyntax('[', '](https://example.com)', 'link text');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      insertSyntax('  ');
    }
  };

  // File Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      readFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      readFile(e.target.files[0]);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) {
        onImportFile(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const copyRawMarkdown = () => {
    navigator.clipboard.writeText(value);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const insertTable = () => {
    const tableTemplate = `
| Header 1 | Header 2 | Header 3 |
| :--- | :--- | :--- |
| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |
| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |
`;
    insertSyntax('\n' + tableTemplate.trim() + '\n');
  };

  const insertCallout = (type: string) => {
    insertSyntax(`\n> [!${type}]\n> `, '\n', 'Important note or directive goes here.');
  };

  return (
    <div
      className={`editor-container ${isDragging ? 'drag-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".md,.markdown,.txt"
        style={{ display: 'none' }}
      />

      {/* Editor Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('# ', '', 'Heading 1')}
            title="Heading 1 (#)"
          >
            <Heading1 size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('## ', '', 'Heading 2')}
            title="Heading 2 (##)"
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('### ', '', 'Heading 3')}
            title="Heading 3 (###)"
          >
            <Heading3 size={16} />
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('**', '**', 'bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('*', '*', 'italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('~~', '~~', 'strikethrough')}
            title="Strikethrough (~~)"
          >
            <Strikethrough size={16} />
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('- ', '', 'Bullet item')}
            title="Bulleted List"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('1. ', '', 'Numbered item')}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('- [ ] ', '', 'Task item')}
            title="Task List Checkbox"
          >
            <CheckSquare size={16} />
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('`', '`', 'code')}
            title="Inline Code (`)"
          >
            <Code size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('```typescript\n', '\n```', '// code block here')}
            title="Code Block (```)"
          >
            <FileCode size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('> ', '', 'Quote text')}
            title="Blockquote (>)"
          >
            <Quote size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={insertTable}
            title="Insert Table"
          >
            <TableIcon size={16} />
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('[', '](https://example.com)', 'link text')}
            title="Insert Link (Ctrl+K)"
          >
            <LinkIcon size={16} />
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => insertSyntax('\n---\n')}
            title="Horizontal Divider"
          >
            <Minus size={16} />
          </button>
        </div>

        <div className="toolbar-separator" />

        {/* Callout Quick Menus */}
        <div className="toolbar-group callout-group">
          <button
            type="button"
            className="tool-btn-badge note"
            onClick={() => insertCallout('NOTE')}
            title="Insert Note Callout"
          >
            [!NOTE]
          </button>
          <button
            type="button"
            className="tool-btn-badge tip"
            onClick={() => insertCallout('TIP')}
            title="Insert Tip Callout"
          >
            [!TIP]
          </button>
          <button
            type="button"
            className="tool-btn-badge warning"
            onClick={() => insertCallout('WARNING')}
            title="Insert Warning Callout"
          >
            [!WARN]
          </button>
        </div>

        {/* Utility Actions */}
        <div className="toolbar-actions-right">
          <button
            type="button"
            className="tool-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload .md or .txt file"
          >
            <UploadCloud size={16} />
            <span className="btn-label">Import</span>
          </button>

          <button
            type="button"
            className="tool-btn"
            onClick={copyRawMarkdown}
            title="Copy Raw Markdown"
          >
            {copiedRaw ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            <span className="btn-label">{copiedRaw ? 'Copied' : 'Raw'}</span>
          </button>

          <button
            type="button"
            className="tool-btn danger"
            onClick={onClear}
            title="Clear Markdown Content"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="editor-body">
        <div className="line-numbers" ref={lineNumbersRef} aria-hidden="true">
          {lineNumbers.map((num) => (
            <div key={num} className="line-number">
              {num}
            </div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste your Markdown here, or drag & drop a .md file..."
          spellCheck={false}
        />

        {/* Drag and Drop Overlay */}
        {isDragging && (
          <div className="drag-overlay">
            <div className="drag-content">
              <UploadCloud size={48} className="drag-icon" />
              <h3>Drop your Markdown file here</h3>
              <p>Supports .md, .markdown, and .txt files</p>
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer Status Bar */}
      <div className="editor-statusbar">
        <div className="status-left">
          <span className="status-badge">MARKDOWN</span>
          <span className="status-info">UTF-8</span>
        </div>
        <div className="status-right">
          <span>{stats.characters.toLocaleString()} chars</span>
          <span>•</span>
          <span>{stats.words.toLocaleString()} words</span>
          <span>•</span>
          <span>{linesCount.toLocaleString()} lines</span>
        </div>
      </div>
    </div>
  );
};
