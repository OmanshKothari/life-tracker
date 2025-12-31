# Life Tracker 🎮📊
*A Gamified Personal Productivity & Finance Tracker*

Life Tracker is a **full-stack, gamified productivity system** designed to help users track goals, habits, bucket list items, and personal finances — while staying motivated through XP, levels, and progress insights.

This project is built as a **learning-first but production-style monorepo**, focusing on clean architecture, scalability, and future extensibility.

---

## ✨ Key Highlights

- Full-stack **monorepo** (backend, frontend, shared packages)
- **Gamification-driven UX** to encourage consistency
- Modular, scalable architecture
- Clear separation of concerns (API, UI, shared domain)
- Designed for incremental feature growth

---

## 🧠 Core Features

### 🎯 Goals
- Create, update, track, and complete goals
- Priority- and category-based organization
- Progress tracking with XP rewards on completion

### 🔁 Habits
- Daily habit tracking (binary & numeric)
- Automatic streak calculation (current & best)
- Calendar-based habit history view

### 🪣 Bucket List
- Difficulty-based items (Easy → Epic)
- Completion review flow
- XP rewards based on difficulty

### 💰 Finance
- Expense and income tracking
- Monthly budgets per category
- Budget vs actual comparison
- Savings goals with add-money flow
- Finance dashboard with summaries

---

## 🧩 Architecture Overview

### Backend
- **Node.js + Express + TypeScript**
- **Prisma ORM** with PostgreSQL
- Layered architecture:
  - Controllers → Services → Repositories
- Centralized error handling & validation
- RESTful API design

### Frontend
- **React 18 + Vite**
- **Tailwind CSS + shadcn/ui**
- Zustand for state management
- Component-driven, modular UI

### Shared
- Shared types, constants, and schemas
- Single source of truth for validation
- Used across frontend and backend

---

## 📁 Monorepo Structure

```txt
life-tracker/
├── apps/
│   ├── api/            # Express backend
│   └── web/            # React frontend
│
├── packages/
│   └── shared/         # Shared types & schemas
│
├── docs/               # Documentation & progress notes
├── CHANGELOG.md
├── README.md
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```
