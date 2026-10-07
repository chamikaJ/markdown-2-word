import type { DocumentStylePreset } from '../types';

export const STYLE_PRESETS: DocumentStylePreset[] = [
  {
    id: 'standard-word',
    name: 'Standard Word (Aptos Display)',
    description: 'Official Microsoft 365 default style with clean black headings and Aptos Display font',
    fontFamily: 'Aptos Display',
    fontSize: 11,
    headingFontFamily: 'Aptos Display',
    primaryColor: '111827', // Crisp Black / Charcoal
    secondaryColor: '1F2937', // Dark Charcoal
    textColor: '1F2937', // Black / Dark Gray body text
    lineSpacing: 1.15,
    codeFontFamily: 'Consolas',
    codeBgColor: 'F3F4F6',
    tableHeaderBg: '2D3748', // Charcoal header
    tableBorderColor: 'D1D5DB',
    quoteBorderColor: '4B5563',
    margins: { top: 1, bottom: 1, left: 1, right: 1 },
  },
  {
    id: 'modern-corporate',
    name: 'Modern Office (Navy Blue Headings)',
    description: 'Microsoft Office 365 default style with Navy/Steel Blue colored headings',
    fontFamily: 'Calibri',
    fontSize: 11,
    headingFontFamily: 'Calibri',
    primaryColor: '1E3A8A', // Deep Navy
    secondaryColor: '1D4ED8', // Steel Blue
    textColor: '1F2937', // Charcoal Gray body text
    lineSpacing: 1.15,
    codeFontFamily: 'Consolas',
    codeBgColor: 'F3F4F6',
    tableHeaderBg: '1E3A8A',
    tableBorderColor: 'D1D5DB',
    quoteBorderColor: '2563EB',
    margins: { top: 1, bottom: 1, left: 1, right: 1 },
  },
  {
    id: 'academic-formal',
    name: 'Academic / Formal',
    description: 'Times New Roman standard, 1.5 line spacing, traditional research style',
    fontFamily: 'Times New Roman',
    fontSize: 12,
    headingFontFamily: 'Times New Roman',
    primaryColor: '111827', // Black
    secondaryColor: '1F2937',
    textColor: '111827',
    lineSpacing: 1.5,
    codeFontFamily: 'Courier New',
    codeBgColor: 'F9FAFB',
    tableHeaderBg: '374151',
    tableBorderColor: '9CA3AF',
    quoteBorderColor: '4B5563',
    margins: { top: 1, bottom: 1, left: 1, right: 1 },
  },
  {
    id: 'tech-developer',
    name: 'Tech & Engineering',
    description: 'Inter & JetBrains Mono, indigo accents, shaded code containers',
    fontFamily: 'Inter',
    fontSize: 10.5,
    headingFontFamily: 'Plus Jakarta Sans',
    primaryColor: '1E293B', // Dark Slate for H1
    secondaryColor: '4338CA', // Indigo for H2
    textColor: '1E293B',
    lineSpacing: 1.25,
    codeFontFamily: 'JetBrains Mono',
    codeBgColor: 'F1F5F9',
    tableHeaderBg: '334155',
    tableBorderColor: 'CBD5E1',
    quoteBorderColor: '6366F1',
    margins: { top: 0.8, bottom: 0.8, left: 0.8, right: 0.8 },
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimalist',
    description: 'Monochrome, sleek modern spacing with subtle gray accents',
    fontFamily: 'Arial',
    fontSize: 10.5,
    headingFontFamily: 'Arial',
    primaryColor: '18181B', // Dark Zinc
    secondaryColor: '27272A',
    textColor: '27272A',
    lineSpacing: 1.2,
    codeFontFamily: 'Consolas',
    codeBgColor: 'F4F4F5',
    tableHeaderBg: '27272A',
    tableBorderColor: 'E4E4E7',
    quoteBorderColor: '71717A',
    margins: { top: 1, bottom: 1, left: 1, right: 1 },
  },
];
