import { Request, Response } from 'express'
import { responseData } from '../helper/response'
import { statusCode } from '../utils/statusCode'
import submissionPlanService from '../services/submissionPlan.service'

class SubmissionPlanController {
  async getAllPlans(req: Request, res: Response) {
    try {
      const result = await submissionPlanService.getAllPlans()
      if (!result.success) {
        return responseData({
          res,
          statusCode: result.statusCode,
          success: 0,
          error: result.message,
        });
      }
      return responseData({
        res,
        statusCode: statusCode.SUCCESS,
        success: 1,
        message: result.message,
        data: result.data,
      })
    } catch (error) {
      console.error('[SubmissionPlanController] getAllPlans error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }

  async updatePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(`Updating plan with ID: ${id}`, req.body);
      const result = await submissionPlanService.updatePlan(id, req.body);
      if (!result.success) {
        return responseData({
          res,
          statusCode: result.statusCode,
          success: 0,
          error: result.message,
        });
      }
      return responseData({
        res,
        statusCode: result.statusCode,
        success: 1,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('[SubmissionPlanController] getAllPlans error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      });
    }
  }
}

export default new SubmissionPlanController()