import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
): Promise<string> => {
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

  // Load and add logo image on the left
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/logo.png';
    await new Promise<void>((resolve, reject) => {
      logoImg.onload = () => {
        doc.addImage(logoImg, 'PNG', margin, yPos, 25, 25);
        resolve();
      };
      logoImg.onerror = () => reject(new Error('Logo failed'));
      setTimeout(() => reject(new Error('Timeout')), 3000);
    });
  } catch (error) {
    console.warn('Logo not loaded');
  }

  // Load and add MPKKJAWIS.jpg above "MAJLIS PERBANDARAN"
  let mpkkImageHeight = 0;
  try {
    const mpkkImg = new Image();
    mpkkImg.crossOrigin = 'anonymous';
    mpkkImg.src = '/MPKKJAWIS.jpg';
    await new Promise<void>((resolve, reject) => {
      mpkkImg.onload = () => {
        // Calculate where "MAJLIS" starts in the centered text "MAJLIS PERBANDARAN KULIM"
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const fullText = 'MAJLIS PERBANDARAN KULIM';
        const fullTextWidth = doc.getTextWidth(fullText);
        const fullTextStartX = pageWidth / 2 - fullTextWidth / 2;
        
        // Calculate width of "MAJLIS PERBANDARAN" for image width
        const textWidth = doc.getTextWidth('MAJLIS PERBANDARAN');
        
        // Position image above the text, starting at the M in MAJLIS
        mpkkImageHeight = 15; // Height of the image
        // Position image above the text (yPos - image height - smaller gap, moved down 1mm)
        doc.addImage(mpkkImg, 'JPEG', fullTextStartX, yPos - mpkkImageHeight + 0.5, textWidth, mpkkImageHeight);
        resolve();
      };
      mpkkImg.onerror = () => reject(new Error('MPKKJAWIS failed'));
      setTimeout(() => reject(new Error('Timeout')), 3000);
    });
  } catch (error) {
    console.warn('MPKKJAWIS not loaded');
  }

  // Header - Council Name (positioned below the MPKKJAWIS image)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MAJLIS PERBANDARAN KULIM', pageWidth / 2, yPos + 10, { align: 'center' });
  yPos += 18; // Move down after council name

  // Address
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('NO 1, LEBUH BANDAR 2, BANDAR PUTRA, 09000 KULIM', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  // Portal - CENTERED, below address
  doc.setFontSize(9);
  doc.text('Portal Rasmi: www.mpkk.gov.my', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  // Contact Information (right side)
  const contactX = pageWidth - margin;
  doc.setFontSize(9);
  doc.text('No Tel: +604-4325225', contactX, margin + 5, { align: 'right' });
  doc.text('No Faks: +604-4325229', contactX, margin + 10, { align: 'right' });
  doc.text('E-mail: info@mpkk.gov.my', contactX, margin + 15, { align: 'right' });

  yPos += 3; // Reduced space

  // Bill Title (green banner style)
  doc.setFillColor(0, 128, 0); // Green color
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BIL AWAL CUKAI TAKSIRAN BAGI TAHUN ' + billYear, pageWidth / 2, yPos + 5.5, { align: 'center' });
  doc.setTextColor(0, 0, 0); // Reset to black
  yPos += 10; // Reduced spacing

  // MAKLUMAT PEMILIK Section (with green header bar)
  doc.setFillColor(0, 128, 0); // Green color
  doc.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MAKLUMAT PEMILIK', margin + 3, yPos + 4);
  doc.setTextColor(0, 0, 0); // Reset to black
  yPos += 8; // Reduced spacing

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Left side - Owner Name and Address
  const ownerName = propertyDetails?.ownerName || '';
  const mailingAddress = propertyDetails?.mailingAddress || '';
  const mailingLines = doc.splitTextToSize(mailingAddress, 70);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(ownerName, margin, yPos);
  yPos += 4; // Reduced spacing
  mailingLines.forEach((line: string) => {
    doc.text(line, margin, yPos);
    yPos += 3.5; // Reduced spacing
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

  yPos = Math.max(yPos, rightY + 15) + 5;

  // MAKLUMAT HARTA/PEGANGAN Section (with green header bar)
  doc.setFillColor(0, 128, 0); // Green color
  doc.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MAKLUMAT HARTA/PEGANGAN', margin + 3, yPos + 4);
  doc.setTextColor(0, 0, 0); // Reset to black
  yPos += 8; // Reduced spacing

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
    yPos += 3.5; // Reduced spacing
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

  yPos = Math.max(yPos, rightY) + 6; // Reduced spacing

  // MAKLUMAT BAYARAN Section (with green header bar)
  doc.setFillColor(0, 128, 0); // Green color
  doc.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MAKLUMAT BAYARAN', margin + 3, yPos + 4);
  doc.setTextColor(0, 0, 0); // Reset to black
  yPos += 8; // Reduced spacing

  // Payment Due Date (in red)
  doc.setFontSize(9);
  doc.setTextColor(255, 0, 0); // Red color
  doc.setFont('helvetica', 'bold');
  doc.text(`Bayar Pada/Sebelum: ${formatDate(dueDate)}`, margin, yPos);
  doc.setTextColor(0, 0, 0); // Reset to black
  yPos += 5; // Reduced spacing

  // "DITERIMA TANPA PREJUDIS" text (centered)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('DITERIMA TANPA PREJUDIS', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6; // Reduced spacing

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
      cellPadding: 2, // Reduced padding
    },
    didParseCell: (data: any) => {
      // Make total row bold
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 9;
      }
    },
  });

  // Get total pages after table is drawn
  const totalPages = (doc as any).internal.getNumberOfPages();

  // Print info at bottom
  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 50;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const printInfo = `Dicetak oleh: ${propertyDetails?.ownerName || 'System'} pada ${formatDate(new Date())} ${new Date().toLocaleTimeString('en-GB')}`;
  doc.text(printInfo, margin, pageHeight - 10);

  // Update page numbers on all pages
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`M/Surat: ${i} / ${totalPages}`, pageWidth - margin, 8, { align: 'right' });
  }

  // Return PDF as blob URL instead of saving
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  return pdfUrl;
};

