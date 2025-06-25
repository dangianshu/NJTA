import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);


export default router;