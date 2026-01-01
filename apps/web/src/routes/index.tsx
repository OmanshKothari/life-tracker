import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import {
  Dashboard,
  Goals,
  BucketList,
  Habits,
  Finance,
  ComingSoon,
  Savings,
  Achievements,
  Analytics,
} from '@/pages';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/bucket-list" element={<BucketList />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<ComingSoon title="Settings" icon="⚙️" />} />
        <Route path="/more" element={<ComingSoon title="More Options" icon="📋" />} />
      </Route>
    </Routes>
  );
}
