import SubmissionPlan from '../models/SubmissionPlan.models'
import { statusCode } from '../utils/statusCode'
import { ISubmissionPlan, ISubmissionResponse } from '../types/submissionPlan.interface'

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
    console.log(`Updating plan with ID: ${id}`, payload)
    const plan = await SubmissionPlan.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    )
    console.log(`Updated plan:`, plan)
    if (!plan) {
      return {
        success: false,
        statusCode: statusCode.NOTFOUND,
        message: 'Submission plan not found',
      }
    }
    const planObj = plan.toObject()
    console.log(`Plan object after update:`, planObj)
    return {
      success: true,
      statusCode: statusCode.SUCCESS,
      message: 'Submission plan updated successfully',
      data: {
        plan: planObj,
      },
    }
  }
}

const submissionPlanService = new SubmissionPlanService()
export default submissionPlanService
