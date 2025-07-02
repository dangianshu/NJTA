import { ISendEmailVerification } from '../types/email.interface'

class SendEmailVerificationTemplate {
  sendEmailVerification(body: ISendEmailVerification) {
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>NJTA - Email Verification</title>
                <style>
                    @media only screen and (max-width: 600px) {
                        .container { width: 100% !important; margin: 0 !important; }
                        .content { padding: 20px !important; }
                        .button { padding: 12px 24px !important; font-size: 14px !important; }
                        .header { padding: 30px 15px !important; }
                        .header h1 { font-size: 24px !important; }
                    }
                    .verify-button:hover {
                        background: linear-gradient(135deg, #20c997 0%, #28a745 100%) !important;
                        box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4) !important;
                        transform: translateY(-2px) !important;
                    }
                    .clickable-link:hover {
                        color: #0056b3 !important;
                        text-decoration: none !important;
                    }
                </style>
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; margin: 0;">
                <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); overflow: hidden;">
                    
                    <!-- Header Section -->
                    <div class="header" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 20px; text-align: center; position: relative;">
                        <div style="background: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                            <div style="width: 40px; height: 40px; background: #ffffff; border-radius: 50%; position: relative;">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; background: #28a745; border-radius: 50%;"></div>
                            </div>
                        </div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 2px;">NJTA</h1>
                        <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 300;">Email Verification Required</p>
                    </div>
                    
                    <!-- Content Section -->
                    <div class="content" style="padding: 40px 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #28a745, #20c997); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <div style="color: white; font-size: 24px; font-weight: bold;">✉️</div>
                            </div>
                            <h2 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 28px; font-weight: 600;">Verify Your Email Address</h2>
                            <p style="margin: 0; color: #7f8c8d; font-size: 16px;">Please confirm your email address to complete your registration</p>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #28a745;">
                            <p style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">Hello ${body.name},</p>
                            <p style="margin: 0 0 15px 0; color: #495057; font-size: 15px; line-height: 1.6;">
                                Thank you for registering with NJTA! To complete your registration and activate your account, 
                                please verify your email address by clicking the button below.
                            </p>
                            <p style="margin: 0; color: #6c757d; font-size: 14px; font-style: italic;">
                                This verification link will expire in 24 hours for security purposes.
                            </p>
                        </div>
                        
                        <!-- Action Button -->
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${body.redirect_url}?hash=${body.token}" 
                               target="_blank"
                               class="verify-button button"
                               style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); transition: all 0.3s ease; text-transform: uppercase; cursor: pointer; border: none; outline: none;">
                                ✓ Verify Email Address
                            </a>
                        </div>
                        
                        <!-- Alternative Link -->
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; color: #495057; font-size: 14px; font-weight: 500;">Can't click the button? Copy and paste this link in your browser:</p>
                            <div style="background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #dee2e6; margin-top: 10px;">
                                <a href="${body.redirect_url}?hash=${body.token}" 
                                   target="_blank"
                                   class="clickable-link"
                                   style="color: #007bff; font-size: 13px; font-family: 'Courier New', monospace; text-decoration: underline; word-break: break-all; cursor: pointer; transition: color 0.3s ease;">
                                    ${body.redirect_url}?hash=${body.token}
                                </a>
                            </div>
                        </div>
                        
                        <!-- Security Notice -->
                        <div style="background: linear-gradient(135deg, #fff3cd, #ffeaa7); border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #ffc107;">
                            <div style="display: flex; align-items: flex-start;">
                                <div style="color: #856404; font-size: 18px; margin-right: 12px;">⚠️</div>
                                <div>
                                    <p style="margin: 0 0 8px 0; color: #856404; font-size: 14px; font-weight: 600;">Security Notice</p>
                                    <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.5;">
                                        If you didn't register for a NJTA account, please ignore this email. 
                                        Your email address will not be added to our system without verification.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Help Section -->
                        <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">Having trouble with verification?</p>
                            <p style="margin: 0; color: #6c757d; font-size: 13px;">
                                Contact our support team for assistance.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                        <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 12px;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                        <p style="margin: 0; color: #adb5bd; font-size: 11px;">
                            © ${new Date().getFullYear()} NJTA. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>`
  }
}

const sendEmailVerificationTemplate = new SendEmailVerificationTemplate()
export default sendEmailVerificationTemplate
