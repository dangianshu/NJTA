import User from '../models/User.models'
import { statusCode } from '../utils/statusCode'
import { responseData, responseMessage } from '../helper/response'
import { NextFunction, Request, Response } from 'express'
import { verifyJWTToken } from '../helper/jwt'
import { UserRole } from '../utils/constant'

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

// Common token validation function
const commonValidation = async (req: Request, res: Response, token: string) => {
  const reqUser = verifyJWTToken(token)

  if (!reqUser) {
    return null
  }

  const user = await User.findById(reqUser.id)

  if (!user) {
    return null
  }

  return { ...reqUser, _id: user._id }
}

// Verify JWT Token Middleware
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    if (!authorization) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: 'Token does not exist!',
      })
    }

    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7, authorization.length)
      : authorization

    const reqUser = await commonValidation(req, res, token)

    if (!reqUser) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: responseMessage('unauthorize as'),
      })
    }

    req.user = reqUser
    next()
  } catch (error) {
    console.error('[verifyToken] error:', error)
    return responseData({
      res,
      statusCode: statusCode.UNAUTHORIZED,
      success: 0,
      message: responseMessage('unauthorize'),
      error: (error as Error).message,
    })
  }
}

// Role checking middleware factory
export const checkRole = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: responseMessage('unauthorize'),
      })
    }

    const userRole = req.user.role

    if (!userRole || !requiredRoles.includes(userRole)) {
      return responseData({
        res,
        statusCode: statusCode.FORBIDDEN,
        success: 0,
        message: 'Permission is not sufficient!',
      })
    }

    next()
  }
}

// Admin Auth Guard
export const adminAuthGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    if (!authorization) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: 'Token does not exist!',
      })
    }

    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7, authorization.length)
      : authorization

    const reqUser = await commonValidation(req, res, token)

    if (!reqUser) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: responseMessage('unauthorize'),
      })
    }

    const user = await User.findById(reqUser.id)

    if (!user || user.role !== UserRole.ADMIN) {
      return responseData({
        res,
        statusCode: statusCode.FORBIDDEN,
        success: 0,
        message: responseMessage('unauthorize'),
      })
    }

    req.user = reqUser
    next()
  } catch (error) {
    console.error('[adminAuthGuard] error:', error)
    return responseData({
      res,
      statusCode: statusCode.UNAUTHORIZED,
      success: 0,
      message: responseMessage('unauthorize'),
      error: (error as Error).message,
    })
  }
}

// User Auth Guard
export const userAuthGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    if (!authorization) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: 'Token does not exist!',
      })
    }

    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7, authorization.length)
      : authorization

    const reqUser = await commonValidation(req, res, token)

    if (!reqUser) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: responseMessage('unauthorize'),
      })
    }

    const user = await User.findById(reqUser.id)

    if (!user) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: responseMessage('unauthorize'),
      })
    }

    req.user = reqUser
    next()
  } catch (error) {
    console.error('[userAuthGuard] error:', error)
    return responseData({
      res,
      statusCode: statusCode.UNAUTHORIZED,
      success: 0,
      message: responseMessage('unauthorize'),
      error: (error as Error).message,
    })
  }
}

// Evaluator Auth Guard
export const evaluatorAuthGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    if (!authorization) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: 'Token does not exist!',
      })
    }

    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7, authorization.length)
      : authorization

    const reqUser = await commonValidation(req, res, token)

    if (!reqUser) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: responseMessage('unauthorize'),
      })
    }

    const user = await User.findById(reqUser.id)

    if (!user || user.role !== UserRole.EVALUATOR) {
      return responseData({
        res,
        statusCode: statusCode.FORBIDDEN,
        success: 0,
        message: responseMessage('unauthorize'),
      })
    }

    req.user = reqUser
    next()
  } catch (error) {
    console.error('[evaluatorAuthGuard] error:', error)
    return responseData({
      res,
      statusCode: statusCode.UNAUTHORIZED,
      success: 0,
      message: responseMessage('unauthorize'),
      error: (error as Error).message,
    })
  }
}

export const verifyResetToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query
    if (!token || typeof token !== 'string') {
      return responseData({
        res,
        statusCode: statusCode.BAD_REQUEST,
        success: 0,
        error: 'Reset token is required',
      })
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return responseData({
        res,
        statusCode: statusCode.BAD_REQUEST,
        success: 0,
        error: 'Invalid or expired reset token',
      })
    }

    ;(req as any).user = user
    next()
  } catch (error) {
    console.error('[verifyResetToken] error:', error)
    return responseData({
      res,
      statusCode: statusCode.SERVER_ERROR,
      success: 0,
      error: 'Server error while verifying reset token',
    })
  }
}

export const universalAuthGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    if (!authorization) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: 'Token does not exist!',
      })
    }

    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7, authorization.length)
      : authorization

    const reqUser = verifyJWTToken(token)
    if (!reqUser) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: responseMessage('unauthorize'),
      })
    }

    const user = await User.findById(reqUser.id)
    if (!user) {
      return responseData({
        res,
        statusCode: statusCode.UNAUTHORIZED,
        success: 0,
        message: responseMessage('unauthorize'),
      })
    }

    req.user = { ...reqUser, _id: user._id, role: user.role }
    next()
  } catch (error) {
    console.error('[universalAuthGuard] error:', error)
    return responseData({
      res,
      statusCode: statusCode.UNAUTHORIZED,
      success: 0,
      message: responseMessage('unauthorize'),
      error: (error as Error).message,
    })
  }
}
