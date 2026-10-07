export interface DocumentStylePreset {
  id: string;
  name: string;
  description: string;
  fontFamily: string;
  fontSize: number; // in pt
  headingFontFamily: string;
  primaryColor: string; // Hex for headings and accents (without # for docx)
  secondaryColor: string; // Hex for subheadings
  textColor: string; // Body text hex
  lineSpacing: number; // e.g., 1.15, 1.5, 2.0
  codeFontFamily: string;
  codeBgColor: string;
  tableHeaderBg: string;
  tableBorderColor: string;
  quoteBorderColor: string;
  margins: {
    top: number; // inches
    bottom: number;
    left: number;
    right: number;
  };
}

export interface DocumentStats {
  words: number;
  characters: number;
  readingTime: number; // minutes
  headings: number;
  tables: number;
  codeBlocks: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'error';
}
