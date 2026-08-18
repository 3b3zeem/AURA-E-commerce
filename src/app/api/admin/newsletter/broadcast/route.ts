import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { generateOfferEmailHtml } from '@/lib/emailTemplates';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { offerTitle, offerSubtitle, offerPrice, originalPrice, offerImage, customMessage, products } = body;

    const supabase = createClient();
    const { data: subscribers } = await supabase.from('newsletter_subscribers').select('email');

    const recipientEmails = (subscribers || []).map((s) => s.email);

    if (recipientEmails.length === 0) {
      return NextResponse.json({
        success: true,
        recipientsCount: 0,
        recipients: [],
        sentAt: new Date().toISOString(),
        message: 'No newsletter subscribers found in Supabase database.',
      });
    }

    // Generate responsive HTML email template
    const emailHtml = generateOfferEmailHtml({
      offerTitle: offerTitle || 'Special Bundle Offer',
      offerSubtitle: offerSubtitle || 'Limited Time Discount Drop',
      offerPrice: Number(offerPrice) || 0,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      offerImage,
      customMessage,
      products,
    });

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || `"AURA Store" <${smtpUser || 'no-reply@aura.com'}>`;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log(`[AURA BROADCAST NOTICE] HTML Email ready for ${recipientEmails.length} subscribers. SMTP env vars missing.`);
      return NextResponse.json({
        success: true,
        recipientsCount: recipientEmails.length,
        recipients: recipientEmails,
        htmlTemplate: emailHtml,
        sentAt: new Date().toISOString(),
        warning: 'SMTP_HOST, SMTP_USER, or SMTP_PASS not set in .env.local',
        message: `HTML email alert generated for ${recipientEmails.length} subscribers! Add SMTP_HOST, SMTP_USER, and SMTP_PASS to .env.local to enable live inbox delivery.`,
      });
    }

    // Create Nodemailer transport & dispatch emails
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
      to: recipientEmails.join(', '),
      subject: `🔥 Exclusive Offer Alert: ${offerTitle}`,
      html: emailHtml,
    });

    console.log(`[AURA NEWSLETTER BROADCAST] Real email sent to ${recipientEmails.length} subscribers via SMTP!`);

    return NextResponse.json({
      success: true,
      recipientsCount: recipientEmails.length,
      recipients: recipientEmails,
      sentAt: new Date().toISOString(),
      message: `Real HTML email alert delivered to ${recipientEmails.length} subscribers via SMTP!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
