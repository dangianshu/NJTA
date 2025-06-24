import User from '../models/User.models';
import { encrypt, compareValue } from '../helper/encrypt';
import { generateJWTToken } from '../helper/jwt';
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
    try {
      const { email, password } = loginData;

      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        return {
          success: false,
          statusCode: statusCode.UNAUTHORIZED,
          message: 'Invalid email or password'
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
          user: {
            id: user._id.toString(),
            name: user.name!,
            email: user.email!,
            role: user.role
          },
          token
        }
      };

    } catch (error) {
      console.error('[AuthService] login error:', error);
      return {
        success: false,
        statusCode: statusCode.SERVER_ERROR,
        message: 'Login failed. Please try again.'
      };
    }
  }
}

const authService = new AuthService();
export default authService;