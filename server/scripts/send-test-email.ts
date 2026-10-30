/**
 * npm run email:test
 * Sends one test message through the configured SMTP settings, exactly as the contact form
 * would. Use it after setting up email locally (server/.env) or in the Render Shell.
 */
import { loadEnv } from '../src/config/env';
import { createMailer } from '../src/services/mailer';

const env = loadEnv();
if (!env.SMTP_HOST) {
  console.error(
    'SMTP_HOST is not set, so nothing would be sent. Configure SMTP first (see README).',
  );
  process.exit(1);
}

console.log(`Sending a test message via ${env.SMTP_HOST}:${env.SMTP_PORT}`);
console.log(`  from ${env.SMTP_FROM}`);
console.log(`  to   ${env.CONTACT_NOTIFY_TO}`);
try {
  await createMailer(env).sendContact({
    name: 'Website test',
    email: env.CONTACT_NOTIFY_TO,
    type: 'general',
    message: `This is a test of the contact form email, sent at ${new Date().toISOString()}.`,
  });
  console.log('✓ Sent. Check the inbox (and the junk folder the first time).');
} catch (err) {
  console.error('✗ Could not send:', (err as Error).message);
  process.exit(1);
}
