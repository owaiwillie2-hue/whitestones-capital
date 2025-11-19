import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2 } from 'lucide-react';

const WithdrawalAccounts = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('withdrawal_accounts')
      .select('*')
      .eq('user_id', user.id);

    setAccounts(data || []);
  };

  const handleAddAccount = async (type: string, formData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('withdrawal_accounts').insert([{
        user_id: user.id,
        account_type: type as any,
        account_name: formData.name,
        account_details: formData
      }]);

      if (error) throw error;

      toast({
        title: 'Account Added',
        description: 'Withdrawal account has been added successfully.',
      });

      fetchAccounts();
      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('withdrawal_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Account Deleted',
        description: 'Withdrawal account has been removed.',
      });

      fetchAccounts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const BankForm = () => {
    const [formData, setFormData] = useState<any>({});
    const isFormValid = formData.name && formData.accountNumber && formData.bankName && formData.routingNumber;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label><span className="text-red-500">*</span> Account Holder Name</Label>
          <Input 
            placeholder="Full name"
            required 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label><span className="text-red-500">*</span> Account Number</Label>
          <Input 
            placeholder="Account number"
            required 
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label><span className="text-red-500">*</span> Routing Number</Label>
          <Input 
            placeholder="Routing number"
            required 
            onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label><span className="text-red-500">*</span> Bank Name</Label>
          <Input 
            placeholder="Bank name"
            required 
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Swift Code/BIC</Label>
          <Input 
            placeholder="Optional: SWIFT code or BIC"
            onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })} 
          />
        </div>
        <Button 
          onClick={() => handleAddAccount('bank', formData)} 
          className="w-full"
          disabled={!isFormValid}
        >
          Add Account
        </Button>
      </div>
    );
  };

  const CryptoForm = () => {
    const [formData, setFormData] = useState<any>({});
    const isFormValid = formData.name && formData.address;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label><span className="text-red-500">*</span> Wallet Name</Label>
          <select
            className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          >
            <option value="">Select wallet</option>
            <option value="Bitcoin">Bitcoin</option>
            <option value="Ethereum">Ethereum</option>
            <option value="Litecoin">Litecoin</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label><span className="text-red-500">*</span> Wallet Address</Label>
          <Input 
            placeholder="Wallet address"
            required 
            onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
          />
        </div>
        <Button 
          onClick={() => handleAddAccount('crypto', formData)} 
          className="w-full"
          disabled={!isFormValid}
        >
          Add Wallet
        </Button>
      </div>
    );
  };

  const PayPalForm = () => {
    const [formData, setFormData] = useState<any>({});
    const isFormValid = formData.email;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label><span className="text-red-500">*</span> PayPal Email</Label>
          <Input 
            type="email"
            placeholder="your.email@paypal.com"
            required
            onChange={(e) => setFormData({ ...formData, email: e.target.value, name: e.target.value })} 
          />
        </div>
        <Button 
          onClick={() => handleAddAccount('paypal', formData)} 
          className="w-full"
          disabled={!isFormValid}
        >
          Add PayPal
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Withdrawal Accounts</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Withdrawal Account</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="bank">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="bank">Bank</TabsTrigger>
                    <TabsTrigger value="crypto">Crypto</TabsTrigger>
                    <TabsTrigger value="paypal">PayPal</TabsTrigger>
                  </TabsList>
                  <TabsContent value="bank">
                    <BankForm />
                  </TabsContent>
                  <TabsContent value="crypto">
                    <CryptoForm />
                  </TabsContent>
                  <TabsContent value="paypal">
                    <PayPalForm />
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No withdrawal accounts added yet
            </p>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{account.account_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{account.account_type}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WithdrawalAccounts;
