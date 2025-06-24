export interface MailData {
  to: string
  subject: string
  text?: string
  html?: string
}

export interface ISendForgotPassword {
  email: string
  name: string
  token: string
  redirect_url: string
}
