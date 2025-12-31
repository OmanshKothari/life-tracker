import { Router } from 'express';
import profileRouter from './profile.routes';
import goalsRouter from './goals.routes';
import bucketListRouter from './bucketList.routes';
import habitsRouter from './habits.routes';
import financeRouter from './finance.routes';

const router: Router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Life Tracker API',
      version: '1.0.0',
      endpoints: {
        profile: '/api/v1/profile',
        goals: '/api/v1/goals',
        bucketList: '/api/v1/bucket-list',
        habits: '/api/v1/habits',
        finance: '/api/v1/finance',
      },
    },
  });
});

router.use('/profile', profileRouter);
router.use('/goals', goalsRouter);
router.use('/bucket-list', bucketListRouter);
router.use('/habits', habitsRouter);
router.use('/finance', financeRouter);

export default router;
