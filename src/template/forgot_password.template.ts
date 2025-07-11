import { ISendForgotPassword } from '../types/email.interface'

class SendForgotPasswordTemplate {
  sendForgotPassword(body: ISendForgotPassword) {
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>NJTA - Password Reset Request</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; padding-bottom: 20px;">
                        <h1 style="margin: 0; color: #0056b3;">NJTA</h1>
                        <h2 style="margin: 10px 0 0 0; color: #666;">Password Reset Request</h2>
                    </div>
                    <div style="text-align: center;">
                        <p style="font-size: 16px;">Hi ${body?.name},</p>
                        <p style="font-size: 16px;">We received a request to reset your password for your NJTA account.</p>
                        <p style="font-size: 16px;">Click the button below to create a new password:</p>
                        
                        <a href="${body.redirect_url}?token=${body?.token}" target="_blank" style="display: inline-block; margin-top: 20px; padding: 12px 25px; font-size: 16px; color: #fff; background-color: #dc3545; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Your Password</a>
                        
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 25px 0; text-align: left;">
                            <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged and your account stays secure.</p>
                        </div>
                        
                        <p style="font-size: 16px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                        <p style="font-size: 14px; color: #666; margin-top: 30px;">Best regards,<br>The NJTA Team</p>
                    </div>
                </div>
            </body>
            </html>`
  }
}

const sendForgotPasswordTemplate = new SendForgotPasswordTemplate()

export default sendForgotPasswordTemplate
