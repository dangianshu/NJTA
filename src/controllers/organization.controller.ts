import { Request, Response } from 'express'
import organizationService from '../services/organization.service'
import { responseData } from '../helper/response'
import { statusCode } from '../utils/statusCode'

class OrganizationController {
  async getDashboard(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      
      if (!userId) {
        return responseData({
          res,
          statusCode: statusCode.UNAUTHORIZED,
          success: 0,
          error: 'User not authenticated',
        })
      }

      const result = await organizationService.getDashboard(userId)

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
      const { cat } = req.query
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

      const result = await organizationService.takeSurvey(userId, planID, userRole, cat as string)

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

  async viewSubmissions(req: Request, res: Response) {
    try {
      const { plan, showSubmit } = req.params
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

      const result = await organizationService.viewSubmissions(userId, plan, userRole, showSubmit === 'true')

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
      console.error('[OrgController] viewSubmissions error:', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async submitQuestionDraft(req: Request, res: Response) {
    try {
      const { section, plan, question, ans, role } = req.body
      const userId = req.user?.id

      if (!userId) {
        return responseData({
          res,
          statusCode: statusCode.UNAUTHORIZED,
          success: 0,
          error: 'User not authenticated',
        })
      }

      // Validate required fields
      if (!section || !plan || !question || !ans || !role) {
        return responseData({
          res,
          statusCode: statusCode.BAD_REQUEST,
          success: 0,
          error: 'Missing required fields: section, plan, question, ans, role',
        })
      }

      const result = await organizationService.submitQuestionDraft({
        userId,
        section,
        plan,
        question,
        ans,
        role,
      })

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
      console.error('[OrgController] submitQuestionDraft error:', error)
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