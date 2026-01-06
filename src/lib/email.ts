import { Resend } from 'resend';
import { emailTranslations } from './email-translations';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@thunderxis.store';

type SupportedLang = 'es' | 'en' | 'fr' | 'pt';

// --- Styles & Design Tokens ---
const css = {
  body: "font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #000000; margin: 0; padding: 0; width: 100%; -webkit-font-smoothing: antialiased;",
  container: "max-width: 600px; margin: 0 auto; background-color: #09090b; color: #ffffff; border: 1px solid #27272a; border-radius: 16px; overflow: hidden;",
  header: "background-color: #000000; padding: 40px 20px; text-align: center; border-bottom: 1px solid #27272a;",
  brand: "color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 2px; margin: 0; text-transform: uppercase;",
  content: "padding: 40px 30px;",
  h1: "color: #ffffff; margin: 0 0 16px 0; font-size: 24px; font-weight: 700; text-align: center;",
  p: "color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;",
  card: "background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 32px;",

  // Tables
  table: "width: 100%; border-collapse: collapse;",
  th: "text-align: left; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 12px; font-weight: 600;",
  td: "color: #ffffff; font-size: 14px; padding-bottom: 4px; font-weight: 500;",

  // Specifics
  accent: "color: #7c3aed;",
  button: "background-color: #7c3aed; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; transition: background-color 0.2s;",
  footer: "background-color: #000000; padding: 32px 20px; text-align: center; border-top: 1px solid #27272a;",
  footerLink: "color: #52525b; text-decoration: none; font-size: 12px; margin: 0 12px; hover: color: #a1a1aa;",

  // Order Item
  itemRow: "display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #27272a;",
  itemName: "font-weight: 600; color: #ffffff; font-size: 15px; margin-bottom: 4px;",
  itemCues: "color: #a1a1aa; font-size: 13px;",
  itemPrice: "font-weight: 600; color: #ffffff; font-size: 15px;",
};

