# Email Configuration Guide

This guide explains how to configure email functionality for sending statement PDFs.

## Environment Variables

Add the following variables to your `.env` file in the `backend` directory:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@mpkk.gov.my
```

## SMTP Configuration Examples

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Note:** For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

### Outlook/Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@yourdomain.com
```

## Testing Email Configuration

After configuring the environment variables, restart your backend server. The email service will automatically initialize when the server starts.

If email configuration is missing or incorrect, you'll see a warning in the console:
```
SMTP configuration not found. Email functionality will be disabled.
```

## Troubleshooting

### Error: "Email service is not configured"
- Check that all SMTP environment variables are set in your `.env` file
- Restart the backend server after adding environment variables

### Error: "Failed to send email"
- Verify your SMTP credentials are correct
- Check that your SMTP server allows connections from your server IP
- For Gmail, ensure you're using an App Password, not your regular password
- Check firewall settings if using a custom SMTP server

### Email not received
- Check spam/junk folder
- Verify the recipient email address is correct
- Check SMTP server logs for delivery issues

