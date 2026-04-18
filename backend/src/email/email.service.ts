import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';

@Injectable()
export class EmailService {
  private mailgun: any;
  private domain: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('MAILGUN_API_KEY');
    const domain = this.configService.get<string>('MAILGUN_DOMAIN');

    if (!apiKey || !domain) {
      throw new Error(
        'Mailgun API key or domain not configured. Set MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables.',
      );
    }

    this.mailgun = new Mailgun(FormData);
    this.domain = domain;
  }

  private getClient() {
    const apiKey = this.configService.get<string>('MAILGUN_API_KEY');
    return this.mailgun.client({ username: 'api', key: apiKey });
  }

  async sendOtpEmail(email: string, code: string, fullName: string): Promise<void> {
    try {
      const client = this.getClient();

      await client.messages.create(this.domain, {
        from: `Smart Campus Utility <noreply@${this.domain}>`,
        to: email,
        subject: 'Verify Your Email - Smart Campus Utility',
        html: this.getOtpEmailHtml(fullName, code),
        text: `Your verification code is: ${code}. This code will expire in 10 minutes.`,
      });
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new BadRequestException('Failed to send verification email. Please try again.');
    }
  }

  private getOtpEmailHtml(fullName: string, code: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hi ${fullName},</p>
              <p>Thank you for registering with Smart Campus Utility. To complete your registration, please verify your email using the code below:</p>
              <div class="otp-box">
                <div class="otp-code">${code}</div>
                <p style="color: #999; margin: 10px 0; font-size: 14px;">This code will expire in 10 minutes</p>
              </div>
              <p>If you did not create this account, please ignore this email.</p>
              <div class="footer">
                <p>&copy; 2026 Smart Campus Utility. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
