import nodemailer from 'nodemailer'
import { CONFIG } from '../config/env.config'
import { MailData } from '../types/email.interface'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: CONFIG.ADMIN_EMAIL,
    pass: CONFIG.ADMIN_PASS,
  },
})

export const sendMail = async (data: MailData): Promise<boolean> => {
  const mailOptions = {
    from: `NJTA <${CONFIG.ADMIN_EMAIL}>`,
    ...data,
  }

  try {
    const result = await transporter.sendMail(mailOptions)
    return result ? true : false
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
