import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  AlignmentType,
  ExternalHyperlink,
  Footer,
  PageNumber,
  convertInchesToTwip,
} from 'docx';
import { marked } from 'marked';
import type { Token, Tokens } from 'marked';
import { saveAs } from 'file-saver';
import type { DocumentStylePreset } from '../types';

interface CalloutConfig {
  type: string;
  color: string;
  bgColor: string;
  title: string;
}

const CALLOUT_MAP: Record<string, CalloutConfig> = {
  NOTE: { type: 'NOTE', color: '2563EB', bgColor: 'EFF6FF', title: 'Note' },
  TIP: { type: 'TIP', color: '059669', bgColor: 'ECFDF5', title: 'Tip' },
  IMPORTANT: { type: 'IMPORTANT', color: '7C3AED', bgColor: 'F5F3FF', title: 'Important' },
  WARNING: { type: 'WARNING', color: 'D97706', bgColor: 'FFFBEB', title: 'Warning' },
  CAUTION: { type: 'CAUTION', color: 'DC2626', bgColor: 'FEF2F2', title: 'Caution' },
};

function parseCallout(text: string): { config: CalloutConfig; cleanText: string } | null {
  const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*\n)?([\s\S]*)$/i);
  if (!match) return null;
  const key = match[1].toUpperCase();
  const config = CALLOUT_MAP[key] || CALLOUT_MAP.NOTE;
  return { config, cleanText: match[2].trim() };
}

// Convert inline marked tokens to docx TextRuns or Hyperlinks
function parseInlineTokens(
  tokens: Token[] | undefined,
  preset: DocumentStylePreset,
  inheritedStyles: { bold?: boolean; italics?: boolean; strike?: boolean; color?: string } = {}
): (TextRun | ExternalHyperlink)[] {
  if (!tokens || tokens.length === 0) return [];

  const runs: (TextRun | ExternalHyperlink)[] = [];

  for (const token of tokens) {
    if (token.type === 'text') {
      const textToken = token as Tokens.Text;
      if (textToken.tokens && textToken.tokens.length > 0) {
        runs.push(...parseInlineTokens(textToken.tokens, preset, inheritedStyles));
      } else {
        runs.push(
          new TextRun({
            text: textToken.text,
            bold: inheritedStyles.bold,
            italics: inheritedStyles.italics,
            strike: inheritedStyles.strike,
            color: inheritedStyles.color || preset.textColor,
            font: preset.fontFamily,
            size: preset.fontSize * 2, // docx uses half-points
          })
        );
      }
    } else if (token.type === 'strong') {
      const strongToken = token as Tokens.Strong;
      runs.push(
        ...parseInlineTokens(strongToken.tokens, preset, {
          ...inheritedStyles,
          bold: true,
        })
      );
    } else if (token.type === 'em') {
      const emToken = token as Tokens.Em;
      runs.push(
        ...parseInlineTokens(emToken.tokens, preset, {
          ...inheritedStyles,
          italics: true,
        })
      );
    } else if (token.type === 'del') {
      const delToken = token as Tokens.Del;
      runs.push(
        ...parseInlineTokens(delToken.tokens, preset, {
          ...inheritedStyles,
          strike: true,
        })
      );
    } else if (token.type === 'codespan') {
      const codeToken = token as Tokens.Codespan;
      runs.push(
        new TextRun({
          text: ` ${codeToken.text} `,
          font: preset.codeFontFamily,
          size: (preset.fontSize - 1) * 2,
          shading: {
            type: ShadingType.CLEAR,
            color: 'auto',
            fill: preset.codeBgColor,
          },
          color: 'B91C1C', // Dark crimson for inline code
        })
      );
    } else if (token.type === 'link') {
      const linkToken = token as Tokens.Link;
      runs.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: linkToken.text,
              style: 'Hyperlink',
              color: preset.secondaryColor,
              underline: {},
              font: preset.fontFamily,
              size: preset.fontSize * 2,
            }),
          ],
          link: linkToken.href,
        })
      );
    } else if (token.type === 'escape') {
      runs.push(
        new TextRun({
          text: (token as Tokens.Escape).text,
          bold: inheritedStyles.bold,
          italics: inheritedStyles.italics,
          color: inheritedStyles.color || preset.textColor,
          font: preset.fontFamily,
          size: preset.fontSize * 2,
        })
      );
    }
  }

  return runs;
}

