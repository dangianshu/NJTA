import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { validate } from '../middlewares/validation.middleware';
import { creationInvitaionValidation, updateUserValidation } from '../validation/admin.validation';
import { adminAuthGuard } from '../middlewares/auth.middleware';


const router = Router();

router.post('/users', adminAuthGuard, validate(creationInvitaionValidation), adminController.createInvitation);
router.put('/users/:id', adminAuthGuard, validate(updateUserValidation), adminController.updateUser);
router.get('/users', adminAuthGuard,  adminController.getUsers);


export default router