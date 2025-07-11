import { Router } from 'express'
import evaluatorController from '../controllers/evaluator.controller'
import { checkRole, evaluatorAuthGuard, universalAuthGuard } from '../middlewares/auth.middleware'

const router = Router()

router.get('/submissions', evaluatorAuthGuard, evaluatorController.getAllSubmission)
router.post(
  '/feedback/:submissionId',
  universalAuthGuard,
  checkRole(['admin', 'evaluator']),
  evaluatorController.addFeedbackToSubmission
)

export default router
