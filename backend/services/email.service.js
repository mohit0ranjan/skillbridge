/**
 * Enhanced Email Service with Templates
 * Supports Google Gmail, Sendgrid, and console logging for dev
 */

const nodemailer = require('nodemailer');
const { ApiError } = require('../utils/apiResponse');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Development mode: Log to console
    if (process.env.NODE_ENV === 'development' && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
      console.log('📧 Email service in CONSOLE mode (development)');
      this.transporter = {
        sendMail: async (options) => {
          console.log('📧 EMAIL CONSOLE LOG:', {
            from: options.from,
            to: options.to,
            subject: options.subject,
            preview: options.html.substring(0, 100),
          });
          return { messageId: `mock-${Date.now()}` };
        },
      };
      return;
    }

    // Production mode: Use Gmail SMTP with App Password
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Should be Gmail App Password, not account password
        },
      });
      console.log('📧 Email service configured with Gmail');
      return;
    }

    // In development with no credentials, use console
    console.warn('⚠️ Email credentials not configured. Using console mode.');
    this.transporter = {
      sendMail: async (options) => {
        console.log('📧 EMAIL (DEV):', {
          from: options.from,
          to: options.to,
          subject: options.subject,
        });
        return { messageId: `dev-${Date.now()}` };
      },
    };
  }

  /**
   * Send onboarding email right after account creation.
   */
  async sendOnboardingWelcome({ userEmail, userName, verifyLink }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to SkillBridge</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Your account has been created successfully. You can now explore internships and start your journey.
          </p>
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Before you begin, please verify your email address.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="font-size: 13px; color: #6b7280; margin-top: 18px;">
            This verification link expires in 24 hours.
          </p>
        </div>
      </div>
    `;

    return this.send({
      to: userEmail,
      subject: 'Welcome to SkillBridge - Verify your email',
      html,
    });
  }

  /**
   * Send enrollment confirmation email
   */
  async sendEnrollmentConfirmation({ userEmail, userName, internshipTitle, internshipDuration }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to SkillBridge!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>
          <p style="font-size: 16px; color: #555;">
            You have successfully enrolled in the <strong>${internshipTitle}</strong> internship program!
          </p>
          <div style="background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #10b981;">Program Details</h3>
            <p style="margin: 5px 0;"><strong>Program:</strong> ${internshipTitle}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${internshipDuration}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Active</p>
          </div>
          <p style="font-size: 16px; color: #555;">
            You can now access your workspace and start working on tasks. Check your dashboard to view all assignments.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            Best of luck with your internship! If you have any questions, contact our support team.
          </p>
        </div>
      </div>
    `;

    return this.send({
      to: userEmail,
      subject: `✅ Enrollment Confirmed: ${internshipTitle}`,
      html,
    });
  }

  /**
   * Send payment success notification
   */
  async sendPaymentSuccess({ userEmail, userName, internshipTitle, amount }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✅ Payment Successful</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>
          <p style="font-size: 16px; color: #555;">
            Your payment has been successfully processed!
          </p>
          <div style="background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #10b981;">Receipt Details</h3>
            <p style="margin: 5px 0;"><strong>Program:</strong> ${internshipTitle}</p>
            <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${amount}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p style="font-size: 16px; color: #555;">
            Start your internship now by visiting your dashboard!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Start Learning
            </a>
          </div>
        </div>
      </div>
    `;

    return this.send({
      to: userEmail,
      subject: `✅ Payment Received - ${internshipTitle}`,
      html,
    });
  }

  /**
   * Send Certificate Delivery email
   */
  async sendCertificateDelivery({ userEmail, userName, internshipTitle, certificateId }) {
    const frontendBaseUrl = process.env.FRONTEND_URL
      || process.env.APP_URL
      || (process.env.NODE_ENV === 'production' ? 'https://skillbridge.in' : 'http://localhost:3000');
    const certificateUrl = `${frontendBaseUrl}/certificate/${certificateId}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎓 Certificate Earned!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333;">Congratulations <strong>${userName}</strong>,</p>
          <p style="font-size: 16px; color: #555;">
            Your final submission for the <strong>${internshipTitle}</strong> program has been approved and your certificate is ready!
          </p>
          <div style="background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Certificate ID:</strong> ${certificateId}</p>
          </div>
          <p style="font-size: 16px; color: #555;">
            You can now view, share, or download your official verified certificate online.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${certificateUrl}" style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View My Certificate
            </a>
          </div>
        </div>
      </div>
    `;

    return this.send({
      to: userEmail,
      subject: `🎓 Your Certificate is Ready - ${internshipTitle}`,
      html,
    });
  }

  /**
   * Send support ticket reply email
   */
  async sendSupportReply({ userEmail, userName, subject, replyMessage }) {
    const frontendBaseUrl = process.env.FRONTEND_URL
      || process.env.APP_URL
      || (process.env.NODE_ENV === 'production' ? 'https://skillbridge.in' : 'http://localhost:3000');
    const supportUrl = `${frontendBaseUrl}/support`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f9fafb; padding: 24px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 28px; text-align: center; color: white; border-radius: 14px 14px 0 0;">
          <h1 style="margin: 0; font-size: 26px;">Support Reply from SkillBridge</h1>
        </div>
        <div style="background: white; padding: 28px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 14px 14px;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${userName}</strong>,</p>
          <p style="font-size: 16px; color: #4b5563; line-height: 1.7;">
            We have replied to your support request about <strong>${subject}</strong>.
          </p>
          <div style="margin: 22px 0; padding: 18px; background: #f9fafb; border-left: 4px solid #10b981; border-radius: 10px;">
            <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #6b7280; font-weight: 700;">Admin reply</p>
            <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #111827; white-space: pre-wrap;">${replyMessage}</p>
          </div>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            If you need more help, reply from the support page and our team will take it from there.
          </p>
          <div style="text-align: center; margin-top: 26px;">
            <a href="${supportUrl}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Open Support Center
            </a>
          </div>
        </div>
      </div>
    `;

    return this.send({
      to: userEmail,
      subject: `Reply to your support request: ${subject}`,
      html,
    });
  }

  /**
   * Generic send email
   */
  async send({ to, subject, html, text = null }) {
    if (!this.transporter) {
      throw new ApiError('Email service not configured', 500, 'EMAIL_CONFIG_ERROR');
    }

    if (!to || !subject || !html) {
      throw new ApiError('Missing email parameters', 400, 'INVALID_EMAIL_PARAMS');
    }

    try {
      const mailOptions = {
        from: `SkillBridge <${process.env.EMAIL_USER || 'noreply@skillbridge.in'}>`,
        to,
        subject,
        html,
        text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}`);
      return info;
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
      throw new ApiError(`Failed to send email: ${error.message}`, 500, 'EMAIL_SEND_ERROR');
    }
  }
}

const emailService = new EmailService();

module.exports = {
  sendEmail: (options) => emailService.send(options),
  emailService,
};
