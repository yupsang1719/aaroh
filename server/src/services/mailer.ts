import nodemailer from 'nodemailer';
import { CONTACT_TYPE_LABELS } from '@aaroh/shared';
import type { Env } from '../config/env';
import type { ContactRecord } from './contactStore';

export interface Mailer {
  notifyContact(message: ContactRecord): Promise<void>;
}

const noopMailer: Mailer = { async notifyContact() {} };

/** Sends a notification per contact message, or does nothing when SMTP_HOST is not set. */
export function createMailer(env: Env): Mailer {
  if (!env.SMTP_HOST) return noopMailer;

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  return {
    async notifyContact(message) {
      await transport.sendMail({
        from: env.SMTP_FROM,
        to: env.CONTACT_NOTIFY_TO,
        replyTo: { name: message.name, address: message.email },
        subject: `[Aaroh website] ${CONTACT_TYPE_LABELS[message.type]} from ${message.name}`,
        text: [
          `Name: ${message.name}`,
          `Email: ${message.email}`,
          `Subject: ${CONTACT_TYPE_LABELS[message.type]}`,
          '',
          message.message,
        ].join('\n'),
      });
    },
  };
}
