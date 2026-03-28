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
          primary: '#9b59b6',
          secondary: '#d7bde2',
          accent: '#f9ebff',
          button: '#8e44ad',
        }
      : {
          primary: '#2980b9',
          secondary: '#aed6f1',
          accent: '#ebf5fb',
          button: '#1a6fa0',
        };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

            body {
              font-family: 'Poppins', Arial, sans-serif;
              background-color: ${colors.accent};
              margin: 0;
              padding: 0;
            }
            .wrapper {
              padding: 40px 20px;
            }
            .container {
              max-width: 580px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 8px 30px rgba(0,0,0,0.12);
            }
            .header {
              background: linear-gradient(135deg, ${colors.primary}, ${colors.button});
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 26px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .header p {
              color: ${colors.secondary};
              margin: 6px 0 0;
              font-size: 14px;
            }
            .body {
              padding: 40px 36px;
              color: #444444;
            }
            .greeting {
              font-size: 20px;
              font-weight: 600;
              color: ${colors.primary};
              margin-bottom: 16px;
            }
            .body p {
              font-size: 15px;
              line-height: 1.8;
              color: #555555;
              margin: 0 0 20px;
            }
            .card {
              background-color: ${colors.accent};
              border-left: 4px solid ${colors.primary};
              border-radius: 10px;
              padding: 16px 20px;
              margin: 24px 0;
              font-size: 14px;
              color: #555;
            }
            .card strong {
              color: ${colors.primary};
            }
            .icon {
              width: 20px;
              height: 20px;
              vertical-align: middle;
              margin-right: 10px;
            }
            .button-container {
              text-align: center;
              margin: 32px 0 20px;
            }
            .button {
              background: linear-gradient(135deg, ${colors.primary}, ${colors.button});
              color: #ffffff !important;
              padding: 16px 40px;
              text-decoration: none;
              border-radius: 50px;
              font-size: 16px;
              font-weight: 600;
              display: inline-block;
              letter-spacing: 0.5px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            .note {
              font-size: 12px;
              color: #aaaaaa;
              text-align: center;
              margin-top: 8px;
            }
            .divider {
              border: none;
              border-top: 1px solid #f0f0f0;
              margin: 28px 0;
            }
            .small-link {
              font-size: 12px;
              color: #aaaaaa;
              word-break: break-all;
            }
            .small-link a {
              color: ${colors.primary};
            }
            .footer {
              background: linear-gradient(135deg, ${colors.primary}, ${colors.button});
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: rgba(255,255,255,0.75);
            }
            .footer strong {
              color: #ffffff;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>${organizationName}</h1>
                <p>Hostel Booking Portal</p>
              </div>
              <div class="body">
                <div class="greeting">Hey ${studentName}! 
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-left: 4px;">
                    <path d="M15 19C15 19 16.5 19 18 19C19.5 19 21 19 21 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M7 8C7 5.79086 8.79086 4 11 4C13.2091 4 15 5.79086 15 8C15 10.2091 13.2091 12 11 12C8.79086 12 7 10.2091 7 8Z" fill="currentColor"/>
                    <path d="M3 21C3 17.134 6.13401 14 10 14C10.5523 14 11 14.4477 11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M19 14C19 14 20 14 21 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <p>
                  You've been officially invited by <strong>${organizationName}</strong>
                  to begin your hostel booking process. We're excited to help you find
                  your perfect roommate match!
                </p>
                <div class="card">
                  <strong>What happens next?</strong><br /><br />
                  
                  <img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" 
                       alt="Set up account" class="icon">
                  Click the button below to set up your account<br /><br />
                  
                  <img src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png" 
                       alt="Answer questions" class="icon">
                  Answer a few compatibility questions<br /><br />
                  
                  <img src="https://cdn-icons-png.flaticon.com/512/1077/1077072.png" 
                       alt="Get matched" class="icon">
                  Get matched with your ideal roommate<br /><br />
                  
                  <img src="https://cdn-icons-png.flaticon.com/512/1077/1077066.png" 
                       alt="Book room" class="icon">
                  Book your room!
                </div>
                <div class="button-container">
                  <a href="${inviteLink}" class="button">Set Up My Account</a>
                </div>
                <p class="note">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  </svg>
                  This link expires in <strong>7 days</strong>
                </p>
                <hr class="divider" />
                <p class="small-link">
                  Button not working? Copy and paste this link into your browser:<br />
                  <a href="${inviteLink}">${inviteLink}</a>
                </p>
                <p style="font-size:13px; color:#aaa;">
                  If you weren't expecting this email, you can safely ignore it.
                </p>
              </div>
              <div class="footer">
                Powered by <strong>Roommate Compatibility System</strong><br />
                ${organizationName} &mdash; Hostel Booking Portal
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
