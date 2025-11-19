import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const KYC = () => {
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [idNumber, setIdNumber] = useState<string>('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [activeSelfieCamera, setActiveSelfieCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setKycStatus(data);
  };

  // Helper to generate preview from file
  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  // Handle front ID file upload
  const handleFrontFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFrontFile(file);
    if (file) {
      const preview = await generatePreview(file);
      setFrontPreview(preview);
    } else {
      setFrontPreview(null);
    }
  };

  // Handle back ID file upload
  const handleBackFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBackFile(file);
    if (file) {
      const preview = await generatePreview(file);
      setBackPreview(preview);
    } else {
      setBackPreview(null);
    }
  };

  // Handle selfie file upload
  const handleSelfieFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelfieFile(file);
    if (file) {
      const preview = await generatePreview(file);
      setSelfiePreview(preview);
    } else {
      setSelfiePreview(null);
    }
  };

  // Clear selfie and allow retake
  const handleRetakeSelfie = () => {
    setSelfieFile(null);
    setSelfiePreview(null);
    setCameraOpen(false);
    // Stop camera if running
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontFile || !selfieFile || !idNumber) {
      toast({ title: 'Missing fields', description: 'Please provide ID number, front/back ID images and a selfie.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const bucket = (process.env.VITE_SUPABASE_KYC_BUCKET as string) || 'kyc-documents';

      // Upload front ID
      const frontExt = frontFile!.name.split('.').pop();
      const frontName = `${user.id}-id-front-${Date.now()}.${frontExt}`;
      const { error: frontError } = await supabase.storage
        .from(bucket)
        .upload(frontName, frontFile!);
      if (frontError) {
        if (frontError.message && frontError.message.toLowerCase().includes('bucket')) {
          throw new Error(`Storage bucket "${bucket}" not found. Please create this bucket in Supabase storage or contact support.`);
        }
        throw frontError;
      }

      // Upload back ID (optional)
      let backName: string | null = null;
      if (backFile) {
        const backExt = backFile.name.split('.').pop();
        backName = `${user.id}-id-back-${Date.now()}.${backExt}`;
        const { error: backError } = await supabase.storage.from(bucket).upload(backName, backFile);
        if (backError) throw backError;
      }

      // Upload selfie
      const selfieExt = selfieFile.name.split('.').pop();
      const selfieFileName = `${user.id}-selfie-${Date.now()}.${selfieExt}`;
      const { error: selfieError } = await supabase.storage
        .from(bucket)
        .upload(selfieFileName, selfieFile);
      if (selfieError) throw selfieError;

      // Save to database
      const { error } = await supabase.from('kyc_documents').upsert({
        user_id: user.id,
        id_number: idNumber,
        id_front_url: frontName,
        id_back_url: backName,
        selfie_url: selfieFileName,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: 'KYC Submitted',
        description: 'Your documents have been submitted for review.',
      });

      fetchKYCStatus();
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

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-500',
      under_review: 'bg-blue-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">KYC Verification</h1>
        <p className="text-muted-foreground mt-2">Complete your identity verification</p>
      </div>

      {kycStatus && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>KYC Status</CardTitle>
              {getStatusBadge(kycStatus.status)}
            </div>
          </CardHeader>
          <CardContent>
            {kycStatus.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800"><strong>Rejection Reason:</strong> {kycStatus.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(!kycStatus || kycStatus.status === 'rejected') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Identity Documents</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">You can take photos or upload files of your ID documents</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ID Number Field */}
              <div className="space-y-2">
                <Label htmlFor="idNumber" className="text-base font-semibold">ID / Passport Number *</Label>
                <Input
                  id="idNumber"
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g., A123456789"
                  required
                  className="text-base"
                />
              </div>

              {/* ID Documents Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">ID Documents</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Front ID Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Label className="text-base font-semibold">Front of ID *</Label>
                      {frontFile && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                    
                    {!frontPreview ? (
                      <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition duration-200">
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">Click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFrontFileChange}
                          className="hidden"
                          required
                        />
                      </label>
                    ) : (
                      <div className="relative group rounded-lg overflow-hidden border border-gray-300">
                        <img 
                          src={frontPreview} 
                          alt="Front ID Preview" 
                          className="w-full rounded-lg object-cover max-h-64" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                            onClick={() => {
                              setFrontFile(null);
                              setFrontPreview(null);
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Back ID Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Label className="text-base font-semibold">Back of ID <span className="text-gray-500 font-normal text-sm">(Optional)</span></Label>
                      {backFile && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                    
                    {!backPreview ? (
                      <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition duration-200">
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">Click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleBackFileChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative group rounded-lg overflow-hidden border border-gray-300">
                        <img 
                          src={backPreview} 
                          alt="Back ID Preview" 
                          className="w-full rounded-lg object-cover max-h-64" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                            onClick={() => {
                              setBackFile(null);
                              setBackPreview(null);
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Document Upload Tips:</p>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-disc">
                        <li>Ensure documents are clear and fully visible</li>
                        <li>Good lighting and no glare or reflections</li>
                        <li>All four corners of document should be visible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selfie Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Live Photo Verification</h3>
                <p className="text-sm text-gray-600">Take a selfie holding your ID document or upload a photo</p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Label className="text-base font-semibold">Selfie with ID *</Label>
                    {selfieFile && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>

                  {!selfiePreview && !activeSelfieCamera && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* File Upload Option */}
                      <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition duration-200">
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">Upload Photo</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleSelfieFileChange}
                          className="hidden"
                        />
                      </label>

                      {/* Camera Option */}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                            if (videoRef.current) {
                              videoRef.current.srcObject = stream;
                              setActiveSelfieCamera(true);
                            }
                          } catch (err) {
                            toast({ 
                              title: 'Camera Error', 
                              description: 'Unable to access camera. Please check permissions.',
                              variant: 'destructive'
                            });
                          }
                        }}
                        className="flex items-center justify-center w-full p-6 border-2 border-dashed border-primary rounded-lg cursor-pointer hover:bg-primary/5 transition duration-200"
                      >
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">Take Photo</p>
                          <p className="text-xs text-gray-500 mt-1">Use your device camera</p>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Camera View */}
                  {activeSelfieCamera && (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-black">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full aspect-video object-cover"
                        />
                      </div>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-900 font-semibold">Position your face clearly and hold your ID document visible in the photo</p>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          type="button" 
                          onClick={() => {
                            if (!videoRef.current) return;
                            const video = videoRef.current;
                            const canvas = document.createElement('canvas');
                            canvas.width = video.videoWidth || 640;
                            canvas.height = video.videoHeight || 480;
                            const ctx = canvas.getContext('2d');
                            if (!ctx) return;
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            canvas.toBlob((blob) => {
                              if (!blob) return;
                              const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
                              setSelfieFile(file);
                              generatePreview(file).then(preview => {
                                setSelfiePreview(preview);
                                const stream = video.srcObject as MediaStream | null;
                                stream?.getTracks().forEach(t => t.stop());
                                video.srcObject = null;
                                setActiveSelfieCamera(false);
                                toast({ 
                                  title: 'Photo Captured', 
                                  description: 'Selfie saved successfully.' 
                                });
                              });
                            }, 'image/jpeg');
                          }}
                          className="flex-1"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Capture Photo
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            if (videoRef.current) {
                              const stream = videoRef.current.srcObject as MediaStream | null;
                              stream?.getTracks().forEach(t => t.stop());
                              videoRef.current.srcObject = null;
                            }
                            setActiveSelfieCamera(false);
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Selfie Preview */}
                  {selfiePreview && (
                    <div className="space-y-3">
                      <div className="relative group rounded-lg overflow-hidden border border-gray-300">
                        <img 
                          src={selfiePreview} 
                          alt="Selfie Preview" 
                          className="w-full rounded-lg object-cover max-h-64" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            className="text-white border-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition"
                            onClick={() => {
                              setSelfieFile(null);
                              setSelfiePreview(null);
                              setActiveSelfieCamera(false);
                            }}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Retake Photo
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selfie Tips */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">Selfie Tips:</p>
                      <ul className="text-sm text-green-800 mt-2 space-y-1 ml-4 list-disc">
                        <li>Face clearly visible with good lighting</li>
                        <li>Hold your ID document next to your face</li>
                        <li>Ensure both your face and ID are in frame</li>
                        <li>No filters or heavy makeup</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 text-base"
                disabled={loading || !frontFile || !selfieFile || !idNumber}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {loading ? 'Submitting Documents...' : 'Submit KYC Verification'}
              </Button>

              <p className="text-xs text-gray-600 text-center">
                Your documents will be reviewed within 24-48 hours. You'll receive an email notification once verification is complete.
              </p>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Verification Complete */}
      {kycStatus && kycStatus.status === 'approved' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-12 w-12 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">Verification Approved!</h3>
                <p className="text-green-800 mt-1">Your identity has been verified. You now have full access to all platform features.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KYC;
