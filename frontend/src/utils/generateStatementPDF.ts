import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { StatementResponse } from '../types/database.types';

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

export const generateStatementPDF = async (
  data: StatementResponse,
  propertyDetails: PropertyDetails | null
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = 15;

  // Helper functions
  const formatCurrency = (amount: number): string => amount.toFixed(2);
  const formatNumber = (num: number): string => num.toLocaleString('en-US');
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  // Watermark - load first
  try {
    const watermarkImg = new Image();
    watermarkImg.crossOrigin = 'anonymous';
    watermarkImg.src = '/WATERMARK.jpg';
    await new Promise<void>((resolve, reject) => {
      watermarkImg.onload = () => {
        doc.addImage(watermarkImg, 'JPEG', pageWidth / 2 - 50, pageHeight / 2 - 50, 100, 100, undefined, 'FAST');
        resolve();
      };
      watermarkImg.onerror = () => reject(new Error('Watermark failed'));
      setTimeout(() => reject(new Error('Timeout')), 3000);
    });
  } catch (error) {
    console.warn('Watermark not loaded');
  }

  // Page number - TOP RIGHT
  doc.setFontSize(8);
  doc.text('M/Surat: 1 / 1', pageWidth - margin, 8, { align: 'right' });

  // Logo - TOP LEFT
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/MPKKJAWIS.jpg';
    await new Promise<void>((resolve, reject) => {
      logoImg.onload = () => {
        doc.addImage(logoImg, 'JPEG', margin, yPos, 20, 20);
        resolve();
      };
      logoImg.onerror = () => reject(new Error('Logo failed'));
      setTimeout(() => reject(new Error('Timeout')), 3000);
    });
  } catch (error) {
    console.warn('Logo not loaded');
  }

  // Council Name - CENTERED, BOLD, LARGE
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MAJLIS PERBANDARAN KULIM', pageWidth / 2, yPos + 10, { align: 'center' });
  yPos += 8;

  // Address - CENTERED
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('NO 1, LEBUH BANDAR 2, BANDAR PUTRA, 09000 KULIM', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  // Contact Info - RIGHT SIDE
  const contactRight = pageWidth - margin;
  doc.setFontSize(9);
  doc.text('No Tel: +604-4325225', contactRight, 20, { align: 'right' });
  doc.text('No Faks: +604-4325229', contactRight, 25, { align: 'right' });
  doc.text('E-mail: info@mpkk.gov.my', contactRight, 30, { align: 'right' });
  doc.text('Portal Rasmi: www.mpkk.gov.my', contactRight, 35, { align: 'right' });

  yPos += 8;

  // DARK GREEN BAR - Main Title
  doc.setFillColor(0, 128, 0);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PENYATA AKAUN CUKAI TAKSIRAN', pageWidth / 2, yPos + 5.5, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  yPos += 8;

  // LIGHT GREEN BAR - Section Header (IMMEDIATELY BELOW)
  doc.setFillColor(240, 255, 240);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MAKLUMAT PEMILIK dan HARTA PEGANGAN', margin + 3, yPos + 4);
  yPos += 10;

  // Format account number
  const accountNumber = propertyDetails?.accountNumber || data.statements[0]?.STA_NOMBAKAUN || 0;
  const formattedAccountNumber = `T${String(accountNumber).padStart(9, '0')}`;

  // TWO COLUMN LAYOUT
  const leftX = margin;
  const rightX = pageWidth / 2 + 10;
  const labelOffset = 40;
  let leftY = yPos;
  let rightY = yPos;

  doc.setFontSize(9);

  // LEFT COLUMN
  doc.setFont('helvetica', 'bold');
  doc.text('Nombor Akaun:', leftX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(formattedAccountNumber, leftX + labelOffset, leftY);
  leftY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Nama Pemilik:', leftX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(propertyDetails?.ownerName || '', leftX + labelOffset, leftY);
  leftY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Alamat Surat:', leftX, leftY);
  doc.setFont('helvetica', 'normal');
  const mailingAddress = propertyDetails?.mailingAddress || '';
  const mailingLines = doc.splitTextToSize(mailingAddress, 70);
  doc.text(mailingLines, leftX + labelOffset, leftY);
  leftY += mailingLines.length * 5 + 2;

  doc.setFont('helvetica', 'bold');
  doc.text('Negeri:', leftX, leftY);
  doc.setFont('helvetica', 'normal');
  leftY += 6;

  // RIGHT COLUMN
  doc.setFont('helvetica', 'bold');
  doc.text('Nilai Tahunan:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    propertyDetails?.newValue ? formatNumber(propertyDetails.newValue) : '-',
    rightX + 35,
    rightY,
    { align: 'right' }
  );
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('% Kadar:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    propertyDetails?.ratePerYear ? `${propertyDetails.ratePerYear.toFixed(2)}%` : '-',
    rightX + 35,
    rightY,
    { align: 'right' }
  );
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Peratusan:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    propertyDetails?.percentage ? `${propertyDetails.percentage.toFixed(2)}%` : '-',
    rightX + 35,
    rightY,
    { align: 'right' }
  );
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Taksiran Tahunan:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    propertyDetails?.newTax ? formatCurrency(propertyDetails.newTax) : '-',
    rightX + 35,
    rightY,
    { align: 'right' }
  );

  // Alamat Harta - BELOW COLUMNS, LEFT ALIGNED
  yPos = Math.max(leftY, rightY) + 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Alamat Harta:', leftX, yPos);
  doc.setFont('helvetica', 'normal');
  const propertyAddress = propertyDetails?.propertyAddress || '';
  const propertyLines = doc.splitTextToSize(propertyAddress, 80);
  doc.text(propertyLines, leftX + labelOffset, yPos);
  yPos += propertyLines.length * 5 + 8;

  // Baki Akhir
  const lastTransaction = data.statements[data.statements.length - 1];
  const endingBalanceDate = lastTransaction?.STA_TARIKHTRX
    ? formatDate(lastTransaction.STA_TARIKHTRX)
    : formatDate(new Date());

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Baki Akhir: ${endingBalanceDate}`, margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(data.totals.totalBalance), margin + 60, yPos, { align: 'right' });
  yPos += 10;

  // Transaction Table
  let runningBalance = 0;
  const tableData = data.statements.map((stmt) => {
    const date = formatDate(stmt.STA_TARIKHTRX);
    const document = stmt.STA_REFERENCE || '-';
    const description = stmt.TRA_TRANSNAME || stmt.STA_TRANSCODE || 'CUKAI TAKSIRAN';
    const debit = stmt.STA_TRANSDRCR === 'D' ? formatCurrency(stmt.STA_AMOUNTTRX) : '';
    const credit = stmt.STA_TRANSDRCR === 'K' ? formatCurrency(stmt.STA_AMOUNTTRX) : '';

    if (stmt.STA_TRANSDRCR === 'D') {
      runningBalance += stmt.STA_AMOUNTTRX;
    } else if (stmt.STA_TRANSDRCR === 'K') {
      runningBalance -= stmt.STA_AMOUNTTRX;
    }

    const balanceStr = runningBalance < 0
      ? `(${formatCurrency(Math.abs(runningBalance))})`
      : formatCurrency(runningBalance);

    return [date, document, description, debit, credit, balanceStr];
  });

  const totalDebit = formatCurrency(data.totals.totalDebit);
  const totalCredit = formatCurrency(data.totals.totalCredit);
  const totalBalance = data.totals.totalBalance < 0
    ? `(${formatCurrency(Math.abs(data.totals.totalBalance))})`
    : formatCurrency(data.totals.totalBalance);

  autoTable(doc, {
    startY: yPos,
    head: [['Tarikh', 'Dokumen', 'Keterangan Transaksi', 'Debit', 'Kredit', 'Baki']],
    body: [
      ...tableData,
      ['JUMLAH', '', '', totalDebit, totalCredit, totalBalance],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 30 },
      2: { cellWidth: 60 },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    styles: {
      cellPadding: 2,
    },
    didParseCell: (data: any) => {
      if (data.row.index === tableData.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 9;
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 50;
  doc.setFontSize(7);
  doc.text(`Dicetak pada ${formatDate(new Date())} ${new Date().toLocaleTimeString('en-GB')}`, margin, pageHeight - 10);

  doc.save(`Penyata_Akaun_${formattedAccountNumber}.pdf`);
};
