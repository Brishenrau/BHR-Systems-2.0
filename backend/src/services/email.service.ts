import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    // Initialize transporter from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (smtpHost && smtpUser && smtpPassword) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });
    } else {
      console.warn('SMTP configuration not found. Email functionality will be disabled.');
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email service is not configured. Please set SMTP environment variables.');
    }

    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@mpkk.gov.my';

    try {
      const info = await this.transporter.sendMail({
        from: `"MAJLIS PERBANDARAN KULIM" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });

      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send statement PDF via email
   */
  async sendStatementPDF(
    toEmail: string,
    accountNumber: number,
    ownerName: string,
    pdfBuffer: Buffer
  ): Promise<void> {
    const subject = `Penyata Akaun Cukai Taksiran - Akaun ${accountNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1e40af;">Penyata Akaun Cukai Taksiran</h2>
        <p>Yang Dihormati,</p>
        <p>Berikut adalah penyata akaun cukai taksiran untuk:</p>
        <ul>
          <li><strong>Nombor Akaun:</strong> ${accountNumber}</li>
          <li><strong>Nama Pemilik:</strong> ${ownerName}</li>
        </ul>
        <p>Sila rujuk lampiran PDF untuk butiran lengkap.</p>
        <p>Sekian, terima kasih.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          <strong>MAJLIS PERBANDARAN KULIM</strong><br>
          NO 1, LEBUH BANDAR 2, BANDAR PUTRA, 09000 KULIM<br>
          Tel: +604-4325225 | Faks: +604-4325229<br>
          E-mail: info@mpkk.gov.my | www.mpkk.gov.my
        </p>
      </div>
    `;

    const text = `
Penyata Akaun Cukai Taksiran

Yang Dihormati,

Berikut adalah penyata akaun cukai taksiran untuk:
- Nombor Akaun: ${accountNumber}
- Nama Pemilik: ${ownerName}

Sila rujuk lampiran PDF untuk butiran lengkap.

Sekian, terima kasih.

---
MAJLIS PERBANDARAN KULIM
NO 1, LEBUH BANDAR 2, BANDAR PUTRA, 09000 KULIM
Tel: +604-4325225 | Faks: +604-4325229
E-mail: info@mpkk.gov.my | www.mpkk.gov.my
    `;

    await this.sendEmail({
      to: toEmail,
      subject,
      text,
      html,
      attachments: [
        {
          filename: `Penyata_Akaun_${accountNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }
}

