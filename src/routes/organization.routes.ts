import { Router } from 'express'
import organizationController from '../controllers/organization.controller'
import { verifyToken } from '../middlewares/auth.middleware'
import { upload } from '../helper/multer'

const router = Router()

router.get('/dashboard', verifyToken, organizationController.getDashboard)

router.get('/take/survey/:planID', verifyToken, organizationController.takeSurvey)

router.post('/submit/survey', verifyToken, organizationController.submitSurvey)

router.post('/submit/submission', verifyToken, upload.array('files'), organizationController.submitSubmission)

export default router