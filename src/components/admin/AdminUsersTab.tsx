import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminUsersTabProps {
  onUpdate: () => void;
}

const AdminUsersTab = ({ onUpdate }: AdminUsersTabProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          account_balances(main_balance, profit_balance, total_deposited),
          kyc_documents(status)
        `)
        .order('created_at', { ascending: false });

      setUsers(data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-foreground">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-foreground">
          <thead className="text-xs text-muted-foreground uppercase bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-right">Main Balance</th>
              <th className="px-4 py-2 text-right">Total Deposited</th>
              <th className="px-4 py-2 text-center">KYC Status</th>
              <th className="px-4 py-2 text-center">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition">
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.full_name}</td>
                <td className="px-4 py-3 text-right text-green-400">
                  ${user.account_balances?.[0]?.main_balance?.toFixed(2) || '0.00'}
                </td>
                <td className="px-4 py-3 text-right text-blue-400">
                  ${user.account_balances?.[0]?.total_deposited?.toFixed(2) || '0.00'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    user.kyc_documents?.[0]?.status === 'approved' 
                      ? 'bg-green-900 text-green-200' 
                      : user.kyc_documents?.[0]?.status === 'pending'
                      ? 'bg-yellow-900 text-yellow-200'
                      : 'bg-gray-900 text-gray-200'
                  }`}>
                    {user.kyc_documents?.[0]?.status || 'Not submitted'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xs">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground text-sm">Total Users: {users.length}</p>
    </div>
  );
};

export default AdminUsersTab;
