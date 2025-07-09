import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { validate } from '../middlewares/validation.middleware';
import { creationInvitaionValidation, updateUserValidation } from '../validation/admin.validation';
import { adminAuthGuard } from '../middlewares/auth.middleware';


const router = Router();

router.post('/users', adminAuthGuard, validate(creationInvitaionValidation), adminController.createInvitation);
router.put('/users/:id', adminAuthGuard, validate(updateUserValidation), adminController.updateUser);
router.get('/users', adminAuthGuard,  adminController.getUsers);
router.get('/submissions', adminAuthGuard, adminController.getAllSubmission);
router.get('/view/submissions/:plan/:user', adminAuthGuard, adminController.previewSubmissions);
router.put('/update/status/:plan/:user', adminAuthGuard, adminController.updateSubmissionStatus);

export default router