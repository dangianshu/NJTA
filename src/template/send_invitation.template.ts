import { ISendInvitation } from "../types/email.interface"


class SendInvitationTemplate {
  sendInvitation(body: ISendInvitation) {
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>NJTA - Welcome to Your Account</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; padding-bottom: 20px;">
                        <h1 style="margin: 0; color: #0056b3;">NJTA</h1>
                        <h2 style="margin: 10px 0 0 0; color: #666;">Welcome to Your Account</h2>
                    </div>
                    <div style="text-align: center;">
                        <p style="font-size: 16px;">Hi ${body?.name},</p>
                        <p style="font-size: 16px;">Welcome to NJTA! Your account has been created successfully.</p>
                        <p style="font-size: 16px;">Here are your login credentials:</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Invitation Code:</strong> <span style="font-family: monospace; background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">${body?.code}</span></p>
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">${body?.password}</span></p>
                        </div>
                        
                        <p style="font-size: 16px;">Click the button below to access your account and set up your profile:</p>
                        <a href="${body.redirect_url}?code=${body?.code}" target="_blank" style="display: inline-block; margin-top: 20px; padding: 12px 25px; font-size: 16px; color: #fff; background-color: #28a745; text-decoration: none; border-radius: 5px; font-weight: bold;">Access Your Account</a>
                        
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 25px 0; text-align: left;">
                            <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Security Note:</strong> Please change your password after your first login for security purposes. Keep your invitation code safe and do not share it with others.</p>
                        </div>
                        
                        <p style="font-size: 16px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                        <p style="font-size: 14px; color: #666; margin-top: 30px;">Best regards,<br>The NJTA Team</p>
                    </div>
                </div>
            </body>
            </html>`
  }
}

const sendInvitationTemplate = new SendInvitationTemplate()

export default sendInvitationTemplate