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
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; margin: 0;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); overflow: hidden;">
                    
                    <!-- Header Section -->
                    <div style="background: linear-gradient(135deg, #0056b3 0%, #007bff 100%); padding: 40px 20px; text-align: center; position: relative;">
                        <div style="background: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                            <div style="width: 40px; height: 40px; background: #ffffff; border-radius: 50%; position: relative;">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; background: #0056b3; border-radius: 50%;"></div>
                            </div>
                        </div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 2px;">NJTA</h1>
                        <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 300;">Secure Password Management</p>
                    </div>
                    
                    <!-- Content Section -->
                    <div style="padding: 40px 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ff6b6b, #ffa500); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <div style="color: white; font-size: 24px; font-weight: bold;">🔒</div>
                            </div>
                            <h2 style="margin: 0; color: #333; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #007bff; margin: 25px 0;">
                            <p style="font-size: 18px; margin: 0 0 15px 0; color: #333;">Hi <strong style="color: #0056b3;">${body?.name}</strong>,</p>
                            <p style="font-size: 16px; margin: 0; color: #666; line-height: 1.7;">We received a request to reset your password for your NJTA account. If you made this request, click the button below to create a new password.</p>
                        </div>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${body.redirect_url}?token=${body?.token}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); text-decoration: none; border-radius: 50px; box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px;">
                                Reset Your Password
                            </a>
                        </div>
                        
                        <!-- Security Notice -->
                        <div style="background: linear-gradient(135deg, #fff3cd, #ffeaa7); border: 1px solid #ffc107; border-radius: 10px; padding: 20px; margin: 25px 0;">
                            <div style="display: flex; align-items: flex-start;">
                                <div style="background: #ffc107; color: #212529; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">!</div>
                                <div>
                                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #856404; font-size: 14px;">Security Notice</p>
                                    <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.5;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged and your account stays secure.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e9ecef;">
                            <p style="font-size: 14px; color: #6c757d; margin: 0 0 10px 0;">Need help? Contact our support team</p>
                            <p style="font-size: 16px; color: #333; margin: 0; font-weight: 500;">
                                Best regards,<br>
                                <span style="color: #0056b3; font-weight: 600;">The NJTA Team</span>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Bottom Border -->
                    <div style="height: 4px; background: linear-gradient(90deg, #007bff, #0056b3, #007bff);"></div>
                </div>
                
                <!-- Footer Text -->
                <div style="text-align: center; margin-top: 30px;">
                    <p style="font-size: 12px; color: rgba(255,255,255,0.7); margin: 0;">This email was sent from a secure NJTA system</p>
                </div>
            </body>
            </html>`
  }
}

const sendForgotPasswordTemplate = new SendForgotPasswordTemplate()

export default sendForgotPasswordTemplate