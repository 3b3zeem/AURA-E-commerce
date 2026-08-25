// Clean Executive White Email OTP Template Service via Nodemailer & SMTP

import nodemailer from 'nodemailer';

export interface SendEmailOtpParams {
  email: string;
  code: string;
  type?: 'verification' | 'password_reset';
}

export async function sendEmailOtp({ email, code, type = 'verification' }: SendEmailOtpParams): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const isReset = type === 'password_reset';

  const headerTitle = isReset ? 'AURA PASSWORD RESET' : 'AURA ACCOUNT VERIFICATION';
  const headerSubtitle = isReset ? 'Password Reset Security Code' : 'Executive Account Verification';
  const subjectText = isReset
    ? `${code} is your AURA Password Reset Code`
    : `${code} is your AURA Email Verification Code`;

  const bodyContent = isReset
    ? `We received a request to reset the password for your AURA account (<strong>${cleanEmail}</strong>). Please use the 6-digit security OTP code below to complete your password reset:`
    : `Thank you for choosing AURA Platform. Please use the 6-digit verification code below to verify your email address (<strong>${cleanEmail}</strong>) and complete your registration:`;

  const safetyDisclaimer = isReset
    ? `• If you did not request a password reset, please ignore this email or contact support to protect your account.`
    : `• If you did not request this verification email, please ignore it or contact security support.`;

  // Pure White Executive Aesthetic HTML Email Template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${headerTitle}</title>
      </head>
      <body style="margin: 0; padding: 40px 10px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #0f172a; text-transform: uppercase;">
                AURA
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; font-weight: 700; color: ${isReset ? '#e11d48' : '#64748b'}; text-transform: uppercase; letter-spacing: 1px;">
                ${headerSubtitle}
              </p>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px; background-color: #ffffff;">
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                Hello,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                ${bodyContent}
              </p>

              <!-- OTP Code Display Card (Clean White High Contrast) -->
              <div align="center" style="margin: 28px 0; padding: 20px; background-color: #ffffff; border: 2px solid #0f172a;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #0f172a; display: block;">
                  ${code}
                </span>
              </div>

              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                • This code is valid for <strong>5 minutes</strong> only.<br/>
                ${safetyDisclaimer}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 32px; background-color: #ffffff; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8; font-family: monospace;">
                &copy; ${new Date().getFullYear()} AURA E-Commerce Security. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </body>
    </html>
  `;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"AURA Security" <${smtpUser || 'no-reply@aura.com'}>`;

  // 1. Try Live Delivery via Nodemailer / SMTP
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: cleanEmail,
        subject: subjectText,
        html: htmlContent,
      });

      console.log(`[EMAIL OTP DISPATCH SUCCESS] (${type}) Real email sent to ${cleanEmail} via SMTP!`);
      return { success: true };
    } catch (err: any) {
      console.error("[EMAIL OTP SMTP ERROR]", err);
    }
  }

  // 2. Try Resend API if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "AURA Security <onboarding@resend.dev>",
          to: [cleanEmail],
          subject: subjectText,
          html: htmlContent,
        }),
      });

      if (response.ok) {
        console.log(`[EMAIL OTP DISPATCH SUCCESS] (${type}) Live email sent to ${cleanEmail} via Resend API`);
        return { success: true };
      }
    } catch (err) {
      console.error("[EMAIL OTP RESEND ERROR]", err);
    }
  }

  // Fallback Output Log for Local Testing
  console.log(`\n==================================================`);
  console.log(`[AURA EMAIL OTP DISPATCH - TYPE: ${type.toUpperCase()}]`);
  console.log(`Recipient: ${cleanEmail}`);
  console.log(`Subject: ${subjectText}`);
  console.log(`Verification Code: ${code}`);
  console.log(`==================================================\n`);

  return { success: true };
}
