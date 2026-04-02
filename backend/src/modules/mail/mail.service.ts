import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendInviteEmail(
    to: string,
    studentName: string,
    organizationName: string,
    token: string,
    gender?: string,
  ) {
    const inviteLink = `http://localhost:4200/register?token=${token}`;
    const isFemale = gender?.toLowerCase() === 'female';

    const colors = isFemale
      ? {
          primary: '#c084fc',
          button: '#a855f7',
          gold: '#e9c46a',
          dark1: '#1a0a2e',
          dark2: '#2d1458',
          dark3: '#3b1a6b',
        }
      : {
          primary: '#60a5fa',
          button: '#3b82f6',
          gold: '#e9c46a',
          dark1: '#0a1628',
          dark2: '#0f2347',
          dark3: '#1a3560',
        };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Poppins', Arial, sans-serif; background-color: #080e1a; margin: 0; padding: 0; }
            .wrapper { padding: 48px 20px; background-color: #080e1a; }
            .container { max-width: 600px; margin: 0 auto; background-color: ${colors.dark1}; border-radius: 24px; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.06); }
            .header { background: linear-gradient(160deg, ${colors.dark3} 0%, ${colors.dark2} 50%, ${colors.dark1} 100%); padding: 52px 44px 44px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.07); }
            .header-logo-wrap { width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(135deg, ${colors.primary}, ${colors.button}); border-radius: 18px; display: table; }
            .header-logo-inner { display: table-cell; vertical-align: middle; text-align: center; }
            .header-eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: ${colors.gold}; margin-bottom: 10px; }
            .header h1 { color: #ffffff; margin: 0 0 8px; font-size: 26px; font-weight: 700; }
            .header-sub { font-size: 12px; color: rgba(255,255,255,0.40); letter-spacing: 2px; text-transform: uppercase; }
            .gold-line { height: 1px; background: linear-gradient(90deg, transparent, ${colors.gold}, transparent); }
            .ribbon { background-color: rgba(255,255,255,0.03); padding: 12px 40px; text-align: center; font-size: 11px; color: rgba(255,255,255,0.35); letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .body { padding: 44px 44px 36px; }
            .greeting { font-size: 21px; font-weight: 700; color: #ffffff; margin-bottom: 14px; line-height: 1.35; }
            .greeting span { color: ${colors.primary}; }
            .body p { font-size: 14px; line-height: 1.9; color: rgba(255,255,255,0.50); margin: 0 0 20px; }
            .body p strong { color: rgba(255,255,255,0.85); font-weight: 600; }
            .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px 28px 16px; margin: 28px 0; }
            .card-title { font-size: 10px; font-weight: 600; color: ${colors.gold}; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 24px; }
            .step { display: table; width: 100%; margin-bottom: 18px; }
            .step-left { display: table-cell; width: 40px; vertical-align: top; padding-top: 2px; }
            .step-number { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, ${colors.primary}, ${colors.button}); color: #ffffff; font-size: 12px; font-weight: 700; display: table; text-align: center; }
            .step-number-inner { display: table-cell; vertical-align: middle; text-align: center; line-height: 1; }
            .step-right { display: table-cell; vertical-align: middle; padding-left: 4px; }
            .step-text { font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.6; }
            .button-container { text-align: center; margin: 36px 0 8px; }
            .button { background: linear-gradient(135deg, ${colors.primary}, ${colors.button}); color: #ffffff !important; padding: 16px 52px; text-decoration: none; border-radius: 50px; font-size: 14px; font-weight: 600; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 8px 32px rgba(0,0,0,0.40); }
            .expiry-row { text-align: center; margin-top: 14px; }
            .expiry-badge { display: inline-block; background: rgba(233,196,106,0.10); border: 1px solid rgba(233,196,106,0.30); color: ${colors.gold}; font-size: 11px; font-weight: 500; border-radius: 20px; padding: 5px 16px; }
            .divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 36px 0; }
            .small-link { font-size: 12px; color: rgba(255,255,255,0.25); word-break: break-all; line-height: 1.8; }
            .small-link a { color: ${colors.primary}; text-decoration: none; }
            .ignore-note { font-size: 12px; color: rgba(255,255,255,0.20); margin: 16px 0 0; line-height: 1.7; }
            .footer { background: rgba(0,0,0,0.30); border-top: 1px solid rgba(255,255,255,0.05); padding: 24px 40px; text-align: center; }
            .footer-brand { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.50); margin-bottom: 4px; letter-spacing: 0.5px; }
            .footer-sub { font-size: 11px; color: rgba(255,255,255,0.20); letter-spacing: 0.5px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <div class="header-logo-wrap">
                  <div class="header-logo-inner">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z" fill="#ffffff"/>
                    </svg>
                  </div>
                </div>
                <div class="header-eyebrow">Official Invitation</div>
                <h1>${organizationName}</h1>
                <div class="header-sub">Hostel Booking Portal</div>
              </div>
              <div class="gold-line"></div>
              <div class="ribbon">A personal invitation has been sent to you</div>
              <div class="body">
                <div class="greeting">Welcome, <span>${studentName}</span></div>
                <p><strong>${organizationName}</strong> has officially invited you to begin your hostel booking journey. We're here to help you find the perfect roommate match quickly and effortlessly.</p>
                <div class="card">
                  <div class="card-title">How it works</div>
                  <div class="step"><div class="step-left"><div class="step-number"><div class="step-number-inner">1</div></div></div><div class="step-right"><div class="step-text">Click the button below to set up your account</div></div></div>
                  <div class="step"><div class="step-left"><div class="step-number"><div class="step-number-inner">2</div></div></div><div class="step-right"><div class="step-text">Answer a few compatibility questions about your lifestyle</div></div></div>
                  <div class="step"><div class="step-left"><div class="step-number"><div class="step-number-inner">3</div></div></div><div class="step-right"><div class="step-text">Get matched with your ideal roommate</div></div></div>
                  <div class="step"><div class="step-left"><div class="step-number"><div class="step-number-inner">4</div></div></div><div class="step-right"><div class="step-text">Book your room and move in</div></div></div>
                </div>
                <div class="button-container">
                  <a href="${inviteLink}" class="button">Set Up My Account &nbsp;&rarr;</a>
                </div>
                <div class="expiry-row">
                  <span class="expiry-badge">This link expires in 7 days</span>
                </div>
                <hr class="divider" />
                <p class="small-link">Button not working? Copy and paste this link into your browser:<br /><a href="${inviteLink}">${inviteLink}</a></p>
                <p class="ignore-note">If you weren't expecting this invitation, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <div class="footer-brand">Roommate Compatibility System</div>
                <div class="footer-sub">${organizationName} &nbsp;&mdash;&nbsp; Hostel Booking Portal</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await this.resend.emails.send({
        from: 'Roommate System <onboarding@resend.dev>',
        to,
        subject: `${organizationName} — Your Hostel Booking Invitation`,
        html,
      });
      console.log(`Invite email sent to ${to}`);
    } catch (error) {
      console.error('Mail send error:', error);
      throw new InternalServerErrorException('Failed to send invite email');
    }
  }

  async sendAdminWelcomeEmail(
    to: string,
    adminName: string,
    organizationName: string,
    temporaryPassword: string,
  ) {
    const loginLink = `http://localhost:4200/login`;
    const supportEmail = `support@roommatesystem.com`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Poppins', Arial, sans-serif; background-color: #080e1a; margin: 0; padding: 0; }
            .wrapper { padding: 48px 20px; background-color: #080e1a; }
            .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 24px; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.06); }
            .header { background: linear-gradient(160deg, #1e3a5f 0%, #0f2347 50%, #0a1628 100%); padding: 52px 44px 44px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.07); }
            .header-logo-wrap { width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(135deg, #60a5fa, #3b82f6); border-radius: 18px; display: table; }
            .header-logo-inner { display: table-cell; vertical-align: middle; text-align: center; }
            .header-eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #e9c46a; margin-bottom: 10px; }
            .header h1 { color: #ffffff; margin: 0 0 8px; font-size: 26px; font-weight: 700; }
            .header-sub { font-size: 12px; color: rgba(255,255,255,0.40); letter-spacing: 2px; text-transform: uppercase; }
            .gold-line { height: 1px; background: linear-gradient(90deg, transparent, #e9c46a, transparent); }
            .body { padding: 44px 44px 36px; }
            .greeting { font-size: 21px; font-weight: 700; color: #ffffff; margin-bottom: 14px; line-height: 1.35; }
            .greeting span { color: #60a5fa; }
            .body p { font-size: 14px; line-height: 1.9; color: rgba(255,255,255,0.55); margin: 0 0 20px; }
            .body p strong { color: rgba(255,255,255,0.85); font-weight: 600; }
            .credentials-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); border-radius: 16px; padding: 24px 28px; margin: 24px 0; }
            .credentials-title { font-size: 10px; font-weight: 600; color: #e9c46a; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 20px; }
            .credential-row { display: table; width: 100%; margin-bottom: 16px; }
            .credential-label { display: table-cell; width: 120px; font-size: 12px; color: rgba(255,255,255,0.35); vertical-align: middle; }
            .credential-value { display: table-cell; font-size: 14px; font-weight: 600; color: #ffffff; vertical-align: middle; }
            .credential-value.password { font-family: monospace; font-size: 15px; background: rgba(255,255,255,0.06); padding: 6px 12px; border-radius: 8px; letter-spacing: 1px; }
            .warning-box { background: rgba(234,179,8,0.08); border: 1px solid rgba(234,179,8,0.25); border-radius: 12px; padding: 14px 18px; margin: 0 0 24px; }
            .warning-box p { font-size: 13px; color: rgba(234,179,8,0.90); margin: 0; line-height: 1.7; }
            .button-container { text-align: center; margin: 32px 0 8px; }
            .button { background: linear-gradient(135deg, #60a5fa, #3b82f6); color: #ffffff !important; padding: 16px 52px; text-decoration: none; border-radius: 50px; font-size: 14px; font-weight: 600; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 8px 32px rgba(0,0,0,0.40); }
            .divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 36px 0; }
            .support-note { font-size: 13px; color: rgba(255,255,255,0.35); line-height: 1.8; }
            .support-note a { color: #60a5fa; text-decoration: none; }
            .footer { background: rgba(0,0,0,0.30); border-top: 1px solid rgba(255,255,255,0.05); padding: 24px 40px; text-align: center; }
            .footer-brand { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.50); margin-bottom: 4px; letter-spacing: 0.5px; }
            .footer-sub { font-size: 11px; color: rgba(255,255,255,0.20); letter-spacing: 0.5px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">

              <!-- Header -->
              <div class="header">
                <div class="header-logo-wrap">
                  <div class="header-logo-inner">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z" fill="#ffffff"/>
                    </svg>
                  </div>
                </div>
                <div class="header-eyebrow">Admin Access Granted</div>
                <h1>${organizationName}</h1>
                <div class="header-sub">Roommate Compatibility System</div>
              </div>

              <div class="gold-line"></div>

              <!-- Body -->
              <div class="body">
                <div class="greeting">Welcome aboard, <span>${adminName}</span> 👋</div>

                <p>
                  You've been set up as the <strong>Organization Administrator</strong> for
                  <strong>${organizationName}</strong> on the Roommate Compatibility System.
                  We're really glad to have you here and we hope your experience managing
                  your hostel is smooth, straightforward, and stress-free.
                </p>

                <p>
                  Your admin panel gives you full control over students, rooms, compatibility
                  questions, switch requests, and complaints — everything you need to run a
                  well-organized hostel allocation process.
                </p>

                <!-- Credentials -->
                <div class="credentials-card">
                  <div class="credentials-title">Your Login Credentials</div>
                  <div class="credential-row">
                    <div class="credential-label">Email</div>
                    <div class="credential-value">${to}</div>
                  </div>
                  <div class="credential-row">
                    <div class="credential-label">Password</div>
                    <div class="credential-value password">${temporaryPassword}</div>
                  </div>
                </div>

                <!-- Warning -->
                <div class="warning-box">
                  <p>
                    ⚠️ &nbsp;This is a temporary password. Please log in and change it as soon as possible to keep your account secure.
                  </p>
                </div>

                <!-- CTA -->
                <div class="button-container">
                  <a href="${loginLink}" class="button">Go to Admin Panel &nbsp;&rarr;</a>
                </div>

                <hr class="divider" />

                <p class="support-note">
                  If you run into any issues, have questions, or need help getting started,
                  our support team is always happy to help. Reach us at
                  <a href="mailto:${supportEmail}">${supportEmail}</a> and we'll get back to you as soon as we can.
                  <br /><br />
                  We hope you have an easy and enjoyable time using the system. Welcome to the team! 🎉
                </p>
              </div>

              <!-- Footer -->
              <div class="footer">
                <div class="footer-brand">Roommate Compatibility System</div>
                <div class="footer-sub">${organizationName} &nbsp;&mdash;&nbsp; Admin Portal</div>
              </div>

            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await this.resend.emails.send({
        from: 'Roommate System <onboarding@resend.dev>',
        to,
        subject: `Welcome to ${organizationName} — Your Admin Account is Ready`,
        html,
      });
      console.log(`Admin welcome email sent to ${to}`);
    } catch (error) {
      console.error('Admin welcome email error:', error);
      // Don't throw — admin is already created, email failure shouldn't block the response
    }
  }
}
