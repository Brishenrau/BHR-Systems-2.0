import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import type { StatementResponse, TKN_BAKHUTANG } from '../types/database.types';

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
  order: number; // 1 for current year tax, 2 for arrears/excess
}

export const generateBillPDF = async (
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

  // Helper function to format date (dd/mm/yyyy)
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate dates based on SQL logic
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();
  
  // Bill year is always next year (add_months(sysdate, 12))
  const billYear = currentYear + 1;
  const billDate = new Date(billYear, 0, 1); // Jan 1 of next year
  const dueDate = new Date(billYear, 1, 0); // Last day of February
  
  // Format account number with "T" prefix (e.g., T000010944)
  const accountNumber = propertyDetails?.accountNumber || data.statements[0]?.STA_NOMBAKAUN || 0;
  const formattedAccountNumber = `T${String(accountNumber).padStart(9, '0')}`;

  // Load watermark first (to appear behind content)
  let watermarkImg: HTMLImageElement | null = null;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/WATERMARK.jpg';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        watermarkImg = img;
        resolve();
      };
      img.onerror = () => reject(new Error('Watermark load failed'));
      setTimeout(() => reject(new Error('Watermark load timeout')), 3000);
    });
    // Add watermark as background (before other content)
    if (watermarkImg) {
      doc.addImage(watermarkImg, 'JPEG', pageWidth / 2 - 50, pageHeight / 2 - 50, 100, 100, undefined, 'FAST');
    }
  } catch (error) {
    console.warn('Could not load watermark:', error);
  }

  // Build bill rows according to SQL query structure
  const billRows: BillRow[] = [];

  // Row 1: Current year tax (PEG_CUKAIBARU)
  if (propertyDetails?.newTax) {
    billRows.push({
      description: 'Cukai Taksiran',
      janJunAmount: propertyDetails.newTax / 2,
      tahunAmount: propertyDetails.newTax,
      order: 1,
    });
  }

  // Rows 2+: Arrears (TUNGGAKAN) from bakhutang
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

  // Last row: Excess payments (Bayaran Lebihan)
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

  // Load and add logo image
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/MPKKJAWIS.jpg';
    await new Promise<void>((resolve, reject) => {
      logoImg.onload = () => resolve();
      logoImg.onerror = () => reject(new Error('Logo load failed'));
      // Timeout after 3 seconds
      setTimeout(() => reject(new Error('Logo load timeout')), 3000);
    });
    doc.addImage(logoImg, 'JPEG', margin, yPos, 20, 20);
  } catch (error) {
    console.warn('Could not load logo image:', error);
  }

  // Header - Council Name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MAJLIS PERBANDARAN KULIM', pageWidth / 2, yPos + 10, { align: 'center' });
  yPos += 8;

  // Address
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('NO 1, LEBUH BANDAR 2, BANDAR PUTRA, 09000 KULIM', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;

  // Portal
  doc.setFontSize(9);
  doc.text('Portal Rasmi: www.mpkk.gov.my', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;

  // Contact Information (right side)
  const contactX = pageWidth - margin;
  doc.setFontSize(9);
  doc.text('No Tel: +604-4325225', contactX, margin + 5, { align: 'right' });
  doc.text('No Faks: +604-4325229', contactX, margin + 10, { align: 'right' });
  doc.text('E-mail: info@mpkk.gov.my', contactX, margin + 15, { align: 'right' });

  yPos += 5;

  // Bill Title (green banner style)
  doc.setFillColor(0, 128, 0); // Green color
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BIL AWAL CUKAI TAKSIRAN BAGI TAHUN ' + billYear, pageWidth / 2, yPos + 5.5, { align: 'center' });
  doc.setTextColor(0, 0, 0); // Reset to black
  yPos += 12;

  // MAKLUMAT PEMILIK Section (with light green background)
  doc.setFillColor(240, 255, 240); // Light green
  doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 6, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MAKLUMAT PEMILIK', margin, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Left side - Owner Name and Address
  const ownerName = propertyDetails?.ownerName || '';
  const mailingAddress = propertyDetails?.mailingAddress || '';
  const mailingLines = doc.splitTextToSize(mailingAddress, 70);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(ownerName, margin, yPos);
  yPos += 5;
  mailingLines.forEach((line: string) => {
    doc.text(line, margin, yPos);
    yPos += 4;
  });

  // Right side - Account Details
  const rightColX = pageWidth / 2 + 20;
  let rightY = yPos - (mailingLines.length * 4) - 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('No. Akaun:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(formattedAccountNumber, rightColX + 28, rightY);
  rightY += 5;

  doc.setFontSize(7);
  doc.text('(Sila gunakan No Akaun sebagai rujukan utama untuk bayaran secara Online)', rightColX, rightY, { maxWidth: 70 });
  rightY += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Tarikh Bil:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(billDate), rightColX + 28, rightY);
  rightY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Bagi Tempoh:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tahun ${billYear}`, rightColX + 28, rightY);

  // Generate barcode for account number (top)
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, formattedAccountNumber, {
      format: 'CODE128',
      width: 1,
      height: 20,
      displayValue: false,
    });
    const barcodeDataUrl = canvas.toDataURL('image/png');
    const barcodeImg = new Image();
    barcodeImg.src = barcodeDataUrl;
    await new Promise<void>((resolve, reject) => {
      barcodeImg.onload = () => resolve();
      barcodeImg.onerror = () => reject(new Error('Barcode load failed'));
      setTimeout(() => reject(new Error('Barcode load timeout')), 3000);
    });
    doc.addImage(barcodeImg, 'PNG', rightColX, rightY + 5, 50, 8);
  } catch (error) {
    console.warn('Could not generate barcode:', error);
  }

  yPos = Math.max(yPos, rightY + 15) + 5;

  // MAKLUMAT HARTA/PEGANGAN Section (with light green background)
  doc.setFillColor(240, 255, 240); // Light green
  doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 6, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MAKLUMAT HARTA/PEGANGAN', margin, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Left side - Property Address
  const propertyAddress = propertyDetails?.propertyAddress || '';
  doc.setFont('helvetica', 'bold');
  doc.text('Alamat Harta:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 5;
  const propertyLines = doc.splitTextToSize(propertyAddress, 70);
  propertyLines.forEach((line: string) => {
    doc.text(line, margin, yPos);
    yPos += 4;
  });

  // Right side - Property Valuation
  rightY = yPos - (propertyLines.length * 4) - 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Nilai Tambah:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    propertyDetails?.newValue ? formatCurrency(propertyDetails.newValue) : '-',
    rightColX + 33,
    rightY
  );
  rightY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Kadar:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    propertyDetails?.ratePerYear ? `${propertyDetails.ratePerYear.toFixed(2)}%` : '-',
    rightColX + 33,
    rightY
  );
  rightY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Cukai Tahunan:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    propertyDetails?.newTax ? formatCurrency(propertyDetails.newTax) : '-',
    rightColX + 33,
    rightY
  );

  yPos = Math.max(yPos, rightY) + 8;

  // MAKLUMAT BAYARAN Section (with light green background)
  doc.setFillColor(240, 255, 240); // Light green
  doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 6, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MAKLUMAT BAYARAN', margin, yPos);
  yPos += 8;

  // Payment Due Date (in red)
  doc.setFontSize(9);
  doc.setTextColor(255, 0, 0); // Red color
  doc.setFont('helvetica', 'bold');
  doc.text(`Bayar Pada/Sebelum: ${formatDate(dueDate)}`, margin, yPos);
  doc.setTextColor(0, 0, 0); // Reset to black
  yPos += 6;

  // QR Code section (left side) - Use static QR code image or generate one
  const qrCodeSize = 30;
  const qrX = margin;
  const qrY = yPos;

  try {
    // Try to use static QR code image first, otherwise generate one
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = '/QRCPBTPAY.jpg';
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => {
        // If static image fails, generate QR code for account number
        QRCode.toDataURL(formattedAccountNumber, { width: 200 })
          .then((dataUrl) => {
            qrImg.src = dataUrl;
            qrImg.onload = () => resolve();
            qrImg.onerror = () => reject(new Error('QR code generation failed'));
          })
          .catch(() => reject(new Error('QR code generation failed')));
      };
      setTimeout(() => reject(new Error('QR code load timeout')), 3000);
    });
    doc.addImage(qrImg, qrImg.src.includes('QRCPBTPAY') ? 'JPEG' : 'PNG', qrX, qrY, qrCodeSize, qrCodeSize);
  } catch (error) {
    console.warn('Could not load/generate QR code:', error);
  }

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Sila scan untuk bayaran PBTPay Online', qrX, qrY + qrCodeSize + 3, { maxWidth: qrCodeSize });
  yPos += qrCodeSize + 8;

  // "DITERIMA TANPA PREJUDIS" text (centered)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('DITERIMA TANPA PREJUDIS', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Payment Table
  const tableData = billRows.map((row) => [
    row.description,
    formatCurrency(row.janJunAmount),
    formatCurrency(row.tahunAmount),
  ]);

  // Add total row
  tableData.push([
    'JUMLAH PERLU BAYAR',
    formatCurrency(totalJanJun),
    formatCurrency(totalTahun),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Keterangan Bil', `Jan-Jun ${billYear}`, `Tahun ${billYear}`]],
    body: tableData,
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
      0: { cellWidth: 80 }, // Keterangan Bil
      1: { cellWidth: 40, halign: 'right' }, // Jan-Jun
      2: { cellWidth: 40, halign: 'right' }, // Tahun
    },
    margin: { left: margin, right: margin },
    styles: {
      cellPadding: 3,
    },
    didParseCell: (data: any) => {
      // Make total row bold
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 9;
      }
    },
  });

  // Bottom barcode
  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 50;
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, formattedAccountNumber, {
      format: 'CODE128',
      width: 1,
      height: 20,
      displayValue: false,
    });
    const barcodeDataUrl = canvas.toDataURL('image/png');
    const barcodeImg = new Image();
    barcodeImg.src = barcodeDataUrl;
    await new Promise<void>((resolve, reject) => {
      barcodeImg.onload = () => resolve();
      barcodeImg.onerror = () => reject(new Error('Barcode load failed'));
      setTimeout(() => reject(new Error('Barcode load timeout')), 3000);
    });
    doc.addImage(barcodeImg, 'PNG', pageWidth - margin - 50, finalY + 5, 50, 8);
  } catch (error) {
    console.warn('Could not generate bottom barcode:', error);
  }

  // Print info at bottom
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const printInfo = `Dicetak oleh: ${propertyDetails?.ownerName || 'System'} pada ${formatDate(new Date())} ${new Date().toLocaleTimeString('en-GB')}`;
  doc.text(printInfo, margin, pageHeight - 10);

  // Save PDF
  doc.save(`Bil_Awal_Cukai_Taksiran_${formattedAccountNumber}_${billYear}.pdf`);
};

