'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, MapPin, TrendingUp, Users, X, Globe, Briefcase, ExternalLink, Youtube, Instagram, Twitter, Facebook, Twitch, Music, MessageSquare, Link2, DollarSign, Clock, Check, ShoppingCart, Calendar, Video, Plus, Send, Image, Upload, FileText, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';

const platformEmojis: Record<string, string> = {
  YOUTUBE: '📺',
  INSTAGRAM: '📸',
  TIKTOK: '🎵',
  TWITTER: '🐦',
  FACEBOOK: '👥',
  TWITCH: '🎮'
};

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

const NICHES = [
  { value: 'TECH', label: 'Tech' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'GAMING', label: 'Gaming' },
  { value: 'FASHION', label: 'Fashion' },
  { value: 'FITNESS', label: 'Fitness' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'HEALTH_WELLNESS', label: 'Health & Wellness' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'BEAUTY', label: 'Beauty' },
  { value: 'FOOD', label: 'Food' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'MUSIC', label: 'Music' },
  { value: 'COMEDY', label: 'Comedy' },
  { value: 'LIFESTYLE', label: 'Lifestyle' },
];

const PLATFORMS = [
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'TWITTER', label: 'Twitter' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'TWITCH', label: 'Twitch' },
];

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

// ============= DYNAMIC PRICING MODEL =============
// Based on industry-standard sponsorship rates
// Formula: Estimated Views × CPM (Cost Per Mille) × Niche Multiplier × Duration Multiplier
//
// Industry benchmarks (for 30-90 sec integrated ad):
// - 1M sub Tech channel: $15,000 - $40,000 per video
// - Average views ÷ 1,000 × $40-$60 CPM
//
// We estimate views as ~10% of subscriber count (industry average)
// Base CPM: $50 (adjusted by niche)

// Niche CPM rates - reflects advertiser demand and conversion rates
// Must match Prisma enum: TECH, GAMING, BEAUTY, FASHION, FITNESS, FINANCE, FOOD, TRAVEL, LIFESTYLE, EDUCATION, SPORTS, MUSIC, COMEDY, BUSINESS, HEALTH_WELLNESS
const NICHE_CPM: Record<string, number> = {
  FINANCE: 80,            // High value - financial products, investments, high LTV customers
  BUSINESS: 70,           // High value - B2B, professional services, SaaS
  TECH: 60,               // High value - tech products, software, gadgets
  EDUCATION: 55,          // Good value - courses, educational products
  HEALTH_WELLNESS: 50,    // Good value - health products, fitness, supplements
  FITNESS: 50,            // Good value - fitness, gym, sports nutrition
  BEAUTY: 45,             // Moderate-high - cosmetics, skincare
  FASHION: 45,            // Moderate-high - clothing, accessories
  FOOD: 40,               // Moderate value - food & beverage, restaurants
  TRAVEL: 40,             // Moderate value - travel, hospitality
  SPORTS: 35,             // Standard value - sports gear, equipment
  GAMING: 35,             // Standard value - gaming products, peripherals
  LIFESTYLE: 35,          // Standard value - general lifestyle
  MUSIC: 30,              // Lower value - music products, events
  COMEDY: 25,             // Lower value - broad audience, lower intent
};

// View rate by platform (percentage of subscribers that typically view)
const PLATFORM_VIEW_RATES: Record<string, number> = {
  YOUTUBE: 0.10,      // ~10% of subs view a video
  INSTAGRAM: 0.15,    // ~15% engagement rate
  TIKTOK: 0.20,       // ~20% higher engagement
  TWITTER: 0.05,      // ~5% lower engagement
  FACEBOOK: 0.08,     // ~8% engagement
  TWITCH: 0.25,       // ~25% live viewers vs followers
};

// Duration multipliers for ad length
// Base rate is for 30-second integrated ad
const DURATION_PRICING: Record<string, { multiplier: number; label: string }> = {
  '15': { multiplier: 0.5, label: 'Short mention (15s)' },
  '30': { multiplier: 1.0, label: 'Standard integration (30s)' },
  '60': { multiplier: 1.8, label: 'Extended segment (60s)' },
  '90': { multiplier: 2.5, label: 'Deep dive (90s)' },
  'dedicated': { multiplier: 4.0, label: 'Dedicated video' },
};

// Platform placement types with pricing multipliers
// Feed posts are permanent and get more reach, stories are temporary (24h)
export interface PlacementType {
  id: string;
  label: string;
  description: string;
  multiplier: number; // Price multiplier (1.0 = base rate)
  duration?: string; // e.g., "24h" for stories
}

export const PLATFORM_PLACEMENTS: Record<string, PlacementType[]> = {
  YOUTUBE: [
    { id: 'video', label: 'Video', description: 'Main channel video', multiplier: 1.0 },
    { id: 'shorts', label: 'Shorts', description: 'Short-form vertical video', multiplier: 0.6 },
    { id: 'community', label: 'Community Post', description: 'Image/text post', multiplier: 0.3 },
  ],
  INSTAGRAM: [
    { id: 'feed', label: 'Feed Post', description: 'Permanent post on profile', multiplier: 1.0 },
    { id: 'story', label: 'Story', description: 'Temporary 24h visibility', multiplier: 0.4, duration: '24h' },
    { id: 'reels', label: 'Reels', description: 'Short-form video', multiplier: 0.8 },
  ],
  TIKTOK: [
    { id: 'video', label: 'Video Post', description: 'Main TikTok video', multiplier: 1.0 },
    { id: 'story', label: 'Story', description: 'Temporary visibility', multiplier: 0.3, duration: '24h' },
  ],
  TWITTER: [
    { id: 'tweet', label: 'Tweet', description: 'Standard tweet post', multiplier: 1.0 },
    { id: 'thread', label: 'Thread', description: 'Multi-tweet thread', multiplier: 1.5 },
  ],
  FACEBOOK: [
    { id: 'feed', label: 'Feed Post', description: 'Permanent post on page', multiplier: 1.0 },
    { id: 'story', label: 'Story', description: 'Temporary 24h visibility', multiplier: 0.4, duration: '24h' },
    { id: 'reels', label: 'Reels', description: 'Short-form video', multiplier: 0.7 },
  ],
  TWITCH: [
    { id: 'stream', label: 'Live Stream', description: 'Mention during stream', multiplier: 1.0 },
    { id: 'panel', label: 'Panel', description: 'Permanent panel link', multiplier: 0.5 },
  ],
};

