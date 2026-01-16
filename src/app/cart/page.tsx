'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Trash2,
  ArrowLeft,
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  Twitch,
  Music,
  Globe,
  CreditCard,
  Package,
  Users,
  Check,
  X,
  Plus,
  Image as ImageIcon,
  Video,
  FileVideo,
  AlertCircle,
  ChevronRight,
  Clock,
  Play,
  Lightbulb,
  Info,
  TrendingUp,
  Zap,
  Mic,
  CheckCircle,
  Lock,
  Shield,
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

interface CartItem {
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorNiches: string[];
  channelId: string;
  channelName: string;
  platform: string;
  placement: string; // Placement type (e.g., 'feed', 'story', 'reels')
  placementLabel: string; // Display label for the placement
  subscribers: number;
  price: number; // Price per 15 seconds (includes subscriber + niche + placement multiplier)
  announcementId?: string; // If sponsoring an announcement
}

// Niche display names - matches Prisma enum
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

interface Ad {
  id: string;
  title: string;
  description?: string;
  images: string[];
  videos: string[];
  scriptRequired?: boolean; // Whether creator needs to speak/narrate (for image-only ads)
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

// Tips for brands
const CAMPAIGN_TIPS = [
  {
    icon: Clock,
    title: "Optimal Ad Length",
    description: "15-30 second ads perform best for brand awareness. Longer ads (60s+) work better for product demos."
  },
  {
    icon: TrendingUp,
    title: "Maximize Reach",
    description: "Select creators across multiple platforms to reach diverse audiences and increase campaign impact."
  },
  {
    icon: Zap,
    title: "Clear Call-to-Action",
    description: "Include a clear CTA in your ad material. Tell viewers exactly what you want them to do next."
  },
  {
    icon: Users,
    title: "Audience Match",
    description: "Choose creators whose audience demographics align with your target customers for better ROI."
  },
];

export default function CampaignBuilderPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [loadingAds, setLoadingAds] = useState(true);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [imageDuration, setImageDuration] = useState<number>(15); // Default 15s for images
  const [scriptRequired, setScriptRequired] = useState<boolean>(false); // For image-only ads that need creator narration
  const [loadingVideoDuration, setLoadingVideoDuration] = useState(false);
  const [step, setStep] = useState<'creators' | 'ad' | 'review'>('creators');
  const videoRef = useRef<HTMLVideoElement>(null);

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
    loadCart();
    fetchAds(storedToken);
  }, []);

  // Load video duration when ad is selected
  useEffect(() => {
    if (selectedAd && selectedAd.videos.length > 0) {
      loadVideoDuration(selectedAd.videos[0]);
    } else {
      setVideoDuration(null);
    }
  }, [selectedAd]);

  const loadVideoDuration = (videoPath: string) => {
    setLoadingVideoDuration(true);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration);
      setLoadingVideoDuration(false);
    };
    video.onerror = () => {
      setVideoDuration(null);
      setLoadingVideoDuration(false);
    };
    video.src = `http://localhost:5000${videoPath}`;
  };

  const loadCart = () => {
    const cart = localStorage.getItem('brandCart');
    if (cart) {
      const items = JSON.parse(cart);
      setCartItems(items);
      setSelectedItems(items.map((item: CartItem) => item.channelId));
    }
  };

  const fetchAds = async (token: string) => {
    try {
      setLoadingAds(true);
      const response = await fetch('http://localhost:5000/api/ads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoadingAds(false);
    }
  };

  const saveCart = (items: CartItem[]) => {
    localStorage.setItem('brandCart', JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (channelId: string) => {
    const newItems = cartItems.filter(item => item.channelId !== channelId);
    setCartItems(newItems);
    setSelectedItems(prev => prev.filter(id => id !== channelId));
    saveCart(newItems);
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedItems([]);
    saveCart([]);
  };

  const toggleItem = (channelId: string) => {
    setSelectedItems(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.channelId));
    }
  };

  // Group cart items by creator
  const groupedItems = cartItems.reduce((acc, item) => {
    if (!acc[item.creatorId]) {
      acc[item.creatorId] = {
        creatorId: item.creatorId,
        creatorName: item.creatorName,
        creatorAvatar: item.creatorAvatar,
        creatorNiches: item.creatorNiches || [],
        channels: []
      };
    }
    acc[item.creatorId].channels.push(item);
    return acc;
  }, {} as Record<string, { creatorId: string; creatorName: string; creatorAvatar?: string; creatorNiches: string[]; channels: CartItem[] }>);

  // Calculate effective duration (from video or use image duration slider)
  const hasVideo = selectedAd?.videos && selectedAd.videos.length > 0;
  const effectiveDuration = hasVideo ? (videoDuration || 15) : imageDuration;

  // Calculate pricing based on duration
  // Price is per 15 seconds, so we multiply by (duration / 15)
  const durationMultiplier = Math.ceil(effectiveDuration / 15);

  // Script multiplier: 1.5x when image-only ad requires creator narration
  const scriptMultiplier = (!hasVideo && scriptRequired) ? 1.5 : 1;

  const selectedTotal = cartItems
    .filter(item => selectedItems.includes(item.channelId))
    .reduce((total, item) => total + (item.price * durationMultiplier * scriptMultiplier), 0);

  const totalReach = cartItems
    .filter(item => selectedItems.includes(item.channelId))
    .reduce((total, item) => total + (item.subscribers || 0), 0);

  const canProceedToAd = selectedItems.length > 0;
  const canProceedToReview = selectedAd !== null;
  const canCheckout = canProceedToAd && canProceedToReview;

  const handleCheckout = () => {
    if (!canCheckout) return;
    setShowCheckoutModal(true);
    setCheckoutError(null);
  };

  const processCheckout = async () => {
    if (!selectedAd) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Prepare items for checkout
      const checkoutItems = cartItems
        .filter(item => selectedItems.includes(item.channelId))
        .map(item => ({
          creatorId: item.creatorId,
          creatorName: item.creatorName,
          channelId: item.channelId,
          channelName: item.channelName,
          platform: item.platform,
          placement: item.placement,
          placementLabel: item.placementLabel,
          subscribers: item.subscribers,
          price: item.price * durationMultiplier * scriptMultiplier,
          announcementId: item.announcementId || undefined
        }));

      // Initialize payment with Paystack
      const response = await fetch('http://localhost:5000/api/checkout/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: checkoutItems,
          adId: selectedAd.id,
          totalAmount: selectedTotal,
          scriptRequired: scriptRequired,
          callbackUrl: `${window.location.origin}/cart?verify=true`
        })
      });

      if (response.ok) {
        const result = await response.json();
        setPaymentReference(result.reference);

        // Redirect to Paystack checkout page
        window.location.href = result.authorizationUrl;
      } else {
        const err = await response.json();
        setCheckoutError(err.error || 'Checkout failed. Please try again.');
        setCheckoutLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError('Something went wrong. Please try again.');
      setCheckoutLoading(false);
    }
  };

  // Handle Paystack callback (redirect flow)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verify = urlParams.get('verify');
    const reference = urlParams.get('reference');

    if (verify === 'true' && reference) {
      const verifyPayment = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setCheckoutLoading(true);
        setShowCheckoutModal(true);

        try {
          const response = await fetch('http://localhost:5000/api/checkout/verify', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reference })
          });

          if (response.ok) {
            setCheckoutSuccess(true);

            // Clear cart
            localStorage.setItem('brandCart', JSON.stringify([]));
            window.dispatchEvent(new Event('cartUpdated'));

            // Clean up URL
            window.history.replaceState({}, '', '/cart');

            setTimeout(() => {
              router.push('/dashboard?view=campaigns');
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
  }, [router]);

  const handleNextStep = () => {
    if (step === 'creators' && canProceedToAd) {
      setStep('ad');
    } else if (step === 'ad' && canProceedToReview) {
      setStep('review');
    }
  };

  const handleBackStep = () => {
    if (step === 'ad') {
      setStep('creators');
    } else if (step === 'review') {
      setStep('ad');
    }
  };

  // Get duration category for tips
  const getDurationCategory = () => {
    if (!videoDuration) return null;
    if (videoDuration <= 15) return 'short';
    if (videoDuration <= 30) return 'optimal';
    if (videoDuration <= 60) return 'medium';
    return 'long';
  };

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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Campaign Builder</h1>
              <p className="text-gray-600">
                {cartItems.length} {cartItems.length === 1 ? 'creator' : 'creators'} selected
              </p>
            </div>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                step === 'creators' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setStep('creators')}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">1. Creators</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                step === 'ad' ? 'bg-gray-900 text-white' : canProceedToAd ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
              }`}
              onClick={() => canProceedToAd && setStep('ad')}
            >
              <FileVideo className="w-4 h-4" />
              <span className="text-sm font-medium">2. Ad Material</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                step === 'review' ? 'bg-gray-900 text-white' : canProceedToReview ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
              }`}
              onClick={() => canProceedToReview && setStep('review')}
            >
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">3. Review</span>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl border border-gray-200"
          >
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No creators added</h2>
            <p className="text-gray-600 mb-6">Browse creators and add them to your campaign to get started</p>
            <button
              onClick={() => router.push('/hub')}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Browse Creators
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="wait">
                {step === 'creators' && (
                  <motion.div
                    key="creators"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {/* Select All */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={toggleAll}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedItems.length === cartItems.length
                              ? 'border-gray-900 bg-gray-900'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedItems.length === cartItems.length && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          Select All ({cartItems.length} platforms)
                        </span>
                      </label>
                    </div>

                    {/* Grouped by Creator */}
                    {Object.values(groupedItems).map((group) => (
                      <motion.div
                        key={group.creatorId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                      >
                        {/* Creator Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                              {group.creatorAvatar ? (
                                <img
                                  src={`http://localhost:5000${group.creatorAvatar}`}
                                  alt={group.creatorName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-400">
                                  {group.creatorName[0]}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{group.creatorName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-gray-500">
                                  {group.channels.length} {group.channels.length === 1 ? 'platform' : 'platforms'}
                                </p>
                                {group.creatorNiches.length > 0 && (
                                  <>
                                    <span className="text-xs text-gray-300">•</span>
                                    <p className="text-xs text-gray-500">
                                      {group.creatorNiches.slice(0, 2).map(n => NICHE_LABELS[n] || n).join(', ')}
                                      {group.creatorNiches.length > 2 && ` +${group.creatorNiches.length - 2}`}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Channels */}
                        <div className="divide-y divide-gray-100">
                          {group.channels.map((item) => {
                            const isSelected = selectedItems.includes(item.channelId);
                            return (
                              <div
                                key={item.channelId}
                                className={`p-4 flex items-center justify-between transition-colors ${
                                  isSelected ? 'bg-white' : 'bg-gray-50/50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    onClick={() => toggleItem(item.channelId)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-gray-900 bg-gray-900'
                                        : 'border-gray-300'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <PlatformIcon platform={item.platform} className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{item.channelName}</p>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs text-gray-500">
                                        {item.subscribers ? formatNumber(item.subscribers) + ' subscribers' : 'New channel'}
                                      </p>
                                      {item.placementLabel && (
                                        <>
                                          <span className="text-xs text-gray-300">•</span>
                                          <span className="text-xs text-blue-600 font-medium">{item.placementLabel}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeItem(item.channelId)}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}

                    {/* Tips Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Campaign Tips</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {CAMPAIGN_TIPS.slice(0, 2).map((tip, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                            <tip.icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{tip.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{tip.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add More Creators */}
                    <button
                      onClick={() => router.push('/hub')}
                      className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add More Creators
                    </button>
                  </motion.div>
                )}

                {step === 'ad' && (
                  <motion.div
                    key="ad"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Select Ad Material</h3>

                      {loadingAds ? (
                        <div className="py-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-600">Loading your ads...</p>
                        </div>
                      ) : ads.length === 0 ? (
                        <div className="py-8 text-center">
                          <FileVideo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600 mb-4">You haven't created any ads yet</p>
                          <button
                            onClick={() => router.push('/dashboard?view=ads')}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Create Ad
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {ads.map(ad => (
                            <div
                              key={ad.id}
                              onClick={() => {
                                setSelectedAd(ad);
                                // Set scriptRequired based on ad's setting (can be overridden)
                                setScriptRequired(ad.scriptRequired || false);
                              }}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedAd?.id === ad.id
                                  ? 'border-gray-900 bg-gray-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Thumbnail */}
                                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {ad.images.length > 0 ? (
                                    <img
                                      src={`http://localhost:5000${ad.images[0]}`}
                                      alt={ad.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : ad.videos.length > 0 ? (
                                    <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
                                      <Play className="w-8 h-8 text-gray-500" />
                                    </div>
                                  ) : (
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-medium text-gray-900 truncate">{ad.title}</h4>
                                    {selectedAd?.id === ad.id && (
                                      <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  {ad.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{ad.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    {ad.images.length > 0 && (
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3" /> {ad.images.length}
                                      </span>
                                    )}
                                    {ad.videos.length > 0 && (
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Video className="w-3 h-3" /> {ad.videos.length}
                                      </span>
                                    )}
                                    {ad.scriptRequired && (
                                      <span className="text-xs text-purple-600 flex items-center gap-1 font-medium">
                                        <Mic className="w-3 h-3" /> Script
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Video Duration Info */}
                    {selectedAd && (
                      <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Ad Duration & Pricing</h3>

                        {selectedAd.videos.length > 0 ? (
                          <div className="space-y-4">
                            {loadingVideoDuration ? (
                              <div className="flex items-center gap-2 text-gray-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                <span className="text-sm">Detecting video duration...</span>
                              </div>
                            ) : videoDuration ? (
                              <>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                                      <Clock className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">Video Duration</p>
                                      <p className="text-xs text-gray-500">Detected from your video</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">{formatDuration(videoDuration)}</p>
                                    <p className="text-xs text-gray-500">{durationMultiplier}x pricing multiplier</p>
                                  </div>
                                </div>

                                {/* Duration-based tip */}
                                {getDurationCategory() === 'long' && (
                                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium text-amber-800">Long Video Detected</p>
                                      <p className="text-xs text-amber-700 mt-0.5">
                                        Videos over 60 seconds may have lower completion rates. Consider a shorter version for better engagement.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {getDurationCategory() === 'optimal' && (
                                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium text-green-800">Optimal Length</p>
                                      <p className="text-xs text-green-700 mt-0.5">
                                        15-30 second ads have the highest engagement rates. Great choice!
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                <Info className="w-5 h-5 text-gray-500" />
                                <p className="text-sm text-gray-600">Unable to detect video duration. Default pricing will apply.</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Image Ad Duration</p>
                                    <p className="text-xs text-gray-500">Adjust how long your image will be displayed</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900">{formatDuration(imageDuration)}</p>
                                  <p className="text-xs text-gray-500">{Math.ceil(imageDuration / 15)}x pricing</p>
                                </div>
                              </div>

                              {/* Duration Slider */}
                              <div className="space-y-3">
                                <input
                                  type="range"
                                  min="15"
                                  max="90"
                                  step="15"
                                  value={imageDuration}
                                  onChange={(e) => setImageDuration(Number(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>15s</span>
                                  <span>30s</span>
                                  <span>45s</span>
                                  <span>60s</span>
                                  <span>75s</span>
                                  <span>90s</span>
                                </div>
                              </div>
                            </div>

                            {/* Duration recommendations */}
                            {imageDuration === 15 && (
                              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-blue-800">Quick Mention</p>
                                  <p className="text-xs text-blue-700 mt-0.5">
                                    15 seconds is ideal for simple brand mentions or logo placements.
                                  </p>
                                </div>
                              </div>
                            )}
                            {(imageDuration === 30 || imageDuration === 45) && (
                              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-green-800">Optimal Duration</p>
                                  <p className="text-xs text-green-700 mt-0.5">
                                    30-45 seconds gives creators enough time to explain your product while maintaining engagement.
                                  </p>
                                </div>
                              </div>
                            )}
                            {imageDuration >= 60 && (
                              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-amber-800">Extended Segment</p>
                                  <p className="text-xs text-amber-700 mt-0.5">
                                    Longer durations work best for detailed product demos or tutorials.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Script Required Toggle */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Mic className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Script Required</p>
                                    <p className="text-xs text-gray-500">Creator will speak/narrate about your product</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setScriptRequired(!scriptRequired)}
                                  className={`relative w-12 h-6 rounded-full transition-colors ${
                                    scriptRequired ? 'bg-purple-600' : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                      scriptRequired ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </div>
                              {scriptRequired && (
                                <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                  <p className="text-xs text-purple-800">
                                    <span className="font-medium">+50% charge applied.</span> Creator will read your script or talk about your product while displaying the image.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!selectedAd && (
                      <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-amber-800">Please select an ad material to continue</p>
                      </div>
                    )}

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
                      <h3 className="font-semibold text-gray-900 mb-4">Ad Material</h3>
                      {selectedAd && (
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                            {selectedAd.images.length > 0 ? (
                              <img
                                src={`http://localhost:5000${selectedAd.images[0]}`}
                                alt={selectedAd.title}
                                className="w-full h-full object-cover"
                              />
                            ) : selectedAd.videos.length > 0 ? (
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
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDuration(effectiveDuration)}
                              </span>
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {durationMultiplier}x multiplier
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Creators Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Selected Creators ({selectedItems.length} platforms)</h3>
                      <div className="space-y-3">
                        {Object.values(groupedItems).map((group) => {
                          const selectedChannels = group.channels.filter(c => selectedItems.includes(c.channelId));
                          if (selectedChannels.length === 0) return null;

                          return (
                            <div key={group.creatorId} className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                {group.creatorAvatar ? (
                                  <img
                                    src={`http://localhost:5000${group.creatorAvatar}`}
                                    alt={group.creatorName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold text-gray-400">
                                    {group.creatorName[0]}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900">{group.creatorName}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {selectedChannels.map(channel => (
                                    <PlatformIcon key={channel.channelId} platform={channel.platform} className="w-4 h-4" />
                                  ))}
                                  {group.creatorNiches.length > 0 && (
                                    <span className="text-xs text-gray-400 ml-1">
                                      ({group.creatorNiches.slice(0, 2).map(n => NICHE_LABELS[n] || n).join(', ')})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatPrice(selectedChannels.reduce((sum, c) => sum + (c.price * durationMultiplier), 0))}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                      <div className="space-y-3">
                        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                          <p className="font-medium text-gray-700 mb-1">Dynamic Pricing Formula:</p>
                          <p>Subscribers × Niche Multiplier × Duration{scriptMultiplier > 1 ? ' × Script Fee' : ''}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Price per 15s (all platforms)</span>
                          <span className="text-gray-900">
                            {formatPrice(cartItems.filter(item => selectedItems.includes(item.channelId)).reduce((total, item) => total + item.price, 0))}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Duration multiplier ({formatDuration(effectiveDuration)})</span>
                          <span className="text-gray-900">x{durationMultiplier}</span>
                        </div>
                        {scriptMultiplier > 1 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-purple-600">Script/narration fee</span>
                            <span className="text-purple-600 font-medium">+50%</span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">Total Campaign Cost</span>
                            <span className="text-xl font-bold text-gray-900">{formatPrice(selectedTotal)}</span>
                          </div>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h2>

                {/* Stats */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Platforms
                    </span>
                    <span className="font-medium text-gray-900">{selectedItems.length}</span>
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
                      <Clock className="w-4 h-4" />
                      Duration
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatDuration(effectiveDuration)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FileVideo className="w-4 h-4" />
                      Ad Material
                    </span>
                    <span className={`font-medium ${selectedAd ? 'text-green-500' : 'text-amber-600'}`}>
                      {selectedAd ? 'Selected' : 'Not selected'}
                    </span>
                  </div>
                  {scriptMultiplier > 1 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-600 flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        Script Required
                      </span>
                      <span className="font-medium text-purple-600">+50%</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">Total</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-gray-900">{formatPrice(selectedTotal)}</span>
                      <p className="text-xs text-gray-500">
                        {durationMultiplier > 1 ? `${durationMultiplier}x for ${formatDuration(effectiveDuration)}` : ''}
                        {durationMultiplier > 1 && scriptMultiplier > 1 ? ' + ' : ''}
                        {scriptMultiplier > 1 ? 'script fee' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {step === 'creators' && (
                  <button
                    onClick={handleNextStep}
                    disabled={!canProceedToAd}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                      canProceedToAd
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Continue to Ad Selection
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {step === 'ad' && (
                  <div className="space-y-3">
                    <button
                      onClick={handleNextStep}
                      disabled={!canProceedToReview}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                        canProceedToReview
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Review Campaign
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleBackStep}
                      className="w-full py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Back to Creators
                    </button>
                  </div>
                )}

                {step === 'review' && (
                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      disabled={!canCheckout}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                        canCheckout
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={handleBackStep}
                      className="w-full py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Back to Ad Selection
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
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
                    Your campaign has been created. Creators have been notified and can now view your ad material.
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

                  <div className="p-6 space-y-6">
                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{selectedItems.length} placements selected</span>
                          <span className="text-gray-900">{formatPrice(cartItems.filter(item => selectedItems.includes(item.channelId)).reduce((total, item) => total + item.price, 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration ({formatDuration(effectiveDuration)})</span>
                          <span className="text-gray-900">x{durationMultiplier}</span>
                        </div>
                        {scriptMultiplier > 1 && (
                          <div className="flex justify-between text-purple-600">
                            <span>Script/narration fee</span>
                            <span>+50%</span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-900">Total</span>
                            <span className="text-gray-900">{formatPrice(selectedTotal)}</span>
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
                          Pay {formatPrice(selectedTotal)}
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
