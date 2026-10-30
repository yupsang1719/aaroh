import nodemailer from 'nodemailer';
import { CONTACT_TYPE_LABELS, type ContactInput } from '@aaroh/shared';
import type { Env } from '../config/env';

export type ContactMessage = Omit<ContactInput, 'website'>;

export interface Mailer {
  /** Delivers a contact form message to the team inbox. Rejects if it could not be sent. */
  sendContact(message: ContactMessage): Promise<void>;
}

function format(message: ContactMessage) {
  const subjectType = CONTACT_TYPE_LABELS[message.type];
  return {
    subject: `[Aaroh website] ${subjectType} from ${message.name}`,
    text: [
      `Name: ${message.name}`,
      `Email: ${message.email}`,
      `Subject: ${subjectType}`,
      '',
      message.message,
      '',
      '—',
      'Sent from the contact form on the Aaroh website. Reply to this email to answer.',
    ].join('\n'),
  };
}

/**
 * Emails contact messages via SMTP. Messages are not stored anywhere else.
 * Without SMTP_HOST (development only; production requires it) they are printed to the terminal.
 */
export function createMailer(env: Env): Mailer {
  if (!env.SMTP_HOST) {
    return {
      async sendContact(message) {
        const { subject, text } = format(message);
        console.log(`[contact] SMTP not configured; message not emailed.\n${subject}\n${text}\n`);
      },
    };
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    requireTLS: env.SMTP_PORT !== 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  return {
    async sendContact(message) {
      await transport.sendMail({
        from: env.SMTP_FROM,
        to: env.CONTACT_NOTIFY_TO,
        replyTo: { name: message.name, address: message.email },
        ...format(message),
      });
    },
  };
}
