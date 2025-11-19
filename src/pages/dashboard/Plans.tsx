import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Plans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('is_active', true)
      .order('min_amount');

    setPlans(data || []);
  };

  const handleInvest = async () => {
    if (!selectedPlan) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const investAmount = parseFloat(amount);
      if (!investAmount || investAmount <= 0) {
        throw new Error('Please enter a valid investment amount');
      }

      if (investAmount < selectedPlan.min_amount || (selectedPlan.max_amount && investAmount > selectedPlan.max_amount)) {
        throw new Error(`Invalid investment amount. Min: $${selectedPlan.min_amount}${selectedPlan.max_amount ? `, Max: $${selectedPlan.max_amount}` : ''}`);
      }

      // Fetch user's account balance
      const { data: balanceData } = await supabase
        .from('account_balances')
        .select('main_balance')
        .eq('user_id', user.id)
        .single();

      if (!balanceData) {
        throw new Error('Unable to fetch account balance. Please contact support.');
      }

      const currentBalance = Number(balanceData.main_balance) || 0;
      if (currentBalance < investAmount) {
        throw new Error(`Insufficient balance. You have $${currentBalance.toFixed(2)} but need $${investAmount.toFixed(2)} to invest.`);
      }

      const expectedProfit = (investAmount * selectedPlan.roi_percentage) / 100;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedPlan.duration_days);

      const { error } = await supabase.from('investments').insert({
        user_id: user.id,
        plan_id: selectedPlan.id,
        amount: investAmount,
        expected_profit: expectedProfit,
        end_date: endDate.toISOString(),
        status: 'active'
      });

      if (error) throw error;

      toast({
        title: 'Investment Created',
        description: 'Your investment has been successfully created!',
      });

      setAmount('');
      setSelectedPlan(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Investment Plans</h1>
        <p className="text-muted-foreground mt-2">Choose a plan that suits your goals</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-primary">{plan.roi_percentage}%</p>
                <p className="text-sm text-muted-foreground">ROI</p>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Min:</strong> ${plan.min_amount}</p>
                {plan.max_amount && <p><strong>Max:</strong> ${plan.max_amount}</p>}
                <p><strong>Duration:</strong> {plan.duration_days} days</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" onClick={() => setSelectedPlan(plan)}>
                    Invest Now
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invest in {plan.name}</DialogTitle>
                    <DialogDescription>Enter the amount you want to invest</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Investment Amount (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min={plan.min_amount}
                        max={plan.max_amount || undefined}
                        placeholder={`Min: $${plan.min_amount}`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleInvest} className="w-full" disabled={loading}>
                      {loading ? 'Creating...' : 'Confirm Investment'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Plans;
