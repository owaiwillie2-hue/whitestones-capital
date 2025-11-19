import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminSettingsTab = () => {
  const [settings, setSettings] = useState({
    company_email: '',
    company_phone: '',
    company_address: '',
    bitcoin_address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('website_settings')
        .select('key, value');

      if (data) {
        const settingsMap: any = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value;
        });
        setSettings({
          company_email: settingsMap.company_email || '',
          company_phone: settingsMap.company_phone || '',
          company_address: settingsMap.company_address || '',
          bitcoin_address: settingsMap.bitcoin_address || '',
        });
      }
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { data: existing } = await supabase
          .from('website_settings')
          .select('id')
          .eq('key', key)
          .single();

        if (existing) {
          await supabase
            .from('website_settings')
            .update({ value })
            .eq('key', key);
        } else {
          await supabase
            .from('website_settings')
            .insert({ key, value });
        }
      }

      toast.success('Settings updated! Changes will appear on the website instantly.');
      fetchSettings();
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Website Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">Company Email</Label>
            <Input
              id="email"
              value={settings.company_email}
              onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="contact@example.com"
            />
            <p className="text-xs text-slate-400">This email will appear on the website footer and contact page</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-200">Company Phone</Label>
            <Input
              id="phone"
              value={settings.company_phone}
              onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="+1 (555) 123-4567"
            />
            <p className="text-xs text-slate-400">This phone will appear on the website footer</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-slate-200">Company Address</Label>
            <Input
              id="address"
              value={settings.company_address}
              onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Street, City, Country, Postal Code"
            />
            <p className="text-xs text-slate-400">This address will appear on the website footer</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bitcoin" className="text-slate-200">Bitcoin Address</Label>
            <Input
              id="bitcoin"
              value={settings.bitcoin_address}
              onChange={(e) => setSettings({ ...settings, bitcoin_address: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="bc1q..."
            />
            <p className="text-xs text-slate-400">This Bitcoin address will appear on deposit page</p>
          </div>

          <div className="pt-4 border-t border-slate-600">
            <p className="text-sm text-slate-300 mb-4">
              ✓ All changes will appear on the website instantly
            </p>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsTab;
