# MarkWord — Markdown to Microsoft Word Converter

A modern, fast, and 100% client-side web application that converts Markdown documents into beautifully formatted Microsoft Word (`.docx`) files in real-time. Features a side-by-side workspace, authentic Word styling, and one-click rich-text copying directly into Microsoft Word and Google Docs.

---

## ✨ Features

- **Side-by-Side Dual-Pane Workspace**:
  - **Left Pane**: Markdown editor with syntax toolbar, line numbering, keyboard shortcuts, and file drag-and-drop.
  - **Right Pane**: Continuous Word-formatted document view with authentic Word typography, styled tables, callouts, and code blocks.
  - **Draggable Splitter**: Easily adjust the split ratio between editor and preview, or toggle between **Side-by-Side**, **Editor**, and **Word View**.
- **Aptos Display as Default Font**:
  - Uses Microsoft 365's official default font family (`Aptos Display` / `Aptos`) for both body text and headings.
- **1-Click "Copy to Word / Google Docs"**:
  - Copies rich formatted HTML (`text/html` + `text/plain`) directly to your clipboard.
  - Hit `Ctrl+V` / `Cmd+V` in Microsoft Word, Google Docs, Apple Pages, or LibreOffice with full formatting, tables, headings, and colors intact.
- **Native `.docx` File Export**:
  - Generates valid OpenXML `.docx` files using the `docx` library.
  - Maps Markdown headings (`#`, `##`, `###`) directly to Word Heading styles for Word's Navigation Pane and Table of Contents.
  - Supports styled tables with header row shading, borders, code blocks with monospaced font, and automatic document footers (`Page X of Y`).
- **GitHub Alert Callouts**:
  - Renders GitHub-style alert callouts (`[!NOTE]`, `[!TIP]`, `[!WARNING]`, `[!IMPORTANT]`, `[!CAUTION]`) with styled left borders and badges.
- **Curated Document Style Presets**:
  - **Standard Word (Aptos Display)** — Modern Microsoft 365 default style with clean black headings.
  - **Modern Office (Navy Blue Headings)** — Microsoft Office 365 default style with navy/steel blue headings.
  - **Academic / Formal** — Times New Roman, 1.5 line spacing, traditional research paper layout.
  - **Tech & Engineering** — Inter & JetBrains Mono with indigo accents and shaded code containers.
  - **Clean Minimalist** — Monochrome typography with spacious margins.
- **100% Private & Secure**:
  - All processing and `.docx` generation happens completely inside your browser. No files are uploaded to any server.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **DOCX Generation**: [`docx`](https://docx.js.org/) (native OpenXML generation)
- **Markdown Parsing**: [`marked`](https://marked.js.org/) (AST token lexer)
- **Icons**: [`lucide-react`](https://lucide.dev/)
- **File Download**: [`file-saver`](https://github.com/eligrey/FileSaver.js/)
- **Styling**: Vanilla CSS with modern CSS custom properties and responsive layout

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed on your system.
- npm or pnpm.

### Installation

```bash
# Clone or navigate to the project directory
cd markdown-2-word

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the Vite development server
npm run dev
```

Open your browser at `http://localhost:5173/` (or the port specified in terminal).

### Production Build

```bash
# Type-check and create production build
npm run build

# Preview production build locally
npm run preview
```

---

## ⌨️ Editor Shortcuts & Hotkeys

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + B` / `Cmd + B` | Bold text (`**text**`) |
| `Ctrl + I` / `Cmd + I` | Italic text (`*text*`) |
| `Ctrl + K` / `Cmd + K` | Insert Link (`[text](url)`) |
| `Tab` | Indent with 2 spaces |

---

## 📄 License

MIT License. Free to use and modify.
