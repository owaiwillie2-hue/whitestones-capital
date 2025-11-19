import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminReferralsTab = () => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const { data } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer_profile:referrer_id(email),
          referred_profile:referred_id(email)
        `)
        .order('created_at', { ascending: false });

      setReferrals(data || []);
    } catch (error) {
      toast.error('Failed to fetch referrals');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading referrals...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700">
            <tr>
              <th className="px-4 py-2 text-left">Referrer</th>
              <th className="px-4 py-2 text-left">Referred User</th>
              <th className="px-4 py-2 text-right">Bonus</th>
              <th className="px-4 py-2 text-center">Bonus Paid</th>
              <th className="px-4 py-2 text-center">Date</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((referral) => (
              <tr key={referral.id} className="border-b border-slate-700 hover:bg-slate-700 transition">
                <td className="px-4 py-3 text-sm">{referral.referrer_profile?.email}</td>
                <td className="px-4 py-3 text-sm">{referral.referred_profile?.email}</td>
                <td className="px-4 py-3 text-right text-green-400 font-semibold">
                  ${Number(referral.bonus_amount).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    referral.bonus_paid 
                      ? 'bg-green-900 text-green-200' 
                      : 'bg-yellow-900 text-yellow-200'
                  }`}>
                    {referral.bonus_paid ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xs">
                  {new Date(referral.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-slate-400 text-sm">Total Referrals: {referrals.length}</p>
    </div>
  );
};

export default AdminReferralsTab;
