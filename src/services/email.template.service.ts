import { sendMail } from '../helper/mail'
import {
  ISendForgotPassword,
  ISendInvitation,
  ISendEmailVerification,
} from '../types/email.interface'
import sendForgotPasswordTemplate from '../template/forgot_password.template'
import sendInvitationTemplate from '../template/send_invitation.template'
import sendEmailVerificationTemplate from '../template/email_verification.template'

class MailTemplateService {
  async sendForgotPasswordMail(body: ISendForgotPassword) {
    console.log('Sending forgot password email with body:', body)
    try {
      const emailCheckData = {
        to: body?.email,
        subject: 'Forgot Password',
        html: sendForgotPasswordTemplate.sendForgotPassword(body),
      }
      console.log('Email check data:', emailCheckData)
      const isMailSent = await sendMail(emailCheckData)
      console.log('Email sent status:', isMailSent)
      if (!isMailSent) {
        console.error('Failed to send email.')
        return isMailSent
      }
      return isMailSent
    } catch (error) {
      console.error('Failed to send email.', error)
      throw error
    }
  }

  async sendInvitationMail(body: ISendInvitation) {
    try {
      const emailCheckData = {
        to: body?.email,
        subject: 'Invitation',
        html: sendInvitationTemplate.sendInvitation(body),
      }
      const isMailSent = await sendMail(emailCheckData)
      if (!isMailSent) {
        console.error('Failed to send email.')
        return isMailSent
      }
      return isMailSent
    } catch (error) {
      console.error('Failed to send email.', error)
      throw error
    }
  }

  async sendEmailVerificationMail(body: ISendEmailVerification) {
    try {
      const emailCheckData = {
        to: body?.email,
        subject: 'NJTA - Verify Your Email Address',
        html: sendEmailVerificationTemplate.sendEmailVerification(body),
      }
      const isMailSent = await sendMail(emailCheckData)
      console.log('Email verification sent status:', isMailSent)
      if (!isMailSent) {
        console.error('Failed to send verification email.')
        return isMailSent
      }
      return isMailSent
    } catch (error) {
      console.error('Failed to send verification email.', error)
      throw error
    }
  }
}

const mailTemplateService = new MailTemplateService()

export default mailTemplateService
