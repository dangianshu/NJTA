import { Request, Response } from 'express'
import organizationService from '../services/organization.service'
import { responseData } from '../helper/response'
import { statusCode } from '../utils/statusCode'

class OrganizationController {
  async getDashboard(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { page = 1, limit = 10 } = req.query
      const pagination = {
        page: Number(page),
        limit: Number(limit),
      }

      const result = await organizationService.getDashboard(userId, pagination)

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
      console.error('[OrgController] getDashboard error:', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async takeSurvey(req: Request, res: Response) {
    try {
      const { planID } = req.params
      const userId = req.user?.id
      const userRole = req.user?.role

      if (!userId || !userRole) {
        return responseData({
          res,
          statusCode: statusCode.UNAUTHORIZED,
          success: 0,
          error: 'User not authenticated',
        })
      }

      const result = await organizationService.takeSurvey(userId, planID, userRole)

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
      console.error('[OrgController] takeSurvey error:', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async submitSubmission(req: Request, res: Response) {
    try {
      const result = await organizationService.submitSubmissionWithFiles(req)
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
        statusCode: statusCode.SUCCESS,
        success: 1,
        message: result.message,
        data: result.data,
      })
    } catch (error) {
      console.error('[OrgController] submitSubmission error:', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }
}

const organizationController = new OrganizationController()
export default organizationController
