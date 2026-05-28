import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error("Missing SMTP env vars (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS)");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const backendUrl =
    process.env.BACKEND_URL ||
    (process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://localhost:3000");

  const verifyLink = `${backendUrl}/api/v1/auth/verify-email?token=${token}`;
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    to,
    subject: "Verify your email",
    text: `Verify your email using this link: ${verifyLink}`,
  });

  return { verifyLink };
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const transporter = getTransporter();

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your password",
    text: `Reset your password using this link: ${resetLink}`,
  });

  return { resetLink };
};
