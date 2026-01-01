import { Router } from 'express';
import healthRoutes from './health.routes';
import profileRoutes from './profile.routes';
import goalsRoutes from './goals.routes';
import habitsRoutes from './habits.routes';
import bucketListRoutes from './bucketList.routes';
import financeRoutes from './finance.routes';
import achievementsRoutes from './achievements.routes';

const router: Router = Router();

router.use('/health', healthRoutes);
router.use('/profile', profileRoutes);
router.use('/goals', goalsRoutes);
router.use('/habits', habitsRoutes);
router.use('/bucket-list', bucketListRoutes);
router.use('/finance', financeRoutes);
router.use('/achievements', achievementsRoutes);

export default router;
