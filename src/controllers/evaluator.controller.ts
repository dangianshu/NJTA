import { Request, Response } from 'express'
import adminService from '../services/admin.service'
import { responseData } from '../helper/response'
import { statusCode } from '../utils/statusCode'
import evaluatorService from '../services/evaluator.service'

class EvaluatorController {
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

  async addFeedbackToSubmission(req: Request, res: Response) {
    try {
      const { submissionId } = req.params
      const { questionId, isSubQuestion, comment, needImprovement } = req.body
      const result = await evaluatorService.addFeedbackToSubmission({
        submissionId,
        questionId,
        isSubQuestion,
        comment,
        needImprovement,
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
      console.error('[AdminController] addFeedbackToSubmission error: ', error)
      return responseData({
        res,
        statusCode: statusCode.SERVER_ERROR,
        success: 0,
        error: (error as Error).message,
      })
    }
  }
}

const evaluatorController = new EvaluatorController()
export default evaluatorController
