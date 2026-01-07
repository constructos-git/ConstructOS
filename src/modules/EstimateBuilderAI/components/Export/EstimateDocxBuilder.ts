// DOCX Export Builder for Customer Estimate

import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import type { CustomerEstimate, VisibilitySettings, EstimateBuilderAIEstimate } from '../../domain/types';
import { formatCurrency } from '../../utils/money';

export async function buildDocxBlob(
  estimate: EstimateBuilderAIEstimate,
  customerEstimate: CustomerEstimate,
  visibilitySettings: VisibilitySettings,
  clientName?: string
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      text: estimate.title || 'Estimate',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Client details
  if (clientName) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Client: ', bold: true }),
          new TextRun({ text: clientName }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Date
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Date: ', bold: true }),
        new TextRun({ text: new Date(estimate.createdAt).toLocaleDateString('en-GB') }),
      ],
      spacing: { after: 400 },
    })
  );

  // Sections
  customerEstimate.sections.forEach((section) => {
    // Section title
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    // Section notes
    if (section.notes && visibilitySettings.showNotes) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: section.notes, italics: true })],
            spacing: { after: 200 },
          })
        );
    }

    // Items table
    if (section.items.length > 0) {
      const tableRows: TableRow[] = [];

      // Header row
      const headerCells: TableCell[] = [];
      if (visibilitySettings.showQuantities && visibilitySettings.showUnits) {
        headerCells.push(
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Item', bold: true })] })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Qty', bold: true })], alignment: AlignmentType.CENTER })],
              width: { size: 15, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Unit', bold: true })], alignment: AlignmentType.CENTER })],
              width: { size: 15, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Unit Price', bold: true })], alignment: AlignmentType.RIGHT })],
              width: { size: 20, type: WidthType.PERCENTAGE },
            })
        );
      } else {
        headerCells.push(
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Item', bold: true })] })],
            width: { size: 70, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Unit Price', bold: true })], alignment: AlignmentType.RIGHT })],
            width: { size: 30, type: WidthType.PERCENTAGE },
          })
        );
      }

        if (visibilitySettings.showLineTotals) {
          headerCells.push(
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Total', bold: true })], alignment: AlignmentType.RIGHT })],
              width: { size: 20, type: WidthType.PERCENTAGE },
            })
          );
        }

      tableRows.push(new TableRow({ children: headerCells }));

      // Item rows
      section.items.forEach((item) => {
        const itemCells: TableCell[] = [];

        // Item title and description
        const itemText = visibilitySettings.showDescriptions && item.description
          ? `${item.title}\n${item.description}`
          : item.title;

        if (visibilitySettings.showQuantities && visibilitySettings.showUnits) {
          itemCells.push(
            new TableCell({
              children: [new Paragraph({ text: itemText })],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: item.quantity?.toString() || '-',
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: item.unit || '-',
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: item.unitPrice ? formatCurrency(item.unitPrice) : '-',
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            })
          );
        } else {
          itemCells.push(
            new TableCell({
              children: [new Paragraph({ text: itemText })],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: item.unitPrice ? formatCurrency(item.unitPrice) : '-',
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            })
          );
        }

        if (visibilitySettings.showLineTotals) {
          itemCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  text: item.lineTotal ? formatCurrency(item.lineTotal) : '-',
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            })
          );
        }

        tableRows.push(new TableRow({ children: itemCells }));

        // Notes
        if (item.notes && visibilitySettings.showNotes) {
          const noteCells: TableCell[] = [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: item.notes, italics: true })],
                }),
              ],
              columnSpan: visibilitySettings.showQuantities && visibilitySettings.showUnits ? 4 : 2,
            }),
          ];
          if (visibilitySettings.showLineTotals) {
            noteCells.push(new TableCell({ children: [new Paragraph('')] }));
          }
          tableRows.push(new TableRow({ children: noteCells }));
        }
      });

      // Section total row
      if (visibilitySettings.showSectionTotals && section.sectionTotal !== undefined) {
        const totalCells: TableCell[] = [];
        const colspan = visibilitySettings.showQuantities && visibilitySettings.showUnits ? 4 : 2;
        totalCells.push(
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Section Total', bold: true })] })],
            columnSpan: colspan,
          })
        );
        if (visibilitySettings.showLineTotals) {
          totalCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: formatCurrency(section.sectionTotal), bold: true })],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            })
          );
        }
        tableRows.push(new TableRow({ children: totalCells }));
      }

      children.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
    }

    children.push(new Paragraph({ text: '' })); // Spacing
  });

  // Totals section
  if (!visibilitySettings.showGrandTotalOnly) {
    children.push(
      new Paragraph({
        text: 'Summary',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    const summaryRows: TableRow[] = [];

    summaryRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Subtotal', bold: true })] })],
            width: { size: 70, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: formatCurrency(customerEstimate.subtotal) })],
                alignment: AlignmentType.RIGHT,
              }),
            ],
            width: { size: 30, type: WidthType.PERCENTAGE },
          }),
        ],
      })
    );

    if (visibilitySettings.showProvisionalSums && customerEstimate.provisionalSums) {
      summaryRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Provisional Sums', bold: true })] })],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: formatCurrency(customerEstimate.provisionalSums) })],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
          ],
        })
      );
    }

    if (visibilitySettings.showVat) {
      summaryRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'VAT', bold: true })] })],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: formatCurrency(customerEstimate.vat) })],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
          ],
        })
      );
    }

    summaryRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Total', bold: true })] })],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: formatCurrency(customerEstimate.total), bold: true })],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
          ],
        })
    );

    children.push(
      new Table({
        rows: summaryRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  } else {
    // Grand total only
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Total: ', bold: true, size: 28 }),
          new TextRun({ text: formatCurrency(customerEstimate.total), bold: true, size: 28 }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 400 },
      })
    );
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  // Generate blob
  const blob = await Packer.toBlob(doc);
  return blob;
}

export async function downloadDocx(
  estimate: EstimateBuilderAIEstimate,
  customerEstimate: CustomerEstimate,
  visibilitySettings: VisibilitySettings,
  clientName?: string
): Promise<void> {
  const blob = await buildDocxBlob(estimate, customerEstimate, visibilitySettings, clientName);
  const filename = `${estimate.title || 'Estimate'}_${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, filename);
}