export const sendWelcomeEmail = async (email: string, name: string, lang: SupportedLang = 'es') => {
  const t = emailTranslations[lang]?.welcome || emailTranslations['es'].welcome;

  try {
    const { data, error } = await resend.emails.send({
      from: `Foodies <${FROM_EMAIL}>`,
      to: [email],
      subject: t.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="${css.body}">
          <div style="${css.container}">
            
            <div style="${css.header}">
               <h1 style="${css.brand}">THUNDERXIS</h1>
            </div>

            <div style="${css.content}">
              <h2 style="${css.h1}">${t.title.replace('{name}', name)}</h2>
              <p style="${css.p}">${t.p1}</p>
              <p style="${css.p}">${t.p2}</p>
              
              <div style="text-align: center; margin-top: 40px;">
                 <a href="https://thunderxis.store/shop" style="${css.button}">${t.cta}</a>
              </div>
            </div>

            <div style="${css.footer}">
              <div style="margin-bottom: 20px;">
                <a href="#" style="${css.footerLink}">Instagram</a>
                <a href="#" style="${css.footerLink}">Twitter</a>
                <a href="#" style="${css.footerLink}">Web</a>
              </div>
              <p style="color: #27272a; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Foodies. Be Brave.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Exception sending welcome email:', error);
    return { success: false, error };
  }
};

export const sendReengagementEmail = async (email: string, name: string, lang: SupportedLang = 'es') => {
  const t = emailTranslations[lang]?.reengagement || emailTranslations['es'].reengagement;

  try {
    const { data, error } = await resend.emails.send({
      from: `Foodies <${FROM_EMAIL}>`,
      to: [email],
      subject: t.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="${css.body}">
          <div style="${css.container}">
             <div style="${css.header}">
               <h1 style="${css.brand}">THUNDERXIS</h1>
            </div>
            <div style="${css.content}">
                <h2 style="${css.h1}">${t.title.replace('{name}', name)}</h2>
                <p style="${css.p}">${t.p1}</p>
                <p style="${css.p}">${t.p2}</p>
                
                <div style="text-align: center; margin: 40px 0;">
                    <a href="https://thunderxis.store/shop" style="${css.button}">${t.cta}</a>
                </div>
                
                <p style="${css.p}">${t.p3}</p>
            </div>
             <div style="${css.footer}">
               <p style="color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} Foodies. Be Brave.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Error sending reengagement email:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Exception sending reengagement email:', error);
    return { success: false, error };
  }
};

export const sendNudgeEmail = async (email: string, name: string, lang: SupportedLang = 'es') => {
  const t = emailTranslations[lang]?.nudge || emailTranslations['es'].nudge;

  try {
    const { data, error } = await resend.emails.send({
      from: `Foodies <${FROM_EMAIL}>`,
      to: [email],
      subject: t.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="${css.body}">
          <div style="${css.container}">
             <div style="${css.header}">
               <h1 style="${css.brand}">THUNDERXIS</h1>
            </div>
            <div style="${css.content}">
                <h2 style="${css.h1}">${t.title.replace('{name}', name)}</h2>
                <p style="${css.p}">${t.p1}</p>
                <p style="${css.p}">${t.p2}</p>
                
                <div style="text-align: center; margin: 40px 0;">
                    <a href="https://thunderxis.store/shop" style="${css.button}">${t.cta}</a>
                </div>
            </div>
             <div style="${css.footer}">
               <p style="color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} Foodies. Be Brave.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Error sending nudge email:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Exception sending nudge email:', error);
    return { success: false, error };
  }
};

export const sendOrderConfirmationEmail = async (name: string, email: string, orderId: string, total: number, items: any[], lang: SupportedLang = 'es', date: string = new Date().toLocaleDateString(), shippingCost: number = 0) => {
  const t = emailTranslations[lang]?.order || emailTranslations['es'].order;

  try {
    const itemListHtml = items.map(item => `
      <div style="${css.itemRow}">
        <div style="flex: 1; padding-right: 16px;">
          <div style="${css.itemName}">${item.name}</div>
          <div style="${css.itemCues}">
             ${item.size ? `<span style="border: 1px solid #3f3f46; border-radius: 4px; padding: 2px 6px; font-size: 11px; margin-right: 8px;">${item.size}</span>` : ''}
             Qty: ${item.quantity}
          </div>
        </div>
        <div style="${css.itemPrice}">$${(item.price || item.price_at_time || 0).toLocaleString()}</div>
      </div>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: `Foodies <${FROM_EMAIL}>`,
      to: [email],
      subject: t.subject.replace('{id}', orderId.slice(0, 8)),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="${css.body}">
          <div style="${css.container}">
            
            <div style="${css.header}">
              <h1 style="${css.brand}">THUNDERXIS</h1>
            </div>

            <div style="${css.content}">
              <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="${css.h1}">${t.greeting.replace('{name}', name)}</h2>
                <p style="${css.p}">${t.p1.replace('{id}', `<span style="color: #ffffff; font-weight: 700;">#${orderId.slice(0, 8)}</span>`)}</p>
              </div>

              <!-- Info Card -->
              <div style="${css.card}">
                <table style="${css.table}">
                  <tr>
                    <td style="width: 50%; vertical-align: top;">
                        <div style="${css.th}">${t.billed_to}</div>
                        <div style="${css.td}">${email}</div>
                    </td>
                    <td style="width: 50%; vertical-align: top; text-align: right;">
                        <div style="${css.th} text-align: right;">${t.date}</div>
                        <div style="${css.td} text-align: right;">${date}</div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Items -->
              <div style="margin-bottom: 40px;">
                <h3 style="color: #ffffff; font-size: 18px; font-weight: 700; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #27272a;">${t.summary_title}</h3>
                ${itemListHtml}
                
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #27272a;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: #a1a1aa; font-size: 14px;">
                        <span>Subtotal</span>
                        <span>$${(total - (shippingCost || 0)).toLocaleString()}</span>
                    </div>
                     <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: #a1a1aa; font-size: 14px;">
                        <span>Envío</span>
                        <span>$${(shippingCost || 0).toLocaleString()}</span>
                    </div>
                </div>

                <div style="padding-top: 16px; border-top: 1px solid #27272a; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 16px; color: #ffffff; font-weight: 700;">${t.total}</span>
                  <span style="font-size: 24px; font-weight: 700; color: #7c3aed;">$${total.toLocaleString()}</span>
                </div>
              </div>

              <div style="text-align: center;">
                 <a href="https://thunderxis.store/my-orders" style="${css.button}">${t.track_btn}</a>
              </div>
              
              <p style="${css.p}; margin-top: 32px; font-size: 14px;">
                ${t.thanks}
              </p>
            </div>

            <div style="${css.footer}">
               <p style="color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} Foodies. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending order confirmation:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Exception sending order confirmation:', error);
    return { success: false, error };
  }
};

export const sendOrderStatusEmail = async (
  email: string,
  orderId: string,
  status: string,
  lang: SupportedLang = 'es',
  carrier?: string,
  trackingNumber?: string,
  name: string = 'Cliente',
  items: any[] = []
) => {
  if (status !== 'shipped') return { success: true, skipped: true };

  const t = emailTranslations[lang]?.shipped || emailTranslations['es'].shipped;
  const tOrder = emailTranslations[lang]?.order || emailTranslations['es'].order;

  try {
    const itemListHtml = items.map(item => `
      <div style="${css.itemRow}">
        <div style="flex: 1; padding-right: 16px;">
          <div style="${css.itemName}">${item.name}</div>
          <div style="${css.itemCues}">
             ${item.size ? `<span style="border: 1px solid #3f3f46; border-radius: 4px; padding: 2px 6px; font-size: 11px; margin-right: 8px;">${item.size}</span>` : ''}
             Qty: ${item.quantity}
          </div>
        </div>
        <div style="${css.itemPrice}">$${(item.price || item.price_at_time || 0).toLocaleString()}</div>
      </div>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: `Foodies <${FROM_EMAIL}>`,
      to: [email],
      subject: t.subject.replace('{id}', orderId.slice(0, 8)),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="${css.body}">
          <div style="${css.container}">
            
             <div style="${css.header}">
              <h1 style="${css.brand}">THUNDERXIS</h1>
            </div>

            <div style="${css.content}">
              <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="${css.h1}">${t.title}</h2>
                <div style="font-size: 50px; margin: 16px 0;">🚚</div>
                <p style="${css.p}">${t.p1.replace('{id}', `<span style="color: #ffffff; font-weight: 700;">#${orderId.slice(0, 8)}</span>`)}</p>
              </div>

              <!-- Shipping Card -->
              <div style="${css.card} border-color: #4c1d95; background: linear-gradient(180deg, rgba(76, 29, 149, 0.1) 0%, rgba(9, 9, 11, 0) 100%);">
                 <table style="${css.table}">
                    <tr>
                        <td style="padding-bottom: 16px;">
                            <div style="${css.th} color: #a78bfa;">${t.carrier.replace(': {carrier}', '')}</div>
                            <div style="color: #ffffff; font-size: 18px; font-weight: 700;">${carrier || 'N/A'}</div>
                        </td>
                    </tr>
                    ${trackingNumber ? `
                    <tr>
                        <td style="border-top: 1px solid #4c1d95; padding-top: 16px;">
                            <div style="${css.th} color: #a78bfa;">${t.tracking.replace(': {tracking}', '')}</div>
                            <div style="font-family: monospace; color: #ffffff; font-size: 20px; letter-spacing: 2px; background: #2e1065; display: inline-block; padding: 8px 12px; border-radius: 6px; border: 1px dashed #6d28d9;">${trackingNumber}</div>
                        </td>
                    </tr>
                    ` : ''}
                 </table>
              </div>

              <div style="margin-bottom: 40px;">
                <h3 style="color: #ffffff; font-size: 18px; font-weight: 700; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #27272a;">${tOrder.summary_title}</h3>
                ${itemListHtml}
              </div>
              
              <div style="text-align: center;">
                 <a href="https://thunderxis.store/my-orders" style="${css.button}">${t.track_btn}</a>
              </div>

              <p style="${css.p}; margin-top: 32px; font-size: 14px;">${t.p2}</p>
            </div>
            
            <div style="${css.footer}">
               <p style="color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} Foodies. All rights reserved.</p>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending status email:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Exception sending status email:', error);
    return { success: false, error };
  }
};
