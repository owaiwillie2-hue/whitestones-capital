import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminWithdrawalsTabProps {
  onUpdate: () => void;
}

const AdminWithdrawalsTab = ({ onUpdate }: AdminWithdrawalsTabProps) => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const { data } = await supabase
        .from('withdrawals')
        .select(`
          *,
          profiles!user_id(email, full_name),
          withdrawal_accounts(account_name, account_type)
        `)
        .order('created_at', { ascending: false });

      setWithdrawals(data || []);
    } catch (error) {
      toast.error('Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId: string, userId: string, amount: number) => {
    try {
      await supabase
        .from('withdrawals')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', withdrawalId);

      // Deduct from user balance
      const { data: balance } = await supabase
        .from('account_balances')
        .select('main_balance, total_withdrawn')
        .eq('user_id', userId)
        .single();

      const newBalance = (Number(balance?.main_balance) || 0) - amount;
      const newTotalWithdrawn = (Number(balance?.total_withdrawn) || 0) + amount;

      await supabase
        .from('account_balances')
        .update({ main_balance: newBalance, total_withdrawn: newTotalWithdrawn })
        .eq('user_id', userId);

      toast.success('Withdrawal approved!');
      fetchWithdrawals();
      onUpdate();
    } catch (error) {
      toast.error('Error approving withdrawal');
    }
  };

  const handleReject = async (withdrawalId: string) => {
    try {
      await supabase
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', withdrawalId);

      toast.success('Withdrawal rejected');
      fetchWithdrawals();
      onUpdate();
    } catch (error) {
      toast.error('Error rejecting withdrawal');
    }
  };

  if (loading) {
    return <div className="text-white">Loading withdrawals...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700">
            <tr>
              <th className="px-4 py-2 text-left">User Email</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-left">Account</th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-center">Date</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="border-b border-slate-700 hover:bg-slate-700 transition">
                <td className="px-4 py-3">{withdrawal.profiles?.email}</td>
                <td className="px-4 py-3 text-right font-semibold text-red-400">${Number(withdrawal.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-xs">
                  {withdrawal.withdrawal_accounts?.account_name} ({withdrawal.withdrawal_accounts?.account_type})
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    withdrawal.status === 'approved' 
                      ? 'bg-green-900 text-green-200' 
                      : withdrawal.status === 'pending'
                      ? 'bg-yellow-900 text-yellow-200'
                      : 'bg-red-900 text-red-200'
                  }`}>
                    {withdrawal.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xs">
                  {new Date(withdrawal.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center space-x-2">
                  {withdrawal.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(withdrawal.id, withdrawal.user_id, withdrawal.amount)}
                        className="bg-green-600 hover:bg-green-700 text-xs"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(withdrawal.id)}
                        variant="destructive"
                        className="text-xs"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminWithdrawalsTab;
