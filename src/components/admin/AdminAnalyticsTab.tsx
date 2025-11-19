import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface AdminAnalyticsTabProps {
  stats: any;
  onStatsUpdate: () => void;
}

const AdminAnalyticsTab = ({ stats }: AdminAnalyticsTabProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [investmentData, setInvestmentData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch recent deposits for chart
      const { data: deposits } = await supabase
        .from('deposits')
        .select('created_at, amount, status')
        .order('created_at', { ascending: false })
        .limit(30);

      if (deposits) {
        const groupedData: { [key: string]: { approved: number; pending: number; rejected: number } } = {};
        deposits.forEach(dep => {
          const date = new Date(dep.created_at).toLocaleDateString();
          if (!groupedData[date]) {
            groupedData[date] = { approved: 0, pending: 0, rejected: 0 };
          }
          groupedData[date][dep.status] += Number(dep.amount);
        });

        const chartArray = Object.keys(groupedData)
          .sort()
          .reverse()
          .slice(0, 10)
          .map(date => ({
            date,
            ...groupedData[date],
          }));
        setChartData(chartArray);
      }

      // Fetch investment status breakdown
      const { data: investments } = await supabase
        .from('investments')
        .select('status');

      if (investments) {
        const breakdown = {
          active: investments.filter(i => i.status === 'active').length,
          completed: investments.filter(i => i.status === 'completed').length,
          cancelled: investments.filter(i => i.status === 'cancelled').length,
        };
        setInvestmentData([
          { name: 'Active', value: breakdown.active, fill: '#3b82f6' },
          { name: 'Completed', value: breakdown.completed, fill: '#10b981' },
          { name: 'Cancelled', value: breakdown.cancelled, fill: '#ef4444' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit Trends */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Deposit Trends (Last 10 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} name="Approved" />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Investment Status Distribution */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Investment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={investmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {investmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total Invested</p>
            <p className="text-2xl font-bold text-white">${stats.totalInvested.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Approved Deposits</p>
            <p className="text-2xl font-bold text-green-400">${stats.totalDeposits}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Active Users</p>
            <p className="text-2xl font-bold text-blue-400">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Pending Actions</p>
            <p className="text-2xl font-bold text-yellow-400">
              {stats.pendingDeposits + stats.pendingWithdrawals + stats.pendingKYC}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsTab;
