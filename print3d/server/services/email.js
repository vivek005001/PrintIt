import nodemailer from 'nodemailer'

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env

let transporter = null
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587'),
        secure: false,
        auth: { user: SMTP_USER, pass: SMTP_PASS }
    })
    console.log('✅ Email transporter ready')
} else {
    console.log('ℹ️  SMTP not configured — emails will be logged to console')
}

async function sendEmail({ to, subject, html }) {
    if (!transporter) {
        console.log(`\n📧 [EMAIL] To: ${to}\n   Subject: ${subject}\n   Body: ${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}\n`)
        return
    }
    try {
        await transporter.sendMail({ from: EMAIL_FROM || 'PrintIt <noreply@printit.local>', to, subject, html })
    } catch (err) {
        console.error('Email send error:', err.message)
    }
}

export function emailOrderPlaced(user, order) {
    return sendEmail({
        to: user.email,
        subject: `📦 Order #${order.id} Placed — Awaiting Admin Approval`,
        html: `
      <h2>Hi ${user.name}! 👋</h2>
      <p>Your order <strong>#${order.id}</strong> has been placed and is awaiting approval from our team.</p>
      <p><strong>Amount:</strong> ₹${order.total_amount}</p>
      <p>We'll notify you once the order is reviewed. Stay tuned!</p>
      <p style="color:#888">— PrintIt Team</p>
    `
    })
}

export function emailOrderApproved(user, order) {
    return sendEmail({
        to: user.email,
        subject: `✅ Order #${order.id} Approved — Please Make Payment`,
        html: `
      <h2>Great news, ${user.name}! 🎉</h2>
      <p>Your order <strong>#${order.id}</strong> has been <strong>approved</strong>!</p>
      <p><strong>Estimated Delivery:</strong> ${order.delivery_estimate}</p>
      <p><strong>Amount to Pay:</strong> ₹${order.total_amount}</p>
      ${order.admin_notes ? `<p><strong>Admin Note:</strong> ${order.admin_notes}</p>` : ''}
      <p>Please scan the payment QR on the website and upload your payment receipt to confirm your order.</p>
      <p style="color:#888">— PrintIt Team</p>
    `
    })
}

export function emailOrderRejected(user, order) {
    return sendEmail({
        to: user.email,
        subject: `❌ Order #${order.id} Could Not Be Processed`,
        html: `
      <h2>Hi ${user.name},</h2>
      <p>Unfortunately, your order <strong>#${order.id}</strong> could not be approved at this time.</p>
      ${order.admin_notes ? `<p><strong>Reason:</strong> ${order.admin_notes}</p>` : ''}
      <p>Feel free to place a new order or contact us for more info.</p>
      <p style="color:#888">— PrintIt Team</p>
    `
    })
}

export function emailPaymentConfirmed(user, order) {
    return sendEmail({
        to: user.email,
        subject: `🖨️ Order #${order.id} Confirmed — Printing Starts Now!`,
        html: `
      <h2>You're all set, ${user.name}! 🚀</h2>
      <p>Payment for order <strong>#${order.id}</strong> has been verified. Your print job is now queued!</p>
      <p><strong>Estimated Delivery:</strong> ${order.delivery_estimate}</p>
      <p>We'll update you when it's ready for pickup.</p>
      <p style="color:#888">— PrintIt Team</p>
    `
    })
}
