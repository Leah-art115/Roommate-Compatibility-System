/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

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

            body {
              font-family: 'Poppins', Arial, sans-serif;
              background-color: #080e1a;
              margin: 0;
              padding: 0;
            }
            .wrapper {
              padding: 48px 20px;
              background-color: #080e1a;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: ${colors.dark1};
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 32px 80px rgba(0,0,0,0.6);
              border: 1px solid rgba(255,255,255,0.06);
            }

            /* ── Header ── */
            .header {
              background: linear-gradient(160deg, ${colors.dark3} 0%, ${colors.dark2} 50%, ${colors.dark1} 100%);
              padding: 52px 44px 44px;
              text-align: center;
              border-bottom: 1px solid rgba(255,255,255,0.07);
              position: relative;
            }
            .header-logo-wrap {
              width: 64px;
              height: 64px;
              margin: 0 auto 20px;
              background: linear-gradient(135deg, ${colors.primary}, ${colors.button});
              border-radius: 18px;
              display: table;
            }
            .header-logo-inner {
              display: table-cell;
              vertical-align: middle;
              text-align: center;
            }
            .header-eyebrow {
              font-size: 10px;
              font-weight: 600;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: ${colors.gold};
              margin-bottom: 10px;
            }
            .header h1 {
              color: #ffffff;
              margin: 0 0 8px;
              font-size: 26px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .header-sub {
              font-size: 12px;
              color: rgba(255,255,255,0.40);
              letter-spacing: 2px;
              text-transform: uppercase;
            }

            /* ── Gold divider line ── */
            .gold-line {
              height: 1px;
              background: linear-gradient(90deg, transparent, ${colors.gold}, transparent);
              margin: 0;
            }

            /* ── Ribbon ── */
            .ribbon {
              background-color: rgba(255,255,255,0.03);
              padding: 12px 40px;
              text-align: center;
              font-size: 11px;
              color: rgba(255,255,255,0.35);
              letter-spacing: 1px;
              text-transform: uppercase;
              border-bottom: 1px solid rgba(255,255,255,0.05);
            }

            /* ── Body ── */
            .body {
              padding: 44px 44px 36px;
            }
            .greeting {
              font-size: 21px;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 14px;
              line-height: 1.35;
            }
            .greeting span {
              color: ${colors.primary};
            }
            .greeting-icon {
              display: inline-block;
              vertical-align: middle;
              margin-left: 8px;
              position: relative;
              top: -2px;
            }
            .body p {
              font-size: 14px;
              line-height: 1.9;
              color: rgba(255,255,255,0.50);
              margin: 0 0 20px;
            }
            .body p strong {
              color: rgba(255,255,255,0.85);
              font-weight: 600;
            }

            /* ── Steps Card ── */
            .card {
              background: rgba(255,255,255,0.04);
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 16px;
              padding: 28px 28px 16px;
              margin: 28px 0;
            }
            .card-title {
              font-size: 10px;
              font-weight: 600;
              color: ${colors.gold};
              text-transform: uppercase;
              letter-spacing: 2.5px;
              margin-bottom: 24px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .card-title-line {
              flex: 1;
              height: 1px;
              background: rgba(255,255,255,0.08);
            }
            .step {
              display: table;
              width: 100%;
              margin-bottom: 18px;
            }
            .step-left {
              display: table-cell;
              width: 40px;
              vertical-align: top;
              padding-top: 2px;
            }
            .step-number {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: linear-gradient(135deg, ${colors.primary}, ${colors.button});
              color: #ffffff;
              font-size: 12px;
              font-weight: 700;
              display: table;
              text-align: center;
            }
            .step-number-inner {
              display: table-cell;
              vertical-align: middle;
              text-align: center;
              line-height: 1;
            }
            .step-right {
              display: table-cell;
              vertical-align: middle;
              padding-left: 4px;
            }
            .step-text {
              font-size: 14px;
              color: rgba(255,255,255,0.65);
              line-height: 1.6;
            }

            /* ── Button ── */
            .button-container {
              text-align: center;
              margin: 36px 0 8px;
            }
            .button {
              background: linear-gradient(135deg, ${colors.primary}, ${colors.button});
              color: #ffffff !important;
              padding: 16px 52px;
              text-decoration: none;
              border-radius: 50px;
              font-size: 14px;
              font-weight: 600;
              display: inline-block;
              letter-spacing: 0.5px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.40);
            }

            /* ── Expiry ── */
            .expiry-row {
              text-align: center;
              margin-top: 14px;
            }
            .expiry-badge {
              display: inline-block;
              background: rgba(233,196,106,0.10);
              border: 1px solid rgba(233,196,106,0.30);
              color: ${colors.gold};
              font-size: 11px;
              font-weight: 500;
              border-radius: 20px;
              padding: 5px 16px;
            }

            /* ── Divider ── */
            .divider {
              border: none;
              border-top: 1px solid rgba(255,255,255,0.06);
              margin: 36px 0;
            }

            /* ── Footer links ── */
            .small-link {
              font-size: 12px;
              color: rgba(255,255,255,0.25);
              word-break: break-all;
              line-height: 1.8;
            }
            .small-link a {
              color: ${colors.primary};
              text-decoration: none;
            }
            .ignore-note {
              font-size: 12px;
              color: rgba(255,255,255,0.20);
              margin: 16px 0 0;
              line-height: 1.7;
            }

            /* ── Footer ── */
            .footer {
              background: rgba(0,0,0,0.30);
              border-top: 1px solid rgba(255,255,255,0.05);
              padding: 24px 40px;
              text-align: center;
            }
            .footer-brand {
              font-size: 12px;
              font-weight: 600;
              color: rgba(255,255,255,0.50);
              margin-bottom: 4px;
              letter-spacing: 0.5px;
            }
            .footer-sub {
              font-size: 11px;
              color: rgba(255,255,255,0.20);
              letter-spacing: 0.5px;
            }
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
                <div class="header-eyebrow">Official Invitation</div>
                <h1>${organizationName}</h1>
                <div class="header-sub">Hostel Booking Portal</div>
              </div>

              <!-- Gold line -->
              <div class="gold-line"></div>

              <!-- Ribbon -->
              <div class="ribbon">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle; margin-right:7px;">
                  <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 13L4 6H20ZM20 18H4V8L12 15L20 8V18Z" fill="rgba(255,255,255,0.35)"/>
                </svg>
                A personal invitation has been sent to you
              </div>

              <!-- Body -->
              <div class="body">
                <div class="greeting">
                  Welcome, <span>${studentName}</span>
                  <span class="greeting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="4" fill="${colors.primary}"/>
                      <path d="M4 20C4 16.134 7.58172 13 12 13C16.4183 13 20 16.134 20 20" stroke="${colors.primary}" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </span>
                </div>
                <p>
                  <strong>${organizationName}</strong> has officially invited you to begin
                  your hostel booking journey. We're here to help you find the perfect
                  roommate match quickly and effortlessly.
                </p>

                <!-- Steps -->
                <div class="card">
                  <div class="card-title">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 5.55228 9.44772 6 10 6H14C14.5523 6 15 5.55228 15 5M9 5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5" stroke="${colors.gold}" stroke-width="2" stroke-linecap="round"/>
                      <path d="M9 12H15M9 16H12" stroke="${colors.gold}" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    &nbsp;How it works
                    <div class="card-title-line"></div>
                  </div>

                  <div class="step">
                    <div class="step-left">
                      <div class="step-number"><div class="step-number-inner">1</div></div>
                    </div>
                    <div class="step-right">
                      <div class="step-text">Click the button below to set up your account</div>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-left">
                      <div class="step-number"><div class="step-number-inner">2</div></div>
                    </div>
                    <div class="step-right">
                      <div class="step-text">Answer a few compatibility questions about your lifestyle</div>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-left">
                      <div class="step-number"><div class="step-number-inner">3</div></div>
                    </div>
                    <div class="step-right">
                      <div class="step-text">Get matched with your ideal roommate</div>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-left">
                      <div class="step-number"><div class="step-number-inner">4</div></div>
                    </div>
                    <div class="step-right">
                      <div class="step-text">Book your room and move in</div>
                    </div>
                  </div>
                </div>

                <!-- CTA -->
                <div class="button-container">
                  <a href="${inviteLink}" class="button">Set Up My Account &nbsp;&rarr;</a>
                </div>
                <div class="expiry-row">
                  <span class="expiry-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle; margin-right:5px;">
                      <circle cx="12" cy="12" r="9" stroke="${colors.gold}" stroke-width="2"/>
                      <path d="M12 7V12L15 15" stroke="${colors.gold}" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    This link expires in 7 days
                  </span>
                </div>

                <hr class="divider" />

                <p class="small-link">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle; margin-right:5px;">
                    <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59699 21.9548 8.33397 21.9434 7.02299C21.932 5.71201 21.4061 4.45799 20.4791 3.53098C19.5521 2.60398 18.298 2.07819 16.9871 2.06679C15.6761 2.0554 14.413 2.55938 13.47 3.46997L11.75 5.17997" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60706C11.7643 9.26329 11.0685 9.05888 10.3533 9.00766C9.63816 8.95644 8.92037 9.05966 8.24864 9.31023C7.5769 9.5608 6.96689 9.95297 6.46 10.46L3.46 13.46C2.54921 14.403 2.04524 15.666 2.05663 16.977C2.06802 18.288 2.59382 19.542 3.52083 20.469C4.44783 21.396 5.70199 21.9218 7.01297 21.9332C8.32395 21.9446 9.58697 21.4406 10.53 20.53L12.24 18.82" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Button not working? Copy and paste this link into your browser:<br />
                  <a href="${inviteLink}">${inviteLink}</a>
                </p>
                <p class="ignore-note">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle; margin-right:5px;">
                    <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.20)" stroke-width="2"/>
                    <path d="M12 8V12" stroke="rgba(255,255,255,0.20)" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="rgba(255,255,255,0.20)"/>
                  </svg>
                  If you weren't expecting this invitation, you can safely ignore this email.
                </p>
              </div>

              <!-- Footer -->
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
      await this.transporter.sendMail({
        from: `${organizationName} <${process.env.MAIL_USER}>`,
        to,
        subject: `${organizationName} — Your Hostel Booking Invitation`,
        html,
      });
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Mail send error:', error);
      throw new InternalServerErrorException('Failed to send invite email');
    }
  }
}
