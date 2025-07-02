import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import planRoutes from './plan.routes';
import organizationRoutes from './organization.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/plan', planRoutes);
router.use('/organization', organizationRoutes);

export default router;