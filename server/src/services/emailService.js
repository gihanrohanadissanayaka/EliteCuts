const nodemailer = require('nodemailer');

const SALON_NAME = 'Salon DECO';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function getFromAddress() {
  return `${SALON_NAME} <${process.env.GMAIL_USER}>`;
}

async function send(payload) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[Email] Skipped — GMAIL_USER or GMAIL_APP_PASSWORD not set');
    return;
  }
  const info = await getTransporter().sendMail(payload);
  console.log('[Email] Sent:', info.messageId, '→', payload.to);
}

/**
 * Notify admin when a new appointment is created.
 */
async function sendNewAppointmentAlert(appointment) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !process.env.GMAIL_USER) return;

  const dateStr = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  await send({
    from:    getFromAddress(),
    to:      adminEmail,
    subject: `New Appointment — ${appointment.guestName} on ${dateStr}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#111;color:#e5e5e5;border-radius:12px;overflow:hidden;">
        <div style="background:#b8860b;padding:24px 32px;">
          <h1 style="margin:0;font-size:22px;color:#fff;">✂ ${SALON_NAME}</h1>
            <p style="margin:8px 0 0;color:#fff9e6;font-size:14px;">New appointment booking — please review</p>
        </div>
        <div style="padding:32px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#999;width:130px;">Client</td>      <td style="padding:8px 0;color:#fff;font-weight:600;">${appointment.guestName}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Mobile</td>       <td style="padding:8px 0;color:#fff;">${appointment.guestPhone}</td></tr>
            ${appointment.guestEmail ? `<tr><td style="padding:8px 0;color:#999;">Email</td><td style="padding:8px 0;color:#fff;">${appointment.guestEmail}</td></tr>` : ''}
            <tr><td style="padding:8px 0;color:#999;">Package</td>      <td style="padding:8px 0;color:#fff;">${appointment.packageName}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Date</td>         <td style="padding:8px 0;color:#fff;">${dateStr}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Time</td>         <td style="padding:8px 0;color:#fff;">${appointment.timeSlot}</td></tr>
            ${appointment.notes ? `<tr><td style="padding:8px 0;color:#999;">Notes</td><td style="padding:8px 0;color:#ccc;">${appointment.notes}</td></tr>` : ''}
          </table>
          <div style="margin-top:24px;padding:16px;background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;">
            <p style="margin:0;font-size:13px;color:#999;">Status: <span style="color:#b8860b;font-weight:600;">Pending</span> — log in to the admin panel to approve.</p>
          </div>
        </div>
        <div style="padding:16px 32px;background:#0a0a0a;font-size:12px;color:#555;text-align:center;">
          ${SALON_NAME} &mdash; Appointment Management System
        </div>
      </div>
    `,
  });
}

/**
 * Send booking confirmation to the guest/customer when appointment is confirmed.
 */
async function sendBookingConfirmation(appointment) {
  const email = appointment.guestEmail;
  if (!email || !process.env.GMAIL_USER) return;

  const dateStr = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  await send({
    from:    getFromAddress(),
    to:      email,
    subject: `Your Salon DECO appointment is confirmed`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#111;color:#e5e5e5;border-radius:12px;overflow:hidden;">
        <div style="background:#b8860b;padding:24px 32px;">
          <h1 style="margin:0;font-size:22px;color:#fff;">✂ ${SALON_NAME}</h1>
            <p style="margin:8px 0 0;color:#fff9e6;font-size:14px;">Your appointment is confirmed ✓</p>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 24px;font-size:15px;">Hi <strong>${appointment.guestName}</strong>, your appointment at <strong>Salon DECO</strong> has been confirmed!</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#999;width:130px;">Package</td>  <td style="padding:8px 0;color:#fff;">${appointment.packageName}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Date</td>     <td style="padding:8px 0;color:#fff;">${dateStr}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Time</td>     <td style="padding:8px 0;color:#fff;">${appointment.timeSlot}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Address</td>   <td style="padding:8px 0;color:#fff;">Puwakdandawa, Beliatta, Sri Lanka</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Phone</td>     <td style="padding:8px 0;color:#fff;">076 715 7718</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;">
            <p style="margin:0 0 6px;font-size:13px;color:#999;">Need to reschedule or cancel? Use your PIN on our website.</p>
            <p style="margin:0;font-size:13px;color:#555;">Mobile: ${appointment.guestPhone}</p>
          </div>
        </div>
        <div style="padding:16px 32px;background:#0a0a0a;font-size:12px;color:#555;text-align:center;">
          ${SALON_NAME} &mdash; We look forward to seeing you!
        </div>
      </div>
    `,
  });
}

module.exports = { sendNewAppointmentAlert, sendBookingConfirmation };
