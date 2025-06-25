import { Request, Response } from 'express'
import adminService from '../services/admin.service'
import { responseData } from '../helper/response'
import { statusCode } from '../utils/statusCode'

class AdminController {
  async createInvitation(req: Request, res: Response) {
    try {
      const result = await adminService.createInvitation(req.body)

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
      console.error('[AdminController] register error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params
      console.log('Update user ID:', id)
      const result = await adminService.updateUser(id, req.body)

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
      console.error('[AdminController] updateUser error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const { search = '', type = '', page = 1, limit = 10 } = req.query
      const pagination = {
        page: Number(page),
        limit: Number(limit),
      }
      const result = await adminService.findAll(String(search), pagination, String(type))
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
      console.error('[AdminController] getUsers error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }
}

const adminController = new AdminController()
export default adminController