// Get default placement for a platform
function getDefaultPlacement(platform: string): string {
  const placements = PLATFORM_PLACEMENTS[platform];
  return placements?.[0]?.id || 'default';
}

// Get placement multiplier
function getPlacementMultiplier(platform: string, placementId: string): number {
  const placements = PLATFORM_PLACEMENTS[platform];
  const placement = placements?.find(p => p.id === placementId);
  return placement?.multiplier || 1.0;
}

// Calculate estimated views based on subscribers and platform
function estimateViews(subscribers: number, platform: string): number {
  const viewRate = PLATFORM_VIEW_RATES[platform] || 0.10;
  return Math.round(subscribers * viewRate);
}

// Get CPM for niche - uses highest value niche if creator has multiple
function getNicheCPM(niches: string[] | null | undefined): number {
  if (!niches || niches.length === 0) return 35; // Default CPM
  const cpms = niches.map(niche => NICHE_CPM[niche] || 35);
  return Math.max(...cpms);
}

// Calculate price for a 30-second ad (base unit)
// Formula: (Estimated Views / 1000) × CPM
function calculateBasePriceFor30Seconds(
  subscribers: number | null | undefined,
  platform: string,
  niches?: string[] | null
): number {
  // $50 flat rate for channels with 0 subscribers (new creators starting out)
  if (!subscribers || subscribers === 0) return 50;

  const estimatedViews = estimateViews(subscribers, platform);
  const cpm = getNicheCPM(niches);

  // Price = (views / 1000) × CPM
  let price = (estimatedViews / 1000) * cpm;

  // Apply minimum thresholds based on subscriber tiers
  // Even small creators have value
  if (subscribers < 10000) {
    price = Math.max(100, price); // Minimum $100 for nano-influencers
  } else if (subscribers < 100000) {
    price = Math.max(500, price); // Minimum $500 for micro-influencers
  } else if (subscribers < 500000) {
    price = Math.max(2000, price); // Minimum $2,000 for mid-tier
  } else if (subscribers < 1000000) {
    price = Math.max(5000, price); // Minimum $5,000 for macro-influencers
  }

  return Math.round(price);
}

// Calculate price per 15 seconds (our base display unit)
// This is half of the 30-second rate, multiplied by placement multiplier
function calculatePricePer15Seconds(
  subscribers: number | null | undefined,
  niches?: string[] | null,
  platform: string = 'YOUTUBE',
  placement?: string
): number {
  const priceFor30s = calculateBasePriceFor30Seconds(subscribers, platform, niches);
  // 15 seconds = 0.5x of 30-second rate
  let price = priceFor30s * 0.5;

  // Apply placement multiplier if specified
  if (placement) {
    const placementMultiplier = getPlacementMultiplier(platform, placement);
    price = price * placementMultiplier;
  }

  return Math.round(price);
}

