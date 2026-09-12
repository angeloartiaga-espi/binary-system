import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

async function sendWelcomeEmail(to, firstName) {
    if (!resend) {
        console.log(
            `[email skipped - no RESEND_API_KEY set] Would send welcome email to ${to}`
        );
        return;
    }

    await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to,
        subject: 'Welcome to Estate Site Properties Inc.',
        html: `
      <p>Hi ${firstName},</p>
      <p>
        Thanks for creating your ESPI account.
        You're starting out with <strong>Bronze</strong> membership status.
      </p>
    `,
    });
}

export { sendWelcomeEmail };