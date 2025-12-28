import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
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

      // Header
      doc.fontSize(16).font('Helvetica-Bold');
      doc.text('MAJLIS PERBANDARAN KULIM', { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica');
      doc.text('NO 1, LEBUH BANDAR 2, BANDAR PUTRA, 09000 KULIM', { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(9);
      doc.text('Portal Rasmi: www.mpkk.gov.my', { align: 'center' });
      doc.moveDown(0.5);

      // Contact Information (right side)
      doc.fontSize(9);
      doc.text('No Tel: +604-4325225', { align: 'right' });
      doc.text('No Faks: +604-4325229', { align: 'right' });
      doc.text('E-mail: info@mpkk.gov.my', { align: 'right' });
      doc.moveDown(1);

      // Bill Title (green banner)
      doc.rect(50, doc.y, 495, 8).fill([0, 128, 0]);
      doc.fillColor('white');
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text(`BIL AWAL CUKAI TAKSIRAN BAGI TAHUN ${billYear}`, { align: 'center', y: doc.y - 4 });
      doc.fillColor('black');
      doc.moveDown(1.5);

      // MAKLUMAT PEMILIK Section
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('MAKLUMAT PEMILIK');
      doc.moveDown(0.8);

      doc.fontSize(9).font('Helvetica');
      const ownerName = propertyDetails?.ownerName || '';
      doc.text(ownerName);
      doc.moveDown(0.3);

      const mailingAddress = propertyDetails?.mailingAddress || '';
      const mailingLines = mailingAddress.split('\n');
      mailingLines.forEach((line) => {
        doc.text(line);
        doc.moveDown(0.2);
      });

      // Right side - Account Details
      const rightX = 300;
      let rightY = doc.y - (mailingLines.length * 12) - 20;

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

      doc.moveDown(1);

      // MAKLUMAT HARTA/PEGANGAN Section
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('MAKLUMAT HARTA/PEGANGAN');
      doc.moveDown(0.8);

      doc.fontSize(9).font('Helvetica');
      const propertyAddress = propertyDetails?.propertyAddress || '';
      doc.text(`Alamat Harta: ${propertyAddress}`);
      doc.moveDown(0.5);

      // Right side - Property Valuation
      rightY = doc.y - 15;
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

      doc.moveDown(1.5);

      // MAKLUMAT BAYARAN Section
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('MAKLUMAT BAYARAN');
      doc.moveDown(0.8);

      // Payment Due Date (in red)
      doc.fontSize(9);
      doc.fillColor('red');
      doc.font('Helvetica-Bold');
      doc.text(`Bayar Pada/Sebelum: ${formatDate(dueDate)}`);
      doc.fillColor('black');
      doc.moveDown(1);

      // QR Codes
      const qrCodeSize = 60;
      const qrX = 50;
      const qrY = doc.y;

      try {
        // QR Code 1: Account Number
        const qrAccount = await QRCode.toBuffer(formattedAccountNumber, { width: 200 });
        doc.image(qrAccount, qrX, qrY, { width: qrCodeSize, height: qrCodeSize });

        // QR Code 2: 6-month total
        const qrJanJun = await QRCode.toBuffer(formatCurrency(totalJanJun), { width: 200 });
        doc.image(qrJanJun, qrX + qrCodeSize + 10, qrY, { width: qrCodeSize, height: qrCodeSize });

        // QR Code 3: Yearly total
        const qrTahun = await QRCode.toBuffer(formatCurrency(totalTahun), { width: 200 });
        doc.image(qrTahun, qrX + (qrCodeSize + 10) * 2, qrY, { width: qrCodeSize, height: qrCodeSize });
      } catch (error) {
        console.warn('Could not generate QR codes:', error);
      }

      doc.fontSize(7).font('Helvetica');
      doc.text('Sila scan untuk bayaran PBTPay Online', qrX, qrY + qrCodeSize + 5, { width: 200 });
      doc.moveDown(1);

      // "DITERIMA TANPA PREJUDIS"
      doc.fontSize(8).font('Helvetica-Oblique');
      doc.text('DITERIMA TANPA PREJUDIS');
      doc.moveDown(1);

      // Payment Table
      const tableTop = doc.y;
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
      const printInfo = `Dicetak oleh: ${propertyDetails?.ownerName || 'System'} pada ${formatDate(new Date())} ${new Date().toLocaleTimeString('en-GB')}`;
      doc.text(printInfo, 50, doc.page.height - 30);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

