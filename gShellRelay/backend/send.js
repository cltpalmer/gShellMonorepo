// send.js
import { supabase } from './supabaseClient.js';    // ⬅️ new
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// 🔽 ↓ NEW helper
async function fetchTemplateFromStorage(name) {
  const { data, error } = await supabase
    .storage
    .from('email-templates')                // bucket name
    .download(`templates/${name}.hbs`);

  if (error) throw error;                   // surfaces as 500
  const buffer = await data.arrayBuffer();
  return Buffer.from(buffer).toString('utf-8');
}

export default async function sendEmail(templateName, to, variables) {
  /* 1. get template */
  const raw = await fetchTemplateFromStorage(templateName);

  /* 2. pull & strip subject */
  const subjectMatch = raw.match(/{{!--\s*subject:\s*([\s\S]*?)\s*--}}/i);
  const subject      = subjectMatch?.[1]?.trim() || '📧 Notification';
  const source       = raw.replace(/{{!--[\s\S]*?--}}/, '').trim();

  /* 3. compile */
  const html = handlebars.compile(source)({
    ...variables,
  });
  
  /* 4. send */
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  const info = await transporter.sendMail({
    from: `"Creative League" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
  console.log('✅ Email sent:', info.messageId);
}
