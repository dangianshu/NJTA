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

export interface ISendInvitation {
  name: string;
  email: string;
  code: string;
  password: string;
  redirectUrl?: string;
  role: string
  
}
