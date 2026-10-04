import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const getTransporter = () => {
  const host = env.EMAIL_HOST;
  const port = env.EMAIL_PORT ? Number(env.EMAIL_PORT) : undefined;
  const user = env.EMAIL_USER;
  const pass = env.EMAIL_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error(
      'Missing email config. Provide RESEND_API_KEY or SMTP vars (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS)',
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const sendMailPayload = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const from = env.EMAIL_FROM || env.EMAIL_USER || 'no-reply@docintel.ai';

  if (resend) {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    if (error) {
      throw new Error(`Resend email delivery failed: ${error.message}`);
    }
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
};

// Send email verification link
export const sendVerificationEmail = async (to: string, token: string) => {
  const backendUrl =
    env.BACKEND_URL ||
    (env.PORT ? `http://localhost:${env.PORT}` : 'http://localhost:8080');

  const verifyLink = `${backendUrl.replace(/\/$/, '')}/api/v1/auth/verify-email?token=${token}`;

  await sendMailPayload({
    to,
    subject: 'Verify your email',
    html: verifyEmailTemplate(verifyLink),
  });

  return { verifyLink };
};

// send password reset email
export const sendPasswordResetEmail = async (to: string, token: string) => {
  const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;

  await sendMailPayload({
    to,
    subject: 'Reset your password',
    html: resetPasswordTemplate(resetLink),
  });

  return { resetLink };
};

const verifyEmailTemplate = (verifyLink: string) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2aaad5;">Verify your email</h2>
      
      <p>Welcome! You're almost ready to start using the platform.</p>
      
      <p>Please confirm your email address by clicking the button below:</p>
      
      <a href="${verifyLink}" 
         style="
           display: inline-block;
           padding: 12px 20px;
           margin: 16px 0;
           background-color: #2aaad5;
           color: #ffffff;
           text-decoration: none;
           border-radius: 6px;
           font-weight: bold;
         ">
         Verify Email
      </a>

      <p>If the button doesn't work, you can also use this link:</p>
      <p><a href="${verifyLink}">verify</a></p>

      <hr style="margin: 24px 0;" />

      <p style="font-size: 12px; color: #777;">
        If you didn’t create an account, you can safely ignore this email.
      </p>
    </div>
  `;

const resetPasswordTemplate = (resetLink: string) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      
      <h2 style="color: #e53935;">Reset your password</h2>
      
      <p>We received a request to reset your password.</p>
      
      <p>If you made this request, click the button below to set a new password:</p>

      <a href="${resetLink}"
        style="
          display: inline-block;
          padding: 12px 20px;
          margin: 16px 0;
          background-color: #e53935;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        ">
        Reset Password
      </a>

      <p>If the button doesn’t work, you can also use this link:</p>
      <p><a href="${resetLink}">Reset your password</a></p>

      <hr style="margin: 24px 0;" />

      <p style="font-size: 12px; color: #777;">
        If you didn’t request this, you can safely ignore this email. Your password will remain unchanged.
      </p>

      <p style="font-size: 12px; color: #777;">
        For security, this link will expire after a limited time.
      </p>
    </div>
  `;
