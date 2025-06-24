import { sendMail } from '../helper/mail'
import { ISendForgotPassword } from '../types/email.interface'
import sendForgotPasswordTemplate from '../template/forgot_password.template'

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

}

const mailTemplateService = new MailTemplateService()

export default mailTemplateService
