import User from '../models/User.models';
import { statusCode } from '../utils/statusCode';
import { responseData } from '../helper/response';
import { NextFunction, Request, Response } from 'express';

export const verifyResetToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    if (!token || typeof token !== 'string') {
      return responseData({
        res,
        statusCode: statusCode.BAD_REQUEST,
        success: 0,
        error: 'Reset token is required',
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return responseData({
        res,
        statusCode: statusCode.BAD_REQUEST,
        success: 0,
        error: 'Invalid or expired reset token',
      });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('[verifyResetToken] error:', error);
    return responseData({
      res,
      statusCode: statusCode.SERVER_ERROR,
      success: 0,
      error: 'Server error while verifying reset token',
    });
  }
};