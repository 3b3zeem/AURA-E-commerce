export interface OfferEmailPayload {
  offerTitle: string;
  offerSubtitle?: string;
  offerPrice: number;
  originalPrice?: number;
  offerImage?: string;
  customMessage?: string;
  offerLink?: string;
  products?: { name: string; price?: number; image?: string }[];
}

/**
  Generates a premium, clean white responsive HTML email template for AURA marketing newsletter broadcasts.
 */
export function generateOfferEmailHtml(payload: OfferEmailPayload): string {
  const {
    offerTitle,
    offerSubtitle = 'Exclusive VIP Offer & Product Bundle',
    offerPrice,
    originalPrice,
    offerImage = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80',
    customMessage,
    offerLink = 'https://go-aura.vercel.app/offers',
    products = [],
  } = payload;

  const discount =
    originalPrice && originalPrice > offerPrice
      ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
      : null;

  const savingsAmount =
    originalPrice && originalPrice > offerPrice
      ? (originalPrice - offerPrice).toFixed(2)
      : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${offerTitle} - AURA Exclusive Drop</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f6f8; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- MAIN WHITE CONTAINER -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
          
          <!-- TOP CONTRAST BRAND BAR -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 30px; text-align: center;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #fbbf24; color: #0f172a; font-weight: 900; font-size: 20px; width: 38px; height: 38px; text-align: center; border-radius: 8px; font-family: monospace;">A</td>
                  <td style="padding-left: 12px; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; font-family: monospace;">aura</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO HEADER SECTION -->
          <tr>
            <td style="padding: 36px 36px 12px 36px; text-align: center;">
              <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 16px; border-radius: 9999px; border: 1px solid #fde68a; margin-bottom: 16px;">
                ${discount ? `SPECIAL DEAL • SAVE ${discount}%` : 'VIP MEMBER EXCLUSIVE'}
              </span>
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #0f172a; line-height: 1.25; letter-spacing: -0.5px;">
                ${offerTitle}
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 15px; color: #64748b; font-weight: 500; line-height: 1.5;">
                ${offerSubtitle}
              </p>
            </td>
          </tr>

          <!-- CUSTOM NOTE CARD (IF PROVIDED) -->
          ${
            customMessage
              ? `
          <tr>
            <td style="padding: 12px 36px;">
              <div style="background-color: #f8fafc; border-left: 4px solid #0f172a; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 16px 20px; border-radius: 8px; font-size: 14px; color: #334155; line-height: 1.6; font-style: italic;">
                "${customMessage}"
              </div>
            </td>
          </tr>
          `
              : ''
          }

          <!-- PRODUCT MAIN CARD -->
          <tr>
            <td style="padding: 24px 36px;">
              <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                
                <!-- IMAGE -->
                <div style="position: relative; background-color: #f1f5f9; text-align: center;">
                  <img src="${offerImage}" alt="${offerTitle}" width="100%" style="display: block; width: 100%; height: auto; max-height: 340px; object-fit: cover;">
                </div>

                <!-- PRICE & CTA CONTENT -->
                <div style="padding: 28px 24px; text-align: center; background-color: #ffffff;">
                  
                  ${
                    savingsAmount
                      ? `
                    <div style="margin-bottom: 8px;">
                      <span style="background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 6px; border: 1px solid #a7f3d0; text-transform: uppercase;">
                        Instant Savings: $${savingsAmount}
                      </span>
                    </div>
                    `
                      : ''
                  }

                  <!-- PRICE -->
                  <div style="margin-bottom: 20px; font-family: monospace;">
                    <span style="font-size: 36px; font-weight: 900; color: #0f172a;">$${offerPrice.toFixed(2)}</span>
                    ${
                      originalPrice && originalPrice > offerPrice
                        ? `<span style="font-size: 20px; color: #94a3b8; text-decoration: line-through; margin-left: 12px; font-weight: 700;">$${originalPrice.toFixed(2)}</span>`
                        : ''
                    }
                  </div>

                  <!-- CTA BUTTON -->
                  <a href="${offerLink}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 16px 36px; border-radius: 8px; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.25);">
                    CLAIM THIS OFFER NOW →
                  </a>

                </div>
              </div>
            </td>
          </tr>

          <!-- INCLUDED PRODUCTS BREAKDOWN SECTION -->
          ${
            products && products.length > 0
              ? `
          <tr>
            <td style="padding: 0 36px 24px 36px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                <p style="margin: 0 0 14px 0; font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                  Included Items in this Bundle (${products.length}):
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  ${products
                    .map(
                      (item) => `
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            ${
                              item.image
                                ? `<td width="44" style="padding-right: 12px;">
                                    <img src="${item.image}" alt="${item.name}" width="40" height="40" style="display: block; width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid #cbd5e1;">
                                   </td>`
                                : `<td width="24" style="font-size: 14px; color: #10b981; font-weight: bold;">•</td>`
                            }
                            <td style="font-size: 13px; font-weight: 700; color: #1e293b;">
                              ${item.name}
                            </td>
                            ${
                              item.price
                                ? `<td align="right" style="font-size: 12px; font-weight: 800; color: #64748b; font-family: monospace;">$${item.price}</td>`
                                : ''
                            }
                          </tr>
                        </table>
                      </td>
                    </tr>
                    `
                    )
                    .join('')}
                </table>
              </div>
            </td>
          </tr>
          `
              : ''
          }

          <!-- TRUST BADGES BAR -->
          <tr>
            <td style="padding: 0 36px 24px 36px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px border-bottom: 1px solid #f1f5f9; padding: 16px 0;">
                <tr>
                  <td width="33%" align="center" style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                    Fast Delivery
                  </td>
                  <td width="33%" align="center" style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                    Official Warranty
                  </td>
                  <td width="33%" align="center" style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                    100% Authentic
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER SECTION -->
          <tr>
            <td style="background-color: #f8fafc; padding: 28px 36px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 10px 0; font-weight: 800; color: #0f172a; font-size: 13px;">
                AURA Store — Premium Hardware & Tech Ecosystem
              </p>
              <p style="margin: 0 0 14px 0; line-height: 1.6; color: #64748b;">
                You are receiving this exclusive announcement because you joined the AURA VIP Newsletter.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © ${new Date().getFullYear()} AURA Store Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