// Convert marked tokens into docx elements
function convertTokensToDocxElements(
  tokens: Token[],
  preset: DocumentStylePreset
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token.type) {
      case 'heading': {
        const hToken = token as Tokens.Heading;
        const headingLevels = [
          HeadingLevel.HEADING_1,
          HeadingLevel.HEADING_2,
          HeadingLevel.HEADING_3,
          HeadingLevel.HEADING_4,
          HeadingLevel.HEADING_5,
          HeadingLevel.HEADING_6,
        ];
        const level = headingLevels[Math.min(hToken.depth - 1, 5)];

        // Dynamic font size for headings
        const headingSizes = [
          Math.round(preset.fontSize * 2.2),
          Math.round(preset.fontSize * 1.7),
          Math.round(preset.fontSize * 1.35),
          Math.round(preset.fontSize * 1.15),
          Math.round(preset.fontSize * 1.05),
          Math.round(preset.fontSize * 1.0),
        ];
        const headingSize = headingSizes[Math.min(hToken.depth - 1, 5)];
        const headingColor = hToken.depth === 1 ? preset.primaryColor : preset.secondaryColor;

        const inlineRuns = parseInlineTokens(hToken.tokens, preset, {
          color: headingColor,
          bold: true,
        });

        elements.push(
          new Paragraph({
            heading: level,
            spacing: {
              before: hToken.depth === 1 ? 360 : 260,
              after: 140,
              line: Math.round(preset.lineSpacing * 240),
            },
            children: inlineRuns.length > 0 ? inlineRuns : [
              new TextRun({
                text: hToken.text,
                bold: true,
                color: headingColor,
                font: preset.headingFontFamily,
                size: headingSize * 2,
              }),
            ],
          })
        );
        break;
      }

      case 'paragraph': {
        const pToken = token as Tokens.Paragraph;
        const inlineRuns = parseInlineTokens(pToken.tokens, preset);

        elements.push(
          new Paragraph({
            spacing: {
              before: 80,
              after: 140,
              line: Math.round(preset.lineSpacing * 240),
            },
            children: inlineRuns.length > 0 ? inlineRuns : [
              new TextRun({
                text: pToken.text,
                font: preset.fontFamily,
                size: preset.fontSize * 2,
                color: preset.textColor,
              }),
            ],
          })
        );
        break;
      }

      case 'blockquote': {
        const bqToken = token as Tokens.Blockquote;
        const rawText = bqToken.text.trim();
        const callout = parseCallout(rawText);

        if (callout) {
          // GitHub-style Alert/Callout Box
          elements.push(
            new Paragraph({
              spacing: { before: 180, after: 60 },
              indent: { left: convertInchesToTwip(0.3) },
              border: {
                left: {
                  color: callout.config.color,
                  space: 12,
                  style: BorderStyle.SINGLE,
                  size: 24, // thick bar
                },
              },
              children: [
                new TextRun({
                  text: `${callout.config.title.toUpperCase()}: `,
                  bold: true,
                  color: callout.config.color,
                  font: preset.fontFamily,
                  size: preset.fontSize * 2,
                }),
                new TextRun({
                  text: callout.cleanText,
                  color: preset.textColor,
                  font: preset.fontFamily,
                  size: preset.fontSize * 2,
                }),
              ],
            })
          );
        } else {
          // Standard blockquote
          elements.push(
            new Paragraph({
              spacing: { before: 140, after: 140 },
              indent: { left: convertInchesToTwip(0.35) },
              border: {
                left: {
                  color: preset.quoteBorderColor,
                  space: 12,
                  style: BorderStyle.SINGLE,
                  size: 18,
                },
              },
              children: [
                new TextRun({
                  text: rawText,
                  italics: true,
                  color: '4B5563',
                  font: preset.fontFamily,
                  size: preset.fontSize * 2,
                }),
              ],
            })
          );
        }
        break;
      }

      case 'list': {
        const listToken = token as Tokens.List;
        for (let itemIdx = 0; itemIdx < listToken.items.length; itemIdx++) {
          const item = listToken.items[itemIdx];
          const isTask = item.task;
          const isChecked = item.checked;
          const prefix = isTask ? (isChecked ? '☑ ' : '☐ ') : listToken.ordered ? `${itemIdx + 1}. ` : '• ';

          const inlineRuns = parseInlineTokens(item.tokens, preset);

          elements.push(
            new Paragraph({
              spacing: { before: 40, after: 40, line: Math.round(preset.lineSpacing * 240) },
              indent: { left: convertInchesToTwip(0.3) },
              children: [
                new TextRun({
                  text: prefix,
                  bold: isTask || listToken.ordered,
                  color: isTask && isChecked ? '059669' : preset.textColor,
                  font: preset.fontFamily,
                  size: preset.fontSize * 2,
                }),
                ...(inlineRuns.length > 0
                  ? inlineRuns
                  : [
                      new TextRun({
                        text: item.text,
                        font: preset.fontFamily,
                        size: preset.fontSize * 2,
                        color: preset.textColor,
                      }),
                    ]),
              ],
            })
          );
        }
        break;
      }

      case 'code': {
        const codeToken = token as Tokens.Code;
        const lines = codeToken.text.split('\n');

        // Optional lang header
        if (codeToken.lang) {
          elements.push(
            new Paragraph({
              spacing: { before: 160, after: 0 },
              children: [
                new TextRun({
                  text: codeToken.lang.toUpperCase(),
                  font: preset.codeFontFamily,
                  size: Math.round((preset.fontSize - 2) * 2),
                  bold: true,
                  color: '6B7280',
                }),
              ],
            })
          );
        }

        // Code container rows
        for (let l = 0; l < lines.length; l++) {
          elements.push(
            new Paragraph({
              spacing: {
                before: l === 0 ? 60 : 0,
                after: l === lines.length - 1 ? 160 : 0,
                line: 240,
              },
              indent: { left: convertInchesToTwip(0.2) },
              shading: {
                type: ShadingType.CLEAR,
                color: 'auto',
                fill: preset.codeBgColor,
              },
              border: {
                left: {
                  color: preset.tableBorderColor,
                  space: 8,
                  style: BorderStyle.SINGLE,
                  size: 6,
                },
              },
              children: [
                new TextRun({
                  text: lines[l] || ' ',
                  font: preset.codeFontFamily,
                  size: (preset.fontSize - 1.5) * 2,
                  color: '1E293B',
                }),
              ],
            })
          );
        }
        break;
      }

      case 'table': {
        const tableToken = token as Tokens.Table;
        const rows: TableRow[] = [];

        // Header Row
        const headerCells: TableCell[] = tableToken.header.map((cell) => {
          const inlineRuns = parseInlineTokens(cell.tokens, preset, { bold: true, color: 'FFFFFF' });
          return new TableCell({
            shading: {
              type: ShadingType.CLEAR,
              color: 'auto',
              fill: preset.tableHeaderBg,
            },
            margins: {
              top: convertInchesToTwip(0.08),
              bottom: convertInchesToTwip(0.08),
              left: convertInchesToTwip(0.12),
              right: convertInchesToTwip(0.12),
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: inlineRuns.length > 0 ? inlineRuns : [
                  new TextRun({
                    text: cell.text,
                    bold: true,
                    color: 'FFFFFF',
                    font: preset.fontFamily,
                    size: preset.fontSize * 2,
                  }),
                ],
              }),
            ],
          });
        });
        rows.push(new TableRow({ children: headerCells, tableHeader: true }));

        // Body Rows with subtle zebra striping
        for (let r = 0; r < tableToken.rows.length; r++) {
          const rowData = tableToken.rows[r];
          const isZebra = r % 2 === 1;
          const bodyCells: TableCell[] = rowData.map((cell) => {
            const inlineRuns = parseInlineTokens(cell.tokens, preset);
            return new TableCell({
              shading: isZebra
                ? {
                    type: ShadingType.CLEAR,
                    color: 'auto',
                    fill: 'F9FAFB',
                  }
                : undefined,
              margins: {
                top: convertInchesToTwip(0.07),
                bottom: convertInchesToTwip(0.07),
                left: convertInchesToTwip(0.12),
                right: convertInchesToTwip(0.12),
              },
              children: [
                new Paragraph({
                  children: inlineRuns.length > 0 ? inlineRuns : [
                    new TextRun({
                      text: cell.text,
                      font: preset.fontFamily,
                      size: preset.fontSize * 2,
                      color: preset.textColor,
                    }),
                  ],
                }),
              ],
            });
          });
          rows.push(new TableRow({ children: bodyCells }));
        }

        const borderStyle = {
          style: BorderStyle.SINGLE,
          size: 4,
          color: preset.tableBorderColor,
        };

        elements.push(
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: borderStyle,
              bottom: borderStyle,
              left: borderStyle,
              right: borderStyle,
              insideHorizontal: borderStyle,
              insideVertical: borderStyle,
            },
            rows,
          })
        );

        // Add small spacing after table
        elements.push(
          new Paragraph({
            spacing: { before: 0, after: 120 },
            children: [],
          })
        );
        break;
      }

      case 'hr': {
        elements.push(
          new Paragraph({
            spacing: { before: 180, after: 180 },
            border: {
              bottom: {
                color: preset.tableBorderColor,
                space: 1,
                style: BorderStyle.SINGLE,
                size: 8,
              },
            },
            children: [],
          })
        );
        break;
      }

      default:
        break;
    }
  }

  return elements;
}

