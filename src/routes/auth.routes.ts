import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { loginValidation, registerValidation } from '../validation/auth.validation';

const router = Router();

// Register route with validation
router.post('/register', validate(registerValidation), authController.register);

// Login route with validation
router.post('/login', validate(loginValidation), authController.login);

// Forgot password route
router.post('/forgot-password', authController.forgotPassword);

// Reset password route
router.post('/reset-password', authController.resetPassword);

export default router;