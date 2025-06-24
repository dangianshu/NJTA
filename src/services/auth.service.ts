import crypto from 'crypto';
import User from '../models/User.models';
import { encrypt, compareValue } from '../helper/encrypt';
import { generateJWTToken } from '../helper/jwt';
import mailTemplateService from './email.template.service';
import { IRegisterRequest, ILoginRequest, IAuthResponse } from '../types/auth.interface';
import { JWTPayload } from '../types/common.interface';
import { statusCode } from '../utils/statusCode';

class AuthService {
  
  async register(userData: IRegisterRequest): Promise<IAuthResponse> {
      const { name, email, password, contactName, code } = userData;

      const existingUser = await User.findOne({ code });
      
      if (!existingUser) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Provided Organization/Evaluator ID Is Invalid'
        };
      }

      if (existingUser.password) {
        return {
          success: false,
          statusCode: statusCode.CONFLICT,
          message: 'Organization/Evaluator ID Has Already Been Registered'
        };
      }

      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return {
          success: false,
          statusCode: statusCode.CONFLICT,
          message: 'Email is already registered'
        };
      }

      const hashedPassword = await encrypt(password);
      
      const hashString = await encrypt(email);

      // Update existing user with registration data
      existingUser.name = name;
      existingUser.email = email;
      existingUser.contact = contactName;
      existingUser.password = hashedPassword;
      existingUser.role = 'user';
      existingUser.hashString = hashString;

      await existingUser.save();

      return {
        success: true,
        statusCode: statusCode.CREATED,
        message: 'User registered successfully',
        data: {
          user: {
            id: existingUser._id.toString(),
            name: existingUser.name!,
            email: existingUser.email!,
            role: existingUser.role
          },
        }
      };

  }

  async login(loginData: ILoginRequest): Promise<IAuthResponse> {
      const { code, password } = loginData;

      // Find user by email
      const user = await User.findOne({ code });

      
      if (!user) {
        return {
          success: false,
          statusCode: statusCode.UNAUTHORIZED,
          message: 'Invalid code or password'
        };
      }

      // Check if user has completed registration (has password)
      if (!user.password) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Please complete your registration first'
        };
      }

      // Compare password
      const isPasswordValid = await compareValue(password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          statusCode: statusCode.UNAUTHORIZED,
          message: 'Invalid email or password'
        };
      }

      // Generate JWT token
      const payload: JWTPayload = {
        id: user._id.toString(),
        email: user.email!,
        role: user.role
      };

      const token = generateJWTToken(payload);

      return {
        success: true,
        statusCode: statusCode.SUCCESS,
        message: 'Login successful',
        data: {
          token
        }
      };

  }
  
  async forgotPassword(payload: { email: string, redirect_url?: string }) {
      const { email, redirect_url } = payload;
      const user = await User.findOne({ email });
      console.log("user", user)

      if (!user) {
        return {
          success: false,
          statusCode: statusCode.BAD_REQUEST,
          message: 'Email not found',
        };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      console.log("resetToken", resetToken)
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      await user.save();

      const mailBody = {
        email: user.email || '',
        name: user.name || '',
        token: resetToken, 
        redirect_url: redirect_url || '',
      };
      console.log("mailBody", mailBody)
      await mailTemplateService.sendForgotPasswordMail(mailBody);

      return {
        success: true,
        statusCode: statusCode.SUCCESS,
        message: 'Forgot password email sent successfully',
      };
    }

  async resetPassword(payload: { token: string, newPassword: string }) {
    const user = await User.findOne({
      resetPasswordToken: payload.token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return {
        success: false,
        statusCode: statusCode.BAD_REQUEST,
        message: 'Invalid or expired reset token',
      };
    }

    user.password = await encrypt(payload.newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'Password reset successful',
    };
  }
}

const authService = new AuthService();
export default authService;