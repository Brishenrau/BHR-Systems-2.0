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
  let yPos = margin;

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2);
  };

  // Helper function to format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
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

  // Load watermark first (to appear behind content)
  try {
    const watermarkImg = new Image();
    watermarkImg.crossOrigin = 'anonymous';
    watermarkImg.src = '/WATERMARK.jpg';
    await new Promise<void>((resolve, reject) => {
      watermarkImg.onload = () => {
        // Add watermark as background
        doc.addImage(watermarkImg, 'JPEG', pageWidth / 2 - 50, pageHeight / 2 - 50, 100, 100, undefined, 'FAST');
        resolve();
      };
      watermarkImg.onerror = () => reject(new Error('Watermark load failed'));
      setTimeout(() => reject(new Error('Watermark load timeout')), 3000);
    });
  } catch (error) {
    console.warn('Could not load watermark:', error);
  }

  // Page number in top right
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('M/Surat: 1 / 1', pageWidth - margin, margin + 3, { align: 'right' });

  // Load and add logo image
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/MPKKJAWIS.jpg';
    await new Promise<void>((resolve, reject) => {
      logoImg.onload = () => {
        doc.addImage(logoImg, 'JPEG', margin, yPos, 20, 20);
        resolve();
      };
      logoImg.onerror = () => reject(new Error('Logo load failed'));
      setTimeout(() => reject(new Error('Logo load timeout')), 3000);
    });
  } catch (error) {
    console.warn('Could not load logo image:', error);
  }

  // Council Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MAJLIS PERBANDARAN KULIM', pageWidth / 2, yPos + 10, { align: 'center' });
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('NO 1, LEBUH BANDAR 2, BANDAR PUTRA, 09000 KULIM', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;

  // Contact Information (right side)
  const contactX = pageWidth - margin;
  doc.setFontSize(9);
  doc.text('No Tel: +604-4325225', contactX, margin + 5, { align: 'right' });
  doc.text('No Faks: +604-4325229', contactX, margin + 10, { align: 'right' });
  doc.text('E-mail: info@mpkk.gov.my', contactX, margin + 15, { align: 'right' });
  doc.text('Portal Rasmi: www.mpkk.gov.my', contactX, margin + 20, { align: 'right' });

  yPos += 5;

  // Document Title (dark green banner)
  doc.setFillColor(0, 128, 0); // Green color
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PENYATA AKAUN CUKAI TAKSIRAN', pageWidth / 2, yPos + 5.5, { align: 'center' });
  doc.setTextColor(0, 0, 0); // Reset to black
  yPos += 8;

  // Section Header (light green bar immediately below dark green bar)
  doc.setFillColor(240, 255, 240); // Light green
  doc.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MAKLUMAT PEMILIK dan HARTA PEGANGAN', margin + 3, yPos + 4);
  yPos += 10;

  // Owner and Property Details - Two Column Layout
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const leftColX = margin;
  const rightColX = pageWidth / 2 + 10;
  const labelWidth = 40;
  const valueOffset = 5;

  // Format account number with T prefix
  const accountNumber = propertyDetails?.accountNumber || data.statements[0]?.STA_NOMBAKAUN || 0;
  const formattedAccountNumber = `T${String(accountNumber).padStart(9, '0')}`;

  // Left Column - Owner Details
  let leftY = yPos;
  doc.setFont('helvetica', 'bold');
  doc.text('Nombor Akaun:', leftColX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(formattedAccountNumber, leftColX + labelWidth, leftY);
  leftY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Nama Pemilik:', leftColX, leftY);
  doc.setFont('helvetica', 'normal');
  const ownerName = propertyDetails?.ownerName || '';
  doc.text(ownerName, leftColX + labelWidth, leftY);
  leftY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Alamat Surat:', leftColX, leftY);
  doc.setFont('helvetica', 'normal');
  const mailingAddress = propertyDetails?.mailingAddress || '';
  const mailingLines = doc.splitTextToSize(mailingAddress, 70);
  doc.text(mailingLines, leftColX + labelWidth, leftY);
  leftY += mailingLines.length * 5 + 2;

  doc.setFont('helvetica', 'bold');
  doc.text('Negeri:', leftColX, leftY);
  doc.setFont('helvetica', 'normal');
  // Negeri field (empty for now)
  leftY += 6;

  // Right Column - Assessment Details
  let rightY = yPos;
  doc.setFont('helvetica', 'bold');
  doc.text('Nilai Tahunan:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    propertyDetails?.newValue ? formatNumber(propertyDetails.newValue) : '-',
    rightColX + 35,
    rightY,
    { align: 'right' }
  );
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('% Kadar:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    propertyDetails?.ratePerYear ? `${propertyDetails.ratePerYear.toFixed(2)}%` : '-',
    rightColX + 35,
    rightY,
    { align: 'right' }
  );
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Peratusan:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    propertyDetails?.percentage ? `${propertyDetails.percentage.toFixed(2)}%` : '-',
    rightColX + 35,
    rightY,
    { align: 'right' }
  );
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Taksiran Tahunan:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    propertyDetails?.newTax ? formatCurrency(propertyDetails.newTax) : '-',
    rightColX + 35,
    rightY,
    { align: 'right' }
  );

  // Alamat Harta section (below owner/assessment details, left aligned)
  yPos = Math.max(leftY, rightY) + 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Alamat Harta:', leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  const propertyAddress = propertyDetails?.propertyAddress || '';
  const propertyLines = doc.splitTextToSize(propertyAddress, 80);
  doc.text(propertyLines, leftColX + labelWidth, yPos);
  yPos += propertyLines.length * 5 + 8;

  // Calculate ending balance date (last transaction date or current date)
  const lastTransaction = data.statements[data.statements.length - 1];
  const endingBalanceDate = lastTransaction?.STA_TARIKHTRX
    ? formatDate(lastTransaction.STA_TARIKHTRX)
    : new Date().toLocaleDateString('en-GB');

  // Ending Balance
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Baki Akhir: ${endingBalanceDate}`, margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(data.totals.totalBalance), margin + 60, yPos, { align: 'right' });
  yPos += 10;

  // Transaction Table - Calculate running balances
  let runningBalance = 0;
  const tableData = data.statements.map((stmt) => {
    const date = formatDate(stmt.STA_TARIKHTRX);
    const document = stmt.STA_REFERENCE || '-';
    const description = stmt.TRA_TRANSNAME || stmt.STA_TRANSCODE || 'CUKAI TAKSIRAN';
    const debit = stmt.STA_TRANSDRCR === 'D' ? formatCurrency(stmt.STA_AMOUNTTRX) : '';
    const credit = stmt.STA_TRANSDRCR === 'K' ? formatCurrency(stmt.STA_AMOUNTTRX) : '';
    
    // Calculate running balance (Debit - Credit)
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

  // Add totals row
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
      0: { cellWidth: 25 }, // Tarikh
      1: { cellWidth: 30 }, // Dokumen
      2: { cellWidth: 60 }, // Keterangan
      3: { cellWidth: 20, halign: 'right' }, // Debit
      4: { cellWidth: 20, halign: 'right' }, // Kredit
      5: { cellWidth: 20, halign: 'right' }, // Baki
    },
    margin: { left: margin, right: margin },
    styles: {
      cellPadding: 2,
    },
    didParseCell: (data: any) => {
      // Make total row bold with darker background
      if (data.row.index === tableData.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 9;
        data.cell.styles.fillColor = [240, 240, 240]; // Same as header
      }
    },
  });

  // Print info at bottom
  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 50;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const printInfo = `Dicetak pada ${formatDate(new Date())} ${new Date().toLocaleTimeString('en-GB')}`;
  doc.text(printInfo, margin, pageHeight - 10);

  // Open PDF in new window for printing/downloading
  doc.save(`Penyata_Akaun_${formattedAccountNumber}.pdf`);
};
