import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const Investments = () => {
  const [investments, setInvestments] = useState<any[]>([]);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('investments')
      .select(`
        *,
        investment_plans(name, roi_percentage, duration_days)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setInvestments(data || []);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Investments</h1>
        <p className="text-muted-foreground mt-2">Track your active and completed investments</p>
      </div>

      <div className="grid gap-6">
        {investments.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">No investments yet</p>
            </CardContent>
          </Card>
        ) : (
          investments.map((investment) => (
            <Card key={investment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{investment.investment_plans?.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Started: {format(new Date(investment.start_date), 'PP')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(investment.status)}>
                    {investment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Invested</p>
                    <p className="text-lg font-bold">${investment.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Profit</p>
                    <p className="text-lg font-bold text-green-600">${investment.expected_profit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className="text-lg font-bold">{investment.investment_plans?.roi_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="text-lg font-bold">
                      {format(new Date(investment.end_date), 'PP')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Investments;
