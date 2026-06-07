// src/lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FROM = process.env.SMTP_FROM || 'CryptoVault <noreply@cryptovault.com>';

const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d0f12; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1d24; border-radius: 16px; overflow: hidden; border: 1px solid rgba(234,179,8,0.2); }
    .header { background: linear-gradient(135deg, #1a1d24 0%, #0d1520 100%); padding: 32px; text-align: center; border-bottom: 1px solid rgba(234,179,8,0.2); }
    .logo { font-size: 28px; font-weight: 800; color: #eab308; letter-spacing: -0.5px; }
    .logo span { color: #fff; }
    .body { padding: 40px 32px; color: #d1d5db; line-height: 1.7; }
    .body h2 { color: #fff; font-size: 22px; margin: 0 0 16px; }
    .body p { margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #eab308, #ca8a04); color: #000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; margin: 8px 0; }
    .alert { background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); border-radius: 8px; padding: 16px; margin: 16px 0; }
    .footer { background: #111318; padding: 24px 32px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #1f2937; }
    .risk-notice { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 12px 16px; margin-top: 24px; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Crypto<span>Vault</span></div>
    </div>
    <div class="body">
      ${content}
      <div class="risk-notice">
        ⚠️ <strong>Risk Notice:</strong> Cryptocurrency investments involve significant risk. Returns are not guaranteed. Please conduct your own research before investing.
      </div>
    </div>
    <div class="footer">
      <p>© 2024 CryptoVault. All rights reserved.</p>
      <p>This email was sent to you because you have an account at CryptoVault.</p>
    </div>
  </div>
</body>
</html>
`;

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Verify Your CryptoVault Account',
    html: emailTemplate(`
      <h2>Welcome to CryptoVault, ${name}!</h2>
      <p>Thank you for registering. Please verify your email address to activate your account and start investing.</p>
      <div style="text-align:center; margin: 32px 0;">
        <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      </div>
      <p>This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
    `),
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Reset Your CryptoVault Password',
    html: emailTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <div style="text-align:center; margin: 32px 0;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      <p>This link expires in 1 hour. If you didn't request a reset, please ignore this email and your password will remain unchanged.</p>
    `),
  });
}

export async function sendDepositApprovedEmail(email: string, name: string, amount: number, coin: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Deposit Approved — CryptoVault',
    html: emailTemplate(`
      <h2>Deposit Approved ✅</h2>
      <p>Hi ${name}, your deposit has been approved and your account balance has been updated.</p>
      <div class="alert">
        <strong>Amount:</strong> $${amount.toFixed(2)} (${coin})<br>
        <strong>Status:</strong> Approved
      </div>
      <div style="text-align:center; margin: 32px 0;">
        <a href="${APP_URL}/dashboard" class="btn">View Dashboard</a>
      </div>
    `),
  });
}

export async function sendDepositRejectedEmail(email: string, name: string, amount: number, reason?: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Deposit Rejected — CryptoVault',
    html: emailTemplate(`
      <h2>Deposit Rejected ❌</h2>
      <p>Hi ${name}, unfortunately your deposit request has been rejected.</p>
      <div class="alert">
        <strong>Amount:</strong> $${amount.toFixed(2)}<br>
        <strong>Reason:</strong> ${reason || 'Please contact support for more information.'}
      </div>
      <div style="text-align:center; margin: 32px 0;">
        <a href="${APP_URL}/deposit" class="btn">Try Again</a>
      </div>
    `),
  });
}

export async function sendWithdrawalApprovedEmail(email: string, name: string, amount: number, coin: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Withdrawal Approved — CryptoVault',
    html: emailTemplate(`
      <h2>Withdrawal Approved ✅</h2>
      <p>Hi ${name}, your withdrawal request has been approved and is being processed.</p>
      <div class="alert">
        <strong>Amount:</strong> $${amount.toFixed(2)} (${coin})<br>
        <strong>Status:</strong> Processing
      </div>
      <p>Your funds will arrive at your wallet within 1-24 hours depending on network congestion.</p>
    `),
  });
}

export async function sendWithdrawalRejectedEmail(email: string, name: string, amount: number, reason?: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Withdrawal Rejected — CryptoVault',
    html: emailTemplate(`
      <h2>Withdrawal Rejected ❌</h2>
      <p>Hi ${name}, your withdrawal request has been rejected and the amount has been returned to your balance.</p>
      <div class="alert">
        <strong>Amount:</strong> $${amount.toFixed(2)}<br>
        <strong>Reason:</strong> ${reason || 'Please contact support for more information.'}
      </div>
    `),
  });
}
