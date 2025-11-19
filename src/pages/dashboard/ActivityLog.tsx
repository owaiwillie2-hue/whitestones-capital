import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Smartphone, Laptop, Tablet } from 'lucide-react';

const ActivityLog = () => {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setActivities(data || []);
  };

  const getDeviceIcon = (deviceName: string | null) => {
    if (!deviceName) return <Smartphone className="w-4 h-4" />;
    
    const lower = deviceName.toLowerCase();
    if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) {
      return <Smartphone className="w-4 h-4" />;
    } else if (lower.includes('tablet') || lower.includes('ipad')) {
      return <Tablet className="w-4 h-4" />;
    } else if (lower.includes('desktop') || lower.includes('windows') || lower.includes('mac') || lower.includes('linux')) {
      return <Laptop className="w-4 h-4" />;
    }
    return <Smartphone className="w-4 h-4" />;
  };

  const getDeviceDisplay = (deviceName: string | null) => {
    if (!deviceName) return 'Unknown Device';
    return deviceName.charAt(0).toUpperCase() + deviceName.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No activity logs yet</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(activity.created_at), 'PPpp')}
                    </p>
                  </div>
                  <div className="text-muted-foreground">
                    {getDeviceIcon(activity.device_name)}
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t">
                  {activity.device_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Device:</span>
                      <span className="text-xs text-muted-foreground">
                        {getDeviceDisplay(activity.device_name)}
                      </span>
                    </div>
                  )}
                  
                  {activity.location && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Location:</span>
                      <span className="text-xs text-muted-foreground">{activity.location}</span>
                    </div>
                  )}

                  {activity.ip_address && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">IP Address:</span>
                      <span className="text-xs text-muted-foreground font-mono">{activity.ip_address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
