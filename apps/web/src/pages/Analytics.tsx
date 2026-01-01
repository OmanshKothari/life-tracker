import { useState, useEffect } from 'react';
import { useAnalyticsStore } from '../stores/analytics.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  Download,
  FileText,
  FileSpreadsheet,
  Target,
  Flame,
  Wallet,
  Star,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { WeeklyPeriod, MonthlyPeriod } from '../services/analytics.api';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

type TabType = 'weekly' | 'monthly' | 'trends' | 'export';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<TabType>('weekly');
  const [weeklyPeriod, setWeeklyPeriod] = useState<WeeklyPeriod>('this_week');
  const [monthlyPeriod, setMonthlyPeriod] = useState<MonthlyPeriod>('this_month');
  const [trendType, setTrendType] = useState<'weekly' | 'monthly'>('weekly');

  const {
    weeklyReport,
    monthlyReport,
    trends,
    isLoadingWeekly,
    isLoadingMonthly,
    isLoadingTrends,
    isExporting,
    fetchWeeklyReport,
    fetchMonthlyReport,
    fetchTrends,
    exportCSV,
    exportPDF,
    exportJSON,
  } = useAnalyticsStore();

  useEffect(() => {
    if (activeTab === 'weekly') {
      fetchWeeklyReport(weeklyPeriod);
    } else if (activeTab === 'monthly') {
      fetchMonthlyReport(monthlyPeriod);
    } else if (activeTab === 'trends') {
      fetchTrends(trendType);
    }
  }, [activeTab, weeklyPeriod, monthlyPeriod, trendType]);

  const report = activeTab === 'weekly' ? weeklyReport : monthlyReport;
  const isLoading = activeTab === 'weekly' ? isLoadingWeekly : isLoadingMonthly;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500">Track your progress and identify trends</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { id: 'weekly', label: 'Weekly Report', icon: BarChart3 },
          { id: 'monthly', label: 'Monthly Report', icon: BarChart3 },
          { id: 'trends', label: 'Trends', icon: TrendingUp },
          { id: 'export', label: 'Export Data', icon: Download },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as TabType)}
            className="gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Weekly/Monthly Report Content */}
      {(activeTab === 'weekly' || activeTab === 'monthly') && (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex items-center gap-4">
            <Select
              value={activeTab === 'weekly' ? weeklyPeriod : monthlyPeriod}
              onValueChange={(value) =>
                activeTab === 'weekly'
                  ? setWeeklyPeriod(value as WeeklyPeriod)
                  : setMonthlyPeriod(value as MonthlyPeriod)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activeTab === 'weekly' ? (
                  <>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="last_week">Last Week</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            {report && (
              <Badge variant="outline" className="text-gray-500">
                {report.period.label}
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 animate-pulse text-amber-500" />
                <p className="mt-2 text-gray-500">Generating report...</p>
              </div>
            </div>
          ) : report ? (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <SummaryCard
                  title="Goals Completed"
                  value={report.goals.completed}
                  subtitle={`${report.goals.completionRate}% completion rate`}
                  icon={Target}
                  color="blue"
                />
                <SummaryCard
                  title="Habit Consistency"
                  value={`${report.habits.completionRate}%`}
                  subtitle={`${report.habits.completionsCount} completions`}
                  icon={Flame}
                  color="green"
                />
                <SummaryCard
                  title="XP Earned"
                  value={report.gamification.xpEarned}
                  subtitle={`Level ${report.gamification.currentLevel}`}
                  icon={Star}
                  color="amber"
                />
                <SummaryCard
                  title="Savings Rate"
                  value={`${report.finance.savingsRate}%`}
                  subtitle={`₹${report.finance.netIncome.toLocaleString()} net`}
                  icon={Wallet}
                  color="purple"
                />
              </div>

              {/* Highlights */}
              {(report.highlights.bestPerforming.length > 0 ||
                report.highlights.needsAttention.length > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {report.highlights.bestPerforming.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          Best Performing
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {report.highlights.bestPerforming.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  {report.highlights.needsAttention.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-amber-600">
                          <AlertTriangle className="h-5 w-5" />
                          Needs Attention
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {report.highlights.needsAttention.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Goals by Category */}
                {report.goals.byCategory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Goals by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={report.goals.byCategory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" name="Total" />
                          <Bar dataKey="completed" fill="#10b981" name="Completed" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Habit Performance */}
                {report.habits.habitPerformance.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Habit Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={report.habits.habitPerformance.slice(0, 6)}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip formatter={(value: number) => `${value}%`} />
                          <Bar dataKey="rate" fill="#10b981" name="Completion Rate" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Expenses by Category */}
                {report.finance.expensesByCategory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Expenses by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={report.finance.expensesByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="amount"
                            nameKey="category"
                            label={({
                              category,
                              percentage,
                            }: {
                              category: string;
                              percentage: number;
                            }) => `${category} (${percentage}%)`}
                          >
                            {report.finance.expensesByCategory.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: string) => `₹${Number(value).toLocaleString()}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Budget Adherence */}
                {report.finance.overBudgetCategories.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Over Budget Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {report.finance.overBudgetCategories.map((cat, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between text-sm">
                              <span>{cat.category}</span>
                              <span className="text-red-600">
                                +₹{cat.overage.toLocaleString()} over
                              </span>
                            </div>
                            <Progress
                              value={Math.min((cat.actual / cat.budget) * 100, 150)}
                              className="mt-1 h-2"
                            />
                            <div className="mt-1 flex justify-between text-xs text-gray-500">
                              <span>Budget: ₹{cat.budget.toLocaleString()}</span>
                              <span>Actual: ₹{cat.actual.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Select
              value={trendType}
              onValueChange={(v) => setTrendType(v as 'weekly' | 'monthly')}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Week over Week</SelectItem>
                <SelectItem value="monthly">Month over Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoadingTrends ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <TrendingUp className="mx-auto h-12 w-12 animate-pulse text-amber-500" />
                <p className="mt-2 text-gray-500">Analyzing trends...</p>
              </div>
            </div>
          ) : trends ? (
            <>
              {/* Comparison Cards */}
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <TrendCard
                  title="Goals Completed"
                  current={trends.current.goals.completed}
                  previous={trends.previous.goals.completed}
                  change={trends.comparison.goalsCompletedChange}
                  suffix=""
                />
                <TrendCard
                  title="Habits Rate"
                  current={trends.current.habits.completionRate}
                  previous={trends.previous.habits.completionRate}
                  change={trends.comparison.habitsCompletionRateChange}
                  suffix="%"
                  isPercentageChange
                />
                <TrendCard
                  title="Income"
                  current={trends.current.finance.totalIncome}
                  previous={trends.previous.finance.totalIncome}
                  change={trends.comparison.incomeChange}
                  prefix="₹"
                  format
                />
                <TrendCard
                  title="Expenses"
                  current={trends.current.finance.totalExpenses}
                  previous={trends.previous.finance.totalExpenses}
                  change={trends.comparison.expensesChange}
                  prefix="₹"
                  format
                  invertColors
                />
                <TrendCard
                  title="Savings Rate"
                  current={trends.current.finance.savingsRate}
                  previous={trends.previous.finance.savingsRate}
                  change={trends.comparison.savingsRateChange}
                  suffix="%"
                  isPercentageChange
                />
                <TrendCard
                  title="XP Earned"
                  current={trends.current.gamification.xpEarned}
                  previous={trends.previous.gamification.xpEarned}
                  change={trends.comparison.xpChange}
                  suffix=" XP"
                />
              </div>

              {/* Period Comparison Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Period Comparison</CardTitle>
                  <CardDescription>
                    {trends.current.period.label} vs {trends.previous.period.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          metric: 'Goals',
                          current: trends.current.goals.completed,
                          previous: trends.previous.goals.completed,
                        },
                        {
                          metric: 'Habit %',
                          current: trends.current.habits.completionRate,
                          previous: trends.previous.habits.completionRate,
                        },
                        {
                          metric: 'Bucket',
                          current: trends.current.bucketList.completed,
                          previous: trends.previous.bucketList.completed,
                        },
                        {
                          metric: 'Savings %',
                          current: trends.current.finance.savingsRate,
                          previous: trends.previous.finance.savingsRate,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="previous" fill="#94a3b8" name="Previous" />
                      <Bar dataKey="current" fill="#f59e0b" name="Current" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-gray-500">No trend data available</p>
            </div>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Your Data</CardTitle>
              <CardDescription>Download your Life Tracker data in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PDF Reports */}
              <div>
                <h3 className="mb-3 font-medium">PDF Reports</h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => exportPDF('this_week')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    This Week Report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportPDF('last_week')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Last Week Report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportPDF('this_month')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    This Month Report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportPDF('last_month')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Last Month Report
                  </Button>
                </div>
              </div>

              {/* CSV Exports */}
              <div>
                <h3 className="mb-3 font-medium">CSV Exports</h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => exportCSV('all')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    All Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportCSV('goals')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Goals
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportCSV('habits')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Habits
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportCSV('bucket_list')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Bucket List
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportCSV('expenses')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Expenses
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportCSV('incomes')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Incomes
                  </Button>
                </div>
              </div>

              {/* JSON Export */}
              <div>
                <h3 className="mb-3 font-medium">Full Backup</h3>
                <Button
                  variant="outline"
                  onClick={() => exportJSON()}
                  disabled={isExporting}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export All Data (JSON)
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                  Complete backup of all your data in JSON format
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * Summary Card Component
 */
interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

function SummaryCard({ title, value, subtitle, icon: Icon, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          </div>
          <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Trend Card Component
 */
interface TrendCardProps {
  title: string;
  current: number;
  previous: number;
  change: number;
  prefix?: string;
  suffix?: string;
  format?: boolean;
  invertColors?: boolean;
  isPercentageChange?: boolean;
}

function TrendCard({
  title,
  current,
  previous,
  change,
  prefix = '',
  suffix = '',
  format = false,
  invertColors = false,
  isPercentageChange = false,
}: TrendCardProps) {
  const isPositive = invertColors ? change <= 0 : change >= 0;
  const displayChange = isPercentageChange ? change : change;
  const changeSymbol = change > 0 ? '+' : '';

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs text-gray-500">{title}</p>
        <p className="mt-1 text-xl font-bold">
          {prefix}
          {format ? current.toLocaleString() : current}
          {suffix}
        </p>
        <div
          className={`mt-1 flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          <span>
            {changeSymbol}
            {displayChange}
            {isPercentageChange ? 'pp' : '%'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
