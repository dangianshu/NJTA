import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { validate } from '../middlewares/validation.middleware';


const router = Router();

router.post('/users',  adminController.createInvitation);
router.put('/users/:id', adminController.updateUser);
router.get('/users', adminController.getUsers);


export default router