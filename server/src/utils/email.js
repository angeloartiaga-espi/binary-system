import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

async function sendVerificationEmail(to, firstName, verifyUrl) {
    if (!resend) {
        console.log(
            `[email skipped - no RESEND_API_KEY set] Would send welcome email to ${to}`
        );
        return;
    }

    await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to,
        subject: 'Confirm your ESPI Portal account',
        html: `<p>Hi ${firstName},</p>
           <p>Please confirm your account by clicking the link below:</p>
           <p><a href="${verifyUrl}">${verifyUrl}</a></p>
           <p>This link expires in 24 hours.</p>`,
    });
}

export {  sendVerificationEmail };