// Transactional email via Gmail SMTP (app password). Sends invite & reset links.
import nodemailer from 'nodemailer';

function transport() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

export async function sendMail(to, subject, html) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email is not configured (SMTP_USER / SMTP_PASS missing).');
  }
  const from = process.env.SMTP_FROM || `LUME Skin <${process.env.SMTP_USER}>`;
  await transport().sendMail({ from, to, subject, html });
}

/* ---------- Email templates ---------- */
const wrap = (title, body) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;background:#fbf7f0;border:1px solid #ece2d2;border-radius:16px;overflow:hidden">
    <div style="background:#8a6f50;color:#fff;padding:22px 28px;font-size:20px;letter-spacing:1px">LUM&Eacute; <span style="opacity:.7;font-size:12px;letter-spacing:3px">SKIN</span></div>
    <div style="padding:28px">
      <h2 style="margin:0 0 12px;color:#3a3229;font-weight:600">${title}</h2>
      ${body}
      <p style="color:#9a8a76;font-size:12px;margin-top:26px">If you weren't expecting this email, you can safely ignore it.</p>
    </div>
  </div>`;

const button = (href, label) =>
  `<a href="${href}" style="display:inline-block;background:#8a6f50;color:#fff;text-decoration:none;padding:13px 26px;border-radius:100px;font-weight:600;margin:8px 0">${label}</a>`;

export function inviteHtml(link, invitedBy) {
  return wrap(
    'You&rsquo;ve been invited to the admin',
    `<p style="color:#6a5e50">${invitedBy ? invitedBy + ' has invited' : 'You have been invited'} you to manage the LUM&Eacute; Skin clinic dashboard.</p>
     <p style="color:#6a5e50">Click below to set your password and activate your account. This link expires in 48 hours.</p>
     <p>${button(link, 'Set my password')}</p>
     <p style="color:#9a8a76;font-size:12px;word-break:break-all">Or paste this link: ${link}</p>`
  );
}

export function resetHtml(link) {
  return wrap(
    'Reset your password',
    `<p style="color:#6a5e50">A password reset was requested for your LUM&Eacute; Skin admin account.</p>
     <p style="color:#6a5e50">Click below to choose a new password. This link expires in 2 hours.</p>
     <p>${button(link, 'Reset password')}</p>
     <p style="color:#9a8a76;font-size:12px;word-break:break-all">Or paste this link: ${link}</p>`
  );
}
