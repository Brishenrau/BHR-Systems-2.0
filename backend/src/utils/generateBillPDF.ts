import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
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

interface BillRow {
  description: string;
  janJunAmount: number;
  tahunAmount: number;
  order: number;
}

/**
 * Generate Bill PDF and return as Buffer
 */
export async function generateBillPDFBuffer(
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

      // Helper function to format date (dd/mm/yyyy)
      const formatDate = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Calculate dates based on SQL logic
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const billYear = currentYear + 1;
      const billDate = new Date(billYear, 0, 1);
      const dueDate = new Date(billYear, 1, 0);

      // Format account number with "T" prefix
      const accountNumber = propertyDetails?.accountNumber || data.statements[0]?.STA_NOMBAKAUN || 0;
      const formattedAccountNumber = `T${String(accountNumber).padStart(9, '0')}`;

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

      // Build bill rows
      const billRows: BillRow[] = [];

      // Row 1: Current year tax
      if (propertyDetails?.newTax) {
        billRows.push({
          description: 'Cukai Taksiran',
          janJunAmount: propertyDetails.newTax / 2,
          tahunAmount: propertyDetails.newTax,
          order: 1,
        });
      }

      // Rows 2+: Arrears
      data.bakhutang.forEach((bak) => {
        const arrearsTotal = bak.BAK_AMAUNCURR + bak.BAK_AMAUNTHUN + bak.BAK_AMAUNTNGK;
        if (arrearsTotal > 0) {
          billRows.push({
            description: `TUNGGAKAN ${bak.TRA_TRANSNAME || bak.BAK_TRANSCODE}`,
            janJunAmount: arrearsTotal,
            tahunAmount: arrearsTotal,
            order: 2,
          });
        }
      });

      // Last row: Excess payments
      data.bakhutang.forEach((bak) => {
        if (bak.BAK_AMAUNLBIH > 0) {
          billRows.push({
            description: 'Bayaran Lebihan',
            janJunAmount: bak.BAK_AMAUNLBIH * -1,
            tahunAmount: bak.BAK_AMAUNLBIH * -1,
            order: 2,
          });
        }
      });

      // Calculate totals
      const totalJanJun = billRows.reduce((sum, row) => sum + row.janJunAmount, 0);
      const totalTahun = billRows.reduce((sum, row) => sum + row.tahunAmount, 0);

      // Try to load logo (if available)
      try {
        const logoPath = path.join(process.cwd(), '..', 'frontend', 'public', 'MPKKJAWIS.jpg');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, margin, yPos, { width: 20, height: 20 });
        }
      } catch (error) {
        console.warn('Could not load logo:', error);
      }

      // Header
      doc.fontSize(16).font('Helvetica-Bold');
      doc.text('MAJLIS PERBANDARAN KULIM', { align: 'center', y: yPos + 10 });
      yPos += 20;

      doc.fontSize(10).font('Helvetica');
      doc.text('NO 1, LEBUH BANDAR 2, BANDAR PUTRA, 09000 KULIM', { align: 'center' });
      yPos += 8;

      doc.fontSize(9);
      doc.text('Portal Rasmi: www.mpkk.gov.my', { align: 'center' });
      yPos += 8;

      // Contact Information (right side)
      doc.fontSize(9);
      doc.text('No Tel: +604-4325225', margin, margin + 5, { align: 'right' });
      doc.text('No Faks: +604-4325229', margin, margin + 15, { align: 'right' });
      doc.text('E-mail: info@mpkk.gov.my', margin, margin + 25, { align: 'right' });

      yPos += 5;

      // Bill Title (green banner)
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8).fill([0, 128, 0]);
      doc.fillColor('white');
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text(`BIL AWAL CUKAI TAKSIRAN BAGI TAHUN ${billYear}`, { align: 'center', y: yPos + 2 });
      doc.fillColor('black');
      yPos += 15;

      // MAKLUMAT PEMILIK Section (with green header bar)
      doc.rect(margin, yPos, pageWidth - 2 * margin, 6).fill([0, 128, 0]);
      doc.fillColor('white');
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('MAKLUMAT PEMILIK', margin + 3, yPos + 2);
      doc.fillColor('black');
      yPos += 12;

      doc.fontSize(9).font('Helvetica');
      const ownerName = propertyDetails?.ownerName || '';
      doc.text(ownerName, margin, yPos);
      yPos += 6;

      const mailingAddress = propertyDetails?.mailingAddress || '';
      const mailingLines = mailingAddress.split('\n');
      mailingLines.forEach((line) => {
        doc.text(line, margin, yPos);
        yPos += 5;
      });

      // Right side - Account Details
      const rightX = 300;
      let rightY = yPos - (mailingLines.length * 5) - 6;

      doc.font('Helvetica-Bold');
      doc.text('No. Akaun:', rightX, rightY);
      doc.font('Helvetica');
      doc.text(formattedAccountNumber, rightX + 50, rightY);
      rightY += 15;

      doc.fontSize(7);
      doc.text('(Sila gunakan No Akaun sebagai rujukan utama untuk bayaran secara Online)', rightX, rightY, { width: 150 });
      rightY += 20;

      doc.fontSize(9);
      doc.font('Helvetica-Bold');
      doc.text('Tarikh Bil:', rightX, rightY);
      doc.font('Helvetica');
      doc.text(formatDate(billDate), rightX + 50, rightY);
      rightY += 15;

      doc.font('Helvetica-Bold');
      doc.text('Bagi Tempoh:', rightX, rightY);
      doc.font('Helvetica');
      doc.text(`Tahun ${billYear}`, rightX + 50, rightY);

      yPos += 10;

      // MAKLUMAT HARTA/PEGANGAN Section (with green header bar)
      doc.rect(margin, yPos, pageWidth - 2 * margin, 6).fill([0, 128, 0]);
      doc.fillColor('white');
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('MAKLUMAT HARTA/PEGANGAN', margin + 3, yPos + 2);
      doc.fillColor('black');
      yPos += 12;

      doc.fontSize(9).font('Helvetica');
      const propertyAddress = propertyDetails?.propertyAddress || '';
      doc.font('Helvetica-Bold');
      doc.text('Alamat Harta:', margin, yPos);
      doc.font('Helvetica');
      yPos += 6;
      const propertyLines = propertyAddress.split('\n');
      propertyLines.forEach((line) => {
        doc.text(line, margin, yPos);
        yPos += 5;
      });

      // Right side - Property Valuation
      rightY = yPos - (propertyLines.length * 5) - 6;
      doc.font('Helvetica-Bold');
      doc.text('Nilai Tambah:', rightX, rightY);
      doc.font('Helvetica');
      doc.text(
        propertyDetails?.newValue ? formatCurrency(propertyDetails.newValue) : '-',
        rightX + 50,
        rightY
      );
      rightY += 15;

      doc.font('Helvetica-Bold');
      doc.text('Kadar:', rightX, rightY);
      doc.font('Helvetica');
      doc.text(
        propertyDetails?.ratePerYear ? `${propertyDetails.ratePerYear.toFixed(2)}%` : '-',
        rightX + 50,
        rightY
      );
      rightY += 15;

      doc.font('Helvetica-Bold');
      doc.text('Cukai Tahunan:', rightX, rightY);
      doc.font('Helvetica');
      doc.text(
        propertyDetails?.newTax ? formatCurrency(propertyDetails.newTax) : '-',
        rightX + 50,
        rightY
      );

      yPos += 10;

      // MAKLUMAT BAYARAN Section (with green header bar)
      doc.rect(margin, yPos, pageWidth - 2 * margin, 6).fill([0, 128, 0]);
      doc.fillColor('white');
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('MAKLUMAT BAYARAN', margin + 3, yPos + 2);
      doc.fillColor('black');
      yPos += 12;

      // Payment Due Date (in red)
      doc.fontSize(9);
      doc.fillColor('red');
      doc.font('Helvetica-Bold');
      doc.text(`Bayar Pada/Sebelum: ${formatDate(dueDate)}`);
      doc.fillColor('black');
      doc.moveDown(1);

      // QR Code (single QR code for payment)
      const qrCodeSize = 30;
      const qrX = margin;
      const qrY = yPos;

      try {
        // Try to use static QR code image first, otherwise generate one
        const qrCodePath = path.join(process.cwd(), '..', 'frontend', 'public', 'QRCPBTPAY.jpg');
        if (fs.existsSync(qrCodePath)) {
          doc.image(qrCodePath, qrX, qrY, { width: qrCodeSize, height: qrCodeSize });
        } else {
          // Generate QR code for account number
          const qrAccount = await QRCode.toBuffer(formattedAccountNumber, { width: 200 });
          doc.image(qrAccount, qrX, qrY, { width: qrCodeSize, height: qrCodeSize });
        }
      } catch (error) {
        console.warn('Could not load/generate QR code:', error);
      }

      doc.fontSize(7).font('Helvetica');
      doc.text('Sila scan untuk bayaran PBTPay Online', qrX, qrY + qrCodeSize + 3, { width: qrCodeSize });
      yPos += qrCodeSize + 10;

      // "DITERIMA TANPA PREJUDIS"
      doc.fontSize(8).font('Helvetica-Oblique');
      doc.text('DITERIMA TANPA PREJUDIS', { align: 'center' });
      yPos += 10;

      // Payment Table
      const tableTop = yPos;
      const colWidths = [250, 120, 120];
      const rowHeight = 20;
      let currentY = tableTop;

      // Header
      doc.fontSize(9).font('Helvetica-Bold');
      doc.rect(50, currentY, colWidths[0], rowHeight).stroke();
      doc.text('Keterangan Bil', 55, currentY + 5, { width: colWidths[0] - 10 });
      
      doc.rect(50 + colWidths[0], currentY, colWidths[1], rowHeight).stroke();
      doc.text(`Jan-Jun ${billYear}`, 55 + colWidths[0], currentY + 5, { width: colWidths[1] - 10, align: 'right' });
      
      doc.rect(50 + colWidths[0] + colWidths[1], currentY, colWidths[2], rowHeight).stroke();
      doc.text(`Tahun ${billYear}`, 55 + colWidths[0] + colWidths[1], currentY + 5, { width: colWidths[2] - 10, align: 'right' });

      currentY += rowHeight;

      // Body rows
      doc.fontSize(8).font('Helvetica');
      billRows.forEach((row) => {
        doc.rect(50, currentY, colWidths[0], rowHeight).stroke();
        doc.text(row.description, 55, currentY + 5, { width: colWidths[0] - 10 });

        doc.rect(50 + colWidths[0], currentY, colWidths[1], rowHeight).stroke();
        doc.text(formatCurrency(row.janJunAmount), 55 + colWidths[0], currentY + 5, { width: colWidths[1] - 10, align: 'right' });

        doc.rect(50 + colWidths[0] + colWidths[1], currentY, colWidths[2], rowHeight).stroke();
        doc.text(formatCurrency(row.tahunAmount), 55 + colWidths[0] + colWidths[1], currentY + 5, { width: colWidths[2] - 10, align: 'right' });

        currentY += rowHeight;
      });

      // Total row
      doc.fontSize(9).font('Helvetica-Bold');
      doc.rect(50, currentY, colWidths[0], rowHeight).stroke();
      doc.text('JUMLAH PERLU BAYAR', 55, currentY + 5, { width: colWidths[0] - 10 });

      doc.rect(50 + colWidths[0], currentY, colWidths[1], rowHeight).stroke();
      doc.text(formatCurrency(totalJanJun), 55 + colWidths[0], currentY + 5, { width: colWidths[1] - 10, align: 'right' });

      doc.rect(50 + colWidths[0] + colWidths[1], currentY, colWidths[2], rowHeight).stroke();
      doc.text(formatCurrency(totalTahun), 55 + colWidths[0] + colWidths[1], currentY + 5, { width: colWidths[2] - 10, align: 'right' });

      // Print info at bottom
      doc.fontSize(7).font('Helvetica');
      const printInfo = `Dicetak pada ${formatDate(new Date())} ${new Date().toLocaleTimeString('en-GB')}`;
      doc.text(printInfo, margin, pageHeight - 30);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

