import { Router } from 'express'
import adminController from '../controllers/admin.controller'
import { validate } from '../middlewares/validation.middleware'
import { creationInvitaionValidation, updateUserValidation } from '../validation/admin.validation'
import {
  adminAuthGuard,
  checkRole,
  universalAuthGuard,
  verifyToken,
} from '../middlewares/auth.middleware'

const router = Router()

router.post(
  '/users',
  adminAuthGuard,
  validate(creationInvitaionValidation),
  adminController.createInvitation
)
router.put('/users/:id', adminAuthGuard, validate(updateUserValidation), adminController.updateUser)
router.get('/users', adminAuthGuard, adminController.getUsers)
router.get(
  '/submissions',
  universalAuthGuard,
  checkRole(['admin', 'evaluator']),
  adminController.getAllSubmission
)
router.get(
  '/view/submissions/:plan/:user',
  universalAuthGuard,
  checkRole(['admin', 'evaluator']),
  adminController.previewSubmissions
)
router.put('/update/status/:plan/:user', verifyToken, checkRole(['admin', 'evaluator']), adminController.updateSubmissionStatus)
router.get('/export/preview/:plan/:user', adminController.getPreviewExport)

export default router
