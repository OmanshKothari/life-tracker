import { prisma } from '../config/database';

/**
 * Base repository with common operations
 * All repositories extend this class
 */
export abstract class BaseRepository {
  protected prisma = prisma;

  /**
   * Soft delete filter - excludes deleted records by default
   */
  protected notDeleted = { deletedAt: null };

  /**
   * Include deleted records filter
   */
  protected includeDeleted(include: boolean) {
    return include ? {} : this.notDeleted;
  }
}
