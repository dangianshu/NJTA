import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { loginValidation, registerValidation } from '../validation/auth.validation';
import { verifyResetToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', validate(registerValidation), authController.register);

router.post('/login', validate(loginValidation), authController.login);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password',verifyResetToken, authController.resetPassword);

export default router;