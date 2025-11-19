import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminDepositsTabProps {
  onUpdate: () => void;
}

const AdminDepositsTab = ({ onUpdate }: AdminDepositsTabProps) => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const { data } = await supabase
        .from('deposits')
        .select(`
          *,
          profiles!user_id(email, full_name)
        `)
        .order('created_at', { ascending: false });

      setDeposits(data || []);
    } catch (error) {
      toast.error('Failed to fetch deposits');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (depositId: string, userId: string, amount: number) => {
    try {
      // Update deposit status
      const { error: depError } = await supabase
        .from('deposits')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', depositId);

      if (depError) throw depError;

      // Update user balance
      const { data: balance } = await supabase
        .from('account_balances')
        .select('main_balance')
        .eq('user_id', userId)
        .single();

      const newBalance = (Number(balance?.main_balance) || 0) + amount;

      await supabase
        .from('account_balances')
        .update({ main_balance: newBalance })
        .eq('user_id', userId);

      toast.success('Deposit approved!');
      fetchDeposits();
      onUpdate();
    } catch (error) {
      toast.error('Error approving deposit');
    }
  };

  const handleReject = async (depositId: string) => {
    try {
      await supabase
        .from('deposits')
        .update({ status: 'rejected' })
        .eq('id', depositId);

      toast.success('Deposit rejected');
      fetchDeposits();
      onUpdate();
    } catch (error) {
      toast.error('Error rejecting deposit');
    }
  };

  if (loading) {
    return <div className="text-foreground">Loading deposits...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-foreground">
          <thead className="text-xs text-muted-foreground uppercase bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">User Email</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-center">Date</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((deposit) => (
              <tr key={deposit.id} className="border-b border-border hover:bg-muted/50 transition">
                <td className="px-4 py-3">{deposit.profiles?.email}</td>
                <td className="px-4 py-3 text-right font-semibold text-green-400">${Number(deposit.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    deposit.status === 'approved' 
                      ? 'bg-green-900 text-green-200' 
                      : deposit.status === 'pending'
                      ? 'bg-yellow-900 text-yellow-200'
                      : 'bg-red-900 text-red-200'
                  }`}>
                    {deposit.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xs">
                  {new Date(deposit.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center space-x-2">
                  {deposit.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(deposit.id, deposit.user_id, deposit.amount)}
                        className="bg-green-600 hover:bg-green-700 text-xs"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(deposit.id)}
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

export default AdminDepositsTab;
