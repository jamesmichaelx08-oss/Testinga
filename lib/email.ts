type SendEmailOptions = {
  to: string
  subject: string
  text: string
}

export async function sendEmail({ to, subject, text }: SendEmailOptions) {
  if (process.env.DEV_LOG_2FA === 'true' || !process.env.SMTP_HOST) {
    console.log('\n--- 2FA Email (dev mode) ---')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(text)
    console.log('----------------------------\n')
    return
  }

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Minecraft Hosting <noreply@example.com>',
    to,
    subject,
    text,
  })
}

export async function send2FACode(email: string, code: string) {
  await sendEmail({
    to: email,
    subject: 'Your Minecraft Hosting verification code',
    text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes. If you did not attempt to log in, please secure your account immediately.`,
  })
}
