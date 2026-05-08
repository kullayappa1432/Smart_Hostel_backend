import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// const nodemailer = require('nodemailer');
// Nodemailer will be installed separately
let nodemailer: any;

@Injectable()
export class EmailService {
  private transporter: any;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Initialize Nodemailer transporter with SMTP configuration
   */
  private initializeTransporter(): void {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');

    // If nodemailer is not available, skip initialization
    if (!nodemailer) {
      console.warn('Nodemailer not available. Email functionality disabled.');
      return;
    }

    // If SMTP is not configured, use a test account (for development)
    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.warn('SMTP not configured. Using test account for development.');
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'test@ethereal.email',
          pass: 'test_password',
        },
      });
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });
  }

  /**
   * Send OTP email to user
   * @param email - Recipient email
   * @param otp - OTP code
   * @param userName - User's name (optional)
   */
  async sendOtpEmail(email: string, otp: string, userName: string = 'User'): Promise<void> {
    try {
      if (!this.transporter) {
        console.warn('Email service not configured. OTP email not sent.');
        return;
      }

      const htmlContent = this.generateOtpEmailTemplate(otp, userName);

      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM_EMAIL') || 'noreply@hostel.com',
        to: email,
        subject: 'Password Reset OTP - Hostel Management System',
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new InternalServerErrorException('Failed to send OTP email. Please try again later.');
    }
  }

  /**
   * Send password reset confirmation email
   * @param email - Recipient email
   * @param userName - User's name
   */
  async sendPasswordResetConfirmation(email: string, userName: string = 'User'): Promise<void> {
    try {
      if (!this.transporter) {
        console.warn('Email service not configured. Confirmation email not sent.');
        return;
      }

      const htmlContent = this.generatePasswordResetConfirmationTemplate(userName);

      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM_EMAIL') || 'noreply@hostel.com',
        to: email,
        subject: 'Password Reset Successful - Hostel Management System',
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset confirmation email:', error);
      throw new InternalServerErrorException('Failed to send confirmation email.');
    }
  }

  /**
   * Generate professional OTP email template
   */
  private generateOtpEmailTemplate(otp: string, userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 30px;
            }
            .greeting {
              font-size: 16px;
              margin-bottom: 20px;
              color: #333;
            }
            .otp-section {
              background-color: #f9f9f9;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .otp-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 4px;
              text-align: center;
              font-family: 'Courier New', monospace;
              margin: 15px 0;
            }
            .expiry-info {
              font-size: 13px;
              color: #e74c3c;
              text-align: center;
              margin-top: 10px;
            }
            .instructions {
              background-color: #e8f4f8;
              border-left: 4px solid #3498db;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 14px;
              color: #333;
            }
            .instructions ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .instructions li {
              margin: 8px 0;
            }
            .security-note {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 13px;
              color: #856404;
            }
            .footer {
              background-color: #f9f9f9;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
            }
            .footer p {
              margin: 5px 0;
            }
            .divider {
              height: 1px;
              background-color: #eee;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            
            <div class="content">
              <div class="greeting">
                Hello <strong>${userName}</strong>,
              </div>
              
              <p>We received a request to reset your password for your Hostel Management System account. Use the OTP below to proceed with your password reset.</p>
              
              <div class="otp-section">
                <div class="otp-label">Your One-Time Password (OTP)</div>
                <div class="otp-code">${otp}</div>
                <div class="expiry-info">⏱️ This OTP expires in 5 minutes</div>
              </div>
              
              <div class="instructions">
                <strong>How to use this OTP:</strong>
                <ul>
                  <li>Enter this OTP on the password reset page</li>
                  <li>Do not share this OTP with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>
              
              <div class="security-note">
                <strong>🔒 Security Notice:</strong> Never share your OTP with anyone, including support staff. We will never ask for your OTP via email or phone.
              </div>
              
              <div class="divider"></div>
              
              <p style="font-size: 13px; color: #666;">
                If you didn't request a password reset, please ignore this email or contact our support team immediately.
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Hostel Management System</strong></p>
              <p>© ${new Date().getFullYear()} All rights reserved</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate password reset confirmation email template
   */
  private generatePasswordResetConfirmationTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 30px;
            }
            .success-message {
              background-color: #d4edda;
              border-left: 4px solid #28a745;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #155724;
            }
            .footer {
              background-color: #f9f9f9;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
            }
            .footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              
              <div class="success-message">
                <strong>Your password has been successfully reset!</strong> You can now log in with your new password.
              </div>
              
              <p>If you did not make this change or believe your account has been compromised, please contact our support team immediately.</p>
              
              <p style="font-size: 13px; color: #666; margin-top: 30px;">
                For security reasons, we recommend:
              </p>
              <ul style="font-size: 13px; color: #666;">
                <li>Using a strong, unique password</li>
                <li>Not sharing your password with anyone</li>
                <li>Logging out from other devices if you suspect unauthorized access</li>
              </ul>
            </div>
            
            <div class="footer">
              <p><strong>Hostel Management System</strong></p>
              <p>© ${new Date().getFullYear()} All rights reserved</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
