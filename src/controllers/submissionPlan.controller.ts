import { Request, Response } from 'express'
import { responseData } from '../helper/response'
import { statusCode } from '../utils/statusCode'
import submissionPlanService from '../services/submmisionPlan.service'

class SubmissionPlanController {
  async getAllPlans(req: Request, res: Response) {
    try {
      const plans = await submissionPlanService.getAllPlans()
      return responseData({
        res,
        statusCode: statusCode.SUCCESS,
        success: 1,
        message: 'Plans fetched successfully',
        data: plans,
      })
    } catch (error) {
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }
}

export default new SubmissionPlanController()