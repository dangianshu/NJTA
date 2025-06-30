import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import planRoutes from './plan.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/plan', planRoutes);

export default router;