// Export for use in Campaign Builder - get full pricing details
function getChannelPricingDetails(
  subscribers: number | null | undefined,
  platform: string,
  niches?: string[] | null
) {
  const estimatedViews = subscribers ? estimateViews(subscribers, platform) : 0;
  const cpm = getNicheCPM(niches);
  const priceFor30s = calculateBasePriceFor30Seconds(subscribers, platform, niches);

  return {
    subscribers: subscribers || 0,
    estimatedViews,
    cpm,
    priceFor15s: Math.round(priceFor30s * 0.5),
    priceFor30s,
    priceFor60s: Math.round(priceFor30s * 1.8),
    priceFor90s: Math.round(priceFor30s * 2.5),
    priceForDedicated: Math.round(priceFor30s * 4.0),
  };
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

interface Creator {
  id: string;
  name: string;
  bio?: string;
  location?: string;
  avatar?: string;
  niches: string[];
  channels: {
    id: string;
    platform: string;
    channelName: string;
    subscribers: number;
    thumbnail?: string;
  }[];
  totalReach: number;
}

interface Brand {
  id: string;
  name: string;
  bio?: string;
  location?: string;
  avatar?: string;
  website?: string;
}

interface ContentAnnouncement {
  id: string;
  title: string;
  description: string;
  platforms: string[];
  channelIds?: string[];
  scheduledAt: string;
  thumbnail?: string;
  status: string;
  maxSlots: number;
  filledSlots: number;
  creator: {
    id: string;
    name: string;
    avatar?: string;
    channels?: {
      platform: string;
      subscribers: number;
    }[];
  };
}

// Cart item for storing selected creator channels
export interface CartItem {
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

// Helper to get cart from localStorage
function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem('brandCart');
  return cart ? JSON.parse(cart) : [];
}

// Helper to save cart to localStorage
function saveCart(cart: CartItem[]) {
  localStorage.setItem('brandCart', JSON.stringify(cart));
  // Dispatch custom event so other components can listen
  window.dispatchEvent(new Event('cartUpdated'));
}

function MarketplaceHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [minReach, setMinReach] = useState<string>('');
  const [maxReach, setMaxReach] = useState<string>('');

  // Profile modal state
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // Connect modal state
  const [connectCreator, setConnectCreator] = useState<Creator | null>(null);
  const [connectPlatformFilter, setConnectPlatformFilter] = useState<string[]>([]);
  const [connectChannelIdFilter, setConnectChannelIdFilter] = useState<string[]>([]);
  const [connectAnnouncementId, setConnectAnnouncementId] = useState<string | null>(null);

  // Coming Up view state
  const [viewMode, setViewMode] = useState<'creators' | 'coming-up'>('creators');
  const [announcements, setAnnouncements] = useState<ContentAnnouncement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  // Fetch content announcements
  const fetchAnnouncements = async () => {
    if (!token) return;
    setLoadingAnnouncements(true);
    try {
      const response = await fetch('http://localhost:5000/api/content-announcements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleToggleView = (mode: 'creators' | 'coming-up') => {
    setViewMode(mode);
    if (mode === 'coming-up') {
      fetchAnnouncements();
    }
  };

  // Handle connecting with a brand (for creators)
  const handleConnectWithBrand = async (brand: Brand) => {
    // Check if there's an existing conversation
    let hasExistingConversation = false;
    try {
      const storedToken = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/${brand.id}`, {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      });
      if (response.ok) {
        const messages = await response.json();
        hasExistingConversation = messages.length > 0;
      }
    } catch (err) {
      // If check fails, assume no existing conversation
    }

    const params = new URLSearchParams({
      view: 'messages',
      newConversationWith: brand.id,
      name: brand.name,
      userType: 'BRAND',
    });

    // Only add initial message if no existing conversation
    if (!hasExistingConversation) {
      const initialMessage = `Hi, I am ${user?.name} and would like to connect with you.`;
      params.append('message', initialMessage);
    }

    if (brand.avatar) {
      params.append('avatar', brand.avatar);
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    const tokenFromStorage = localStorage.getItem('token');
    const activeToken = tokenFromUrl || tokenFromStorage;

    if (!activeToken) {
      router.push('/login');
      return;
    }

    setToken(activeToken);
    const decoded = decodeJWT(activeToken);
    if (decoded) {
      setUser(decoded);
      // Fetch based on user type - creators see brands, brands see creators
      if (decoded.type === 'CREATOR') {
        fetchBrands(activeToken);
      } else {
        fetchCreators(activeToken);
      }
    }
  }, []);

  const fetchCreators = async (authToken: string, filters?: any) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.niches?.length) queryParams.append('niches', filters.niches.join(','));
      if (filters?.platforms?.length) queryParams.append('platforms', filters.platforms.join(','));
      if (filters?.minReach) queryParams.append('minReach', filters.minReach);
      if (filters?.maxReach) queryParams.append('maxReach', filters.maxReach);

      const response = await fetch(
        `http://localhost:5000/api/marketplace/creators?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCreators(data.creators || []);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async (authToken: string, filters?: any) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters?.search) queryParams.append('search', filters.search);

      const response = await fetch(
        `http://localhost:5000/api/marketplace/brands?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!token || !user) return;

    const filters = {
      search: searchQuery,
      niches: selectedNiches,
      platforms: selectedPlatforms,
      minReach: minReach,
      maxReach: maxReach
    };

    if (user.type === 'CREATOR') {
      fetchBrands(token, filters);
    } else {
      fetchCreators(token, filters);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedNiches([]);
    setSelectedPlatforms([]);
    setMinReach('');
    setMaxReach('');
    if (token && user) {
      if (user.type === 'CREATOR') {
        fetchBrands(token);
      } else {
        fetchCreators(token);
      }
    }
  };

  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev =>
      prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
    );
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  if (!token || !user) {
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">
            {user.type === 'CREATOR' ? 'Brand Marketplace' : 'Creator Marketplace'}
          </h1>
          <p className="text-gray-600 mt-2">
            {user.type === 'CREATOR'
              ? 'Discover brands looking for creators like you'
              : 'Discover creators for your next campaign'}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6">
          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder={user.type === 'CREATOR' ? "Search brands..." : "Search creators..."}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors text-sm ${
                showFilters ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedNiches.length + selectedPlatforms.length > 0) && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${showFilters ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>
                  {selectedNiches.length + selectedPlatforms.length}
                </span>
              )}
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
            >
              Search
            </button>
          </div>

          {/* Filter Panel - Contextual based on user type */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 bg-white border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              </div>

              {user.type === 'CREATOR' ? (
                // Creator viewing brands - simple message since brands don't have niches/platforms
                <div className="text-center py-4 text-gray-500 text-sm">
                  <p>Use the search bar above to find brands by name or location.</p>
                  <p className="text-xs text-gray-400 mt-1">More brand filters coming soon!</p>
                </div>
              ) : (
                // Brand viewing creators - full filters
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Niches Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Niches</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {NICHES.map(niche => (
                        <label
                          key={niche.value}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                            selectedNiches.includes(niche.value)
                              ? 'bg-gray-900 border-gray-900 text-white'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedNiches.includes(niche.value)}
                            onChange={() => toggleNiche(niche.value)}
                            className="hidden"
                          />
                          <span>{niche.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Platforms Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PLATFORMS.map(platform => (
                        <label
                          key={platform.value}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                            selectedPlatforms.includes(platform.value)
                              ? 'bg-gray-900 border-gray-900 text-white'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPlatforms.includes(platform.value)}
                            onChange={() => togglePlatform(platform.value)}
                            className="hidden"
                          />
                          <span>{platformEmojis[platform.value]}</span>
                          <span>{platform.label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Reach Range */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reach Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={minReach}
                          onChange={(e) => setMinReach(e.target.value)}
                          placeholder="Min (e.g., 10000)"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-sm"
                        />
                        <input
                          type="number"
                          value={maxReach}
                          onChange={(e) => setMaxReach(e.target.value)}
                          placeholder="Max (e.g., 1000000)"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {user.type === 'CREATOR' ? 'Loading brands...' : 'Loading creators...'}
            </p>
          </div>
        ) : user.type === 'CREATOR' ? (
          // Creator viewing brands
          brands.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
              <p className="text-gray-600">Try adjusting your search query or check back later</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  Found <span className="font-medium text-gray-900">{brands.length}</span> brand{brands.length !== 1 && 's'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brands.map((brand) => (
                  <BrandCard
                    key={brand.id}
                    brand={brand}
                    onViewProfile={() => setSelectedBrand(brand)}
                    onConnect={() => handleConnectWithBrand(brand)}
                  />
                ))}
              </div>
            </>
          )
        ) : (
          // Brand viewing creators
          creators.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No creators found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleView('creators')}
                    className={`text-sm font-medium transition-colors ${
                      viewMode === 'creators'
                        ? 'text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Found <span className="font-semibold">{creators.length}</span> creator{creators.length !== 1 && 's'}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => handleToggleView('coming-up')}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      viewMode === 'coming-up'
                        ? 'text-purple-600'
                        : 'text-gray-500 hover:text-purple-600'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Coming Up
                  </button>
                </div>
              </div>

              {viewMode === 'creators' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creators.map((creator) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      userType={user.type}
                      onViewProfile={() => setSelectedCreator(creator)}
                      onConnect={() => setConnectCreator(creator)}
                    />
                  ))}
                </div>
              ) : (
                /* Coming Up View */
                <div>
                  {loadingAnnouncements ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
                      <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming content</h3>
                      <p className="text-gray-600">Creators haven't announced any upcoming videos yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {announcements.map((announcement) => (
                        <AnnouncementCard
                          key={announcement.id}
                          announcement={announcement}
                          onConnect={() => {
                            const creator = creators.find(c => c.id === announcement.creator?.id);
                            if (creator) {
                              // Open ConnectModal with announcement's channels pre-filtered
                              // After selection, ConnectModal will add to cart and go to Campaign Builder
                              setConnectPlatformFilter(announcement.platforms || []);
                              setConnectChannelIdFilter(announcement.channelIds || []);
                              setConnectAnnouncementId(announcement.id);
                              setConnectCreator(creator);
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* Creator Profile Modal */}
      {selectedCreator && (
        <CreatorProfileModal
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
        />
      )}

      {/* Brand Profile Modal */}
      {selectedBrand && (
        <BrandProfileModal
          brand={selectedBrand}
          onClose={() => setSelectedBrand(null)}
          onConnect={() => handleConnectWithBrand(selectedBrand)}
        />
      )}

      {/* Connect Modal */}
      {connectCreator && (
        <ConnectModal
          creator={connectCreator}
          filterPlatforms={connectPlatformFilter}
          filterChannelIds={connectChannelIdFilter}
          announcementId={connectAnnouncementId}
          onClose={() => {
            setConnectCreator(null);
            setConnectPlatformFilter([]);
            setConnectChannelIdFilter([]);
            setConnectAnnouncementId(null);
          }}
        />
      )}

    </DashboardLayout>
  );
}

// Creator Card Component
function CreatorCard({ creator, userType, onViewProfile, onConnect }: { creator: Creator; userType: string; onViewProfile?: () => void; onConnect?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Creator Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
            {creator.avatar ? (
              <img src={`http://localhost:5000${creator.avatar}`} alt={creator.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-gray-400">{creator.name[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{creator.name}</h3>
            {creator.location && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {creator.location}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-900">{formatNumber(creator.totalReach)} reach</span>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Details */}
      <div className="p-6">
        {/* Bio */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {creator.bio || 'Content creator'}
        </p>

        {/* Niches */}
        {creator.niches && creator.niches.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {creator.niches.slice(0, 3).map(niche => (
              <span
                key={niche}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
              >
                {formatNicheDisplay(niche)}
              </span>
            ))}
            {creator.niches.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                +{creator.niches.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Platforms with usernames */}
        <div className="flex flex-wrap gap-2 mb-4">
          {creator.channels.slice(0, 4).map(channel => (
            <div key={channel.id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg">
              <PlatformIcon platform={channel.platform} className="w-4 h-4" />
              <span className="text-xs text-gray-700 truncate max-w-[100px]">{channel.channelName}</span>
            </div>
          ))}
          {creator.channels.length > 4 && (
            <div className="flex items-center px-2.5 py-1.5 bg-gray-100 rounded-lg">
              <span className="text-xs text-gray-500">+{creator.channels.length - 4}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {userType === 'BRAND' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onConnect}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Link2 className="w-4 h-4" />
              Connect
            </button>
            <button
              onClick={onViewProfile}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              View Profile
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Brand Card Component (shown to Creators) - Improved UX
function BrandCard({ brand, onViewProfile, onConnect }: { brand: Brand; onViewProfile?: () => void; onConnect?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Brand Header with larger logo area */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col items-center">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden mb-4">
          {brand.avatar ? (
            <img src={`http://localhost:5000${brand.avatar}`} alt={brand.name} className="w-full h-full object-cover" />
          ) : (
            <Briefcase className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 text-center">{brand.name}</h3>
        {brand.location && (
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {brand.location}
          </p>
        )}
      </div>

      {/* Brand Details */}
      <div className="p-6">
        {/* Bio */}
        {brand.bio ? (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{brand.bio}</p>
        ) : (
          <p className="text-sm text-gray-400 italic mb-4">No description available</p>
        )}

        {/* Website */}
        {brand.website && (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 group"
          >
            <Globe className="w-4 h-4" />
            <span className="group-hover:underline truncate">{brand.website.replace(/^https?:\/\//, '')}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </a>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onConnect}
            className="px-4 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <Link2 className="w-4 h-4" />
            Connect
          </button>
          <button
            onClick={onViewProfile}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Brand Profile Modal
function BrandProfileModal({ brand, onClose, onConnect }: { brand: Brand; onClose: () => void; onConnect?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">Brand Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Brand Info */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden mb-4">
              {brand.avatar ? (
                <img src={`http://localhost:5000${brand.avatar}`} alt={brand.name} className="w-full h-full object-cover" />
              ) : (
                <Briefcase className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">{brand.name}</h3>
            {brand.location && (
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {brand.location}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">About</h4>
            <p className="text-gray-700">
              {brand.bio || 'No description available'}
            </p>
          </div>

          {/* Website */}
          {brand.website && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Website</h4>
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 group"
              >
                <Globe className="w-4 h-4" />
                <span className="group-hover:underline">{brand.website.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onConnect}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Link2 className="w-4 h-4" />
              Connect with Brand
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Creator Profile Modal
function CreatorProfileModal({ creator, onClose }: { creator: Creator; onClose: () => void }) {
  // Sort channels by subscribers (highest first)
  const sortedChannels = [...creator.channels].sort((a, b) => b.subscribers - a.subscribers);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Avatar */}
        <div className="relative p-6 pb-4">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Avatar and Name Row */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ring-4 ring-gray-50">
              {creator.avatar ? (
                <img src={`http://localhost:5000${creator.avatar}`} alt={creator.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-gray-400">{creator.name[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 truncate">{creator.name}</h3>
              {creator.location && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {creator.location}
                </p>
              )}
              {/* Quick Stats */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-semibold text-gray-900">{formatNumber(creator.totalReach)} <span className="font-normal text-gray-500">reach</span></span>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-semibold text-gray-900">{creator.channels.length} <span className="font-normal text-gray-500">channels</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-180px)] px-6">
          {/* Bio */}
          <div className="mb-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              {creator.bio || 'Content creator passionate about connecting with audiences and creating engaging content.'}
            </p>
          </div>

          {/* Niches */}
          {creator.niches && creator.niches.length > 0 && (
            <div className="mb-5">
              <div className="flex flex-wrap gap-1.5">
                {creator.niches.map(niche => (
                  <span
                    key={niche}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    {formatNicheDisplay(niche)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Channels List */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Channels</h4>
            <div className="space-y-2">
              {sortedChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white shadow-sm">
                      <PlatformIcon platform={channel.platform} className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[150px] text-gray-900">
                        {channel.channelName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {channel.platform.charAt(0) + channel.platform.slice(1).toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatNumber(channel.subscribers)}
                    </p>
                    <p className="text-xs text-gray-500">subs</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            <MessageSquare className="w-4 h-4" />
            Message
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Connect Modal - Platform selection for sending collaboration request or adding to cart
function ConnectModal({ creator, filterPlatforms = [], filterChannelIds = [], announcementId = null, onClose, goToCart = false }: { creator: Creator; filterPlatforms?: string[]; filterChannelIds?: string[]; announcementId?: string | null; onClose: () => void; goToCart?: boolean }) {
  const router = useRouter();
  // Track selected channels with their placements: { channelId: placementId }
  const [channelPlacements, setChannelPlacements] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  // Long-term deal state
  const [isLongTermDeal, setIsLongTermDeal] = useState(false);
  const [videoCount, setVideoCount] = useState(3);

  // Ad material state - for selecting existing ads
  const [existingAds, setExistingAds] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [showAdMaterial, setShowAdMaterial] = useState(false);
  const [showAllAdsModal, setShowAllAdsModal] = useState(false);

  // Pending request conflict modal
  const [showPendingConflictModal, setShowPendingConflictModal] = useState(false);

  // Fetch existing ads when modal opens
  useEffect(() => {
    const fetchAds = async () => {
      setLoadingAds(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/ads', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const ads = await response.json();
          setExistingAds(ads);
        }
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoadingAds(false);
      }
    };

    fetchAds();
  }, []);

  // Get selected ad object
  const selectedAd = existingAds.find(ad => ad.id === selectedAdId);

  // Determine if this is from an announcement (has filters or announcementId) - if so, go to cart flow
  const isAnnouncementFlow = goToCart || announcementId || filterChannelIds.length > 0 || filterPlatforms.length > 0;

  // Filter channels - prioritize channelIds over platforms for precise filtering
  // For legacy announcements without channelIds, show ALL channels matching those platforms
  const displayChannels = filterChannelIds.length > 0
    ? creator.channels.filter(channel => filterChannelIds.includes(channel.id))
    : filterPlatforms.length > 0
      ? creator.channels.filter(channel => filterPlatforms.includes(channel.platform))
      : creator.channels;

  const toggleChannel = (channelId: string, platform: string) => {
    setChannelPlacements(prev => {
      if (prev[channelId]) {
        // Remove channel
        const { [channelId]: _, ...rest } = prev;
        return rest;
      } else {
        // Add channel with default placement
        return { ...prev, [channelId]: getDefaultPlacement(platform) };
      }
    });
  };

  const updatePlacement = (channelId: string, placementId: string) => {
    setChannelPlacements(prev => ({
      ...prev,
      [channelId]: placementId
    }));
  };

  // Calculate total price for selected channels
  const getSelectedChannelsWithPricing = () => {
    const selectedChannelIds = Object.keys(channelPlacements);
    return displayChannels
      .filter(channel => selectedChannelIds.includes(channel.id))
      .map(channel => {
        const placement = channelPlacements[channel.id];
        const placements = PLATFORM_PLACEMENTS[channel.platform] || [];
        const placementInfo = placements.find(p => p.id === placement);
        const price = calculatePricePer15Seconds(channel.subscribers, creator.niches, channel.platform, placement);

        return {
          channelId: channel.id,
          channelName: channel.channelName,
          platform: channel.platform,
          placement: placement,
          placementLabel: placementInfo?.label || 'Post',
          subscribers: channel.subscribers,
          price
        };
      });
  };

  const selectedChannelsWithPricing = getSelectedChannelsWithPricing();
  const platformPrice = selectedChannelsWithPricing.reduce((sum, ch) => sum + ch.price, 0);
  const selectedCount = selectedChannelsWithPricing.length;

  // Ad material pricing
  const adImageCount = selectedAd?.images?.length || 0;
  const adVideoCount = selectedAd?.videos?.length || 0;
  const imagePrice = adImageCount * 5; // $5 per image

  // Calculate video price based on duration (price per 15 seconds)
  // Use the same rate as platform pricing: ~$1.67 per 15 seconds base
  const videoDurations = selectedAd?.videoDurations || [];
  const totalVideoSeconds = videoDurations.reduce((sum: number, dur: number) => sum + (dur || 0), 0);
  const videoPrice = Math.ceil(totalVideoSeconds / 15) * 2; // $2 per 15 seconds of video

  const materialPrice = selectedAd ? imagePrice + videoPrice : 0;

  // Total calculation
  const basePrice = platformPrice + materialPrice;
  const totalPrice = isLongTermDeal ? basePrice * videoCount : basePrice;

  // Generate collaboration message
  const generateCollabMessage = () => {
    const platformDetails = selectedChannelsWithPricing.map(ch =>
      `- ${ch.channelName} (${ch.platform}) - ${ch.placementLabel} - ${formatNumber(ch.subscribers)} subscribers - ${formatPrice(ch.price)}`
    ).join('\n');

    const longTermInfo = isLongTermDeal
      ? `\n\n🎯 LONG-TERM DEAL: This is a long-term partnership for ${videoCount} videos.\nTotal Budget: ${formatPrice(totalPrice)} (${formatPrice(basePrice)} per video × ${videoCount} videos)`
      : '';

    return `Hi ${creator.name},

I would love to collaborate with you on your next content!

Here are the platforms and placements I'm interested in:

${platformDetails}

Estimated Budget: ${formatPrice(basePrice)} (per 15 seconds)${longTermInfo}

I believe this collaboration would be a great fit for both of us. Looking forward to hearing from you!

Best regards`;
  };

  // Add to cart (for announcement flow)
  const handleAddToCart = () => {
    if (selectedCount === 0) return;

    const currentCart = getCart();
    const newItems: CartItem[] = selectedChannelsWithPricing.map(ch => ({
      creatorId: creator.id,
      creatorName: creator.name,
      creatorAvatar: creator.avatar,
      creatorNiches: creator.niches,
      channelId: ch.channelId,
      channelName: ch.channelName,
      platform: ch.platform,
      placement: ch.placement,
      placementLabel: ch.placementLabel,
      subscribers: ch.subscribers,
      price: ch.price,
      announcementId: announcementId || undefined
    }));

    // Add items that aren't already in cart
    const existingChannelIds = currentCart.map(item => item.channelId);
    const itemsToAdd = newItems.filter(item => !existingChannelIds.includes(item.channelId));

    if (itemsToAdd.length > 0) {
      saveCart([...currentCart, ...itemsToAdd]);
    }

    // Just close the modal
    onClose();
  };

  // Check if ad material is selected
  const hasValidAdMaterial = selectedAdId !== null;

  // Send collaboration request (for regular creator card flow)
  const handleSendRequest = async (force: boolean = false) => {
    if (selectedCount === 0) return;

    // Validate ad material is selected
    if (!hasValidAdMaterial) {
      setShowAdMaterial(true);
      alert('Please select a campaign material before sending request');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const message = generateCollabMessage();

      const response = await fetch('http://localhost:5000/api/collaboration-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          creatorId: creator.id,
          channels: selectedChannelsWithPricing,
          totalPrice: totalPrice,
          message,
          announcementId: announcementId || undefined,
          isLongTermDeal: isLongTermDeal,
          videoCount: isLongTermDeal ? videoCount : undefined,
          adId: selectedAdId,
          force: force
        })
      });

      if (!response.ok) {
        const error = await response.json();
        // Check if it's a pending request conflict
        if (error.error?.includes('pending request')) {
          setShowPendingConflictModal(true);
          setSending(false);
          return;
        }
        throw new Error(error.error || 'Failed to send request');
      }

      // Dispatch event to update request count
      window.dispatchEvent(new Event('requestUpdated'));

      // Close modal and navigate to messages
      onClose();
      router.push(`/dashboard?view=messages&newConversationWith=${creator.id}&name=${encodeURIComponent(creator.name)}&avatar=${encodeURIComponent(creator.avatar || '')}&userType=CREATOR`);
    } catch (error: any) {
      console.error('Error sending collaboration request:', error);
      alert(error.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                {creator.avatar ? (
                  <img src={`http://localhost:5000${creator.avatar}`} alt={creator.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold text-gray-400">{creator.name[0]}</span>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Collaborate with {creator.name}</h2>
                <p className="text-sm text-gray-500">{formatNumber(creator.totalReach)} total reach</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0">
          <p className="text-sm text-gray-600 mb-4">Select platforms and placement type for your collaboration request</p>

          {/* Long-term Deal Toggle - Only show for regular creator card flow (not announcements) */}
          {!isAnnouncementFlow && (
            <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">Long-term Deal</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">Multi-video</span>
                </div>
                <button
                  onClick={() => setIsLongTermDeal(!isLongTermDeal)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isLongTermDeal ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    isLongTermDeal ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>

              {isLongTermDeal && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">Book your ad across multiple videos from this creator</p>
                  <div className="flex gap-2">
                    {[3, 5, 8, 10].map(count => (
                      <button
                        key={count}
                        onClick={() => setVideoCount(count)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          videoCount === count
                            ? 'bg-gray-900 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {count} videos
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ad Material Section - Required for sending request */}
          {!isAnnouncementFlow && (
            <div className="mb-4">
              <button
                onClick={() => setShowAdMaterial(!showAdMaterial)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Campaign Material</p>
                    <p className="text-xs text-gray-500">
                      {selectedAd
                        ? selectedAd.title
                        : 'Select campaign material'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedAd && (
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                  {showAdMaterial ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </button>

              {showAdMaterial && (
                <div className="mt-3 p-4 rounded-xl border border-gray-200 space-y-4">
                  {/* Info text */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      <strong>Note:</strong> Creator won't see ad material now. It's used for calculating price. Material will be shown to creator only after they accept the request and you complete payment.
                    </p>
                  </div>

                  {/* Loading state */}
                  {loadingAds && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                  )}

                  {/* Existing Ads */}
                  {!loadingAds && existingAds.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Select Campaign Material</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {existingAds.slice(0, 4).map(ad => (
                          <div
                            key={ad.id}
                            onClick={() => setSelectedAdId(ad.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedAdId === ad.id
                                ? 'border-gray-900 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Thumbnail */}
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                              {ad.images?.[0] ? (
                                <img src={`http://localhost:5000${ad.images[0]}`} alt="" className="w-full h-full object-cover" />
                              ) : ad.videos?.[0] ? (
                                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                  <Video className="w-5 h-5 text-white" />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                              <p className="text-xs text-gray-500">
                                {ad.images?.length || 0} images, {ad.videos?.length || 0} videos
                              </p>
                            </div>
                            {/* Checkbox */}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedAdId === ad.id ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                            }`}>
                              {selectedAdId === ad.id && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* View More button */}
                      {existingAds.length > 4 && (
                        <button
                          onClick={() => setShowAllAdsModal(true)}
                          className="w-full mt-2 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          View all {existingAds.length} campaigns →
                        </button>
                      )}
                    </div>
                  )}

                  {/* No ads or Create New */}
                  {!loadingAds && (
                    <div className={existingAds.length > 0 ? 'pt-3 border-t border-gray-200' : ''}>
                      {existingAds.length === 0 && (
                        <p className="text-sm text-gray-500 mb-3">You haven't created any campaign material yet.</p>
                      )}
                      <button
                        onClick={() => router.push('/dashboard?view=ads&create=true')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Create New Campaign Material</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* All Ads Modal */}
          {showAllAdsModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowAllAdsModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Select Campaign Material</h3>
                  <button onClick={() => setShowAllAdsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="p-5 overflow-y-auto max-h-[60vh] space-y-2">
                  {existingAds.map(ad => (
                    <div
                      key={ad.id}
                      onClick={() => {
                        setSelectedAdId(ad.id);
                        setShowAllAdsModal(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedAdId === ad.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {ad.images?.[0] ? (
                          <img src={`http://localhost:5000${ad.images[0]}`} alt="" className="w-full h-full object-cover" />
                        ) : ad.videos?.[0] ? (
                          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                        <p className="text-xs text-gray-500">{ad.images?.length || 0} images, {ad.videos?.length || 0} videos</p>
                        {ad.talkingPoints && <p className="text-xs text-gray-400 truncate mt-0.5">{ad.talkingPoints}</p>}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedAdId === ad.id ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                      }`}>
                        {selectedAdId === ad.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-5 border-t border-gray-100">
                  <button
                    onClick={() => router.push('/dashboard?view=ads&create=true')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Create New Campaign Material</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Pending Request Conflict Modal */}
          {showPendingConflictModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowPendingConflictModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Pending Request Exists</h3>
                  <p className="text-sm text-gray-600 text-center mb-6">
                    You already have a pending request with {creator.name} for one or more of the selected channels. Do you want to send another request anyway?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPendingConflictModal(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowPendingConflictModal(false);
                        handleSendRequest(true);
                      }}
                      disabled={sending}
                      className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {sending ? 'Sending...' : 'Send Anyway'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <div className="space-y-3">
            {displayChannels.map(channel => {
              const isSelected = !!channelPlacements[channel.id];
              const placements = PLATFORM_PLACEMENTS[channel.platform] || [];
              const currentPlacement = channelPlacements[channel.id];
              const price = isSelected ? calculatePricePer15Seconds(channel.subscribers, creator.niches, channel.platform, currentPlacement) : 0;

              return (
                <div
                  key={channel.id}
                  className={`rounded-xl border transition-all ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Channel Header */}
                  <div
                    onClick={() => toggleChannel(channel.id, channel.platform)}
                    className="flex items-center justify-between p-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                        <PlatformIcon platform={channel.platform} className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{channel.channelName}</p>
                        <p className="text-xs text-gray-500">
                          {channel.subscribers ? formatNumber(channel.subscribers) + ' subscribers' : 'New channel'}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(price)}</span>
                    )}
                  </div>

                  {/* Placement Selection - Only show when selected */}
                  {isSelected && placements.length > 0 && (
                    <div className="px-3 pb-3 pt-0">
                      <p className="text-xs text-gray-500 mb-2 ml-8">Select placement type:</p>
                      <div className="flex flex-wrap gap-2 ml-8">
                        {placements.map(placement => {
                          const isPlacementSelected = currentPlacement === placement.id;
                          return (
                            <button
                              key={placement.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                updatePlacement(channel.id, placement.id);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isPlacementSelected
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {placement.label}
                              {placement.duration && (
                                <span className={`ml-1 ${isPlacementSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                                  ({placement.duration})
                                </span>
                              )}
                              {placement.multiplier !== 1.0 && (
                                <span className={`ml-1 ${isPlacementSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                                  {placement.multiplier < 1 ? `${Math.round(placement.multiplier * 100)}%` : `${placement.multiplier}x`}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Summary - Always visible */}
        {!isAnnouncementFlow && (
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
            <div className="space-y-3">
              {/* Breakdown */}
              <div className="space-y-2">
                {/* Selected Platforms - Full pricing (platform + material share) */}
                {selectedCount > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Selected Placements</p>
                    {selectedChannelsWithPricing.map((ch) => {
                      // Each platform gets its base price + equal share of material cost
                      const materialSharePerPlatform = selectedAd ? Math.round(materialPrice / selectedCount) : 0;
                      const fullPrice = ch.price + materialSharePerPlatform;
                      return (
                        <div key={ch.channelId} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-2">
                            <span>{ch.channelName}</span>
                            <span className="text-gray-400">·</span>
                            <span className="text-gray-400 text-xs">{ch.placementLabel}</span>
                          </span>
                          <span className="font-medium text-gray-900">{formatPrice(fullPrice)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">No platforms selected</span>
                    <span className="font-medium text-gray-900">{formatPrice(0)}</span>
                  </div>
                )}

                {/* Campaign material info (no separate price, included in platform prices) */}
                {!isAnnouncementFlow && !selectedAd && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Campaign material</span>
                    <span className="font-medium text-amber-600">Not selected</span>
                  </div>
                )}

                {/* Long-term multiplier */}
                {isLongTermDeal && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-600">× {videoCount} videos (long-term)</span>
                    <span className="font-medium text-gray-900">×{videoCount}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{formatPrice(totalPrice)}</p>
                  {isLongTermDeal && (
                    <p className="text-xs text-gray-500">{formatPrice(basePrice)} per video</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Announcement flow pricing */}
        {isAnnouncementFlow && selectedCount > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{selectedCount} platform{selectedCount > 1 ? 's' : ''} selected</p>
                <p className="text-xs text-gray-500">Price per 15 seconds</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{formatPrice(totalPrice)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={isAnnouncementFlow ? handleAddToCart : () => handleSendRequest(false)}
            disabled={selectedCount === 0 || sending || (!isAnnouncementFlow && !selectedAdId)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
              selectedCount > 0 && !sending && (isAnnouncementFlow || selectedAdId)
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : isAnnouncementFlow ? (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Campaign
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {selectedCount > 0 && selectedAdId
                  ? `Send Request · ${formatPrice(totalPrice)}`
                  : isLongTermDeal ? 'Send Long-term Request' : 'Send Request'
                }
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            {isAnnouncementFlow
              ? `Selected placements will be added to your campaign cart`
              : !selectedAdId
              ? 'Please select campaign material to continue'
              : selectedCount === 0
              ? 'Please select at least one platform'
              : isLongTermDeal
              ? `${creator.name} will receive a long-term deal request for ${videoCount} videos`
              : `A message will be sent to ${creator.name} with your collaboration details`
            }
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Announcement Card Component for Coming Up view
function AnnouncementCard({ announcement, onConnect }: { announcement: ContentAnnouncement; onConnect: () => void }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPlatformName = (platform: string) => {
    const names: Record<string, string> = {
      YOUTUBE: 'YouTube',
      INSTAGRAM: 'Instagram',
      TIKTOK: 'TikTok',
      TWITTER: 'Twitter',
      FACEBOOK: 'Facebook',
      TWITCH: 'Twitch'
    };
    return names[platform] || platform;
  };

  // Get channels from the announcement - use channelIds if available, fall back to platforms
  const channelIds = announcement.channelIds || [];
  const creatorChannels = announcement.creator?.channels || [];
  const displayChannels = channelIds.length > 0
    ? creatorChannels.filter((ch: any) => channelIds.includes(ch.id))
    : creatorChannels.filter((ch: any) => (announcement.platforms || []).includes(ch.platform));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative">
        {announcement.thumbnail ? (
          <img
            src={`http://localhost:5000${announcement.thumbnail}`}
            alt={announcement.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Date row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">{announcement.title}</h3>
          <div className="flex-shrink-0 bg-gray-900 text-white rounded-lg px-2 py-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{formatDate(announcement.scheduledAt)}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-1 mb-3 h-5">
          {announcement.description || 'No description'}
        </p>

        {/* Channel badges - shows each channel, not just unique platforms */}
        {displayChannels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {displayChannels.map((channel: any) => (
              <div key={channel.id} className="bg-gray-100 rounded-lg px-2 py-1 flex items-center gap-1.5">
                <PlatformIcon platform={channel.platform} className="w-4 h-4" />
                <span className="text-xs font-medium text-gray-700">{channel.channelName || getPlatformName(channel.platform)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Creator info */}
        {announcement.creator && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
              {announcement.creator.avatar ? (
                <img
                  src={`http://localhost:5000${announcement.creator.avatar}`}
                  alt={announcement.creator.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-500">
                  {announcement.creator.name?.[0] || '?'}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{announcement.creator.name}</p>
            </div>
          </div>
        )}

        {/* Connect button */}
        <button
          onClick={onConnect}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Link2 className="w-4 h-4" />
          Connect with Creator
        </button>
      </div>
    </motion.div>
  );
}

function formatNicheDisplay(niche: string) {
  const NICHE_MAP: { [key: string]: string } = {
    TECH: 'Tech',
    GAMING: 'Gaming',
    BEAUTY: 'Beauty',
    FASHION: 'Fashion',
    FITNESS: 'Fitness',
    FINANCE: 'Finance',
    FOOD: 'Food',
    TRAVEL: 'Travel',
    LIFESTYLE: 'Lifestyle',
    EDUCATION: 'Education',
    SPORTS: 'Sports',
    MUSIC: 'Music',
    COMEDY: 'Comedy',
    BUSINESS: 'Business',
    HEALTH_WELLNESS: 'Health & Wellness'
  };
  return NICHE_MAP[niche] || niche;
}

export default function MarketplaceHub() {
  return (
    <Suspense fallback={
      <DashboardLayout activeView="hub">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    }>
      <MarketplaceHubContent />
    </Suspense>
  );
}
