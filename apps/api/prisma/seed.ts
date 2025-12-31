import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ==========================================================================
  // 1. CREATE DEFAULT USER
  // ==========================================================================
  console.log('👤 Creating default user...');

  const user = await prisma.user.upsert({
    where: { email: 'omansh@life-tracker.app' },
    update: {},
    create: {
      name: 'Omansh',
      email: 'omansh@life-tracker.app',
      profile: {
        create: {
          totalXP: 0,
          currentLevel: 1,
          goalsCompleted: 0,
          bucketCompleted: 0,
          habitsCompleted: 0,
          totalSaved: 0,
        },
      },
    },
    include: { profile: true },
  });

  console.log(`   ✅ User created: ${user.name} (${user.id})\n`);

  // ==========================================================================
  // 2. CREATE DEFAULT EXPENSE CATEGORIES
  // ==========================================================================
  console.log('📁 Creating default expense categories...');

  const defaultCategories = [
    { name: 'Housing', icon: '🏠', budgetLimit: 25000 },
    { name: 'Groceries', icon: '🛒', budgetLimit: 10000 },
    { name: 'Transportation', icon: '🚗', budgetLimit: 5000 },
    { name: 'Utilities', icon: '💡', budgetLimit: 3000 },
    { name: 'Healthcare', icon: '🏥', budgetLimit: 5000 },
    { name: 'Entertainment', icon: '🎬', budgetLimit: 3000 },
    { name: 'Dining Out', icon: '🍽️', budgetLimit: 4000 },
    { name: 'Shopping', icon: '🛍️', budgetLimit: 5000 },
    { name: 'Education', icon: '📚', budgetLimit: 3000 },
    { name: 'Personal Care', icon: '💅', budgetLimit: 2000 },
    { name: 'Subscriptions', icon: '📱', budgetLimit: 2000 },
    { name: 'Insurance', icon: '🛡️', budgetLimit: 5000 },
    { name: 'Gifts', icon: '🎁', budgetLimit: 2000 },
    { name: 'Travel', icon: '✈️', budgetLimit: 10000 },
    { name: 'Other', icon: '📦', budgetLimit: null },
  ];

  for (const category of defaultCategories) {
    await prisma.expenseCategory.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: category.name,
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: category.name,
        icon: category.icon,
        budgetLimit: category.budgetLimit,
        isDefault: true,
      },
    });
  }

  console.log(`   ✅ Created ${defaultCategories.length} expense categories\n`);

  // ==========================================================================
  // 3. CREATE ACHIEVEMENTS
  // ==========================================================================
  console.log('🏆 Creating achievements...');

  const achievements = [
    // Goals achievements
    {
      code: 'GOAL_GETTER',
      name: 'Goal Getter',
      description: 'Complete your first goal',
      category: 'GOALS' as const,
      icon: '🎯',
      requirement: 'Complete 1 goal',
      bonusPoints: 25,
      isSecret: false,
    },
    {
      code: 'TRIPLE_THREAT',
      name: 'Triple Threat',
      description: 'Complete 3 goals',
      category: 'GOALS' as const,
      icon: '🎯',
      requirement: 'Complete 3 goals',
      bonusPoints: 50,
      isSecret: false,
    },
    {
      code: 'GOAL_MASTER',
      name: 'Goal Master',
      description: 'Complete 10 goals',
      category: 'GOALS' as const,
      icon: '🏅',
      requirement: 'Complete 10 goals',
      bonusPoints: 200,
      isSecret: false,
    },

    // Habits achievements
    {
      code: 'FIRST_STEPS',
      name: 'First Steps',
      description: 'Complete your first habit',
      category: 'HABITS' as const,
      icon: '👣',
      requirement: 'Complete 1 habit entry',
      bonusPoints: 10,
      isSecret: false,
    },
    {
      code: 'WEEK_WARRIOR',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak on any habit',
      category: 'HABITS' as const,
      icon: '🔥',
      requirement: '7-day streak',
      bonusPoints: 50,
      isSecret: false,
    },
    {
      code: 'MONTH_MASTER',
      name: 'Month Master',
      description: 'Maintain a 30-day streak on any habit',
      category: 'HABITS' as const,
      icon: '💪',
      requirement: '30-day streak',
      bonusPoints: 200,
      isSecret: false,
    },
    {
      code: 'HABIT_LEGEND',
      name: 'Habit Legend',
      description: 'Maintain a 100-day streak on any habit',
      category: 'HABITS' as const,
      icon: '👑',
      requirement: '100-day streak',
      bonusPoints: 1000,
      isSecret: false,
    },

    // Finance achievements
    {
      code: 'SAVERS_START',
      name: "Saver's Start",
      description: 'Create your first savings goal',
      category: 'FINANCE' as const,
      icon: '🐷',
      requirement: 'Create 1 savings goal',
      bonusPoints: 25,
      isSecret: false,
    },
    {
      code: 'FIRST_LAKH',
      name: 'First Lakh',
      description: 'Save ₹1,00,000 across all savings goals',
      category: 'FINANCE' as const,
      icon: '💰',
      requirement: 'Save ₹1,00,000 total',
      bonusPoints: 200,
      isSecret: false,
    },
    {
      code: 'BUDGET_BOSS',
      name: 'Budget Boss',
      description: 'Stay under budget for a full month',
      category: 'FINANCE' as const,
      icon: '📊',
      requirement: 'Under budget for 1 month',
      bonusPoints: 100,
      isSecret: false,
    },

    // Bucket List achievements
    {
      code: 'DREAM_STARTER',
      name: 'Dream Starter',
      description: 'Complete your first bucket list item',
      category: 'BUCKET_LIST' as const,
      icon: '⭐',
      requirement: 'Complete 1 bucket list item',
      bonusPoints: 50,
      isSecret: false,
    },
    {
      code: 'ADVENTURE_SEEKER',
      name: 'Adventure Seeker',
      description: 'Complete 5 bucket list items',
      category: 'BUCKET_LIST' as const,
      icon: '🗺️',
      requirement: 'Complete 5 bucket list items',
      bonusPoints: 150,
      isSecret: false,
    },

    // Overall achievements
    {
      code: 'LIFE_TRACKER',
      name: 'Life Tracker',
      description: 'Use all features: goals, habits, finance, and bucket list',
      category: 'OVERALL' as const,
      icon: '🌟',
      requirement: 'Create item in each category',
      bonusPoints: 100,
      isSecret: false,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {},
      create: achievement,
    });
  }

  console.log(`   ✅ Created ${achievements.length} achievements\n`);

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Database seeding completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   👤 Users: 1`);
  console.log(`   📁 Expense Categories: ${defaultCategories.length}`);
  console.log(`   🏆 Achievements: ${achievements.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
