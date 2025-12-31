import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { updateProfileSchema } from '@life-tracker/shared';
import { getProfile, updateProfile, getProfileStats, getLevelProgress } from '../controllers';

const router: Router = Router();

/**
 * GET /api/v1/profile
 * Get current user profile
 */
router.get('/', getProfile);

/**
 * PATCH /api/v1/profile
 * Update user profile
 */
router.patch('/', validateRequest({ body: updateProfileSchema }), updateProfile);

/**
 * GET /api/v1/profile/stats
 * Get detailed statistics
 */
router.get('/stats', getProfileStats);

/**
 * GET /api/v1/profile/level-progress
 * Get level progression details
 */
router.get('/level-progress', getLevelProgress);

export default router;
