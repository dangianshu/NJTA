import SubmissionPlan from '../models/SubmissionPlan.models'

class SubmissionPlanService {
  async getAllPlans() {
    return SubmissionPlan.find()
  }
}

export default new SubmissionPlanService()