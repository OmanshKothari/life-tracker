import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createBucketItemSchema,
  updateBucketItemSchema,
  idParamSchema,
  paginationSchema,
} from '@life-tracker/shared';
import {
  listBucketItems,
  getBucketItem,
  createBucketItem,
  updateBucketItem,
  completeBucketItem,
  deleteBucketItem,
  getBucketListStats,
} from '../controllers/bucketList.controller';

const router: Router = Router();

router.get('/', validateRequest({ query: paginationSchema }), listBucketItems);
router.get('/stats', getBucketListStats);
router.get('/:id', validateRequest({ params: idParamSchema }), getBucketItem);
router.post('/', validateRequest({ body: createBucketItemSchema }), createBucketItem);
router.patch(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateBucketItemSchema }),
  updateBucketItem
);
router.patch('/:id/complete', validateRequest({ params: idParamSchema }), completeBucketItem);
router.delete('/:id', validateRequest({ params: idParamSchema }), deleteBucketItem);

export default router;
