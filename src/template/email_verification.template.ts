import { ISendEmailVerification } from '../types/email.interface'

class SendEmailVerificationTemplate {
  sendEmailVerification(body: ISendEmailVerification) {
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>NJTA - Email Verification</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; padding-bottom: 20px;">
                        <h1 style="margin: 0; color: #0056b3;">NJTA</h1>
                        <h2 style="margin: 10px 0 0 0; color: #666;">Email Verification Required</h2>
                    </div>
                    <div style="text-align: center;">
                        <p style="font-size: 16px;">Hi ${body.name},</p>
                        <p style="font-size: 16px;">Thank you for registering with NJTA! To complete your registration and activate your account, please verify your email address.</p>
                        <p style="font-size: 16px;">Click the button below to verify your email address:</p>
                        
                        <a href="${body.redirect_url}?hash=${body.token}" target="_blank" style="display: inline-block; margin-top: 20px; padding: 12px 25px; font-size: 16px; color: #fff; background-color: #28a745; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                            <p style="margin: 5px 0; font-size: 14px; color: #495057;"><strong>Alternative Link:</strong></p>
                            <p style="margin: 5px 0; font-size: 12px; color: #6c757d; word-break: break-all;">${body.redirect_url}?hash=${body.token}</p>
                        </div>
                        
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 25px 0; text-align: left;">
                            <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Security Note:</strong> This verification link will expire in 24 hours for security purposes. If you didn't register for a NJTA account, please ignore this email.</p>
                        </div>
                        
                        <p style="font-size: 16px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                        <p style="font-size: 14px; color: #666; margin-top: 30px;">Best regards,<br>The NJTA Team</p>
                    </div>
                </div>
            </body>
            </html>`
  }
}

const sendEmailVerificationTemplate = new SendEmailVerificationTemplate()
export default sendEmailVerificationTemplate
