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

  async getAllSubmission(req: Request, res: Response) {
    try {
      const { role, page = 1, limit = 10, fy, search } = req.query
      const pagination = {
        page: Number(page),
        limit: Number(limit),
      }

      const result = await adminService.getAllSubmission(
        role as string,
        pagination,
        fy as string,
        search as string
      )

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
      console.error('[AdminController] getAllSubmission error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async previewSubmissions(req: Request, res: Response) {
    try {
      const { plan, user } = req.params

      if (!plan || !user) {
        return responseData({
          res,
          statusCode: statusCode.BAD_REQUEST,
          success: 0,
          error: 'Missing plan, user',
        })
      }

      const result = await adminService.getPreviewSubmissions(plan, user)

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
      console.error('[AdminController] previewSubmissions error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async updateSubmissionStatus(req: Request, res: Response) {
    try {
      const { plan, user } = req.params
      const { status} = req.query
      const isSubmitted = req.query.isSubmitted as unknown as boolean;

      if (!plan || !user || !status) {
        return responseData({
          res,
          statusCode: statusCode.BAD_REQUEST,
          success: 0,
          error: 'Missing user, subID, or status',
        })
      }
      const result = await adminService.updateSubmissionStatus(plan, user, String(status), isSubmitted ?? false)
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
      console.error('[AdminController] updateSubmissionStatus error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async getPreviewExport(req: Request, res: Response) {
    try {
      const { plan, user } = req.params
      const format = req.query.format as string

      if (!plan || !user) {
        return responseData({
          res,
          statusCode: statusCode.BAD_REQUEST,
          success: 0,
          error: 'Missing plan or user',
        })
      }

      const result = await adminService.getPreviewExport(plan, user, format)

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
      console.error('[AdminController] getPreviewExport error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const result = await adminService.getAllUsers()

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
      console.error('[AdminController] getPreviewExport error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updateFields = req.body

      const result = await adminService.updateProfile(id, updateFields)

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
      console.error('[AdminController] updateUser error:', error)
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
