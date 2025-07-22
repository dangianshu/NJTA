import { Router } from 'express'
import organizationController from '../controllers/organization.controller'
import { verifyToken } from '../middlewares/auth.middleware'
import { upload } from '../helper/multer'
import { checkRole } from '../middlewares/auth.middleware'

const router = Router()

router.get('/dashboard', verifyToken, checkRole(['user', 'evaluator']), organizationController.getDashboard)

router.get('/take/survey/:planID', verifyToken, checkRole(['user', 'evaluator']), organizationController.takeSurvey)

router.post(
  '/submit/submission',
  verifyToken,
  checkRole(['user', 'evaluator']),
  upload.array('files'),
  organizationController.submitSubmission
)

export default router
