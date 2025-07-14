import { Request, Response } from 'express'
import { responseData } from '../helper/response'
import { statusCode } from '../utils/statusCode'
import authService from '../services/auth.service'

class AuthController {
  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body)

      if (!result.success) {
        return responseData({
          res,
          statusCode: result.statusCode,
          success: 0,
          error: result.message,
        })
      }

      return responseData({
        res,
        statusCode: result.statusCode,
        success: 1,
        message: result.message,
        data: result.data,
      })
    } catch (error) {
      console.error('[AuthController] login error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body)

      if (!result.success) {
        return responseData({
          res,
          statusCode: result.statusCode,
          success: 0,
          error: result.message,
        })
      }

      return responseData({
        res,
        statusCode: result.statusCode,
        success: 1,
        message: result.message,
        data: result.data,
      })
    } catch (error) {
      console.error('[AuthController] register error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const result = await authService.forgotPassword(req.body)

      if (!result.success) {
        return responseData({
          res,
          statusCode: result.statusCode,
          success: 0,
          error: result.message,
        })
      }

      return responseData({
        res,
        statusCode: result.statusCode,
        success: 1,
        message: result.message,
      })
    } catch (error) {
      console.error('[AuthController] forgotPassword error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { password } = req.body
      const token = req.query.token as string
      const result = await authService.resetPassword({ token, password })

      if (!result.success) {
        return responseData({
          res,
          statusCode: result.statusCode,
          success: 0,
          error: result.message,
        })
      }

      return responseData({
        res,
        statusCode: result.statusCode,
        success: 1,
        message: result.message,
      })
    } catch (error) {
      console.error('[AuthController] resetPassword error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const token = req.query.token as string
      console.log('Received token for email verification:', token)

      const result = await authService.verifyEmail(token)

      if (!result.success) {
        return responseData({
          res,
          statusCode: result.statusCode,
          success: 0,
          error: result.message,
        })
      }

      return responseData({
        res,
        statusCode: result.statusCode,
        success: 1,
        message: result.message,
      })
    } catch (error) {
      console.error('[AuthController] verifyEmail error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }
  
}

const authController = new AuthController()
export default authController
