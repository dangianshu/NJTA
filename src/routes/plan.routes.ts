import { Router } from 'express'
import submissionPlanController from '../controllers/submissionPlan.controller'

const router = Router()

router.get('/submmison-plan', submissionPlanController.getAllPlans)

export default router