import { Router } from 'express'
import submissionPlanController from '../controllers/submissionPlan.controller'
import { validate } from '../middlewares/validation.middleware'
import { updatePlanValidation } from '../validation/plan.validation'

const router = Router()

router.get('/submission-plan', submissionPlanController.getAllPlans)
router.put(
  '/submission-plan/:id',
  validate(updatePlanValidation),
  submissionPlanController.updatePlan
)

export default router
