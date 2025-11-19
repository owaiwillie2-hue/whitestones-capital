import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';

interface AdminKYCTabProps {
  onUpdate: () => void;
}

const AdminKYCTab = ({ onUpdate }: AdminKYCTabProps) => {
  const [kycs, setKycs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKYC, setSelectedKYC] = useState<any>(null);
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    fetchKYCs();
  }, []);

  const fetchKYCs = async () => {
    try {
      const { data } = await supabase
        .from('kyc_documents')
        .select(`
          *,
          profiles!user_id(email, full_name)
        `)
        .order('submitted_at', { ascending: false });

      setKycs(data || []);
    } catch (error) {
      toast.error('Failed to fetch KYC documents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (kycId: string, userId: string) => {
    try {
      await supabase
        .from('kyc_documents')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', kycId);

      toast.success('KYC approved!');
      fetchKYCs();
      onUpdate();
    } catch (error) {
      toast.error('Error approving KYC');
    }
  };

  const handleReject = async (kycId: string) => {
    try {
      await supabase
        .from('kyc_documents')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', kycId);

      toast.success('KYC rejected');
      fetchKYCs();
      onUpdate();
    } catch (error) {
      toast.error('Error rejecting KYC');
    }
  };

  const getImageUrl = (filename: string) => {
    const supabaseUrl = 'https://elrofncgydzlvixekjxj.supabase.co';
    return `${supabaseUrl}/storage/v1/object/public/kyc-documents/${filename}`;
  };

  if (loading) {
    return <div className="text-white">Loading KYC documents...</div>;
  }

  return (
    <div className="space-y-4">
      {showImages && selectedKYC && (
        <div className="bg-slate-700 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">{selectedKYC.profiles?.email}</h3>
            <Button onClick={() => setShowImages(false)} variant="outline" size="sm">Close</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedKYC.id_front_url && (
              <div>
                <p className="text-slate-300 text-sm mb-2">ID Front</p>
                <img 
                  src={getImageUrl(selectedKYC.id_front_url)} 
                  alt="ID Front" 
                  className="rounded border border-slate-600 max-h-48 object-cover w-full"
                />
              </div>
            )}
            {selectedKYC.id_back_url && (
              <div>
                <p className="text-slate-300 text-sm mb-2">ID Back</p>
                <img 
                  src={getImageUrl(selectedKYC.id_back_url)} 
                  alt="ID Back" 
                  className="rounded border border-slate-600 max-h-48 object-cover w-full"
                />
              </div>
            )}
            {selectedKYC.selfie_url && (
              <div>
                <p className="text-slate-300 text-sm mb-2">Selfie</p>
                <img 
                  src={getImageUrl(selectedKYC.selfie_url)} 
                  alt="Selfie" 
                  className="rounded border border-slate-600 max-h-48 object-cover w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700">
            <tr>
              <th className="px-4 py-2 text-left">User Email</th>
              <th className="px-4 py-2 text-left">ID Number</th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-center">Submitted</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {kycs.map((kyc) => (
              <tr key={kyc.id} className="border-b border-slate-700 hover:bg-slate-700 transition">
                <td className="px-4 py-3">{kyc.profiles?.email}</td>
                <td className="px-4 py-3 text-sm">{kyc.id_number || 'N/A'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    kyc.status === 'approved' 
                      ? 'bg-green-900 text-green-200' 
                      : kyc.status === 'pending'
                      ? 'bg-yellow-900 text-yellow-200'
                      : kyc.status === 'under_review'
                      ? 'bg-blue-900 text-blue-200'
                      : 'bg-red-900 text-red-200'
                  }`}>
                    {kyc.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xs">
                  {new Date(kyc.submitted_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedKYC(kyc);
                      setShowImages(true);
                    }}
                    variant="outline"
                    className="text-xs"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {kyc.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(kyc.id, kyc.user_id)}
                        className="bg-green-600 hover:bg-green-700 text-xs"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(kyc.id)}
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

export default AdminKYCTab;
