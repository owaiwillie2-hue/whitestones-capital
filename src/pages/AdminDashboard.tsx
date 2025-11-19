import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Users, DollarSign, FileCheck, Settings, TrendingUp, BarChart3, AlertCircle, Menu, X, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminDepositsTab from '@/components/admin/AdminDepositsTab';
import AdminWithdrawalsTab from '@/components/admin/AdminWithdrawalsTab';
import AdminKYCTab from '@/components/admin/AdminKYCTab';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';
import AdminAnalyticsTab from '@/components/admin/AdminAnalyticsTab';
import AdminReferralsTab from '@/components/admin/AdminReferralsTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalInvested: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    pendingKYC: 0,
  });

  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'deposits', label: 'Deposits', icon: DollarSign },
    { id: 'withdrawals', label: 'Withdrawals', icon: TrendingUp },
    { id: 'kyc', label: 'KYC', icon: FileCheck },
    { id: 'referrals', label: 'Referrals', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
        return;
      }

      setUser(user);

      const { data: roleData } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (!roleData) {
        toast.error('Unauthorized: Admin access required');
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      setIsAdmin(true);
      fetchStats();
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: depositCount } = await supabase
        .from('deposits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      const { data: investments } = await supabase
        .from('investments')
        .select('amount');

      const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

      const { count: pendingDeposits } = await supabase
        .from('deposits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: pendingWithdrawals } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: pendingKYC } = await supabase
        .from('kyc_documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalUsers: userCount || 0,
        totalDeposits: depositCount || 0,
        totalInvested,
        pendingDeposits: pendingDeposits || 0,
        pendingWithdrawals: pendingWithdrawals || 0,
        pendingKYC: pendingKYC || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-foreground hover:bg-muted p-2 rounded-lg transition"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Whitestones Markets Management Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-foreground">{user?.email}</span>
            <button
              onClick={toggleTheme}
              className="text-foreground hover:bg-muted p-2 rounded-lg transition"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Button onClick={handleLogout} variant="destructive" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`bg-card border-r border-border transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-0'
          } overflow-hidden`}
        >
          <nav className="p-4 space-y-2">
            <h2 className="text-foreground text-lg font-semibold px-4 py-2 mb-4">Management Tools</h2>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Pending Deposits</p>
                      <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingDeposits}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Pending Withdrawals</p>
                      <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingWithdrawals}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Pending KYC</p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.pendingKYC}</p>
                    </div>
                    <FileCheck className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-foreground text-2xl">
                  {menuItems.find(item => item.id === activeTab)?.label || 'Analytics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === 'analytics' && (
                  <AdminAnalyticsTab stats={stats} onStatsUpdate={fetchStats} />
                )}
                {activeTab === 'users' && (
                  <AdminUsersTab onUpdate={fetchStats} />
                )}
                {activeTab === 'deposits' && (
                  <AdminDepositsTab onUpdate={fetchStats} />
                )}
                {activeTab === 'withdrawals' && (
                  <AdminWithdrawalsTab onUpdate={fetchStats} />
                )}
                {activeTab === 'kyc' && (
                  <AdminKYCTab onUpdate={fetchStats} />
                )}
                {activeTab === 'referrals' && (
                  <AdminReferralsTab />
                )}
                {activeTab === 'settings' && (
                  <AdminSettingsTab />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
