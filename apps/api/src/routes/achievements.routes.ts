import { Router } from 'express';
import { listAchievements, getUnlockedAchievements, getAchievementStats } from '../controllers';

const router: Router = Router();

/**
 * GET /api/v1/achievements
 * List all achievements with unlock status
 */
router.get('/', listAchievements);

/**
 * GET /api/v1/achievements/unlocked
 * Get user's unlocked achievements
 */
router.get('/unlocked', getUnlockedAchievements);

/**
 * GET /api/v1/achievements/stats
 * Get achievement statistics
 */
router.get('/stats', getAchievementStats);

export default router;
