'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  Twitch,
  Music,
  Globe,
  Users,
  Check,
  Plus,
  Image as ImageIcon,
  Video,
  FileVideo,
  AlertCircle,
  ChevronRight,
  Clock,
  Play,
  Info,
  TrendingUp,
  Mic,
  Package,
  Handshake,
  CheckCircle,
  Send,
  Lock,
  Shield,
  X,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

// Platform icon component
const PlatformIcon = ({ platform, className = "w-4 h-4" }: { platform: string; className?: string }) => {
  switch (platform) {
    case 'YOUTUBE':
      return <Youtube className={`${className} text-red-500`} />;
    case 'INSTAGRAM':
      return <Instagram className={`${className} text-pink-500`} />;
    case 'TIKTOK':
      return <Music className={`${className} text-gray-900`} />;
    case 'TWITTER':
      return <Twitter className={`${className} text-blue-400`} />;
    case 'FACEBOOK':
      return <Facebook className={`${className} text-blue-600`} />;
    case 'TWITCH':
      return <Twitch className={`${className} text-purple-500`} />;
    default:
      return <Globe className={`${className} text-gray-500`} />;
  }
};

// Niche display names
const NICHE_LABELS: Record<string, string> = {
  FINANCE: 'Finance',
  BUSINESS: 'Business',
  TECH: 'Technology',
  HEALTH_WELLNESS: 'Health & Wellness',
  FITNESS: 'Fitness',
  EDUCATION: 'Education',
  BEAUTY: 'Beauty',
  FASHION: 'Fashion',
  FOOD: 'Food',
  TRAVEL: 'Travel',
  SPORTS: 'Sports',
  GAMING: 'Gaming',
  MUSIC: 'Music',
  COMEDY: 'Comedy',
  LIFESTYLE: 'Lifestyle',
};

interface ChannelInfo {
  channelId: string;
  channelName: string;
  platform: string;
  placement: string;
  placementLabel: string;
  subscribers: number;
  price: number;
}

interface CollabRequest {
  id: string;
  brandId: string;
  creatorId: string;
  channels: ChannelInfo[];
  totalPrice: number;
  message?: string;
  status: string;
  adId?: string;
  createdAt: string;
  brand: {
    id: string;
    name: string;
    avatar?: string;
    industry?: string;
  };
  creator: {
    id: string;
    name: string;
    avatar?: string;
    niches?: string[];
  };
  ad?: {
    id: string;
    title: string;
    images: string[];
    videos: string[];
  };
}

interface Ad {
  id: string;
  title: string;
  description?: string;
  images: string[];
  videos: string[];
  scriptRequired?: boolean;
  status: string;
  createdAt: string;
}

