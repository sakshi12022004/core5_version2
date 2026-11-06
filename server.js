/**
 * Core5 website mail service (Node.js + Nodemailer + Gmail SMTP).
 *
 * - Serves the static website.
 * - Handles the Contact form (POST /send) and emails the lead to enquiry@core5.co.in.
 *   (The Careers form uses FormSubmit separately and does not touch this server.)
 *
 * SETUP:
 *   1. Put your Gmail account + App Password in mail-config.json
 *      (copy mail-config.sample.json if it's missing). Never commit mail-config.json.
 *   2. npm install
 *   3. npm start      ->  open http://localhost:3000
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');

// Config comes from mail-config.json (local dev) and/or environment variables
// (production hosting). Env vars win, so you never upload the secret file.
const cfgPath = path.join(__dirname, 'mail-config.json');
let fileCfg = {};
if (fs.existsSync(cfgPath)) {
  try { fileCfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')); }
  catch (e) { console.error('Could not parse mail-config.json:', e.message); }
}

const cfg = {
  smtp_host: process.env.SMTP_HOST || fileCfg.smtp_host || 'smtp.gmail.com',
  smtp_port: parseInt(process.env.SMTP_PORT || fileCfg.smtp_port || 465, 10),
  smtp_secure: process.env.SMTP_SECURE !== undefined
    ? process.env.SMTP_SECURE === 'true'
    : (fileCfg.smtp_secure !== undefined ? fileCfg.smtp_secure : true),
  smtp_user: process.env.SMTP_USER || fileCfg.smtp_user,
  smtp_pass: process.env.SMTP_PASS || fileCfg.smtp_pass,
  from_name: process.env.FROM_NAME || fileCfg.from_name || 'Core5 Website',
  contact_to: process.env.CONTACT_TO || fileCfg.contact_to || process.env.SMTP_USER || fileCfg.smtp_user,
};

if (!cfg.smtp_user || !cfg.smtp_pass) {
  console.error('ERROR: SMTP credentials missing. Set SMTP_USER and SMTP_PASS as environment variables, or fill in mail-config.json.');
  process.exit(1);
}

const PORT = process.env.PORT || fileCfg.port || 3000;

const transporter = nodemailer.createTransport({
  host: cfg.smtp_host,
  port: cfg.smtp_port,
  secure: cfg.smtp_secure, // true for 465, false for 587
  auth: {
    user: cfg.smtp_user,
    pass: String(cfg.smtp_pass).replace(/\s+/g, ''), // app passwords are shown with spaces
  },
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Allow the form to post even if the site is served from another origin
app.use('/send', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function fieldRow(label, valueHtml) {
  return '<tr><td style="padding:0 34px 18px 34px;">'
    + '<div style="font:700 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:#a5761c;margin-bottom:5px;">' + esc(label) + '</div>'
    + '<div style="font:400 16px/1.5 Arial,Helvetica,sans-serif;color:#0a1f4d;">' + valueHtml + '</div>'
    + '</td></tr>';
}

function buildContactEmail(d) {
  var msgHtml = esc(d.message).replace(/\n/g, '<br>') || '&mdash;';
  var telHref = d.phone ? d.phone.replace(/[^0-9+]/g, '') : '';
  var html =
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
    + '<body style="margin:0;padding:0;background:#eef1f8;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f8;padding:26px 12px;font-family:Arial,Helvetica,sans-serif;">'
    + '<tr><td align="center">'
    + '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid #e3e6f0;border-radius:14px;overflow:hidden;">'
    // header
    + '<tr><td style="background:#0a1f4d;padding:26px 34px 22px 34px;">'
    + '<div style="font:700 20px/1 Arial,Helvetica,sans-serif;color:#ffffff;letter-spacing:.3px;">Core5 <span style="color:#f0b020;">Systems &amp; Services</span></div>'
    + '<div style="height:3px;width:46px;background:#f0b020;margin-top:14px;border-radius:2px;font-size:0;line-height:0;">&nbsp;</div>'
    + '</td></tr>'
    // title
    + '<tr><td style="padding:26px 34px 2px 34px;">'
    + '<div style="font:700 11px/1 Arial,Helvetica,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#a5761c;">New website enquiry</div>'
    + '<div style="font:700 23px/1.3 Arial,Helvetica,sans-serif;color:#0a1f4d;margin-top:7px;">You have a new lead</div>'
    + '<div style="font:400 14px/1.6 Arial,Helvetica,sans-serif;color:#5b6472;margin-top:6px;">Submitted through the contact form on core5.co.in.</div>'
    + '</td></tr>'
    + '<tr><td style="padding:22px 0 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>'
    + fieldRow('Full name', esc(d.name))
    + fieldRow('Email', '<a href="mailto:' + esc(d.email) + '" style="color:#0a1f4d;text-decoration:underline;">' + esc(d.email) + '</a>')
    + fieldRow('Phone', d.phone ? '<a href="tel:' + esc(telHref) + '" style="color:#0a1f4d;text-decoration:none;">' + esc(d.phone) + '</a>' : '&mdash;')
    + fieldRow('Service of interest', esc(d.service || '—'))
    // message
    + '<tr><td style="padding:0 34px 24px 34px;">'
    + '<div style="font:700 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:#a5761c;margin-bottom:8px;">Message</div>'
    + '<div style="font:400 15px/1.65 Arial,Helvetica,sans-serif;color:#1f2733;background:#f5f7fc;border-left:3px solid #f0b020;border-radius:6px;padding:14px 16px;">' + msgHtml + '</div>'
    + '</td></tr>'
    // reply button
    + '<tr><td style="padding:2px 34px 30px 34px;">'
    + '<a href="mailto:' + esc(d.email) + '" style="display:inline-block;background:#0a1f4d;color:#ffffff;font:700 14px/1 Arial,Helvetica,sans-serif;text-decoration:none;padding:14px 26px;border-radius:8px;">Reply to ' + esc(d.name) + ' &rarr;</a>'
    + '</td></tr>'
    // footer
    + '<tr><td style="background:#f7f8fc;border-top:1px solid #eceff5;padding:16px 34px;">'
    + '<div style="font:400 12px/1.6 Arial,Helvetica,sans-serif;color:#8a93a3;">Sent ' + esc(d.ts) + ' &middot; Core5 Systems &amp; Services &middot; core5.co.in</div>'
    + '</td></tr>'
    + '</table></td></tr></table></body></html>';

  var text =
    'NEW WEBSITE ENQUIRY — CORE5\n'
    + '============================================\n\n'
    + 'Full name:           ' + d.name + '\n'
    + 'Email:               ' + d.email + '\n'
    + 'Phone:               ' + (d.phone || '—') + '\n'
    + 'Service of interest: ' + (d.service || '—') + '\n\n'
    + 'Message:\n' + d.message + '\n\n'
    + '--------------------------------------------\n'
    + 'Sent ' + d.ts + ' from core5.co.in';

  return { html: html, text: text };
}

app.post('/send', async (req, res) => {
  const b = req.body || {};

  // Honeypot: real users never fill this hidden field
  if (b._honey) return res.json({ success: true });

  const name = (b['Full Name'] || '').trim();
  const email = (b.email || '').trim();
  const phone = (b.Phone || '').trim();
  const service = (b['Service of Interest'] || '').trim();
  const message = (b.Message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const mail = buildContactEmail({
    name: name,
    email: email,
    phone: phone,
    service: service,
    message: message,
    ts: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
  });

  try {
    await transporter.sendMail({
      from: '"' + (cfg.from_name || 'Core5 Website') + '" <' + cfg.smtp_user + '>',
      to: cfg.contact_to,
      replyTo: '"' + name + '" <' + email + '>',
      subject: 'New website enquiry — ' + name,
      text: mail.text,
      html: mail.html,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Mail error:', err && err.message);
    res.status(502).json({ success: false, message: 'Mail could not be sent.' });
  }
});

// Serve the static website (so the form is same-origin)
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log('Core5 site + mailer running on http://localhost:' + PORT);
});
