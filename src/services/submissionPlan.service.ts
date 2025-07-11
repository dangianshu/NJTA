import SubmissionPlan from '../models/SubmissionPlan.models'
import { statusCode } from '../utils/statusCode'
import { ISubmissionPlan, ISubmissionResponse } from '../types/submissionPlan.interface'
import { toPlainObject } from '../helper/common'

class SubmissionPlanService {
  async getAllPlans(): Promise<ISubmissionResponse> {
    const submissionPlans = await SubmissionPlan.find().sort({ createdAt: -1 })
    if (!submissionPlans || submissionPlans.length === 0) {
      return {
        success: false,
        statusCode: statusCode.NOTFOUND,
        message: 'No submission plans found',
      }
    }
    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'Submission plans fetched successfully',
      data: { submissionPlans },
    }
  }

  async updatePlan(id: string, payload: Partial<ISubmissionPlan>) {
    const plan = await SubmissionPlan.findByIdAndUpdate(id, { $set: payload }, { new: true })
    if (!plan) {
      return {
        success: false,
        statusCode: statusCode.NOTFOUND,
        message: 'Submission plan not found',
      }
    }
    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'Submission plan updated successfully',
      data: {
        plan: await toPlainObject(plan),
      },
    }
  }
}

const submissionPlanService = new SubmissionPlanService()
export default submissionPlanService
