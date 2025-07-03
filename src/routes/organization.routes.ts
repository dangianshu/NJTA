import { Router } from 'express'
import organizationController from '../controllers/organization.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()

router.get('/dashboard', verifyToken, organizationController.getDashboard)

router.get('/take/survey/:planID', verifyToken, organizationController.takeSurvey)

router.post('/submit/survey', verifyToken, organizationController.submitSurvey)

export default router