import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { validate } from '../middlewares/validation.middleware';
import { creationInvitaionValidation, updateUserValidation } from '../validation/admin.validation';



const router = Router();

router.post('/users', validate(creationInvitaionValidation), adminController.createInvitation);
router.put('/users/:id', validate(updateUserValidation), adminController.updateUser);
router.get('/users', adminController.getUsers);


export default router