function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function formatNumber(num: number | null | undefined): string {
  if (num == null) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export default function CompleteCollaborationPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [collabRequest, setCollabRequest] = useState<CollabRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [step, setStep] = useState<'ad' | 'review'>('ad');

  // Checkout state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
      return;
    }

    const decoded = decodeJWT(storedToken);
    if (!decoded || decoded.type !== 'BRAND') {
      router.push('/dashboard');
      return;
    }

    setUser(decoded);
    setToken(storedToken);
    fetchCollabRequest(storedToken);
  }, [requestId]);

  // Auto-select the ad from the collaboration request (ad is already attached when request was sent)
  useEffect(() => {
    if (collabRequest?.ad) {
      // The ad was selected when the request was sent - it's locked
      setSelectedAd(collabRequest.ad as Ad);
    }
  }, [collabRequest]);

  const fetchCollabRequest = async (authToken: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/collaboration-requests/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch collaboration request');
      }

      const data = await response.json();

      if (data.status !== 'ACCEPTED' && data.status !== 'AD_SELECTED') {
        setError('This collaboration request must be accepted before completing');
        return;
      }

      setCollabRequest(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load collaboration request');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 'ad' && selectedAd) {
      setStep('review');
    }
  };

  const handleBackStep = () => {
    if (step === 'review') {
      setStep('ad');
    }
  };

  const handleComplete = () => {
    if (!selectedAd || !collabRequest || !token) return;
    setShowCheckoutModal(true);
    setCheckoutError(null);
  };

  // Process checkout - attach ad and initiate Paystack payment
  const processCheckout = async () => {
    if (!selectedAd || !collabRequest || !token) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      // First, attach the ad to the collaboration request
      const attachResponse = await fetch(`http://localhost:5000/api/collaboration-requests/${requestId}/attach-ad`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adId: selectedAd.id
        })
      });

      if (!attachResponse.ok) {
        const err = await attachResponse.json();
        throw new Error(err.error || 'Failed to attach ad material');
      }

      // Initialize payment with Paystack
      const initResponse = await fetch(`http://localhost:5000/api/collaboration-requests/${requestId}/pay/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: totalPrice,
          callbackUrl: `${window.location.origin}/complete-collab/${requestId}?verify=true`
        })
      });

      if (!initResponse.ok) {
        const err = await initResponse.json();
        throw new Error(err.error || 'Failed to initialize payment');
      }

      const result = await initResponse.json();
      setPaymentReference(result.reference);

      // Redirect to Paystack checkout page (same tab)
      window.location.href = result.authorizationUrl;
    } catch (err: any) {
      setCheckoutError(err.message || 'Something went wrong. Please try again.');
      setCheckoutLoading(false);
    }
  };

  // Handle Paystack callback (redirect flow)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verify = urlParams.get('verify');
    const reference = urlParams.get('reference');

    if (verify === 'true' && reference && token) {
      const verifyPayment = async () => {
        setCheckoutLoading(true);
        setShowCheckoutModal(true);

        try {
          const response = await fetch(`http://localhost:5000/api/collaboration-requests/${requestId}/pay/verify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reference })
          });

          if (response.ok) {
            setCheckoutSuccess(true);

            // Clean up URL
            window.history.replaceState({}, '', `/complete-collab/${requestId}`);

            setTimeout(() => {
              router.push('/dashboard?view=requests');
            }, 2500);
          } else {
            const err = await response.json();
            setCheckoutError(err.error || 'Payment verification failed.');
          }
        } catch (error) {
          setCheckoutError('Payment verification failed. Please contact support.');
        } finally {
          setCheckoutLoading(false);
        }
      };

      verifyPayment();
    }
  }, [token, requestId, router]);

  // Calculate totals from collab request - price is already finalized (includes ad material cost)
  const totalPrice = collabRequest?.totalPrice || 0;
  const totalReach = collabRequest?.channels.reduce((sum, ch) => sum + (ch.subscribers || 0), 0) || 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading collaboration...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !collabRequest) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error || 'Collaboration not found'}</p>
            <button
              onClick={() => router.push('/dashboard?view=requests')}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Back to Requests
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard?view=requests')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Complete Collaboration</h1>
              <p className="text-gray-600">
                Select ad material for {collabRequest.creator.name}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Creator Accepted</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                step === 'ad' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setStep('ad')}
            >
              <FileVideo className="w-4 h-4" />
              <span className="text-sm font-medium">1. Review Details</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                step === 'review' ? 'bg-gray-900 text-white' : selectedAd ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
              }`}
              onClick={() => selectedAd && setStep('review')}
            >
              <Send className="w-4 h-4" />
              <span className="text-sm font-medium">2. Complete</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              {step === 'ad' && (
                <motion.div
                  key="ad"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* Creator Info Card */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Collaborating With</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                        {collabRequest.creator.avatar ? (
                          <img
                            src={`http://localhost:5000${collabRequest.creator.avatar}`}
                            alt={collabRequest.creator.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-semibold text-gray-400">
                            {collabRequest.creator.name[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-lg">{collabRequest.creator.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-500">
                            {collabRequest.channels.length} {collabRequest.channels.length === 1 ? 'platform' : 'platforms'}
                          </p>
                          {collabRequest.creator.niches && collabRequest.creator.niches.length > 0 && (
                            <>
                              <span className="text-xs text-gray-300">•</span>
                              <p className="text-sm text-gray-500">
                                {collabRequest.creator.niches.slice(0, 2).map(n => NICHE_LABELS[n] || n).join(', ')}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        Accepted
                      </div>
                    </div>

                    {/* Channels */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Selected Platforms:</p>
                      <div className="flex flex-wrap gap-2">
                        {collabRequest.channels.map((ch, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                            <PlatformIcon platform={ch.platform} className="w-4 h-4" />
                            <span className="text-sm font-medium text-gray-700">{ch.channelName}</span>
                            <span className="text-xs text-gray-400">• {ch.placementLabel}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Ad Material - Locked (selected when request was sent) */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Ad Material</h3>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    </div>

                    {!selectedAd ? (
                      <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading ad material...</p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border-2 border-gray-900 bg-gray-50">
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {selectedAd.images && selectedAd.images.length > 0 ? (
                              <img
                                src={`http://localhost:5000${selectedAd.images[0]}`}
                                alt={selectedAd.title}
                                className="w-full h-full object-cover"
                              />
                            ) : selectedAd.videos && selectedAd.videos.length > 0 ? (
                              <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
                                <Play className="w-8 h-8 text-gray-500" />
                              </div>
                            ) : (
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-gray-900">{selectedAd.title}</h4>
                              <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            {selectedAd.description && (
                              <p className="text-sm text-gray-500 mt-1">{selectedAd.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-3">
                              {selectedAd.images && selectedAd.images.length > 0 && (
                                <span className="text-xs text-gray-600 flex items-center gap-1 bg-white px-2 py-1 rounded">
                                  <ImageIcon className="w-3 h-3" /> {selectedAd.images.length} image{selectedAd.images.length > 1 ? 's' : ''}
                                </span>
                              )}
                              {selectedAd.videos && selectedAd.videos.length > 0 && (
                                <span className="text-xs text-gray-600 flex items-center gap-1 bg-white px-2 py-1 rounded">
                                  <Video className="w-3 h-3" /> {selectedAd.videos.length} video{selectedAd.videos.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                          This ad material was selected when the collaboration request was sent and cannot be changed.
                        </p>
                      </div>
                    )}
                  </div>

                </motion.div>
              )}

              {step === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* Selected Ad Summary */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Ad Material</h3>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    </div>
                    {selectedAd && (
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          {selectedAd.images && selectedAd.images.length > 0 ? (
                            <img
                              src={`http://localhost:5000${selectedAd.images[0]}`}
                              alt={selectedAd.title}
                              className="w-full h-full object-cover"
                            />
                          ) : selectedAd.videos && selectedAd.videos.length > 0 ? (
                            <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
                              <Play className="w-8 h-8 text-gray-500" />
                            </div>
                          ) : (
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{selectedAd.title}</h4>
                          {selectedAd.description && (
                            <p className="text-sm text-gray-500 mt-1">{selectedAd.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-3">
                            {selectedAd.images && selectedAd.images.length > 0 && (
                              <span className="text-xs text-gray-600 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                <ImageIcon className="w-3 h-3" /> {selectedAd.images.length} image{selectedAd.images.length > 1 ? 's' : ''}
                              </span>
                            )}
                            {selectedAd.videos && selectedAd.videos.length > 0 && (
                              <span className="text-xs text-gray-600 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                <Video className="w-3 h-3" /> {selectedAd.videos.length} video{selectedAd.videos.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Creator Summary */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Creator</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {collabRequest.creator.avatar ? (
                          <img
                            src={`http://localhost:5000${collabRequest.creator.avatar}`}
                            alt={collabRequest.creator.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-gray-400">
                            {collabRequest.creator.name[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{collabRequest.creator.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {collabRequest.channels.map(channel => (
                            <PlatformIcon key={channel.channelId} platform={channel.platform} className="w-4 h-4" />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Price Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Platform placements ({collabRequest.channels.length})</span>
                        <span className="text-gray-900">Included</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Ad material</span>
                        <span className="text-gray-900">Included</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Total</span>
                          <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Message */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">Ready to Complete</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Once you complete this collaboration, {collabRequest.creator.name} will receive your ad material and the campaign will be marked as active.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Collaboration Summary</h2>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Handshake className="w-4 h-4" />
                    Creator
                  </span>
                  <span className="font-medium text-gray-900">{collabRequest.creator.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Platforms
                  </span>
                  <span className="font-medium text-gray-900">{collabRequest.channels.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Reach
                  </span>
                  <span className="font-medium text-gray-900">{formatNumber(totalReach)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FileVideo className="w-4 h-4" />
                    Ad Material
                  </span>
                  <span className={`font-medium ${selectedAd ? 'text-green-500' : 'text-amber-600'}`}>
                    {selectedAd ? 'Included' : 'Loading...'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium">Total</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {step === 'ad' && (
                <button
                  onClick={handleNextStep}
                  disabled={!selectedAd}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedAd
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Review
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 'review' && (
                <div className="space-y-3">
                  <button
                    onClick={handleComplete}
                    disabled={checkoutLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-100 text-green-700 border border-green-300 rounded-xl text-sm font-medium hover:bg-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Complete Collaboration
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBackStep}
                    className="w-full py-3 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                  >
                    Back to Ad Selection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
              {checkoutSuccess ? (
                /* Success State */
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                  <p className="text-gray-600 mb-6">
                    Your campaign is now active. {collabRequest?.creator?.name} has been notified and can access your ad material.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Redirecting to campaigns...
                  </div>
                </div>
              ) : (
                /* Payment Confirmation */
                <>
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
                        <p className="text-sm text-gray-500 mt-1">Secure checkout with Paystack</p>
                      </div>
                      <button
                        onClick={() => setShowCheckoutModal(false)}
                        disabled={checkoutLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Creator</span>
                          <span className="text-gray-900 font-medium">{collabRequest?.creator?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{collabRequest?.channels?.length || 0} placements</span>
                          <span className="text-gray-900">Included</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ad material</span>
                          <span className="text-gray-900">Included</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-900">Total</span>
                            <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {checkoutError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {checkoutError}
                      </div>
                    )}

                    {/* Security Note */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Secure payment powered by Paystack</span>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-100">
                    <button
                      onClick={processCheckout}
                      disabled={checkoutLoading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-100 text-green-700 border border-green-300 rounded-xl font-medium hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {checkoutLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Pay {formatPrice(totalPrice)}
                        </>
                      )}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-3">
                      By completing this purchase, you agree to our terms of service
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
