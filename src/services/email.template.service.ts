import { sendMail } from '../helper/mail'
import { ISendForgotPassword } from '../types/email.interface'
import sendForgotPasswordTemplate from '../template/forgot_password.template'

class MailTemplateService {

  async sendForgotPasswordMail(body: ISendForgotPassword) {
    try {
      const emailCheckData = {
        to: body?.email,
        subject: 'Forgot Password',
        html: sendForgotPasswordTemplate.sendForgotPassword(body),
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

}

const mailTemplateService = new MailTemplateService()

export default mailTemplateService
