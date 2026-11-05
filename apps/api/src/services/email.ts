import nodemailer from "nodemailer";
import { env } from "../config/env.js";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let transporter: any = null;

/**
 * GROWTH-04 / P0-4a: expuesto para que el diagnóstico verifique el MISMO
 * transporte que envía los leads, en lugar de abrir una conexión distinta.
 * No expone credenciales: el objeto transport sólo se usa con verify()/sendMail().
 */
export function getTransporter(): any {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  await getTransporter().sendMail({
    from: env.SMTP_FROM,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}