/**
 * Converts a Markdown string into a styled Word Document (.docx) Blob
 */
export async function convertMarkdownToDocx(
  markdown: string,
  preset: DocumentStylePreset,
  docTitle: string = 'Document'
): Promise<Blob> {
  const tokens = marked.lexer(markdown);
  const docxElements = convertTokensToDocxElements(tokens, preset);

  const doc = new Document({
    title: docTitle,
    description: 'Generated with MarkWord',
    styles: {
      default: {
        document: {
          run: {
            font: preset.fontFamily,
            size: preset.fontSize * 2,
            color: preset.textColor,
          },
          paragraph: {
            spacing: {
              line: Math.round(preset.lineSpacing * 240),
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(preset.margins.top),
              bottom: convertInchesToTwip(preset.margins.bottom),
              left: convertInchesToTwip(preset.margins.left),
              right: convertInchesToTwip(preset.margins.right),
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${docTitle}  |  Page `,
                    font: preset.fontFamily,
                    size: 18,
                    color: '9CA3AF',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: preset.fontFamily,
                    size: 18,
                    color: '6B7280',
                  }),
                  new TextRun({
                    text: ' of ',
                    font: preset.fontFamily,
                    size: 18,
                    color: '9CA3AF',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: preset.fontFamily,
                    size: 18,
                    color: '6B7280',
                  }),
                ],
              }),
            ],
          }),
        },
        children: docxElements.length > 0 ? docxElements : [
          new Paragraph({
            children: [new TextRun({ text: 'Empty document' })],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Downloads the generated docx file directly to the user's computer
 */
export async function exportDocxFile(
  markdown: string,
  preset: DocumentStylePreset,
  filename: string = 'document.docx'
): Promise<void> {
  const sanitizedName = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  const blob = await convertMarkdownToDocx(markdown, preset, sanitizedName.replace('.docx', ''));
  saveAs(blob, sanitizedName);
}
