import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import type { StatementResponse } from '../services/statement.service';

interface PropertyDetails {
  accountNumber?: number;
  ownerName?: string;
  propertyAddress?: string;
  mailingAddress?: string;
  newValue?: number;
  ratePerYear?: number;
  percentage?: number;
  newTax?: number;
}

/**
 * Generate PDF statement and return as Buffer
 */
export async function generateStatementPDFBuffer(
  data: StatementResponse,
  propertyDetails: PropertyDetails | null
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const buffers: Buffer[] = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    try {
      // Helper function to format currency
      const formatCurrency = (amount: number): string => {
        return amount.toFixed(2);
      };

      // Helper function to format date
      const formatDate = (date: Date | string | null | undefined): string => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 50;
      let yPos = margin;

      // Try to load watermark (if available)
      try {
        const watermarkPath = path.join(process.cwd(), '..', 'frontend', 'public', 'WATERMARK.jpg');
        if (fs.existsSync(watermarkPath)) {
          doc.image(watermarkPath, pageWidth / 2 - 50, pageHeight / 2 - 50, { width: 100, height: 100, opacity: 0.3 });
        }
      } catch (error) {
        console.warn('Could not load watermark:', error);
      }

      // Try to load logo (if available)
      try {
        const logoPath = path.join(process.cwd(), '..', 'frontend', 'public', 'MPKKJAWIS.jpg');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, margin, yPos, { width: 20, height: 20 });
        }
      } catch (error) {
        console.warn('Could not load logo:', error);
      }

      // Council Header
      doc.fontSize(16).font('Helvetica-Bold');
      doc.text('MAJLIS PERBANDARAN KULIM', { align: 'center', y: yPos + 10 });
      yPos += 20;

      doc.fontSize(10).font('Helvetica');
      doc.text('NO 1, LEBUH BANDAR 2, BANDAR PUTRA, 09000 KULIM', { align: 'center' });
      yPos += 8;

      // Portal
      doc.fontSize(9);
      doc.text('Portal Rasmi: www.mpkk.gov.my', { align: 'center' });
      yPos += 8;

      // Contact Information (right side)
      doc.fontSize(9);
      doc.text('No Tel: +604-4325225', margin, margin + 5, { align: 'right' });
      doc.text('No Faks: +604-4325229', margin, margin + 15, { align: 'right' });
      doc.text('E-mail: info@mpkk.gov.my', margin, margin + 25, { align: 'right' });

      yPos += 5;

      // Document Title (green banner)
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8).fill([0, 128, 0]);
      doc.fillColor('white');
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('PENYATA AKAUN CUKAI TAKSIRAN', { align: 'center', y: yPos + 2 });
      doc.fillColor('black');
      yPos += 15;

      // Section Header (with light green background)
      doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 6).fill([240, 255, 240]);
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('MAKLUMAT PEMILIK dan HARTA PEGANGAN', margin, yPos);
      yPos += 12;

    // Owner and Property Details
    doc.fontSize(9).font('Helvetica');
    const leftColX = 50;
    const rightColX = 300;
    let leftY = doc.y;
    const lineHeight = 15;

    // Left Column - Owner Details
    doc.font('Helvetica-Bold');
    doc.text('Nombor Akaun:', leftColX, leftY);
    doc.font('Helvetica');
    doc.text(
      propertyDetails?.accountNumber?.toString() || data.statements[0]?.STA_NOMBAKAUN?.toString() || '',
      leftColX + 80,
      leftY
    );
    leftY += lineHeight;

    doc.font('Helvetica-Bold');
    doc.text('Nama Pemilik:', leftColX, leftY);
    doc.font('Helvetica');
    const ownerName = propertyDetails?.ownerName || '';
    doc.text(ownerName, leftColX + 80, leftY, { width: 150 });
    leftY += lineHeight;

    doc.font('Helvetica-Bold');
    doc.text('Alamat Surat:', leftColX, leftY);
    doc.font('Helvetica');
    const mailingAddress = propertyDetails?.mailingAddress || '';
    const mailingHeight = doc.heightOfString(mailingAddress, { width: 150 });
    doc.text(mailingAddress, leftColX + 80, leftY, { width: 150 });
    leftY += Math.max(mailingHeight, lineHeight) + 5;

    doc.font('Helvetica-Bold');
    doc.text('Alamat Harta:', leftColX, leftY);
    doc.font('Helvetica');
    const propertyAddress = propertyDetails?.propertyAddress || '';
    doc.text(propertyAddress, leftColX + 80, leftY, { width: 150 });

    // Right Column - Assessment Details
    let rightY = doc.y - (leftY - doc.y);
    doc.font('Helvetica-Bold');
    doc.text('Nilai Tahunan:', rightColX, rightY);
    doc.font('Helvetica');
    doc.text(
      propertyDetails?.newValue ? formatCurrency(propertyDetails.newValue) : '-',
      rightColX + 70,
      rightY
    );
    rightY += lineHeight;

    doc.font('Helvetica-Bold');
    doc.text('% Kadar:', rightColX, rightY);
    doc.font('Helvetica');
    doc.text(
      propertyDetails?.ratePerYear ? `${propertyDetails.ratePerYear.toFixed(4)}%` : '-',
      rightColX + 70,
      rightY
    );
    rightY += lineHeight;

    doc.font('Helvetica-Bold');
    doc.text('Peratusan:', rightColX, rightY);
    doc.font('Helvetica');
    doc.text(
      propertyDetails?.percentage ? `${propertyDetails.percentage.toFixed(2)}%` : '-',
      rightColX + 70,
      rightY
    );
    rightY += lineHeight;

    doc.font('Helvetica-Bold');
    doc.text('Taksiran Tahunan:', rightColX, rightY);
    doc.font('Helvetica');
    doc.text(
      propertyDetails?.newTax ? formatCurrency(propertyDetails.newTax) : '-',
      rightColX + 70,
      rightY
    );

    // Calculate ending balance date
    const lastTransaction = data.statements[data.statements.length - 1];
    const endingBalanceDate = lastTransaction?.STA_TARIKHTRX
      ? formatDate(lastTransaction.STA_TARIKHTRX)
      : new Date().toLocaleDateString('en-GB');

    // Ending Balance
    const maxY = Math.max(leftY, rightY) + 20;
    doc.y = maxY;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Baki Akhir: ${endingBalanceDate}`, leftColX);
    doc.font('Helvetica');
    doc.text(formatCurrency(data.totals.totalBalance), leftColX + 100);
    doc.moveDown(1);

    // Transaction Table
    const tableTop = doc.y;
    const tableLeft = leftColX;
    const colWidths = [50, 60, 120, 40, 40, 40];
    const rowHeight = 20;
    const headerHeight = 25;

    // Table Headers
    doc.fontSize(9).font('Helvetica-Bold');
    doc.rect(tableLeft, tableTop, colWidths[0], headerHeight).stroke();
    doc.text('Tarikh', tableLeft + 5, tableTop + 8);
    
    doc.rect(tableLeft + colWidths[0], tableTop, colWidths[1], headerHeight).stroke();
    doc.text('Dokumen', tableLeft + colWidths[0] + 5, tableTop + 8);
    
    doc.rect(tableLeft + colWidths[0] + colWidths[1], tableTop, colWidths[2], headerHeight).stroke();
    doc.text('Keterangan Transaksi', tableLeft + colWidths[0] + colWidths[1] + 5, tableTop + 8);
    
    doc.rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], headerHeight).stroke();
    doc.text('Debit', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 8, { align: 'right', width: colWidths[3] - 10 });
    
    doc.rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop, colWidths[4], headerHeight).stroke();
    doc.text('Kredit', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, tableTop + 8, { align: 'right', width: colWidths[4] - 10 });
    
    doc.rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop, colWidths[5], headerHeight).stroke();
    doc.text('Baki', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 5, tableTop + 8, { align: 'right', width: colWidths[5] - 10 });

    // Table Rows
    let currentY = tableTop + headerHeight;
    let runningBalance = 0;
    doc.fontSize(8).font('Helvetica');

    data.statements.forEach((stmt) => {
      // Check if we need a new page
      if (currentY + rowHeight > doc.page.height - 50) {
        doc.addPage();
        currentY = 50;
      }

      const date = formatDate(stmt.STA_TARIKHTRX);
      const document = stmt.STA_REFERENCE || '-';
      const description = stmt.TRA_TRANSNAME || stmt.STA_TRANSCODE || 'CUKAI TAKSIRAN';
      const debit = stmt.STA_TRANSDRCR === 'D' ? formatCurrency(stmt.STA_AMOUNTTRX) : '';
      const credit = stmt.STA_TRANSDRCR === 'K' ? formatCurrency(stmt.STA_AMOUNTTRX) : '';

      // Calculate running balance
      if (stmt.STA_TRANSDRCR === 'D') {
        runningBalance += stmt.STA_AMOUNTTRX;
      } else if (stmt.STA_TRANSDRCR === 'K') {
        runningBalance -= stmt.STA_AMOUNTTRX;
      }

      const balanceStr = runningBalance < 0
        ? `(${formatCurrency(Math.abs(runningBalance))})`
        : formatCurrency(runningBalance);

      // Draw cells
      doc.rect(tableLeft, currentY, colWidths[0], rowHeight).stroke();
      doc.text(date, tableLeft + 5, currentY + 5, { width: colWidths[0] - 10 });

      doc.rect(tableLeft + colWidths[0], currentY, colWidths[1], rowHeight).stroke();
      doc.text(document, tableLeft + colWidths[0] + 5, currentY + 5, { width: colWidths[1] - 10 });

      doc.rect(tableLeft + colWidths[0] + colWidths[1], currentY, colWidths[2], rowHeight).stroke();
      doc.text(description, tableLeft + colWidths[0] + colWidths[1] + 5, currentY + 5, { width: colWidths[2] - 10 });

      doc.rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2], currentY, colWidths[3], rowHeight).stroke();
      doc.text(debit, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5, currentY + 5, { align: 'right', width: colWidths[3] - 10 });

      doc.rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY, colWidths[4], rowHeight).stroke();
      doc.text(credit, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, currentY + 5, { align: 'right', width: colWidths[4] - 10 });

      doc.rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY, colWidths[5], rowHeight).stroke();
      doc.text(balanceStr, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 5, currentY + 5, { align: 'right', width: colWidths[5] - 10 });

      currentY += rowHeight;
    });

    // Totals Row
    if (currentY + rowHeight > doc.page.height - 50) {
      doc.addPage();
      currentY = 50;
    }

    const totalDebit = formatCurrency(data.totals.totalDebit);
    const totalCredit = formatCurrency(data.totals.totalCredit);
    const totalBalance = data.totals.totalBalance < 0
      ? `(${formatCurrency(Math.abs(data.totals.totalBalance))})`
      : formatCurrency(data.totals.totalBalance);

    doc.font('Helvetica-Bold');
    doc.rect(tableLeft, currentY, colWidths[0] + colWidths[1] + colWidths[2], rowHeight).stroke();
    doc.text('JUMLAH', tableLeft + 5, currentY + 5);

    doc.rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2], currentY, colWidths[3], rowHeight).stroke();
    doc.text(totalDebit, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5, currentY + 5, { align: 'right', width: colWidths[3] - 10 });

    doc.rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY, colWidths[4], rowHeight).stroke();
    doc.text(totalCredit, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, currentY + 5, { align: 'right', width: colWidths[4] - 10 });

    doc.rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY, colWidths[5], rowHeight).stroke();
    doc.text(totalBalance, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 5, currentY + 5, { align: 'right', width: colWidths[5] - 10 });

      // Page number
      doc.fontSize(8).font('Helvetica');
      doc.text('M/Surat: 1 / 1', pageWidth - margin, pageHeight - 30, { align: 'right' });

      // Print info at bottom
      doc.fontSize(7);
      doc.text(`Dicetak pada ${formatDate(new Date())} ${new Date().toLocaleTimeString('en-GB')}`, margin, pageHeight - 30);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

