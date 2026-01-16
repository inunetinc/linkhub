'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  MessageSquare,
  Youtube,
  Instagram,
  Twitter,
  Twitch,
  X,
  Home,
  Megaphone,
  Upload,
  Facebook,
  PlusCircle,
  Music,
  FileVideo,
  Send,
  Eye,
  Edit3,
  Trash2,
  Image,
  Video,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  GripVertical,
  Globe,
  Mic,
  Handshake,
  Check,
  XCircle,
  ExternalLink,
  CreditCard,
  Play,
  ImageIcon,
  Sparkles,
  LayoutGrid,
  ArrowRight,
  Package,
  Zap,
  ChevronDown,
  Download,
  CheckSquare,
  Square,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useSocket } from '@/contexts/SocketContext';
import { API_BASE_URL } from '@/config/api';

function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    return null;
  }
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // New secure auth code for Google login
  const authCode = searchParams.get('auth_code');
  // New secure OAuth flow params for platform connections
  const oauthCode = searchParams.get('oauth_code');
  const oauthPlatform = searchParams.get('platform');
  // New conversation params
  const newConversationWith = searchParams.get('newConversationWith');
  const newConversationName = searchParams.get('name');
  const newConversationAvatar = searchParams.get('avatar');
  const newConversationType = searchParams.get('userType');
  const initialMessageParam = searchParams.get('message');
  // View parameter for navigation from other pages
  const viewParam = searchParams.get('view');

  const [userType, setUserType] = useState<'creator' | 'brand'>('creator');
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeView, setActiveView] = useState(viewParam || 'home');

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]); // For platform types
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]); // For individual channels
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [announcementTab, setAnnouncementTab] = useState<'upcoming' | 'past'>('upcoming');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [userChannels, setUserChannels] = useState<any[]>([]);
  const [addingPlatform, setAddingPlatform] = useState<string | null>(null);

  // YouTube-specific states
  const [youtubeChannels, setYoutubeChannels] = useState<any[]>([]);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [selectedYoutubeChannel, setSelectedYoutubeChannel] = useState<any>(null);
  const [youtubeToken, setYoutubeToken] = useState<string | null>(null);

  // Facebook-specific states
  const [facebookPages, setFacebookPages] = useState<any[]>([]);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [facebookError, setFacebookError] = useState<string | null>(null);
  const [selectedFacebookPage, setSelectedFacebookPage] = useState<any>(null);
  const [facebookToken, setFacebookToken] = useState<string | null>(null);

  // Instagram-specific states
  const [instagramChannels, setInstagramChannels] = useState<any[]>([]);
  const [instagramLoading, setInstagramLoading] = useState(false);
  const [instagramError, setInstagramError] = useState<string | null>(null);
  const [selectedInstagramAccount, setSelectedInstagramAccount] = useState<any>(null);
  const [instagramToken, setInstagramToken] = useState<string | null>(null);

  // Twitter-specific states
  const [twitterAccounts, setTwitterAccounts] = useState<any[]>([]);
  const [twitterLoading, setTwitterLoading] = useState(false);
  const [twitterError, setTwitterError] = useState<string | null>(null);
  const [selectedTwitterAccount, setSelectedTwitterAccount] = useState<any>(null);
  const [twitterToken, setTwitterToken] = useState<string | null>(null);

  // TikTok-specific states - Added
  const [tiktokAccounts, setTikTokAccounts] = useState<any[]>([]);
  const [tiktokLoading, setTikTokLoading] = useState(false);
  const [tiktokError, setTikTokError] = useState<string | null>(null);
  const [selectedTikTokAccount, setSelectedTikTokAccount] = useState<any>(null);
  const [tiktokToken, setTiktokToken] = useState<string | null>(null);

  // Remove platform modal state
  const [channelToRemove, setChannelToRemove] = useState<any>(null);
  const [isRemovingChannel, setIsRemovingChannel] = useState(false);

  // Brand Ad states
  const [ads, setAds] = useState<any[]>([]);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [adImages, setAdImages] = useState<File[]>([]);
  const [adVideos, setAdVideos] = useState<File[]>([]);
  const [adImagePreviews, setAdImagePreviews] = useState<string[]>([]);
  const [adVideoPreviews, setAdVideoPreviews] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [videosToRemove, setVideosToRemove] = useState<string[]>([]);
  const [reorderedImages, setReorderedImages] = useState<string[] | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [reorderedVideos, setReorderedVideos] = useState<string[] | null>(null);
  const [draggedVideoIndex, setDraggedVideoIndex] = useState<number | null>(null);
  // Combined order tracking: array of { type: 'existing' | 'new', src: string, index?: number }
  const [combinedImageOrder, setCombinedImageOrder] = useState<any[] | null>(null);
  const [combinedVideoOrder, setCombinedVideoOrder] = useState<any[] | null>(null);
  // Script required for image-only ads (creator needs to speak/narrate)
  const [scriptRequired, setScriptRequired] = useState<boolean>(false);

  // Messaging states
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState<{ userId: string; userName: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket for real-time messaging
  const { sendMessage: socketSendMessage, onNewMessage, onTyping, sendTypingIndicator, isConnected, markAsRead, unreadCounts, setRequestCount } = useSocket();

  // Ad requests/campaigns
  const [adRequests, setAdRequests] = useState<any[]>([]);

  // Collaboration requests
  const [collabRequests, setCollabRequests] = useState<any[]>([]);
  const [loadingCollabRequests, setLoadingCollabRequests] = useState(false);
  const [selectedCollabRequest, setSelectedCollabRequest] = useState<any>(null);
  const [selectedMediaForDownload, setSelectedMediaForDownload] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [collabStatusFilter, setCollabStatusFilter] = useState<'pending' | 'active' | 'paid' | 'completed' | 'declined'>('pending');
  const [showUndoVideoModal, setShowUndoVideoModal] = useState(false);
  const [undoingVideoPost, setUndoingVideoPost] = useState(false);
  const [showMarkCompletedModal, setShowMarkCompletedModal] = useState(false);
  const [markingCompleted, setMarkingCompleted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showVideoConfirmModal, setShowVideoConfirmModal] = useState(false);
  const [confirmingVideoPost, setConfirmingVideoPost] = useState(false);

  // Payout settings state
  const [payoutSettings, setPayoutSettings] = useState<any>(null);
  const [loadingPayoutSettings, setLoadingPayoutSettings] = useState(false);
  const [savingPayoutSettings, setSavingPayoutSettings] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [isEditingPayout, setIsEditingPayout] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    bankCode: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    payoutFrequency: 'IMMEDIATE',
    minimumPayout: 1000
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);
    if (file) {
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    } else {
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      setThumbnailPreview(null);
    }
  };

  // Secure Google auth code exchange
  useEffect(() => {
    if (authCode) {
      // Remove auth code from URL immediately for security
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('auth_code');
      window.history.replaceState({}, '', newUrl.toString());

      const exchangeAuthCode = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: authCode }),
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Auth exchange failed');
          }

          const { token } = await response.json();
          if (token) {
            localStorage.setItem('token', token);
            const decoded = decodeJWT(token);
            if (decoded) {
              setUser(decoded);
              const type = (decoded.type === 'BRAND' ? 'brand' : 'creator') as 'creator' | 'brand';
              setUserType(type);
              localStorage.setItem('userType', type);
            }
          }
        } catch (err) {
          console.error('Auth code exchange error:', err);
          router.push('/login');
        } finally {
          setAuthChecked(true);
        }
      };

      exchangeAuthCode();
    } else {
      // No auth code, check localStorage for existing token
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const decoded = decodeJWT(storedToken);
        if (decoded) {
          setUser(decoded);
          const type = (decoded.type === 'BRAND' ? 'brand' : 'creator') as 'creator' | 'brand';
          setUserType(type);
          localStorage.setItem('userType', type);
        } else {
          // Invalid token, redirect to login
          localStorage.removeItem('token');
          router.push('/login');
        }
      } else {
        // No token at all, redirect to login
        router.push('/login');
      }
      setAuthChecked(true);
    }
  }, [authCode, router]);

  // Sync activeView with URL view parameter (for navigation from other pages)
  useEffect(() => {
    if (viewParam) {
      setActiveView(viewParam);
    }
  }, [viewParam]);

  // Secure OAuth token exchange - handles all platforms
  useEffect(() => {
    if (oauthCode && oauthPlatform) {
      // Remove OAuth params from URL immediately for security
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('oauth_code');
      newUrl.searchParams.delete('platform');
      window.history.replaceState({}, '', newUrl.toString());

      const exchangeToken = async () => {
        try {
          // Exchange the code for the actual token via secure POST request
          const response = await fetch(`${API_BASE_URL}/api/${oauthPlatform}/oauth/exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: oauthCode }),
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Token exchange failed');
          }

          const { token: platformToken, userToken } = await response.json();

          // Store user token if returned
          if (userToken) {
            localStorage.setItem('token', userToken);
          }

          setActiveView('add-platform');

          // Process token based on platform
          const decodeJwtPayload = (jwt: string) => {
            let base64 = jwt.split('.')[1];
            base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
            switch (base64.length % 4) {
              case 2: base64 += '=='; break;
              case 3: base64 += '='; break;
            }
            return JSON.parse(atob(base64));
          };

          switch (oauthPlatform) {
            case 'youtube':
              setYoutubeToken(platformToken);
              setYoutubeLoading(true);
              try {
                const ytResponse = await fetch(`${API_BASE_URL}/api/youtube/channels`, {
                  headers: { Authorization: `Bearer ${platformToken}` },
                });
                if (ytResponse.ok) {
                  const data = await ytResponse.json();
                  setYoutubeChannels(data);
                }
              } catch (err) {
                setYoutubeError('Failed to load YouTube channels');
              }
              setYoutubeLoading(false);
              break;

            case 'facebook':
              setFacebookToken(platformToken);
              try {
                const payload = decodeJwtPayload(platformToken);
                setFacebookPages(payload.facebookPages || []);
              } catch (err) {
                setFacebookError('Failed to process Facebook login');
              }
              break;

            case 'instagram':
              setInstagramToken(platformToken);
              try {
                const payload = decodeJwtPayload(platformToken);
                setInstagramChannels(payload.instagramAccounts || []);
              } catch (err) {
                setInstagramError('Failed to process Instagram login');
              }
              break;

            case 'twitter':
              setTwitterToken(platformToken);
              try {
                const payload = decodeJwtPayload(platformToken);
                setTwitterAccounts(payload.twitterAccounts || []);
              } catch (err) {
                setTwitterError('Failed to process Twitter login');
              }
              break;

            case 'tiktok':
              setTiktokToken(platformToken);
              try {
                const payload = decodeJwtPayload(platformToken);
                setTikTokAccounts(payload.tiktokAccounts || []);
              } catch (err) {
                setTikTokError('Failed to process TikTok login');
              }
              break;

            case 'twitch':
              // Twitch auto-saves the channel
              try {
                const localUserToken = localStorage.getItem('token');
                const resp = await fetch(`${API_BASE_URL}/api/twitch/channel`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${platformToken}`,
                    'X-User-Token': localUserToken || '',
                  },
                  body: JSON.stringify({ twitchUser: decodeJwtPayload(platformToken).twitchUser }),
                });
                if (resp.ok) {
                  await fetchUserChannels();
                  setSuccessToast('Twitch connected!');
                  setTimeout(() => setSuccessToast(null), 1500);
                }
              } catch (err) {
                console.error('Twitch save error:', err);
              }
              break;
          }
        } catch (err: any) {
          console.error('OAuth token exchange failed:', err);
        }
      };

      exchangeToken();
    }
  }, [oauthCode, oauthPlatform]);



  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  // Fetch connected channels from DB
  const fetchUserChannels = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/channels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserChannels(data);
      }
    } catch (err) {
      console.error('Failed to fetch user channels:', err);
      setUserChannels([]);
    }
  };

  // Fetch channels when view changes to add-platform, pricing, or on initial load
  useEffect(() => {
    if (activeView === 'add-platform' || activeView === 'pricing') {
      fetchUserChannels();
    }
  }, [activeView]);

  // Also fetch channels on initial load (for when user is already logged in)
  useEffect(() => {
    if (user) {
      fetchUserChannels();
    }
  }, [user]);

  // Fetch brand ads
  const fetchAds = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/ads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      }
    } catch (err) {
      console.error('Failed to fetch ads:', err);
    }
  };

  // Fetch ad requests/campaigns
  const fetchAdRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/ad-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch ad requests:', err);
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  // Fetch announcements for creator
  const fetchAnnouncements = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user?.id) return;
    try {
      // Use creator-specific endpoint to get ALL announcements (including filled ones)
      const response = await fetch(`${API_BASE_URL}/api/content-announcements/creator/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const now = new Date();
        const announcementsToArchive = data.filter((announcement: any) =>
          new Date(announcement.scheduledAt) < now && announcement.status === 'ACTIVE'
        );
        for (const announcement of announcementsToArchive) {
          await fetch(`${API_BASE_URL}/api/content-announcements/${announcement.id}/status`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'COMPLETED' }),
          });
        }
        if (announcementsToArchive.length > 0) {
          const updatedResponse = await fetch(`${API_BASE_URL}/api/content-announcements/creator/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (updatedResponse.ok) {
            const updatedData = await updatedResponse.json();
            setAnnouncements(updatedData);
          }
        } else {
          setAnnouncements(data);
        }
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  // Fetch collaboration requests
  const fetchCollabRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingCollabRequests(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/collaboration-requests`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCollabRequests(data);
      }
    } catch (error) {
      console.error('Error fetching collaboration requests:', error);
    } finally {
      setLoadingCollabRequests(false);
    }
  };


  // Refetch request count (for badge update after accept/decline or download)
  const refetchRequestCount = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return;

    try {
      const countResponse = await fetch(`${API_BASE_URL}/api/collaboration-requests/count`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      if (countResponse.ok) {
        const data = await countResponse.json();
        setRequestCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching request count:', error);
    }
  };

  // Update collaboration request status (optimistic update - no refetch)
  const updateCollabRequestStatus = async (requestId: string, status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Optimistically update the UI immediately
    setCollabRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status } : req
    ));

    try {
      const response = await fetch(`${API_BASE_URL}/api/collaboration-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        // Update badge count after accept/decline
        refetchRequestCount();
        // Notify other components
        window.dispatchEvent(new Event('requestUpdated'));
      } else {
        // Revert on error
        await fetchCollabRequests();
      }
    } catch (error) {
      console.error('Error updating collaboration request:', error);
      // Revert on error
      await fetchCollabRequests();
    }
  };

  // Process payment for a collaboration (redirect to Paystack)
  const processPayment = async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Get the campaign to find total price
      const campaign = collabRequests.find(r => r.id === requestId);
      if (!campaign) return;

      // Initialize payment with Paystack (redirect flow)
      const response = await fetch(`${API_BASE_URL}/api/collaboration-requests/${requestId}/pay/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: campaign.totalPrice,
          callbackUrl: `${window.location.origin}/dashboard?view=campaigns&verify=true&requestId=${requestId}`
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Redirect to Paystack checkout page
        window.location.href = result.authorizationUrl;
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  // Fetch messages with a specific user
  const fetchMessages = async (userId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  // Send a message using socket for real-time delivery
  const sendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    if (isConnected) {
      // Use socket for real-time messaging
      socketSendMessage(activeConversation.partner.id, newMessage);
      setNewMessage('');
      // Stop typing indicator when sending
      sendTypingIndicator(activeConversation.partner.id, false);
    } else {
      // Fallback to HTTP if socket is disconnected
      const token = localStorage.getItem('token');
      if (!token) return;
      fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toUserId: activeConversation.partner.id,
          content: newMessage
        })
      }).then(response => {
        if (response.ok) {
          response.json().then(msg => {
            setMessages(prev => [...prev, msg]);
            setNewMessage('');
            fetchConversations();
          });
        }
      }).catch(err => {
        console.error('Failed to send message:', err);
      });
    }
  };

  // Handle remove channel/platform
  const handleRemoveChannel = async () => {
    if (!channelToRemove) return;

    setIsRemovingChannel(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/user/channels/${channelToRemove.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        setUserChannels(prev => prev.filter((ch: any) => ch.id !== channelToRemove.id));
        setChannelToRemove(null);
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to remove platform');
      }
    } catch (error) {
      console.error('Error removing channel:', error);
      alert('Failed to remove platform');
    } finally {
      setIsRemovingChannel(false);
    }
  };

  // Toggle media selection for download
  const toggleMediaSelection = (url: string) => {
    setSelectedMediaForDownload(prev => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  // Mark materials as downloaded for a PAID request (to update the badge)
  const markMaterialsDownloaded = async (requestId: string) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/collaboration-requests/${requestId}/mark-downloaded`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        // Refetch the count to update the badge
        refetchRequestCount();
      }
    } catch (error) {
      console.error('Error marking materials as downloaded:', error);
    }
  };

  // Download a single file
  const downloadSingleFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      // Mark materials as downloaded for PAID requests
      if (selectedCollabRequest?.status === 'PAID' && selectedCollabRequest?.id) {
        markMaterialsDownloaded(selectedCollabRequest.id);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  // Download selected files as zip
  const downloadSelectedAsZip = async () => {
    if (selectedMediaForDownload.size === 0) {
      alert('Please select at least one file to download');
      return;
    }

    setIsDownloading(true);
    try {
      // Dynamically import JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const downloadPromises = Array.from(selectedMediaForDownload).map(async (url, idx) => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const extension = url.split('.').pop() || 'file';
          const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(extension.toLowerCase());
          const filename = `${isVideo ? 'video' : 'image'}_${idx + 1}.${extension}`;
          zip.file(filename, blob);
        } catch (e) {
          console.error(`Failed to download: ${url}`, e);
        }
      });

      await Promise.all(downloadPromises);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `campaign_media_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      setSelectedMediaForDownload(new Set());
      // Mark materials as downloaded for PAID requests
      if (selectedCollabRequest?.status === 'PAID' && selectedCollabRequest?.id) {
        markMaterialsDownloaded(selectedCollabRequest.id);
      }
    } catch (error) {
      console.error('Zip download failed:', error);
      alert('Failed to create zip file');
    } finally {
      setIsDownloading(false);
    }
  };

  // Download all media as zip
  const downloadAllAsZip = async () => {
    if (!selectedCollabRequest?.ad) return;

    const allMedia: string[] = [];
    if (selectedCollabRequest.ad.images) {
      allMedia.push(...selectedCollabRequest.ad.images.map((img: string) => `${API_BASE_URL}${img}`));
    }
    if (selectedCollabRequest.ad.videos) {
      allMedia.push(...selectedCollabRequest.ad.videos.map((vid: string) => `${API_BASE_URL}${vid}`));
    }

    if (allMedia.length === 0) {
      alert('No media files to download');
      return;
    }

    setIsDownloading(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const downloadPromises = allMedia.map(async (url, idx) => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const extension = url.split('.').pop() || 'file';
          const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(extension.toLowerCase());
          const filename = `${isVideo ? 'video' : 'image'}_${idx + 1}.${extension}`;
          zip.file(filename, blob);
        } catch (e) {
          console.error(`Failed to download: ${url}`, e);
        }
      });

      await Promise.all(downloadPromises);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${selectedCollabRequest.ad.title || 'campaign'}_all_media.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      // Mark materials as downloaded for PAID requests
      if (selectedCollabRequest?.status === 'PAID' && selectedCollabRequest?.id) {
        markMaterialsDownloaded(selectedCollabRequest.id);
      }
    } catch (error) {
      console.error('Zip download failed:', error);
      alert('Failed to create zip file');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle typing indicator
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (activeConversation && isConnected) {
      sendTypingIndicator(activeConversation.partner.id, e.target.value.length > 0);
    }
  };

  // Listen for real-time messages
  useEffect(() => {
    const unsubscribeMessage = onNewMessage((message) => {
      // Add message to current conversation if it's from/to the active partner
      if (activeConversation) {
        const isFromActivePartner = message.fromUserId === activeConversation.partner.id;
        const isToActivePartner = message.toUserId === activeConversation.partner.id;

        if (isFromActivePartner || isToActivePartner) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, message];
          });
        }
      }

      // Update conversations list
      fetchConversations();
    });

    const unsubscribeTyping = onTyping((data) => {
      if (activeConversation && data.userId === activeConversation.partner.id) {
        if (data.isTyping) {
          setIsTyping({ userId: data.userId, userName: data.userName });
        } else {
          setIsTyping(null);
        }
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [onNewMessage, onTyping, activeConversation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (activeConversation) {
      markAsRead(activeConversation.partner.id);
    }
  }, [activeConversation, markAsRead]);

  // Fetch data based on view and user type
  useEffect(() => {
    if (userType === 'brand') {
      if (activeView === 'ads' || activeView === 'home' || activeView === 'my-ads') {
        fetchAds();
      }
      if (activeView === 'campaigns' || activeView === 'home') {
        fetchCollabRequests(); // Use collabRequests for campaigns
      }
      if (activeView === 'home') {
        fetchConversations();
      }
    }
    if (userType === 'creator') {
      if (activeView === 'home' || activeView === 'announcements') {
        fetchAnnouncements();
      }
      if (activeView === 'home') {
        fetchConversations();
      }
    }
    if (activeView === 'messages') {
      fetchConversations();
    }
    if (activeView === 'requests') {
      fetchCollabRequests();
    }
  }, [activeView, userType]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.partner.id);
    }
  }, [activeConversation]);

  // Handle new conversation from URL params (e.g., from marketplace Connect button)
  useEffect(() => {
    if (newConversationWith && newConversationName && user) {
      // Set view to messages
      setActiveView('messages');

      // Create a virtual conversation partner
      const newPartner = {
        partner: {
          id: newConversationWith,
          name: decodeURIComponent(newConversationName),
          avatar: newConversationAvatar ? decodeURIComponent(newConversationAvatar) : null,
          type: newConversationType || 'BRAND'
        },
        lastMessage: null
      };

      setActiveConversation(newPartner);

      // Pre-fill the message if provided
      if (initialMessageParam) {
        setNewMessage(decodeURIComponent(initialMessageParam));
      }

      // Clean URL params
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('newConversationWith');
      newUrl.searchParams.delete('name');
      newUrl.searchParams.delete('avatar');
      newUrl.searchParams.delete('userType');
      newUrl.searchParams.delete('message');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [newConversationWith, newConversationName, user]);

  // Handle Paystack payment callback (redirect flow)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verify = urlParams.get('verify');
    const reference = urlParams.get('reference');
    const requestId = urlParams.get('requestId');
    const token = localStorage.getItem('token');

    if (verify === 'true' && reference && requestId && token) {
      const verifyPayment = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/collaboration-requests/${requestId}/pay/verify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reference })
          });

          if (response.ok) {
            // Refresh the data
            await fetchCollabRequests();
            window.dispatchEvent(new Event('requestUpdated'));

            // Show success message
            alert('Payment successful! The creator can now access your ad material.');
          } else {
            const err = await response.json();
            alert(err.error || 'Payment verification failed.');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          alert('Payment verification failed. Please contact support.');
        }

        // Clean up URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('verify');
        newUrl.searchParams.delete('reference');
        newUrl.searchParams.delete('requestId');
        window.history.replaceState({}, '', newUrl.toString());
      };

      verifyPayment();
    }
  }, []);

  // Niche options for ad targeting
  const nicheOptions = [
    { value: 'TECH', label: 'Tech' },
    { value: 'GAMING', label: 'Gaming' },
    { value: 'BEAUTY', label: 'Beauty' },
    { value: 'FASHION', label: 'Fashion' },
    { value: 'FITNESS', label: 'Fitness' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'FOOD', label: 'Food' },
    { value: 'TRAVEL', label: 'Travel' },
    { value: 'LIFESTYLE', label: 'Lifestyle' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'MUSIC', label: 'Music' },
    { value: 'COMEDY', label: 'Comedy' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'HEALTH_WELLNESS', label: 'Health & Wellness' },
  ];

  // Handle ad form submission
  const handleAdSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const talkingPoints = formData.get('talkingPoints') as string;
      const guidelines = formData.get('guidelines') as string;

      if (!title) {
        throw new Error('Title is required');
      }

      const submitData = new FormData();
      submitData.append('title', title);
      if (description) submitData.append('description', description);
      if (talkingPoints) submitData.append('talkingPoints', talkingPoints);
      if (guidelines) submitData.append('guidelines', guidelines);
      submitData.append('targetNiches', JSON.stringify(selectedNiches));
      submitData.append('scriptRequired', String(scriptRequired));

      const token = localStorage.getItem('token');
      let response;

      if (editingAd) {
        // Use combined order if available to properly interleave existing and new images
        if (combinedImageOrder) {
          const existingInOrder = combinedImageOrder
            .filter((i: any) => i.type === 'existing' && !imagesToRemove.includes(i.src))
            .map((i: any) => i.src);
          submitData.append('existingImages', JSON.stringify(existingInOrder));

          // Get new images in the order they appear in combinedImageOrder
          const newImagesInOrder = combinedImageOrder
            .filter((i: any) => i.type === 'new')
            .map((i: any) => adImages[i.index])
            .filter(Boolean);

          // Append new images in the correct order
          newImagesInOrder.forEach(file => {
            submitData.append('images', file);
          });

          // Also send the combined order for backend to understand interleaving
          submitData.append('imageOrder', JSON.stringify(
            combinedImageOrder
              .filter((i: any) => i.type === 'existing' ? !imagesToRemove.includes(i.src) : true)
              .map((i: any) => i.type)
          ));
        } else {
          const imageSource = reorderedImages || editingAd.images || [];
          const remainingImages = imageSource.filter((img: string) => !imagesToRemove.includes(img));
          submitData.append('existingImages', JSON.stringify(remainingImages));
          // Add images in original order
          adImages.forEach(file => {
            submitData.append('images', file);
          });
        }

        if (combinedVideoOrder) {
          const existingInOrder = combinedVideoOrder
            .filter((i: any) => i.type === 'existing' && !videosToRemove.includes(i.src))
            .map((i: any) => i.src);
          submitData.append('existingVideos', JSON.stringify(existingInOrder));

          // Get new videos in the order they appear in combinedVideoOrder
          const newVideosInOrder = combinedVideoOrder
            .filter((i: any) => i.type === 'new')
            .map((i: any) => adVideos[i.index])
            .filter(Boolean);

          // Append new videos in the correct order
          newVideosInOrder.forEach(file => {
            submitData.append('videos', file);
          });

          submitData.append('videoOrder', JSON.stringify(
            combinedVideoOrder
              .filter((i: any) => i.type === 'existing' ? !videosToRemove.includes(i.src) : true)
              .map((i: any) => i.type)
          ));
        } else {
          const videoSource = reorderedVideos || editingAd.videos || [];
          const remainingVideos = videoSource.filter((vid: string) => !videosToRemove.includes(vid));
          submitData.append('existingVideos', JSON.stringify(remainingVideos));
          // Add videos in original order
          adVideos.forEach(file => {
            submitData.append('videos', file);
          });
        }

        response = await fetch(`${API_BASE_URL}/api/ads/${editingAd.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: submitData
        });
      } else {
        // Creating new ad - add images and videos in order
        adImages.forEach(file => {
          submitData.append('images', file);
        });
        adVideos.forEach(file => {
          submitData.append('videos', file);
        });

        response = await fetch(`${API_BASE_URL}/api/ads`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: submitData
        });
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save ad');
      }

      // Reset form
      setEditingAd(null);
      setAdImages([]);
      setAdVideos([]);
      setAdImagePreviews([]);
      setAdVideoPreviews([]);
      setSelectedNiches([]);
      setScriptRequired(false);
      setImagesToRemove([]);
      setVideosToRemove([]);
      setReorderedImages(null);
      setDraggedImageIndex(null);
      setReorderedVideos(null);
      setDraggedVideoIndex(null);
      setCombinedImageOrder(null);
      setCombinedVideoOrder(null);
      (e.target as HTMLFormElement).reset();

      // Refresh ads list
      fetchAds();
      alert(editingAd ? 'Ad updated successfully!' : 'Ad created successfully!');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle ad deletion
  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/ads/${adId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAds(prev => prev.filter(ad => ad.id !== adId));
      }
    } catch (err) {
      console.error('Failed to delete ad:', err);
    }
  };

  // Handle image upload for ads
  const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAdImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setAdImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // Handle video upload for ads
  const handleAdVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAdVideos(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setAdVideoPreviews(prev => [...prev, ...newPreviews]);
  };

  // Remove uploaded image
  const removeAdImage = (index: number) => {
    setAdImages(prev => prev.filter((_, i) => i !== index));
    setAdImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Remove uploaded video
  const removeAdVideo = (index: number) => {
    setAdVideos(prev => prev.filter((_, i) => i !== index));
    setAdVideoPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Show loading while checking auth, redirect happens in useEffect if not authenticated
  if (!authChecked || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { title: 'Total Earnings', value: '$2,450', change: '+12.5%', icon: DollarSign },
    { title: 'Active Campaigns', value: '8', change: '+2', icon: BarChart3 },
    { title: 'Total Reach', value: '125K', change: '+8.2%', icon: Users },
    { title: 'Avg. Engagement', value: '4.8%', change: '+0.3%', icon: TrendingUp },
  ];

  const platformOptions = [
    { name: 'YouTube', icon: Youtube, value: 'YOUTUBE' },
    { name: 'Instagram', icon: Instagram, value: 'INSTAGRAM' },
    { name: 'Twitter', icon: Twitter, value: 'TWITTER' },
    { name: 'Twitch', icon: Twitch, value: 'TWITCH' },
    { name: 'Facebook', icon: Facebook, value: 'FACEBOOK' },
    { name: 'TikTok', icon: Music, value: 'TIKTOK' },
  ];

  const getPlatformDisplayName = (enumValue: string) => {
    const option = platformOptions.find(p => p.value === enumValue);
    return option ? option.name : enumValue;
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  // Toggle individual channel selection by ID
  const toggleChannelSelection = (channelId: string, platform: string) => {
    setSelectedChannelIds(prev => {
      const newSelection = prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId];

      // Also update selectedPlatforms for the form submission (unique platforms only)
      const selectedChannels = userChannels.filter(ch =>
        newSelection.includes(ch.id)
      );
      const uniquePlatforms = [...new Set(selectedChannels.map(ch => ch.platform))];
      setSelectedPlatforms(uniquePlatforms);

      return newSelection;
    });
  };

  const handleEdit = async (announcement: any) => {
    const token = localStorage.getItem('token');
    let latestAnnouncement = announcement;
    try {
      const response = await fetch(`${API_BASE_URL}/api/content-announcements/${announcement.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        latestAnnouncement = await response.json();
      }
    } catch (err) {}
    setEditingAnnouncement(latestAnnouncement);
    setActiveView('quick-add');
    if (latestAnnouncement.thumbnail) {
      const url = latestAnnouncement.thumbnail.startsWith('http')
        ? latestAnnouncement.thumbnail
        : `${API_BASE_URL}${latestAnnouncement.thumbnail}`;
      setThumbnailPreview(url);
    } else {
      setThumbnailPreview(null);
    }
    // Set platforms and channelIds immediately (not inside setTimeout)
    const platforms = latestAnnouncement.platforms || [];
    setSelectedPlatforms(platforms);

    // If channelIds exist, use them; otherwise derive from platforms using userChannels
    let channelIdsToSelect = latestAnnouncement.channelIds || [];
    if (channelIdsToSelect.length === 0 && platforms.length > 0) {
      // For legacy announcements without channelIds, find matching channels by platform
      channelIdsToSelect = userChannels
        .filter((ch: any) => platforms.includes(ch.platform))
        .map((ch: any) => ch.id);
    }
    setSelectedChannelIds(channelIdsToSelect);

    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        const titleInput = form.querySelector('input[name="title"]') as HTMLInputElement;
        const descriptionTextarea = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
        const scheduledAtInput = form.querySelector('input[name="scheduledAt"]') as HTMLInputElement;
        if (titleInput) titleInput.value = latestAnnouncement.title;
        if (descriptionTextarea) descriptionTextarea.value = latestAnnouncement.description || '';
        if (scheduledAtInput) {
          const date = new Date(latestAnnouncement.scheduledAt);
          scheduledAtInput.value = date.toISOString().slice(0, 16);
        }
      }
    }, 100);
  };

  const handleDelete = (announcementId: string) => {
    setDeleteAnnouncementId(announcementId);
  };

  const confirmDelete = async () => {
    if (!deleteAnnouncementId) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/content-announcements/${deleteAnnouncementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setAnnouncements(prev => prev.filter(ann => ann.id !== deleteAnnouncementId));
        setDeleteAnnouncementId(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete announcement:', errorData);
        alert('Failed to delete announcement. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const scheduledAt = formData.get('scheduledAt') as string;
      const maxSlots = formData.get('maxSlots') as string;
      if (!title || selectedChannelIds.length === 0 || !scheduledAt || !description || (!thumbnailFile && !editingAnnouncement?.thumbnail)) {
        throw new Error('Please fill in all required fields, select at least one channel, and upload a thumbnail');
      }
      const submitData = new FormData();
      submitData.append('title', title);
      submitData.append('description', description || '');
      submitData.append('platforms', JSON.stringify(selectedPlatforms));
      submitData.append('channelIds', JSON.stringify(selectedChannelIds));
      submitData.append('scheduledAt', scheduledAt);
      submitData.append('maxSlots', maxSlots || '1');
      if (thumbnailFile) {
        submitData.append('thumbnail', thumbnailFile);
      }
      const token = localStorage.getItem('token');
      let response;
      if (editingAnnouncement) {
        response = await fetch(`${API_BASE_URL}/api/content-announcements/${editingAnnouncement.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: submitData,
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/content-announcements`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: submitData,
        });
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save announcement');
      }
      const result = await response.json();
      console.log('Announcement saved:', result);
      setSelectedPlatforms([]);
      setSelectedChannelIds([]);
      setEditingAnnouncement(null);
      setThumbnailPreview(null);
      setThumbnailFile(null);
      (e.target as HTMLFormElement).reset();
      setSuccessToast(editingAnnouncement ? 'Announcement updated successfully!' : 'Content announcement published!');
      fetchAnnouncements();
      setTimeout(() => {
        setSuccessToast(null);
        setActiveView('announcements');
      }, 1500);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        // Brand home view
        if (userType === 'brand') {
          // Use collabRequests for accurate campaign data
          const pendingCollabRequests = collabRequests.filter(r => r.status === 'PENDING');
          const activeCampaigns = collabRequests.filter(r => r.status === 'PAID');
          const awaitingPaymentCampaigns = collabRequests.filter(r => ['ACCEPTED', 'AD_SELECTED'].includes(r.status));
          const totalCollabRequests = collabRequests.length;

          // Brand-specific stats
          const brandStats = [
            { title: 'Total Ads', value: ads.length.toString(), icon: FileVideo, color: 'bg-blue-500' },
            { title: 'Active Campaigns', value: activeCampaigns.length.toString(), icon: CheckCircle, color: 'bg-green-500' },
            { title: 'Pending Requests', value: pendingCollabRequests.length.toString(), icon: Clock, color: 'bg-yellow-500' },
            { title: 'Awaiting Payment', value: awaitingPaymentCampaigns.length.toString(), icon: CreditCard, color: 'bg-purple-500' },
          ];

          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Welcome Header */}
              <div className="mb-8">
                <h2 className="text-4xl font-light text-gray-900 mb-2">Welcome back, {user.name}</h2>
                <p className="text-lg text-gray-600 font-light">Here's what's happening with your brand today</p>
              </div>

              {/* Brand Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {brandStats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.title}</div>
                  </motion.div>
                ))}
              </div>

              {/* Main Content - 3 Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="lg:col-span-1 space-y-4"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>

                  <button
                    onClick={() => setActiveView('ads')}
                    className="w-full bg-gray-900 text-white rounded-2xl p-5 text-left hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">Create New Ad</h4>
                        <p className="text-gray-400 text-sm">Upload ad materials for creators</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => window.location.href = '/hub'}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-lg">Find Creators</h4>
                        <p className="text-gray-500 text-sm">Browse and connect with creators</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveView('campaigns')}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <BarChart3 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-lg">View Campaigns</h4>
                        <p className="text-gray-500 text-sm">Track your active partnerships</p>
                      </div>
                    </div>
                  </button>
                </motion.div>

                {/* Your Ads */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-medium text-gray-900">Your Ads</h3>
                    <button
                      onClick={() => setActiveView('my-ads')}
                      className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                    >
                      View All
                    </button>
                  </div>

                  {ads.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileVideo className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-4">No ads created yet</p>
                      <button
                        onClick={() => setActiveView('ads')}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Create Your First Ad
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ads.slice(0, 4).map((ad, index) => (
                        <motion.div
                          key={ad.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => {
                            setEditingAd(ad);
                            setSelectedNiches(ad.targetNiches || []);
                            setScriptRequired(ad.scriptRequired || false);
                            setActiveView('ads');
                          }}
                        >
                          <div className="w-14 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {ad.images?.[0] ? (
                              <img src={`${API_BASE_URL}${ad.images[0]}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <FileVideo className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{ad.title}</p>
                            <p className="text-xs text-gray-500">{ad.adRequests?.length || 0} requests</p>
                          </div>
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ad.status === 'ACTIVE' ? '#22c55e' : '#9ca3af' }}></div>
                        </motion.div>
                      ))}
                      {ads.length > 4 && (
                        <button
                          onClick={() => setActiveView('my-ads')}
                          className="w-full text-center text-sm text-gray-500 hover:text-gray-900 py-2"
                        >
                          +{ads.length - 4} more ads
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Active Campaigns */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-medium text-gray-900">Active Campaigns</h3>
                    <button
                      onClick={() => setActiveView('campaigns')}
                      className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                    >
                      View All
                    </button>
                  </div>

                  {activeCampaigns.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-4">No active campaigns yet</p>
                      <button
                        onClick={() => window.location.href = '/hub'}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Find Creators
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeCampaigns.slice(0, 4).map((campaign, index) => {
                        const channels = campaign.channels || [];
                        const totalReach = channels.reduce((sum: number, ch: any) => sum + (ch.subscribers || 0), 0);
                        return (
                          <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors"
                            onClick={() => setActiveView('campaigns')}
                          >
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                              {campaign.creator?.avatar ? (
                                <img src={`${API_BASE_URL}${campaign.creator.avatar}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-medium text-green-700">{campaign.creator?.name?.[0] || '?'}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{campaign.creator?.name || 'Creator'}</p>
                              <p className="text-xs text-gray-500 truncate">
                                ${campaign.totalPrice?.toLocaleString() || '0'} • {totalReach >= 1000 ? `${(totalReach / 1000).toFixed(1)}K` : totalReach} reach
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              <span className="text-xs text-green-600 font-medium">Active</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Bottom Row - Pending Requests + Messages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pending Requests */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-medium text-gray-900">Pending Requests</h3>
                    <button
                      onClick={() => setActiveView('campaigns')}
                      className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                    >
                      View All
                    </button>
                  </div>

                  {pendingCollabRequests.length === 0 ? (
                    <div className="text-center py-6">
                      <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No pending requests</p>
                      <p className="text-xs text-gray-400 mt-1">Requests to creators will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingCollabRequests.slice(0, 4).map((request, index) => (
                        <motion.div
                          key={request.id || `pending-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl"
                        >
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                            {request.creator?.avatar ? (
                              <img src={`${API_BASE_URL}${request.creator.avatar}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-medium text-yellow-700">{request.creator?.name?.[0] || '?'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{request.creator?.name || 'Creator'}</p>
                            <p className="text-xs text-gray-500 truncate">${request.totalPrice?.toLocaleString() || '0'} • {(request.channels || []).length} channels</p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium flex-shrink-0">
                            Pending
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Recent Messages */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
                    <button
                      onClick={() => setActiveView('messages')}
                      className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                    >
                      View All
                    </button>
                  </div>

                  {conversations.length === 0 ? (
                    <div className="text-center py-6">
                      <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No messages yet</p>
                      <p className="text-xs text-gray-400 mt-1">Start a conversation with a creator</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {conversations.slice(0, 4).map((conv, index) => {
                        const unreadCount = unreadCounts[conv.partner?.id] || 0;
                        return (
                          <motion.div
                            key={conv.partner?.id || `brand-conv-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            onClick={() => {
                              setActiveConversation(conv);
                              setActiveView('messages');
                              if (unreadCount > 0) {
                                markAsRead(conv.partner.id);
                              }
                            }}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                              {conv.partner?.avatar ? (
                                <img src={`${API_BASE_URL}${conv.partner.avatar}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-medium text-gray-600">{conv.partner?.name?.[0] || '?'}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`font-medium text-sm truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{conv.partner?.name}</p>
                                {unreadCount > 0 && (
                                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium flex-shrink-0">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                  </span>
                                )}
                              </div>
                              {conv.lastMessage && (
                                <p className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                  {(() => {
                                    try {
                                      const parsed = JSON.parse(conv.lastMessage.content);
                                      if (parsed.type === 'COLLAB_REQUEST') {
                                        return '🤝 Collaboration Request';
                                      }
                                      return conv.lastMessage.content;
                                    } catch {
                                      return conv.lastMessage.content;
                                    }
                                  })()}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        }

        // Creator home view
        // Get upcoming announcements for creator
        const upcomingAnnouncements = announcements
          .filter(a => a.status === 'ACTIVE' && new Date(a.scheduledAt) > new Date())
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
          .slice(0, 3);

        // Calculate total subscribers from channels
        const totalSubscribers = userChannels.reduce((sum, ch) => sum + (ch.subscribers || 0), 0);
        const formatNumber = (num: number) => {
          if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
          if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
          return num.toString();
        };

        // Dynamic stats based on real data
        const creatorStats = [
          { title: 'Total Reach', value: formatNumber(totalSubscribers), change: '+8.2%', icon: Users, color: 'bg-blue-500' },
          { title: 'Connected Platforms', value: userChannels.length.toString(), change: `${userChannels.length} active`, icon: TrendingUp, color: 'bg-purple-500' },
          { title: 'Upcoming Content', value: upcomingAnnouncements.length.toString(), change: 'scheduled', icon: Megaphone, color: 'bg-green-500' },
          { title: 'Messages', value: conversations.length.toString(), change: 'conversations', icon: MessageSquare, color: 'bg-orange-500' },
        ];

        return (
          <>
            {/* Welcome Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
              <h2 className="text-4xl font-light text-gray-900 mb-2">Welcome back, {user.name}</h2>
              <p className="text-lg text-gray-600 font-light">Here's what's happening with your account today</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {creatorStats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.title}</div>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Quick Actions - Left Column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="lg:col-span-1 space-y-4"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>

                <button
                  onClick={() => setActiveView('quick-add')}
                  className="w-full bg-gray-900 text-white rounded-2xl p-5 text-left hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">Announce Content</h4>
                      <p className="text-gray-400 text-sm">Let brands know about upcoming videos</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveView('add-platform')}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <PlusCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg">Add Platform</h4>
                      <p className="text-gray-500 text-sm">Connect more social accounts</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => window.location.href = '/hub'}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg">Browse Brands</h4>
                      <p className="text-gray-500 text-sm">Find sponsorship opportunities</p>
                    </div>
                  </div>
                </button>
              </motion.div>

              {/* Connected Platforms - Middle Column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-medium text-gray-900">Your Platforms</h3>
                  <button
                    onClick={() => setActiveView('add-platform')}
                    className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                  >
                    + Add
                  </button>
                </div>

                {userChannels.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlusCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">No platforms connected yet</p>
                    <button
                      onClick={() => setActiveView('add-platform')}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Connect Platform
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userChannels.slice(0, 4).map((channel, index) => {
                      const PlatformIconComp = platformOptions.find(p => p.value === channel.platform)?.icon || Music;
                      return (
                        <motion.div
                          key={channel.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <PlatformIconComp className="w-5 h-5 text-gray-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{channel.channelName}</p>
                            <p className="text-xs text-gray-500">{formatNumber(channel.subscribers || 0)} subscribers</p>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </motion.div>
                      );
                    })}
                    {userChannels.length > 4 && (
                      <button
                        onClick={() => setActiveView('add-platform')}
                        className="w-full text-center text-sm text-gray-500 hover:text-gray-900 py-2"
                      >
                        +{userChannels.length - 4} more platforms
                      </button>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Upcoming Content - Right Column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-medium text-gray-900">Upcoming Content</h3>
                  <button
                    onClick={() => setActiveView('announcements')}
                    className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                  >
                    View All
                  </button>
                </div>

                {upcomingAnnouncements.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Megaphone className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">No upcoming content announced</p>
                    <button
                      onClick={() => setActiveView('quick-add')}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Announce Content
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAnnouncements.map((announcement, index) => (
                      <motion.div
                        key={announcement.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleEdit(announcement)}
                      >
                        <div className="flex items-start gap-3">
                          {announcement.thumbnail ? (
                            <img
                              src={`${API_BASE_URL}${announcement.thumbnail}`}
                              alt=""
                              className="w-14 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-14 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <FileVideo className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{announcement.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-500">
                                {new Date(announcement.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Recent Messages Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="bg-white border border-gray-200 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
                <button
                  onClick={() => setActiveView('messages')}
                  className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                >
                  View All
                </button>
              </div>

              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">No messages yet</p>
                  <p className="text-sm text-gray-400">Messages from brands will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {conversations.slice(0, 3).map((conv, index) => {
                    const unreadCount = unreadCounts[conv.partner?.id] || 0;
                    return (
                      <motion.div
                        key={conv.partner?.id || `conv-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => {
                          setActiveConversation(conv);
                          setActiveView('messages');
                          if (unreadCount > 0) {
                            markAsRead(conv.partner.id);
                          }
                        }}
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {conv.partner?.avatar ? (
                              <img src={`${API_BASE_URL}${conv.partner.avatar}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-medium text-gray-600">{conv.partner?.name?.[0] || '?'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{conv.partner?.name}</p>
                            <p className="text-xs text-gray-500">{conv.partner?.type === 'BRAND' ? 'Brand' : 'Creator'}</p>
                          </div>
                          {unreadCount > 0 && (
                            <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>
                            {(() => {
                              try {
                                const parsed = JSON.parse(conv.lastMessage.content);
                                if (parsed.type === 'COLLAB_REQUEST') {
                                  return '🤝 Collaboration Request';
                                }
                                return conv.lastMessage.content;
                              } catch {
                                return conv.lastMessage.content;
                              }
                            })()}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        );

      case 'quick-add':
        // Show each individual channel (supports multiple channels of same platform)
        const hasConnectedChannels = userChannels.length > 0;

        // Get platform icon by platform value
        const getPlatformIcon = (platform: string) => {
          const option = platformOptions.find(p => p.value === platform);
          return option?.icon || Music;
        };

        const getPlatformName = (platform: string) => {
          const option = platformOptions.find(p => p.value === platform);
          return option?.name || platform;
        };

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-7xl">
            {/* Header Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-8">
              <h2 className="text-3xl font-light text-gray-900 mb-2">
                {editingAnnouncement ? 'Edit Announcement' : 'Quick Add Content'}
              </h2>
              <p className="text-lg text-gray-600 font-light">
                {editingAnnouncement ? 'Update your content announcement details' : 'Let brands know about your upcoming content and get sponsorship opportunities'}
              </p>
            </motion.div>

            {/* Tips Banner */}
            {!editingAnnouncement && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Pro Tip: Get more brand deals</h3>
                    <p className="text-sm text-gray-600">
                      Announce your content 3-7 days in advance to give brands enough time to review and reach out.
                      Include a catchy title and detailed description to attract more sponsors.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Main Form */}
              <motion.div className="lg:col-span-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div className="bg-white border border-gray-200 rounded-3xl p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Content Title */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
                      <label className="block text-base font-medium text-gray-700 mb-2">Content Title <span className="text-red-500">*</span></label>
                      <input type="text" name="title" placeholder="e.g., iPhone 16 Pro Max Review, Travel Vlog: Tokyo Edition" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-100" required />
                      <p className="mt-1.5 text-xs text-gray-500">Make it catchy! This is what brands will see first.</p>
                    </motion.div>

                    {/* Platforms - Now shows each channel individually */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
                      <label className="block text-base font-medium text-gray-700 mb-3">Where will you post? <span className="text-red-500">*</span></label>
                      {hasConnectedChannels ? (
                        <div className="flex flex-wrap gap-3">
                          {userChannels.map((channel, index) => {
                            const Icon = getPlatformIcon(channel.platform);
                            const isSelected = selectedChannelIds.includes(channel.id);
                            return (
                              <motion.button
                                key={channel.id}
                                type="button"
                                onClick={() => toggleChannelSelection(channel.id, channel.platform)}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-100 text-sm font-medium ${
                                  isSelected
                                    ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                    : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700 hover:shadow-sm'
                                }`}
                              >
                                <Icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-100 ${isSelected ? 'text-white' : 'text-gray-700'}`} />
                                <div className="text-left">
                                  <span className="block">{getPlatformName(channel.platform)}</span>
                                  <span className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {channel.channelName || channel.title || 'Connected'}
                                  </span>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                          <PlusCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium mb-1">No platforms connected yet</p>
                          <p className="text-sm text-gray-500 mb-4">Connect your social media accounts to start announcing content</p>
                          <button
                            type="button"
                            onClick={() => setActiveView('add-platform')}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                          >
                            Connect Platforms
                          </button>
                        </div>
                      )}
                    </motion.div>

                    {/* Scheduled Date */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.8 }}>
                      <label className="block text-base font-medium text-gray-700 mb-2">When will you post? <span className="text-red-500">*</span></label>
                      <input type="date" name="scheduledAt" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 [&::-webkit-datetime-edit]:text-gray-900 [&::-webkit-calendar-picker-indicator]:opacity-60 transition-all duration-100" required />
                      <p className="mt-1.5 text-xs text-gray-500">Schedule at least 3 days ahead to give brands time to respond.</p>
                    </motion.div>

                    {/* Max Sponsor Slots */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.85 }}>
                      <label className="block text-base font-medium text-gray-700 mb-2">Sponsor Slots <span className="text-red-500">*</span></label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          name="maxSlots"
                          min="1"
                          max="10"
                          defaultValue="1"
                          className="w-24 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 text-center transition-all duration-100"
                        />
                        <span className="text-gray-600 text-sm">brand(s) can sponsor this content</span>
                      </div>
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <p className="text-xs text-amber-800">
                          <span className="font-medium">Tip:</span> Setting this to 1 creates exclusivity and urgency. The first brand to pay gets the spot, and the announcement is automatically removed from "Coming Up". Higher slots mean more potential sponsors but less exclusivity.
                        </p>
                      </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.9 }}>
                      <label className="block text-base font-medium text-gray-700 mb-2">Content Description <span className="text-red-500">*</span></label>
                      <textarea rows={4} name="description" placeholder="Describe what your content will be about. What topics will you cover? Who is your target audience? What kind of sponsors would be a good fit?" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 transition-all duration-100" required />
                    </motion.div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-2">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting || !hasConnectedChannels}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 1.0 }}
                        whileHover={{ scale: hasConnectedChannels ? 1.02 : 1 }}
                        whileTap={{ scale: hasConnectedChannels ? 0.98 : 1 }}
                        className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-xl hover:bg-gray-800 transition-all duration-100 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (editingAnnouncement ? 'Updating...' : 'Publishing...') : (editingAnnouncement ? 'Update Announcement' : 'Publish Announcement')}
                      </motion.button>
                      {editingAnnouncement && (
                        <motion.button
                          type="button"
                          onClick={() => {
                            setEditingAnnouncement(null);
                            setSelectedPlatforms([]);
                            setSelectedChannelIds([]);
                            setThumbnailPreview(null);
                            const form = document.querySelector('form') as HTMLFormElement;
                            if (form) form.reset();
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 1.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-100 font-medium"
                        >
                          Cancel
                        </motion.button>
                      )}
                    </div>
                    {submitError && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 text-sm font-medium">
                        {submitError}
                      </motion.div>
                    )}
                  </form>
                </div>
              </motion.div>

              {/* Right Sidebar - Thumbnail & Info */}
              <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                {/* Thumbnail Upload */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Content Thumbnail <span className="text-red-500">*</span></h3>
                  <motion.div
                    className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center py-8 px-6 hover:border-gray-400 transition-all duration-100 cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input type="file" name="thumbnail" accept="image/*" className="hidden" id="thumbnail-upload" onChange={handleThumbnailChange} />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full max-h-40 object-contain rounded-md mb-4" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-3 group-hover:text-gray-600 transition-colors duration-100" />
                          <p className="text-gray-600 font-medium mb-1 text-sm">Drop your thumbnail here</p>
                          <p className="text-xs text-gray-500 mb-3">or click to browse</p>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => document.getElementById('thumbnail-upload')?.click()}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-all duration-100 font-medium"
                      >
                        {thumbnailPreview ? 'Change Image' : 'Choose File'}
                      </button>
                      <p className="mt-3 text-xs text-gray-500">1280×720px recommended</p>
                    </label>
                  </motion.div>
                </div>

                {/* How it Works */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6">
                  <h3 className="font-medium text-gray-900 mb-4">How it works</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600">1</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Announce your content</p>
                        <p className="text-xs text-gray-500">Share what you'll be posting and when</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600">2</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Brands discover you</p>
                        <p className="text-xs text-gray-500">Relevant brands see your upcoming content</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600">3</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Get sponsorship offers</p>
                        <p className="text-xs text-gray-500">Receive and negotiate deals directly</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        );

      case 'announcements':
        const currentDate = new Date();
        const upcomingList = announcements.filter(a => new Date(a.scheduledAt) >= currentDate);
        const pastList = announcements.filter(a => new Date(a.scheduledAt) < currentDate);
        const filteredAnnouncements = announcementTab === 'upcoming' ? upcomingList : pastList;

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <h2 className="text-3xl font-light text-gray-900 mb-4">Content Announcements</h2>
              <p className="text-lg text-gray-600 font-light mb-6">Browse and manage your content announcements</p>

              {/* Tab Slider */}
              <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 mb-8">
                <button
                  onClick={() => setAnnouncementTab('upcoming')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    announcementTab === 'upcoming'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Upcoming
                  {upcomingList.length > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      announcementTab === 'upcoming' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {upcomingList.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setAnnouncementTab('past')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    announcementTab === 'past'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Past
                  {pastList.length > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      announcementTab === 'past' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {pastList.length}
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
            <div className="space-y-6">
              {filteredAnnouncements.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {announcementTab === 'upcoming' ? 'No upcoming announcements' : 'No past announcements'}
                  </p>
                  <p className="text-gray-400">
                    {announcementTab === 'upcoming'
                      ? 'Create an announcement to let brands know about your upcoming content'
                      : 'Your completed announcements will appear here'}
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAnnouncements.map((announcement, index) => {
                    const statusConfig = {
                      ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
                      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Completed' },
                      CANCELLED: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Cancelled' },
                    };
                    // Show "Full" if all slots are filled, even if status is still ACTIVE
                    const isFull = announcement.maxSlots > 0 && (announcement.filledSlots || 0) >= announcement.maxSlots;
                    const status = isFull
                      ? { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Full' }
                      : (statusConfig[announcement.status as keyof typeof statusConfig] || statusConfig.ACTIVE);

                    const platformIcons: Record<string, any> = {
                      YOUTUBE: Youtube,
                      INSTAGRAM: Instagram,
                      TWITTER: Twitter,
                      FACEBOOK: Facebook,
                      TWITCH: Twitch,
                      TIKTOK: Music,
                    };

                    return (
                      <motion.div
                        key={announcement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                        className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                      >
                        {/* Thumbnail Section */}
                        <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                          {announcement.thumbnail ? (
                            <img
                              src={`${API_BASE_URL}${announcement.thumbnail}`}
                              alt={announcement.title}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <span className="text-xs text-gray-400">No thumbnail</span>
                              </div>
                            </div>
                          )}
                          {/* Status Badge */}
                          <div className={`absolute top-3 left-3 ${status.bg} ${status.text} px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                            {status.label}
                          </div>
                          {/* Action Buttons */}
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <motion.button
                              onClick={() => handleEdit(announcement)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-gray-900 rounded-lg shadow-sm transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(announcement.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-600 rounded-lg shadow-sm transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </motion.button>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-5">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition-colors">
                            {announcement.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                            {announcement.description || 'No description provided'}
                          </p>

                          {/* Channels/Platforms */}
                          <div className="flex items-center gap-2 mb-4">
                            {(() => {
                              // Use channelIds if available, otherwise fall back to platforms
                              const channelIds = announcement.channelIds || [];
                              const channels = channelIds.length > 0
                                ? userChannels.filter((ch: any) => channelIds.includes(ch.id))
                                : userChannels.filter((ch: any) => announcement.platforms.includes(ch.platform));

                              return (
                                <>
                                  {channels.slice(0, 4).map((channel: any) => {
                                    const IconComponent = platformIcons[channel.platform] || Globe;
                                    return (
                                      <div
                                        key={channel.id}
                                        className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                                        title={`${channel.channelName || getPlatformDisplayName(channel.platform)}`}
                                      >
                                        <IconComponent className="w-4 h-4 text-gray-600" />
                                      </div>
                                    );
                                  })}
                                  {channels.length > 4 && (
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-medium text-gray-500">
                                      +{channels.length - 4}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>

                          {/* Sponsor Slots */}
                          {(announcement.maxSlots > 0) && (
                            <div className="flex items-center justify-between py-3 mb-3 bg-gray-50 rounded-lg px-3">
                              <span className="text-xs text-gray-500">Sponsor Slots</span>
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                  {Array.from({ length: announcement.maxSlots }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2.5 h-2.5 rounded-full ${i < (announcement.filledSlots || 0) ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                    />
                                  ))}
                                </div>
                                <span className={`text-xs font-medium ${announcement.filledSlots >= announcement.maxSlots ? 'text-emerald-600' : 'text-gray-600'}`}>
                                  {announcement.filledSlots || 0}/{announcement.maxSlots}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {announcement.creator.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{announcement.creator.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(announcement.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'add-platform':
        const allPlatforms = [
          { name: 'YouTube', icon: Youtube, value: 'YOUTUBE' },
          { name: 'Twitch', icon: Twitch, value: 'TWITCH' },
          { name: 'Facebook', icon: Facebook, value: 'FACEBOOK' },
          { name: 'Instagram', icon: Instagram, value: 'INSTAGRAM' },
          { name: 'Twitter', icon: Twitter, value: 'TWITTER' },
          { name: 'TikTok', icon: Music, value: 'TIKTOK' },
        ];

        const availablePlatforms = allPlatforms;

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-8">
              <h2 className="text-3xl font-light text-gray-900 mb-4">Your Connected Platforms</h2>
              <p className="text-lg text-gray-600 font-light">
                Manage and add new platforms to share your content announcements
              </p>
            </motion.div>

            {/* Connected Platforms */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Connected Platforms</h3>
                  <p className="text-sm text-gray-500 mt-1">Active channels and accounts</p>
                </div>
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                  <span className="text-sm font-semibold text-blue-700">{userChannels.length}</span>
                </div>
              </div>

              {userChannels.length === 0 ? (
                <div className="py-12 px-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">No platforms connected yet</p>
                  <p className="text-sm text-gray-500">Add your first platform below to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userChannels.map((channel: any) => {
                    const plat = allPlatforms.find(p => p.value === channel.platform);
                    const Icon = plat?.icon || Youtube;
                    return (
                      <motion.div
                        key={channel.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ x: 4 }}
                        className="bg-white border border-gray-200 hover:border-gray-300 rounded-lg p-4 flex items-center gap-4 transition-all hover:shadow-sm group"
                      >
                        <div className="relative flex-shrink-0">
                          {channel.thumbnail ? (
                            <img src={channel.thumbnail} alt={channel.channelName} className="w-10 h-10 rounded-lg object-cover border border-gray-200 group-hover:border-blue-300 transition-colors" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                              <Icon className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                          {channel.verified && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-gray-900 text-sm">
                              {plat ? plat.name : channel.platform}
                            </div>
                          </div>
                          <div className="text-gray-600 text-xs truncate">
                            {channel.channelName || channel.title || channel.username || 'Unknown'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap ${
                            channel.verified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {channel.verified ? 'Verified' : 'Connected'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setChannelToRemove(channel);
                            }}
                            className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove platform"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add New Platform */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add Platforms</h3>
                  <p className="text-sm text-gray-500 mt-1">Connect your social media accounts</p>
                </div>
                <PlusCircle className="w-6 h-6 text-gray-400" />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {availablePlatforms.map(({ name, icon: Icon, value }) => (
                  <motion.button
                    key={value}
                    onClick={() => {
                      const currentToken = localStorage.getItem('token');
                      if (!currentToken) {
                        alert('Please log in first');
                        return;
                      }
                      if (value === 'YOUTUBE') {
                        window.location.href = `${API_BASE_URL}/api/youtube/oauth/start?token=${currentToken}`;
                      } else if (value === 'TWITCH') {
                        window.location.href = `${API_BASE_URL}/api/twitch/oauth/start?token=${currentToken}`;
                      } else if (value === 'FACEBOOK') {
                        window.location.href = `${API_BASE_URL}/api/facebook/oauth/start?token=${currentToken}`;
                      } else if (value === 'INSTAGRAM') {
                        window.location.href = `${API_BASE_URL}/api/instagram/oauth/start?token=${currentToken}`;
                      } else if (value === 'TWITTER') {
                        window.location.href = `${API_BASE_URL}/api/twitter/oauth/start?token=${currentToken}`;
                      } else if (value === 'TIKTOK') {
                        window.location.href = `${API_BASE_URL}/api/tiktok/oauth/start?token=${currentToken}`;
                      } else {
                        setAddingPlatform(value);
                      }
                    }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg transition-all group cursor-pointer"
                  >
                    <Icon className="w-6 h-6 mb-2 text-gray-700 group-hover:text-gray-900 transition-colors" />
                    <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 text-center">{name}</span>
                  </motion.button>
                ))}
              </div>

              {/* YouTube Channel Selection */}
              {youtubeChannels.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 border border-gray-200 bg-white rounded-lg"
                >
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Select YouTube Channel
                  </h4>
                  {youtubeLoading ? (
                    <p className="text-sm text-gray-600">Loading your channels...</p>
                  ) : youtubeError ? (
                    <p className="text-sm text-red-600">{youtubeError}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {youtubeChannels.map((ch: any) => {
                        const isAlreadyConnected = userChannels.some(
                          (uc: any) => uc.platform === 'YOUTUBE' && (uc.channelId === ch.id || uc.id === ch.id)
                        );
                        return (
                          <motion.button
                            key={ch.id}
                            onClick={() => !isAlreadyConnected && setSelectedYoutubeChannel(ch)}
                            whileHover={!isAlreadyConnected ? { scale: 1.02 } : {}}
                            disabled={isAlreadyConnected}
                            className={`p-4 rounded-lg border transition-all text-left ${
                              isAlreadyConnected
                                ? 'border-green-300 bg-green-50 cursor-not-allowed opacity-70'
                                : selectedYoutubeChannel?.id === ch.id
                                  ? 'border-blue-600 bg-white shadow-md'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {ch.thumbnail ? (
                                <img src={ch.thumbnail} alt={ch.title} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <Youtube className="w-10 h-10 text-red-600" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{ch.title}</div>
                                <div className="text-xs text-gray-500">{ch.customUrl || ch.id}</div>
                                {isAlreadyConnected && (
                                  <div className="text-xs text-green-600 font-medium mt-1">Already Connected</div>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-4 flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setYoutubeChannels([]);
                        setSelectedYoutubeChannel(null);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!selectedYoutubeChannel || youtubeLoading}
                      onClick={async () => {
                        if (!selectedYoutubeChannel || !youtubeToken) return;
                        const userToken = localStorage.getItem('token');
                        const resp = await fetch(`${API_BASE_URL}/api/youtube/channel`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${youtubeToken}`,
                            'X-User-Token': userToken || '',
                          },
                          body: JSON.stringify({ channel: selectedYoutubeChannel }),
                        });
                        if (resp.ok) {
                          alert(`Channel "${selectedYoutubeChannel.title}" connected successfully!`);
                          const newChannel = {
                            id: selectedYoutubeChannel.id,
                            platform: 'YOUTUBE',
                            channelName: selectedYoutubeChannel.title,
                            title: selectedYoutubeChannel.title,
                            verified: selectedYoutubeChannel.verified || false,
                          };
                          setUserChannels(prev => [...prev, newChannel]);
                          setYoutubeChannels([]);
                          setSelectedYoutubeChannel(null);
                          setYoutubeToken(null);
                        } else {
                          const err = await resp.json();
                          alert(err.error || 'Failed to connect channel');
                        }
                      }}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
                    >
                      Connect
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Facebook Page Selection */}
              {facebookPages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 border border-gray-200 bg-white rounded-lg"
                >
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Select Facebook Page
                  </h4>
                  {facebookLoading ? (
                    <p className="text-sm text-gray-600">Loading your pages...</p>
                  ) : facebookError ? (
                    <p className="text-sm text-red-600">{facebookError}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {facebookPages.map((page: any) => {
                        const isAlreadyConnected = userChannels.some(
                          (uc: any) => uc.platform === 'FACEBOOK' && (uc.channelId === page.id || uc.id === page.id)
                        );
                        return (
                          <motion.button
                            key={page.id}
                            onClick={() => !isAlreadyConnected && setSelectedFacebookPage(page)}
                            whileHover={!isAlreadyConnected ? { scale: 1.02 } : {}}
                            disabled={isAlreadyConnected}
                            className={`p-4 rounded-lg border transition-all text-left ${
                              isAlreadyConnected
                                ? 'border-green-300 bg-green-50 cursor-not-allowed opacity-70'
                                : selectedFacebookPage?.id === page.id
                                  ? 'border-blue-600 bg-white shadow-md'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {page.picture ? (
                                <img src={page.picture} alt={page.name} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                  {page.name?.charAt(0)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{page.name}</div>
                                <div className="text-xs text-gray-500">{page.followers?.toLocaleString() || 0} followers</div>
                                {isAlreadyConnected && (
                                  <div className="text-xs text-green-600 font-medium mt-1">Already Connected</div>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-4 flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setFacebookPages([]);
                        setSelectedFacebookPage(null);
                        setFacebookToken(null);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!selectedFacebookPage || facebookLoading}
                      onClick={async () => {
                        if (!selectedFacebookPage || !facebookToken) return;
                        setFacebookLoading(true);
                        const userToken = localStorage.getItem('token');
                        const resp = await fetch(`${API_BASE_URL}/api/facebook/channel`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${facebookToken}`,
                            'X-User-Token': userToken || '',
                          },
                          body: JSON.stringify({ page: selectedFacebookPage }),
                        });
                        setFacebookLoading(false);
                        if (resp.ok) {
                          alert(`Page "${selectedFacebookPage.name}" connected successfully!`);
                          const newChannel = {
                            id: selectedFacebookPage.id,
                            platform: 'FACEBOOK',
                            channelName: selectedFacebookPage.name,
                            title: selectedFacebookPage.name,
                            verified: false,
                          };
                          setUserChannels(prev => [...prev, newChannel]);
                          setFacebookPages([]);
                          setSelectedFacebookPage(null);
                          setFacebookToken(null);
                        } else {
                          const err = await resp.json();
                          alert(err.error || 'Failed to connect page');
                        }
                      }}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
                    >
                      Connect
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Instagram Account Selection */}
              {instagramChannels.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 border border-gray-200 bg-white rounded-lg"
                >
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Select Instagram Account
                  </h4>
                  {instagramLoading ? (
                    <p className="text-sm text-gray-600">Loading your accounts...</p>
                  ) : instagramError ? (
                    <p className="text-sm text-red-600">{instagramError}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {instagramChannels.map((acc: any) => {
                        const isAlreadyConnected = userChannels.some(
                          (uc: any) => uc.platform === 'INSTAGRAM' && (uc.channelId === acc.id || uc.id === acc.id)
                        );
                        return (
                          <motion.button
                            key={acc.id}
                            onClick={() => !isAlreadyConnected && setSelectedInstagramAccount(acc)}
                            whileHover={!isAlreadyConnected ? { scale: 1.02 } : {}}
                            disabled={isAlreadyConnected}
                            className={`p-4 rounded-lg border transition-all text-left ${
                              isAlreadyConnected
                                ? 'border-green-300 bg-green-50 cursor-not-allowed opacity-70'
                                : selectedInstagramAccount?.id === acc.id
                                  ? 'border-pink-600 bg-white shadow-md'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {acc.profile_picture_url ? (
                                <img src={acc.profile_picture_url} alt={acc.username} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <Instagram className="w-10 h-10 text-pink-600" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">@{acc.username}</div>
                                <div className="text-xs text-gray-500">{acc.followers_count?.toLocaleString() || 0} followers</div>
                                {isAlreadyConnected && (
                                  <div className="text-xs text-green-600 font-medium mt-1">Already Connected</div>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-4 flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setInstagramChannels([]);
                        setSelectedInstagramAccount(null);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!selectedInstagramAccount || instagramLoading}
                      onClick={async () => {
                        if (!selectedInstagramAccount || !instagramToken) return;
                        const userToken = localStorage.getItem('token');
                        const resp = await fetch(`${API_BASE_URL}/api/instagram/account`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${instagramToken}`,
                            'X-User-Token': userToken || '',
                          },
                          body: JSON.stringify({ account: selectedInstagramAccount }),
                        });
                        if (resp.ok) {
                          alert(`Instagram account "@${selectedInstagramAccount.username}" connected successfully!`);
                          const newChannel = {
                            id: selectedInstagramAccount.id,
                            platform: 'INSTAGRAM',
                            channelName: selectedInstagramAccount.username,
                            title: selectedInstagramAccount.username,
                            verified: false,
                          };
                          setUserChannels(prev => [...prev, newChannel]);
                          setInstagramChannels([]);
                          setSelectedInstagramAccount(null);
                          setInstagramToken(null);
                        } else {
                          const err = await resp.json();
                          alert(err.error || 'Failed to connect account');
                        }
                      }}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
                    >
                      Connect
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Twitter Account Selection */}
              {twitterAccounts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 border border-gray-200 bg-white rounded-lg"
                >
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Select Twitter Account
                  </h4>
                  {twitterLoading ? (
                    <p className="text-sm text-gray-600">Loading your accounts...</p>
                  ) : twitterError ? (
                    <p className="text-sm text-red-600">{twitterError}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {twitterAccounts.map((acc: any) => {
                        const isAlreadyConnected = userChannels.some(
                          (uc: any) => uc.platform === 'TWITTER' && (uc.channelId === acc.id || uc.id === acc.id)
                        );
                        return (
                          <motion.button
                            key={acc.id}
                            onClick={() => !isAlreadyConnected && setSelectedTwitterAccount(acc)}
                            whileHover={!isAlreadyConnected ? { scale: 1.02 } : {}}
                            disabled={isAlreadyConnected}
                            className={`p-4 rounded-lg border transition-all text-left ${
                              isAlreadyConnected
                                ? 'border-green-300 bg-green-50 cursor-not-allowed opacity-70'
                                : selectedTwitterAccount?.id === acc.id
                                  ? 'border-blue-600 bg-white shadow-md'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {acc.picture ? (
                                <img src={acc.picture} alt={acc.username} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <Twitter className="w-10 h-10 text-blue-600" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">@{acc.username}</div>
                                <div className="text-xs text-gray-500">{acc.followers?.toLocaleString() || 0} followers</div>
                                {isAlreadyConnected && (
                                  <div className="text-xs text-green-600 font-medium mt-1">Already Connected</div>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-4 flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setTwitterAccounts([]);
                        setSelectedTwitterAccount(null);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!selectedTwitterAccount || twitterLoading}
                      onClick={async () => {
                        if (!selectedTwitterAccount || !twitterToken) return;
                        const userToken = localStorage.getItem('token');
                        const resp = await fetch(`${API_BASE_URL}/api/twitter/channel`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${twitterToken}`,
                            'X-User-Token': userToken || '',
                          },
                          body: JSON.stringify({ account: selectedTwitterAccount }),
                        });
                        if (resp.ok) {
                          alert(`Twitter account "@${selectedTwitterAccount.username}" connected successfully!`);
                          const newChannel = {
                            id: selectedTwitterAccount.id,
                            platform: 'TWITTER',
                            channelName: selectedTwitterAccount.username,
                            title: selectedTwitterAccount.username,
                            verified: selectedTwitterAccount.verified,
                          };
                          setUserChannels(prev => [...prev, newChannel]);
                          setTwitterAccounts([]);
                          setSelectedTwitterAccount(null);
                          setTwitterToken(null);
                        } else {
                          const err = await resp.json();
                          alert(err.error || 'Failed to connect account');
                        }
                      }}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
                    >
                      Connect
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TikTok Account Selection - Added */}
              {tiktokAccounts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 border border-gray-200 bg-white rounded-lg"
                >
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Select TikTok Account
                  </h4>
                  {tiktokLoading ? (
                    <p className="text-sm text-gray-600">Loading your accounts...</p>
                  ) : tiktokError ? (
                    <p className="text-sm text-red-600">{tiktokError}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {tiktokAccounts.map((acc: any) => {
                        const isAlreadyConnected = userChannels.some(
                          (uc: any) => uc.platform === 'TIKTOK' && (uc.channelId === acc.id || uc.id === acc.id)
                        );
                        return (
                          <motion.button
                            key={acc.id}
                            onClick={() => !isAlreadyConnected && setSelectedTikTokAccount(acc)}
                            whileHover={!isAlreadyConnected ? { scale: 1.02 } : {}}
                            disabled={isAlreadyConnected}
                            className={`p-4 rounded-lg border transition-all text-left ${
                              isAlreadyConnected
                                ? 'border-green-300 bg-green-50 cursor-not-allowed opacity-70'
                                : selectedTikTokAccount?.id === acc.id
                                  ? 'border-red-600 bg-white shadow-md'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {acc.picture ? (
                                <img src={acc.picture} alt={acc.username} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <Music className="w-10 h-10 text-red-600" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{acc.username}</div>
                                <div className="text-xs text-gray-500">{acc.followers?.toLocaleString() || 0} followers</div>
                                {isAlreadyConnected && (
                                  <div className="text-xs text-green-600 font-medium mt-1">Already Connected</div>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-4 flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setTikTokAccounts([]);
                        setSelectedTikTokAccount(null);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!selectedTikTokAccount || tiktokLoading}
                      onClick={async () => {
                        if (!selectedTikTokAccount || !tiktokToken) return;
                        const userToken = localStorage.getItem('token');
                        const resp = await fetch(`${API_BASE_URL}/api/tiktok/channel`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${tiktokToken}`,
                            'X-User-Token': userToken || '',
                          },
                          body: JSON.stringify({ account: selectedTikTokAccount }),
                        });
                        if (resp.ok) {
                          alert(`TikTok account "${selectedTikTokAccount.username}" connected successfully!`);
                          const newChannel = {
                            id: selectedTikTokAccount.id,
                            platform: 'TIKTOK',
                            channelName: selectedTikTokAccount.username,
                            title: selectedTikTokAccount.username,
                            verified: false,
                          };
                          setUserChannels(prev => [...prev, newChannel]);
                          setTikTokAccounts([]);
                          setSelectedTikTokAccount(null);
                          setTiktokToken(null);
                        } else {
                          const err = await resp.json();
                          alert(err.error || 'Failed to connect account');
                        }
                      }}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
                    >
                      Connect
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Other platforms placeholder */}
              {addingPlatform && addingPlatform !== 'YOUTUBE' && addingPlatform !== 'INSTAGRAM' && addingPlatform !== 'TWITTER' && addingPlatform !== 'TIKTOK' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 border border-gray-200 bg-gray-50 rounded-lg text-center"
                >
                  <h4 className="text-sm font-semibold mb-2">
                    Connect {allPlatforms.find(p => p.value === addingPlatform)?.name}
                  </h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Coming soon...
                  </p>
                  <button
                    onClick={() => setAddingPlatform(null)}
                    className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      // ============= BRAND VIEWS =============
      case 'ads':
        if (userType !== 'brand') return null;

        // If we have a selected collaboration request, show ad selection mode
        if (selectedCollabRequest) {
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl">
              <div className="mb-8">
                <button
                  onClick={() => setSelectedCollabRequest(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
                <h2 className="text-3xl font-light text-gray-900 mb-2">Complete Collaboration</h2>
                <p className="text-lg text-gray-600 font-light">
                  Select an ad material to send to {selectedCollabRequest.creator?.name}
                </p>
              </div>

              {/* Collaboration Details */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                    {selectedCollabRequest.creator?.avatar ? (
                      <img src={`${API_BASE_URL}${selectedCollabRequest.creator.avatar}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold text-gray-400">{selectedCollabRequest.creator?.name?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedCollabRequest.creator?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {(selectedCollabRequest.channels || []).length} platform{(selectedCollabRequest.channels || []).length > 1 ? 's' : ''} • ${selectedCollabRequest.totalPrice?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedCollabRequest.channels || []).map((ch: any, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                      {ch.channelName} • {ch.placementLabel}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ad Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Ad Material</h3>
                {ads.length === 0 ? (
                  <div className="text-center py-8">
                    <FileVideo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No ad materials created yet</p>
                    <button
                      onClick={() => setSelectedCollabRequest(null)}
                      className="px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
                    >
                      Create Ad Material First
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ads.map((ad) => (
                      <div
                        key={ad.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors cursor-pointer"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(`${API_BASE_URL}/api/collaboration-requests/${selectedCollabRequest.id}/attach-ad`, {
                              method: 'PUT',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ adId: ad.id }),
                            });
                            if (response.ok) {
                              setSelectedCollabRequest(null);
                              setActiveView('requests');
                              fetchCollabRequests();
                              window.dispatchEvent(new Event('requestUpdated'));
                              alert('Collaboration completed! The creator has been notified.');
                            }
                          } catch (error) {
                            console.error('Error attaching ad:', error);
                          }
                        }}
                      >
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {ad.images?.[0] ? (
                              <img src={`${API_BASE_URL}${ad.images[0]}`} alt="" className="w-full h-full object-cover" />
                            ) : ad.videos?.[0] ? (
                              <video src={`${API_BASE_URL}${ad.videos[0]}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileVideo className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{ad.title}</h4>
                            <p className="text-sm text-gray-500 truncate">{ad.description || 'No description'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {ad.images?.length > 0 && (
                                <span className="text-xs text-gray-400">{ad.images.length} images</span>
                              )}
                              {ad.videos?.length > 0 && (
                                <span className="text-xs text-gray-400">{ad.videos.length} videos</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        }

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-light text-gray-900 mb-2">
                  {editingAd ? 'Edit Ad Material' : 'Create Ad Material'}
                </h2>
                <p className="text-lg text-gray-600 font-light">
                  {editingAd ? 'Update your ad campaign details' : 'Create engaging ad materials for creators to promote'}
                </p>
              </div>
              {!editingAd && ads.length > 0 && (
                <button
                  onClick={() => setActiveView('home')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  View All Ads
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ad Form */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-3xl p-8">
                  <form onSubmit={handleAdSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={editingAd?.title || ''}
                        placeholder="e.g., Summer Sale Promotion, New Product Launch"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-500"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        defaultValue={editingAd?.description || ''}
                        placeholder="Describe your campaign objectives and what you're looking for..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                      />
                    </div>

                    {/* Target Niches */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Target Creator Niches</label>
                      <div className="flex flex-wrap gap-2">
                        {nicheOptions.map(niche => (
                          <button
                            key={niche.value}
                            type="button"
                            onClick={() => setSelectedNiches(prev =>
                              prev.includes(niche.value)
                                ? prev.filter(n => n !== niche.value)
                                : [...prev, niche.value]
                            )}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              selectedNiches.includes(niche.value)
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {niche.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Talking Points */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="inline w-4 h-4 mr-1" />
                        Talking Points
                      </label>
                      <textarea
                        name="talkingPoints"
                        rows={4}
                        defaultValue={editingAd?.talkingPoints || ''}
                        placeholder="What should creators mention or highlight?&#10;• Key product features&#10;• Discount codes&#10;• Call-to-action"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                      />
                    </div>

                    {/* Guidelines */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand Guidelines</label>
                      <textarea
                        name="guidelines"
                        rows={3}
                        defaultValue={editingAd?.guidelines || ''}
                        placeholder="Any specific requirements, do's and don'ts, brand voice guidelines..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                      />
                    </div>

                    {/* Media Upload - Compact Grid */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Media Files</label>
                      <div className="flex gap-3">
                        {/* Image Upload */}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAdImageUpload}
                            className="hidden"
                            id="ad-images"
                          />
                          <label
                            htmlFor="ad-images"
                            className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all group"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                              <Image className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Images</p>
                              <p className="text-xs text-gray-400">PNG, JPG</p>
                            </div>
                            {adImagePreviews.length > 0 && (
                              <span className="ml-auto bg-gray-900 text-white text-xs px-2 py-0.5 rounded-full">
                                {adImagePreviews.length}
                              </span>
                            )}
                          </label>
                        </div>

                        {/* Video Upload */}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="video/*"
                            multiple
                            onChange={handleAdVideoUpload}
                            className="hidden"
                            id="ad-videos"
                          />
                          <label
                            htmlFor="ad-videos"
                            className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all group"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                              <Video className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Videos</p>
                              <p className="text-xs text-gray-400">MP4, MOV</p>
                            </div>
                            {adVideoPreviews.length > 0 && (
                              <span className="ml-auto bg-gray-900 text-white text-xs px-2 py-0.5 rounded-full">
                                {adVideoPreviews.length}
                              </span>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Script Required Toggle - for image-only ads */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${scriptRequired ? 'bg-purple-100' : 'bg-gray-100'}`}>
                            <Mic className={`w-5 h-5 ${scriptRequired ? 'text-purple-600' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Script Required</p>
                            <p className="text-xs text-gray-500">Creator will speak/narrate about your product</p>
                          </div>
                        </div>
                        <button
                          type="button"
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
                            <span className="font-medium">+50% pricing applies.</span> When enabled, creators will read your script or talk about your product. This is ideal for image-only ads where you want verbal promotion.
                          </p>
                        </div>
                      )}
                    </div>

                    {submitError && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                        {submitError}
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : (editingAd ? 'Update Ad' : 'Create Ad')}
                      </button>
                      {editingAd && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAd(null);
                            setSelectedNiches([]);
                            setScriptRequired(false);
                            setAdImages([]);
                            setAdVideos([]);
                            setAdImagePreviews([]);
                            setAdVideoPreviews([]);
                            setImagesToRemove([]);
                            setVideosToRemove([]);
                            setReorderedImages(null);
                            setDraggedImageIndex(null);
                            setReorderedVideos(null);
                            setDraggedVideoIndex(null);
                            setCombinedImageOrder(null);
                            setCombinedVideoOrder(null);
                          }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Sidebar - Tips */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-3xl p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Tips for Success</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-gray-600">Include clear talking points for consistent messaging</p>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-gray-600">Upload high-quality images and videos</p>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-gray-600">Be specific about brand guidelines</p>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-gray-600">Target relevant niches for better results</p>
                    </div>
                  </div>
                </div>

                {/* Current Images - shows existing + new uploads */}
                {(() => {
                  // Build the display list - use combinedImageOrder if available, otherwise default order
                  let allImages: any[];

                  if (combinedImageOrder) {
                    // Use saved combined order, filtering out removed items and updating new image indices
                    allImages = combinedImageOrder
                      .filter((item: any) => {
                        if (item.type === 'existing') return !imagesToRemove.includes(item.src);
                        // For new images, check if the index still exists
                        return item.index < adImagePreviews.length;
                      })
                      .map((item: any) => {
                        if (item.type === 'new') {
                          // Update src to current preview
                          return { ...item, src: adImagePreviews[item.index] };
                        }
                        return item;
                      });

                    // Add any new images that aren't in the combined order yet
                    const existingNewIndices = new Set(allImages.filter((i: any) => i.type === 'new').map((i: any) => i.index));
                    adImagePreviews.forEach((preview, idx) => {
                      if (!existingNewIndices.has(idx)) {
                        allImages.push({ type: 'new', src: preview, index: idx });
                      }
                    });
                  } else {
                    // Default: existing first, then new
                    const existingImages = editingAd ? (reorderedImages || editingAd.images || []).filter((img: string) => !imagesToRemove.includes(img)) : [];
                    const existingMapped = existingImages.map((img: string) => ({ type: 'existing', src: img }));
                    const newImages = adImagePreviews.map((preview, idx) => ({ type: 'new', src: preview, index: idx }));
                    allImages = [...existingMapped, ...newImages];
                  }

                  if (allImages.length === 0) return null;

                  return (
                    <div className="bg-white border border-gray-200 rounded-3xl p-6">
                      <h3 className="font-medium text-gray-900 mb-4">Current Images <span className="text-sm font-normal text-gray-500">(drag to reorder, first image is thumbnail)</span></h3>
                      <div className="flex flex-wrap gap-3">
                        {allImages.map((item: any, index: number) => (
                          <div
                            key={item.type === 'existing' ? item.src : `new-${item.index}`}
                            draggable
                            onDragStart={() => setDraggedImageIndex(index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (draggedImageIndex === null || draggedImageIndex === index) return;

                              // Reorder the combined list and save it
                              const newAllImages = [...allImages];
                              const [draggedItem] = newAllImages.splice(draggedImageIndex, 1);
                              newAllImages.splice(index, 0, draggedItem);

                              // Save the combined order
                              setCombinedImageOrder(newAllImages);
                              setDraggedImageIndex(null);
                            }}
                            onDragEnd={() => setDraggedImageIndex(null)}
                            className={`relative group cursor-grab active:cursor-grabbing ${
                              draggedImageIndex === index ? 'opacity-50' : ''
                            } ${index === 0 ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                          >
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                            <img
                              src={item.type === 'existing' ? `${API_BASE_URL}${item.src}` : item.src}
                              alt=""
                              className={`w-20 h-14 object-cover rounded-lg ${item.type === 'new' ? 'border-2 border-dashed border-green-400' : 'border border-gray-200'}`}
                            />
                            {index === 0 && (
                              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                Thumbnail
                              </span>
                            )}
                            {item.type === 'new' && (
                              <span className="absolute -top-1 -left-1 bg-green-500 text-white text-[8px] px-1 py-0.5 rounded font-medium">
                                NEW
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (item.type === 'existing') {
                                  setImagesToRemove(prev => [...prev, item.src]);
                                } else {
                                  removeAdImage(item.index);
                                }
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {imagesToRemove.length > 0 && (
                        <p className="mt-3 text-sm text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {imagesToRemove.length} image(s) will be removed on save
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Current Videos - shows existing + new uploads */}
                {(() => {
                  // Build the display list - use combinedVideoOrder if available, otherwise default order
                  let allVideos: any[];

                  if (combinedVideoOrder) {
                    // Use saved combined order, filtering out removed items and updating new video indices
                    allVideos = combinedVideoOrder
                      .filter((item: any) => {
                        if (item.type === 'existing') return !videosToRemove.includes(item.src);
                        return item.index < adVideoPreviews.length;
                      })
                      .map((item: any) => {
                        if (item.type === 'new') {
                          return { ...item, src: adVideoPreviews[item.index] };
                        }
                        return item;
                      });

                    // Add any new videos that aren't in the combined order yet
                    const existingNewIndices = new Set(allVideos.filter((i: any) => i.type === 'new').map((i: any) => i.index));
                    adVideoPreviews.forEach((preview, idx) => {
                      if (!existingNewIndices.has(idx)) {
                        allVideos.push({ type: 'new', src: preview, index: idx });
                      }
                    });
                  } else {
                    // Default: existing first, then new
                    const existingVideos = editingAd ? (reorderedVideos || editingAd.videos || []).filter((vid: string) => !videosToRemove.includes(vid)) : [];
                    const existingMapped = existingVideos.map((vid: string) => ({ type: 'existing', src: vid }));
                    const newVideos = adVideoPreviews.map((preview, idx) => ({ type: 'new', src: preview, index: idx }));
                    allVideos = [...existingMapped, ...newVideos];
                  }

                  if (allVideos.length === 0) return null;

                  return (
                    <div className="bg-white border border-gray-200 rounded-3xl p-6">
                      <h3 className="font-medium text-gray-900 mb-4">Current Videos <span className="text-sm font-normal text-gray-500">(drag to reorder)</span></h3>
                      <div className="flex flex-wrap gap-3">
                        {allVideos.map((item: any, index: number) => (
                          <div
                            key={item.type === 'existing' ? item.src : `new-${item.index}`}
                            draggable
                            onDragStart={() => setDraggedVideoIndex(index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (draggedVideoIndex === null || draggedVideoIndex === index) return;

                              // Reorder the combined list and save it
                              const newAllVideos = [...allVideos];
                              const [draggedItem] = newAllVideos.splice(draggedVideoIndex, 1);
                              newAllVideos.splice(index, 0, draggedItem);

                              // Save the combined order
                              setCombinedVideoOrder(newAllVideos);
                              setDraggedVideoIndex(null);
                            }}
                            onDragEnd={() => setDraggedVideoIndex(null)}
                            className={`relative group cursor-grab active:cursor-grabbing ${
                              draggedVideoIndex === index ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                            <video
                              src={item.type === 'existing' ? `${API_BASE_URL}${item.src}` : item.src}
                              className={`w-32 h-20 object-cover rounded-lg ${item.type === 'new' ? 'border-2 border-dashed border-green-400' : 'border border-gray-200'}`}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                                <Video className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            {item.type === 'new' && (
                              <span className="absolute -top-1 -left-1 bg-green-500 text-white text-[8px] px-1 py-0.5 rounded font-medium">
                                NEW
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (item.type === 'existing') {
                                  setVideosToRemove(prev => [...prev, item.src]);
                                } else {
                                  removeAdVideo(item.index);
                                }
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {videosToRemove.length > 0 && (
                        <p className="mt-3 text-sm text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {videosToRemove.length} video(s) will be removed on save
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        );

      case 'my-ads':
        if (userType !== 'brand') return null;
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-light text-gray-900 mb-2">My Ad Materials</h2>
                <p className="text-lg text-gray-600 font-light">View and manage all your created ad materials</p>
              </div>
              <button
                onClick={() => setActiveView('ads')}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
            </div>

            {ads.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-3xl p-16 text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                  <FileVideo className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No ads created yet</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Create your first ad material to start engaging with creators and grow your brand</p>
                <button
                  onClick={() => setActiveView('ads')}
                  className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                >
                  Create Your First Ad
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad, index) => (
                  <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
                  >
                    {/* Ad Thumbnail with Overlay */}
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
                      {ad.images?.[0] ? (
                        <img
                          src={`${API_BASE_URL}${ad.images[0]}`}
                          alt={ad.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : ad.videos?.[0] ? (
                        <video
                          src={`${API_BASE_URL}${ad.videos[0]}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl flex items-center justify-center">
                            <FileVideo className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                          ad.status === 'DRAFT' ? 'bg-gray-900/70 text-white' :
                          ad.status === 'ACTIVE' ? 'bg-green-500/90 text-white' :
                          ad.status === 'PENDING' ? 'bg-amber-500/90 text-white' :
                          'bg-gray-900/70 text-white'
                        }`}>
                          {ad.status === 'ACTIVE' && <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>}
                          {ad.status}
                        </span>
                      </div>

                      {/* Media Count Badges */}
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        {(ad.images?.length || 0) > 0 && (
                          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white rounded-lg text-xs font-medium flex items-center gap-1">
                            <Image className="w-3.5 h-3.5" />
                            {ad.images.length}
                          </span>
                        )}
                        {(ad.videos?.length || 0) > 0 && (
                          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white rounded-lg text-xs font-medium flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" />
                            {ad.videos.length}
                          </span>
                        )}
                      </div>

                      {/* Hover Actions Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingAd(ad);
                              setSelectedNiches(ad.targetNiches || []);
                              setScriptRequired(ad.scriptRequired || false);
                              setActiveView('ads');
                            }}
                            className="px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Ad Info */}
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-1.5 truncate text-lg">{ad.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {ad.description || 'No description provided'}
                      </p>

                      {/* Target Niches */}
                      {ad.targetNiches?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {ad.targetNiches.slice(0, 2).map((niche: string) => (
                            <span key={niche} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              {niche}
                            </span>
                          ))}
                          {ad.targetNiches.length > 2 && (
                            <span className="px-2.5 py-1 bg-gray-900 text-white rounded-full text-xs font-medium">
                              +{ad.targetNiches.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Date Row */}
                      <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-400">
                          Created {new Date(ad.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        );

      case 'campaigns':
        if (userType !== 'brand') return null;
        // Filter campaigns: AD_SELECTED (awaiting payment), PAID (active), COMPLETED (finished)
        const campaigns = collabRequests.filter(r => ['AD_SELECTED', 'PAID', 'COMPLETED'].includes(r.status));
        const awaitingPayment = campaigns.filter(r => r.status === 'AD_SELECTED');
        const activeCampaigns = campaigns.filter(r => r.status === 'PAID');
        const completedCampaigns = campaigns.filter(r => r.status === 'COMPLETED');

        const formatPrice = (price: number) => {
          return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
        };

        // Campaign stats
        const totalSpent = [...activeCampaigns, ...completedCampaigns].reduce((sum, c) => sum + (c.totalPrice || 0), 0);
        const totalReachCampaigns = [...activeCampaigns, ...completedCampaigns].reduce((sum, c) =>
          sum + (c.channels || []).reduce((s: number, ch: any) => s + (ch.subscribers || 0), 0), 0);

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Campaigns</h2>
              <p className="text-gray-500">Manage your creator partnerships and track campaign progress</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{awaitingPayment.length}</p>
                <p className="text-sm text-amber-700">Awaiting Payment</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{activeCampaigns.length}</p>
                <p className="text-sm text-emerald-700">Active</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{completedCampaigns.length}</p>
                <p className="text-sm text-blue-700">Completed</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{formatPrice(totalSpent)}</p>
                <p className="text-sm text-gray-400">Total Invested</p>
              </div>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Start collaborating with creators to grow your brand. Browse our marketplace to find the perfect match.</p>
                <button
                  onClick={() => window.location.href = '/hub'}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Browse Creators
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Awaiting Payment Section */}
                {awaitingPayment.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-2 h-8 bg-gray-400 rounded-full" />
                      <h3 className="text-lg font-semibold text-gray-900">Awaiting Payment</h3>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{awaitingPayment.length}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {awaitingPayment.map((campaign) => {
                        const channels = campaign.channels || [];
                        const totalReach = channels.reduce((sum: number, ch: any) => sum + (ch.subscribers || 0), 0);
                        return (
                          <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                          >
                            <div className="p-6">
                              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                {/* Creator Info */}
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                                      {campaign.creator?.avatar ? (
                                        <img src={`${API_BASE_URL}${campaign.creator.avatar}`} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-xl font-bold text-gray-400">{campaign.creator?.name?.[0]}</span>
                                      )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center ring-2 ring-white">
                                      <Clock className="w-3 h-3 text-white" />
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{campaign.creator?.name}</h4>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {totalReach.toLocaleString()} reach
                                      </span>
                                      <span>•</span>
                                      <span>{channels.length} placement{channels.length !== 1 ? 's' : ''}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Ad Material - Clickable to change */}
                                {campaign.ad && (
                                  <button
                                    onClick={() => { window.location.href = `/complete-collab/${campaign.id}`; }}
                                    className="group flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                                  >
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                      {campaign.ad.images?.length > 0 ? (
                                        <img src={`${API_BASE_URL}${campaign.ad.images[0]}`} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <FileVideo className="w-5 h-5 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Ad Material</p>
                                      <p className="font-medium text-gray-900 text-sm">{campaign.ad.title}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Change</span>
                                    </div>
                                  </button>
                                )}

                                {/* Price & Action */}
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatPrice(campaign.totalPrice)}</p>
                                  </div>
                                  <button
                                    onClick={() => processPayment(campaign.id)}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
                                  >
                                    <CreditCard className="w-5 h-5" />
                                    Pay Now
                                  </button>
                                </div>
                              </div>

                              {/* Channels Preview */}
                              <div className="mt-5 pt-5 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2">
                                  {channels.map((ch: any, idx: number) => {
                                    const PlatformIcon = ch.platform === 'YOUTUBE' ? Youtube :
                                      ch.platform === 'INSTAGRAM' ? Instagram :
                                      ch.platform === 'TWITTER' ? Twitter :
                                      ch.platform === 'TWITCH' ? Twitch :
                                      ch.platform === 'FACEBOOK' ? Facebook :
                                      ch.platform === 'TIKTOK' ? Music : Globe;
                                    return (
                                      <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
                                        <PlatformIcon className="w-4 h-4 text-gray-600" />
                                        <span className="font-medium text-gray-700">{ch.channelName}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-500">{ch.placementLabel}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Active Campaigns Section */}
                {activeCampaigns.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                      <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">{activeCampaigns.length}</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {activeCampaigns.map((campaign) => {
                        const channels = campaign.channels || [];
                        const totalReach = channels.reduce((sum: number, ch: any) => sum + (ch.subscribers || 0), 0);
                        return (
                          <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
                          >
                            {/* Header */}
                            <div className="p-5 border-b border-gray-100">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                                      {campaign.creator?.avatar ? (
                                        <img src={`${API_BASE_URL}${campaign.creator.avatar}`} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-lg font-bold text-gray-400">{campaign.creator?.name?.[0]}</span>
                                      )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{campaign.creator?.name}</h4>
                                    <p className="text-sm text-gray-500">{campaign.ad?.title}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                  Active
                                </div>
                              </div>
                            </div>

                            {/* Long-term deal video progress */}
                            {campaign.isLongTermDeal && (
                              <div className="px-5 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                  {Array.from({ length: campaign.videoCount }).map((_, idx) => {
                                    const isCompleted = idx < (campaign.videosPosted || 0);
                                    return (
                                      <div
                                        key={idx}
                                        className={`flex-1 h-1.5 rounded-full ${
                                          isCompleted ? 'bg-gray-900' : 'bg-gray-200'
                                        }`}
                                      />
                                    );
                                  })}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {campaign.videosPosted || 0}/{campaign.videoCount} videos
                                  </span>
                                  <span className="text-xs font-medium text-gray-700">
                                    {Math.round(((campaign.videosPosted || 0) / campaign.videoCount) * 100)}%
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50">
                              <div className="p-4 text-center">
                                <p className="text-lg font-bold text-gray-900">{channels.length}</p>
                                <p className="text-xs text-gray-500">Placements</p>
                              </div>
                              <div className="p-4 text-center">
                                <p className="text-lg font-bold text-gray-900">{totalReach.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Total Reach</p>
                              </div>
                              <div className="p-4 text-center">
                                <p className="text-lg font-bold text-gray-900">{formatPrice(campaign.totalPrice)}</p>
                                <p className="text-xs text-gray-500">Invested</p>
                              </div>
                            </div>

                            {/* Platforms */}
                            <div className="p-4 border-t border-gray-100">
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {channels.slice(0, 4).map((ch: any, idx: number) => {
                                  const PlatformIcon = ch.platform === 'YOUTUBE' ? Youtube :
                                    ch.platform === 'INSTAGRAM' ? Instagram :
                                    ch.platform === 'TWITTER' ? Twitter :
                                    ch.platform === 'TWITCH' ? Twitch :
                                    ch.platform === 'FACEBOOK' ? Facebook :
                                    ch.platform === 'TIKTOK' ? Music : Globe;
                                  return (
                                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs">
                                      <PlatformIcon className="w-3.5 h-3.5 text-gray-600" />
                                      <span className="text-gray-700">{ch.placementLabel}</span>
                                    </span>
                                  );
                                })}
                                {channels.length > 4 && (
                                  <span className="px-2.5 py-1 text-xs text-gray-500">+{channels.length - 4} more</span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setActiveConversation({ partner: campaign.creator });
                                  setActiveView('messages');
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium"
                              >
                                <MessageSquare className="w-4 h-4" />
                                Message Creator
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Completed Campaigns Section */}
                {completedCampaigns.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-2 h-8 bg-gray-300 rounded-full" />
                      <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{completedCampaigns.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {completedCampaigns.map((campaign) => {
                        const channels = campaign.channels || [];
                        return (
                          <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                                {campaign.creator?.avatar ? (
                                  <img src={`${API_BASE_URL}${campaign.creator.avatar}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-gray-600 font-semibold">{campaign.creator?.name?.[0]}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{campaign.creator?.name}</h4>
                                <p className="text-sm text-gray-500 truncate">{campaign.ad?.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                {[...new Set(channels.map((ch: any) => ch.platform))].slice(0, 3).map((platform: any, idx: number) => {
                                  const PlatformIcon = platform === 'YOUTUBE' ? Youtube :
                                    platform === 'INSTAGRAM' ? Instagram :
                                    platform === 'TWITTER' ? Twitter :
                                    platform === 'TWITCH' ? Twitch :
                                    platform === 'FACEBOOK' ? Facebook :
                                    platform === 'TIKTOK' ? Music : Globe;
                                  return <PlatformIcon key={idx} className="w-4 h-4 text-gray-400" />;
                                })}
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-medium text-gray-900">{formatPrice(campaign.totalPrice)}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );

      case 'pricing':
        if (userType !== 'creator') return null;

        // Calculate base price based on subscriber count
        const getBasePrice = (subscribers: number | null | undefined): number => {
          if (!subscribers || subscribers === 0) return 25; // $50 for 30s = $25 for 15s base

          // Estimate views (avg 10% of subscribers)
          const estimatedViews = Math.round(subscribers * 0.10);
          // Base CPM of $15
          const cpm = 15;
          // Price = (views / 1000) × CPM, then halve for 15s
          let price = ((estimatedViews / 1000) * cpm) * 0.5;

          // Apply minimum thresholds
          if (subscribers < 10000) {
            price = Math.max(50, price); // Min $50 for nano
          } else if (subscribers < 100000) {
            price = Math.max(250, price); // Min $250 for micro
          } else if (subscribers < 500000) {
            price = Math.max(1000, price); // Min $1,000 for mid
          } else if (subscribers < 1000000) {
            price = Math.max(2500, price); // Min $2,500 for macro
          }

          return Math.round(price);
        };

        const formatPriceDisplay = (price: number) => {
          return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
        };

        const getPricingPlatformIcon = (platform: string) => {
          switch (platform) {
            case 'YOUTUBE': return Youtube;
            case 'INSTAGRAM': return Instagram;
            case 'TWITTER': return Twitter;
            case 'TWITCH': return Twitch;
            case 'FACEBOOK': return Facebook;
            case 'TIKTOK': return Music;
            default: return Globe;
          }
        };

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Pricing</h2>
              <p className="text-gray-500">Base rate per ad based on your subscriber count. Video ads are priced per 15 seconds, image ads are a flat rate.</p>
            </div>

            {userChannels.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No channels connected yet</p>
                <button
                  onClick={() => setActiveView('add-platform')}
                  className="text-gray-900 font-medium hover:underline"
                >
                  + Add a channel
                </button>
              </div>
            ) : (
              <>
                {/* Channel Pricing List */}
                <div className="space-y-1 mb-10">
                  {userChannels.map((channel) => {
                    const PlatformIcon = getPricingPlatformIcon(channel.platform);
                    const basePrice = getBasePrice(channel.subscribers);
                    const subscriberCount = channel.subscribers || 0;

                    return (
                      <div
                        key={channel.id}
                        className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <PlatformIcon className="w-5 h-5 text-gray-600" />
                          <div>
                            <span className="text-gray-900 font-medium">{channel.name}</span>
                            <span className="text-gray-400 mx-2">—</span>
                            <span className="text-gray-500">
                              {subscriberCount === 0
                                ? 'New channel'
                                : `${subscriberCount.toLocaleString()} subscribers`
                              }
                            </span>
                          </div>
                        </div>
                        <span className="text-gray-900 font-semibold">{formatPriceDisplay(basePrice)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* How Pricing Works */}
                <div className="mb-10">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">How pricing works</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>Your rates are automatically calculated based on your <span className="text-gray-900">subscriber count</span> and <span className="text-gray-900">estimated reach</span>. The more engaged your audience, the higher your earning potential.</p>
                    <div className="flex gap-8 pt-2">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Video Ads</p>
                        <p className="text-gray-900">Per 15-second segment</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Image Ads</p>
                        <p className="text-gray-900">Flat rate per post</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="mb-10">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Tips to increase your rates</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex gap-3">
                      <span className="text-gray-400">1.</span>
                      <p><span className="text-gray-900">Grow your audience</span> — Subscriber count is the biggest factor in your pricing. Focus on consistent, quality content.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-gray-400">2.</span>
                      <p><span className="text-gray-900">Connect more channels</span> — Brands love creators with presence across multiple platforms.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-gray-400">3.</span>
                      <p><span className="text-gray-900">Engage with brands</span> — Respond quickly to requests and deliver quality work to build your reputation.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-gray-400">4.</span>
                      <p><span className="text-gray-900">Niche matters</span> — Specialized niches like Finance, Tech, and Business often command premium rates.</p>
                    </div>
                  </div>
                </div>

                {/* Frequently Asked Questions */}
                <div className="border-t border-gray-200 pt-10">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
                  <div>
                    {[
                      {
                        question: 'Can I set my own prices?',
                        answer: 'Prices are calculated automatically to ensure fair market rates. This helps brands trust the pricing and makes it easier for you to get deals.'
                      },
                      {
                        question: 'How often do prices update?',
                        answer: 'Your rates are recalculated whenever your subscriber count changes. We sync your channel data regularly.'
                      },
                      {
                        question: 'What if I have a small audience?',
                        answer: 'Every creator starts somewhere. Even new channels have a base rate, and brands often look for micro-influencers with engaged audiences.'
                      },
                      {
                        question: 'Do longer videos cost more?',
                        answer: 'Yes. Video ads are priced per 15-second segment. A 30-second ad costs 2x, a 60-second ad costs 4x your base rate.'
                      },
                      {
                        question: 'When do I get paid?',
                        answer: 'You receive payment once the brand confirms the collaboration. Funds are transferred directly to your connected payment method.'
                      }
                    ].map((faq, idx) => (
                      <div
                        key={idx}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          className="flex items-center justify-between w-full text-left py-5 group"
                        >
                          <span className={`text-sm transition-colors ${
                            expandedFaq === idx ? 'text-gray-900 font-medium' : 'text-gray-700 group-hover:text-gray-900'
                          }`}>
                            {faq.question}
                          </span>
                          <span className={`ml-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            expandedFaq === idx ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                          }`}>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                expandedFaq === idx ? 'rotate-180' : ''
                              }`}
                            />
                          </span>
                        </button>
                        <motion.div
                          initial={false}
                          animate={{
                            height: expandedFaq === idx ? 'auto' : 0,
                            opacity: expandedFaq === idx ? 1 : 0
                          }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-gray-500 pb-5 pr-12 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        );

      case 'payouts':
        if (userType !== 'creator') return null;

        // Fetch payout settings and banks on mount
        const fetchPayoutData = async () => {
          if (loadingPayoutSettings) return;
          setLoadingPayoutSettings(true);
          try {
            const token = localStorage.getItem('token');
            const [settingsRes, banksRes] = await Promise.all([
              fetch(`${API_BASE_URL}/api/payout-settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }),
              fetch(`${API_BASE_URL}/api/banks`)
            ]);

            if (settingsRes.ok) {
              const settings = await settingsRes.json();
              setPayoutSettings(settings);
              setPayoutForm({
                bankCode: settings.bankCode || '',
                bankName: settings.bankName || '',
                accountNumber: settings.accountNumber || '',
                accountName: settings.accountName || '',
                payoutFrequency: settings.payoutFrequency || 'IMMEDIATE',
                minimumPayout: settings.minimumPayout || 1000
              });
            }

            if (banksRes.ok) {
              const banksList = await banksRes.json();
              setBanks(banksList);
            }
          } catch (error) {
            console.error('Error fetching payout data:', error);
          } finally {
            setLoadingPayoutSettings(false);
          }
        };

        // Call fetch if not already loaded
        if (!payoutSettings && !loadingPayoutSettings) {
          fetchPayoutData();
        }

        const handleSavePayoutSettings = async () => {
          setSavingPayoutSettings(true);
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/payout-settings`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payoutForm)
            });

            if (res.ok) {
              const updated = await res.json();
              setPayoutSettings({ ...payoutSettings, ...updated, bankName: payoutForm.bankName, accountName: payoutForm.accountName, accountNumber: payoutForm.accountNumber, bankCode: payoutForm.bankCode, payoutFrequency: payoutForm.payoutFrequency });
              setSuccessToast('Payout settings saved successfully!');
              setTimeout(() => setSuccessToast(null), 3000);
              setIsEditingPayout(false); // Exit edit mode after saving
            } else {
              const error = await res.json();
              alert(error.error || 'Failed to save settings');
            }
          } catch (error) {
            console.error('Error saving payout settings:', error);
            alert('Failed to save settings');
          } finally {
            setSavingPayoutSettings(false);
          }
        };

        // Check if bank details are already saved
        const hasBankDetails = payoutSettings?.bankName && payoutSettings?.accountNumber && payoutSettings?.accountName;
        const showEditForm = isEditingPayout || !hasBankDetails;

        const handleBankSelect = (bankCode: string) => {
          const selectedBank = banks.find(b => b.code === bankCode);
          setPayoutForm({
            ...payoutForm,
            bankCode,
            bankName: selectedBank?.name || ''
          });
        };

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-6xl">
            <div className="mb-8">
              <h2 className="text-3xl font-light text-gray-900 mb-2">Payouts</h2>
              <p className="text-lg text-gray-600 font-light">Manage your earnings and bank details</p>
            </div>

            {loadingPayoutSettings ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Earnings Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-sm text-gray-500">Total Earnings</span>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${(payoutSettings?.totalEarnings || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-sm text-gray-500">Pending</span>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${(payoutSettings?.pendingEarnings || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-500">Available</span>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${(payoutSettings?.availableBalance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {showEditForm ? (
                  <>
                    {/* Bank Details & Payout Preferences - Edit Mode */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Bank Details Section - 2/3 width */}
                      <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Bank Account</h3>
                            <p className="text-sm text-gray-500">Where you'll receive your payouts</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Bank Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
                            <select
                              value={payoutForm.bankCode}
                              onChange={(e) => handleBankSelect(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 bg-white"
                            >
                              <option value="">Select your bank</option>
                              {banks.map(bank => (
                                <option key={bank.code} value={bank.code}>{bank.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Account Number */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                            <input
                              type="text"
                              value={payoutForm.accountNumber}
                              onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                              placeholder="Enter 10-digit account number"
                              maxLength={10}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 bg-white"
                            />
                          </div>

                          {/* Account Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                            <input
                              type="text"
                              value={payoutForm.accountName}
                              onChange={(e) => setPayoutForm({ ...payoutForm, accountName: e.target.value })}
                              placeholder="Name on the account"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Payout Preferences Section */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Payout Preferences</h3>
                            <p className="text-sm text-gray-500">Choose when you want to receive payouts</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Payout Frequency */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Payout Schedule</label>
                            <div className="space-y-3">
                              {[
                                { value: 'IMMEDIATE', label: 'Immediate', desc: 'Get paid when collaboration completes' },
                                { value: 'WEEKLY', label: 'Weekly', desc: 'Receive payouts every week' },
                                { value: 'MONTHLY', label: 'Monthly', desc: 'Receive payouts once a month' }
                              ].map(option => (
                                <button
                                  key={option.value}
                                  onClick={() => setPayoutForm({ ...payoutForm, payoutFrequency: option.value })}
                                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                    payoutForm.payoutFrequency === option.value
                                      ? 'border-gray-900 bg-gray-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <p className="font-medium text-gray-900">{option.label}</p>
                                  <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-3">
                      {hasBankDetails && (
                        <button
                          onClick={() => {
                            setIsEditingPayout(false);
                            // Reset form to saved values
                            setPayoutForm({
                              bankCode: payoutSettings?.bankCode || '',
                              bankName: payoutSettings?.bankName || '',
                              accountNumber: payoutSettings?.accountNumber || '',
                              accountName: payoutSettings?.accountName || '',
                              payoutFrequency: payoutSettings?.payoutFrequency || 'IMMEDIATE',
                              minimumPayout: payoutSettings?.minimumPayout || 1000
                            });
                          }}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={handleSavePayoutSettings}
                        disabled={savingPayoutSettings}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {savingPayoutSettings ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Save Settings
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Bank Details & Payout Preferences - View Mode */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Bank Details Section - 2/3 width */}
                      <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Bank Account</h3>
                              <p className="text-sm text-gray-500">Where you'll receive your payouts</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsEditingPayout(true)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Bank</p>
                            <p className="font-medium text-gray-900">{payoutSettings?.bankName || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Account Number</p>
                            <p className="font-medium text-gray-900">
                              {payoutSettings?.accountNumber
                                ? `****${payoutSettings.accountNumber.slice(-4)}`
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Account Name</p>
                            <p className="font-medium text-gray-900">{payoutSettings?.accountName || '-'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Payout Preferences Section */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Payout Schedule</h3>
                            <p className="text-sm text-gray-500">When you receive payouts</p>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-900">
                          <p className="font-medium text-gray-900">
                            {payoutSettings?.payoutFrequency === 'IMMEDIATE' ? 'Immediate' :
                             payoutSettings?.payoutFrequency === 'WEEKLY' ? 'Weekly' :
                             payoutSettings?.payoutFrequency === 'MONTHLY' ? 'Monthly' : 'Immediate'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {payoutSettings?.payoutFrequency === 'IMMEDIATE' ? 'Get paid when collaboration completes' :
                             payoutSettings?.payoutFrequency === 'WEEKLY' ? 'Receive payouts every week' :
                             payoutSettings?.payoutFrequency === 'MONTHLY' ? 'Receive payouts once a month' : 'Get paid when collaboration completes'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        );

      case 'messages':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-7xl">
            <div className="mb-8">
              <h2 className="text-3xl font-light text-gray-900 mb-2">Messages</h2>
              <p className="text-lg text-gray-600 font-light">Chat with {userType === 'brand' ? 'creators' : 'brands'}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden" style={{ height: '700px' }}>
              <div className="grid grid-cols-3 h-full overflow-hidden">
                {/* Conversations List */}
                <div className="border-r border-gray-200 flex flex-col h-full overflow-hidden">
                  {/* Fixed Header */}
                  <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
                    <h3 className="font-medium text-gray-900">Conversations</h3>
                  </div>
                  {/* Scrollable Conversations */}
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {conversations.length === 0 ? (
                      <div className="p-6 text-center">
                        <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No conversations yet</p>
                      </div>
                    ) : (
                      conversations.map(conv => {
                        // Check if last message is a collaboration request
                        let isCollabRequest = false;
                        let lastMessagePreview = conv.lastMessage?.content || '';
                        try {
                          const parsed = JSON.parse(conv.lastMessage?.content || '');
                          if (parsed.type === 'COLLAB_REQUEST') {
                            isCollabRequest = true;
                            lastMessagePreview = '🤝 Collaboration Request';
                          }
                        } catch {
                          // Not JSON, use as-is
                        }

                        // Get unread count from socket context (real-time) - use partner ID as key
                        const unreadCount = unreadCounts[conv.partner.id] || 0;

                        return (
                          <button
                            key={conv.partner.id}
                            onClick={() => {
                              setActiveConversation(conv);
                              // Mark as read when clicking on conversation
                              if (unreadCount > 0) {
                                markAsRead(conv.partner.id);
                              }
                            }}
                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                              activeConversation?.partner.id === conv.partner.id ? 'bg-gray-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                                  {conv.partner.avatar ? (
                                    <img src={conv.partner.avatar.startsWith('http') ? conv.partner.avatar : `${API_BASE_URL}${conv.partner.avatar}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                                  ) : (
                                    <span className="text-gray-600 font-medium text-sm">{conv.partner.name?.charAt(0)}</span>
                                  )}
                                </div>
                                {/* Unread badge */}
                                {unreadCount > 0 && (
                                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`font-medium truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {conv.partner.name}
                                  </p>
                                  {conv.lastMessage?.createdAt && (
                                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                      {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                  {isCollabRequest && <Handshake className="w-3 h-3 inline mr-1 text-purple-500" />}
                                  {lastMessagePreview}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="col-span-2 flex flex-col h-full overflow-hidden">
                  {activeConversation ? (
                    <>
                      {/* Fixed Chat Header */}
                      <div className="p-4 border-b border-gray-200 flex items-center gap-3 flex-shrink-0 bg-white">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {activeConversation.partner.avatar ? (
                            <img src={activeConversation.partner.avatar.startsWith('http') ? activeConversation.partner.avatar : `${API_BASE_URL}${activeConversation.partner.avatar}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-gray-600 font-medium">{activeConversation.partner.name?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activeConversation.partner.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{activeConversation.partner.type?.toLowerCase()}</p>
                        </div>
                      </div>

                      {/* Scrollable Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                        {messages.map(msg => {
                          // Try to parse as collaboration request message
                          let collabData = null;
                          try {
                            const parsed = JSON.parse(msg.content);
                            if (parsed.type === 'COLLAB_REQUEST') {
                              collabData = parsed;
                            }
                          } catch (e) {
                            // Not JSON, render as normal message
                          }

                          const isFromMe = msg.fromUserId === user.id;

                          // Render collaboration request message visually
                          if (collabData) {
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-sm lg:max-w-md rounded-2xl overflow-hidden border cursor-pointer transition-all hover:shadow-lg ${
                                    isFromMe ? 'border-gray-800 bg-gray-900 hover:border-gray-700' : 'border-gray-200 bg-white hover:border-purple-300'
                                  }`}
                                  onClick={() => setActiveView('requests')}
                                >
                                  {/* Header */}
                                  <div className={`px-4 py-3 flex items-center justify-between ${
                                    isFromMe ? 'bg-gray-800' : 'bg-gradient-to-r from-purple-50 to-blue-50'
                                  }`}>
                                    <div className="flex items-center gap-2">
                                      <Handshake className={`w-5 h-5 ${isFromMe ? 'text-purple-400' : 'text-purple-600'}`} />
                                      <span className={`font-semibold text-sm ${isFromMe ? 'text-white' : 'text-gray-900'}`}>
                                        Collaboration Request
                                      </span>
                                    </div>
                                    <ExternalLink className={`w-4 h-4 ${isFromMe ? 'text-gray-500' : 'text-gray-400'}`} />
                                  </div>

                                  {/* Content */}
                                  <div className="p-4">
                                    <p className={`text-sm mb-3 ${isFromMe ? 'text-gray-300' : 'text-gray-600'}`}>
                                      {isFromMe
                                        ? `You sent a collaboration request to ${collabData.creatorName}`
                                        : `${collabData.brandName} wants to collaborate with you!`
                                      }
                                    </p>

                                    {/* Platforms */}
                                    <div className="space-y-2 mb-3">
                                      {(() => {
                                        const channels = collabData.channels || [];
                                        const platformTotal = channels.reduce((sum: number, ch: any) => sum + (ch.price || 0), 0);
                                        const materialPrice = (collabData.totalPrice || 0) - platformTotal;
                                        const materialSharePerChannel = channels.length > 0 ? Math.round(materialPrice / channels.length) : 0;

                                        return channels.map((ch: any, idx: number) => {
                                          const fullPrice = (ch.price || 0) + (materialSharePerChannel > 0 ? materialSharePerChannel : 0);
                                          return (
                                            <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${
                                              isFromMe ? 'bg-gray-800' : 'bg-gray-50'
                                            }`}>
                                              <div className="flex items-center gap-2">
                                                {ch.platform === 'YOUTUBE' && <Youtube className={`w-4 h-4 ${isFromMe ? 'text-red-400' : 'text-red-500'}`} />}
                                                {ch.platform === 'INSTAGRAM' && <Instagram className={`w-4 h-4 ${isFromMe ? 'text-pink-400' : 'text-pink-500'}`} />}
                                                {ch.platform === 'TWITTER' && <Twitter className={`w-4 h-4 ${isFromMe ? 'text-blue-400' : 'text-blue-500'}`} />}
                                                {ch.platform === 'FACEBOOK' && <Facebook className={`w-4 h-4 ${isFromMe ? 'text-blue-400' : 'text-blue-600'}`} />}
                                                {ch.platform === 'TWITCH' && <Twitch className={`w-4 h-4 ${isFromMe ? 'text-purple-400' : 'text-purple-500'}`} />}
                                                {ch.platform === 'TIKTOK' && <Music className={`w-4 h-4 ${isFromMe ? 'text-gray-400' : 'text-gray-900'}`} />}
                                                <div>
                                                  <p className={`text-xs font-medium ${isFromMe ? 'text-white' : 'text-gray-900'}`}>{ch.channelName}</p>
                                                  <p className={`text-xs ${isFromMe ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {ch.placementLabel} • {ch.subscribers?.toLocaleString() || 0} subs
                                                  </p>
                                                </div>
                                              </div>
                                              <span className={`text-xs font-semibold ${isFromMe ? 'text-gray-300' : 'text-gray-900'}`}>
                                                ${fullPrice?.toLocaleString() || 0}
                                              </span>
                                            </div>
                                          );
                                        });
                                      })()}
                                    </div>

                                    {/* Total */}
                                    <div className={`flex items-center justify-between pt-3 border-t ${
                                      isFromMe ? 'border-gray-700' : 'border-gray-200'
                                    }`}>
                                      <span className={`text-xs ${isFromMe ? 'text-gray-400' : 'text-gray-500'}`}>Estimated Budget</span>
                                      <span className={`text-lg font-bold ${isFromMe ? 'text-white' : 'text-gray-900'}`}>
                                        ${collabData.totalPrice?.toLocaleString() || 0}
                                      </span>
                                    </div>

                                    {/* Footer message */}
                                    <p className={`text-xs mt-3 italic ${isFromMe ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {isFromMe
                                        ? "Waiting for response..."
                                        : "I would love to collaborate with you on your next content!"
                                      }
                                    </p>
                                  </div>

                                  {/* View Request Button */}
                                  <div className={`px-4 py-3 flex items-center justify-between border-t ${
                                    isFromMe ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
                                  }`}>
                                    <span className={`text-xs ${isFromMe ? 'text-gray-500' : 'text-gray-400'}`}>
                                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className={`text-xs font-medium flex items-center gap-1 ${
                                      isFromMe ? 'text-purple-400' : 'text-purple-600'
                                    }`}>
                                      View Request
                                      <ExternalLink className="w-3 h-3" />
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // Regular text message
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                isFromMe
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 ${isFromMe ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        {/* Typing indicator */}
                        {isTyping && isTyping.userId === activeConversation.partner.id && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Fixed Message Input */}
                      <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
                        {/* Connection status */}
                        {!isConnected && (
                          <div className="text-xs text-yellow-600 mb-2 flex items-center gap-1">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            Reconnecting...
                          </div>
                        )}
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={handleTyping}
                            onKeyPress={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                          <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Select a conversation to start chatting</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'requests':
        // Filter requests based on selected status
        // Active = PAID requests that are still in progress (for long-term: videosPosted < videoCount, for non-long-term: not yet marked completed)
        // Paid = PAID but waiting to start (just paid, not active yet) - we'll merge this into Active
        const statusFilterMap: Record<string, string[]> = {
          pending: ['PENDING', 'ACCEPTED', 'AD_SELECTED', 'PAYMENT_PENDING'],
          active: ['PAID'], // Active = all PAID requests (in progress)
          completed: ['COMPLETED'],
          declined: ['REJECTED', 'CANCELLED'],
        };
        const filteredCollabRequests = collabRequests.filter(r => statusFilterMap[collabStatusFilter].includes(r.status));

        // Count requests per category
        const pendingCount = collabRequests.filter(r => ['PENDING', 'ACCEPTED', 'AD_SELECTED', 'PAYMENT_PENDING'].includes(r.status)).length;
        const activeCount = collabRequests.filter(r => r.status === 'PAID').length;
        const completedCount = collabRequests.filter(r => r.status === 'COMPLETED').length;
        const declinedCount = collabRequests.filter(r => ['REJECTED', 'CANCELLED'].includes(r.status)).length;

        // Count unseen/unviewed requests per category (for red dot badges)
        const getUnseenCount = (category: string) => {
          if (userType === 'creator') {
            switch (category) {
              case 'pending':
                // Pending requests not viewed by creator
                return collabRequests.filter(r =>
                  ['PENDING', 'ACCEPTED', 'AD_SELECTED', 'PAYMENT_PENDING'].includes(r.status) &&
                  r.viewedByCreator !== true
                ).length;
              case 'active':
                // Active requests where materials not downloaded
                return collabRequests.filter(r =>
                  r.status === 'PAID' && r.materialsDownloaded !== true
                ).length;
              default:
                return 0;
            }
          } else {
            // Brand
            switch (category) {
              case 'pending':
                // Accepted requests not viewed by brand (creator accepted, needs brand action)
                return collabRequests.filter(r =>
                  r.status === 'ACCEPTED' && r.viewedByBrand !== true
                ).length;
              case 'declined':
                // Declined/cancelled requests not viewed by brand
                return collabRequests.filter(r =>
                  ['REJECTED', 'CANCELLED'].includes(r.status) && r.viewedByBrand !== true
                ).length;
              default:
                return 0;
            }
          }
        };

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-5xl">
            <div className="mb-8">
              <h2 className="text-3xl font-light text-gray-900 mb-2">Collaboration Requests</h2>
              <p className="text-lg text-gray-600 font-light">
                {userType === 'brand' ? 'Track your collaboration requests sent to creators' : 'Review and respond to brand collaboration requests'}
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="mb-6">
              <div className="inline-flex bg-gray-100 rounded-2xl p-1.5 gap-1">
                {[
                  { key: 'pending', label: 'Pending', count: pendingCount, color: 'bg-amber-500' },
                  { key: 'active', label: 'Active', count: activeCount, color: 'bg-emerald-500' },
                  { key: 'completed', label: 'Completed', count: completedCount, color: 'bg-blue-500' },
                  { key: 'declined', label: 'Declined', count: declinedCount, color: 'bg-gray-400' },
                ].map((tab) => {
                  const unseenCount = getUnseenCount(tab.key);
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setCollabStatusFilter(tab.key as any)}
                      className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        collabStatusFilter === tab.key
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${collabStatusFilter === tab.key ? tab.color : 'bg-gray-300'}`} />
                      {tab.label}
                      <span className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-semibold ${
                        collabStatusFilter === tab.key
                          ? `${tab.color} text-white`
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                      {/* Red dot indicator with count for unseen/unviewed items */}
                      {unseenCount > 0 && collabStatusFilter !== tab.key && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold ring-2 ring-gray-100 animate-pulse">
                          {unseenCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {loadingCollabRequests ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : collabRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Handshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No collaboration requests yet</h3>
                <p className="text-gray-500 mb-6">
                  {userType === 'brand'
                    ? 'Browse creators and send collaboration requests to get started'
                    : 'When brands want to collaborate with you, their requests will appear here'}
                </p>
                {userType === 'brand' && (
                  <button
                    onClick={() => window.location.href = '/hub'}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                  >
                    Browse Creators
                  </button>
                )}
              </div>
            ) : filteredCollabRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Handshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No {collabStatusFilter} requests</h3>
                <p className="text-gray-500">
                  {collabStatusFilter === 'pending' && 'No pending requests at the moment'}
                  {collabStatusFilter === 'active' && 'No active collaborations yet'}
                  {collabStatusFilter === 'completed' && 'No completed collaborations yet'}
                  {collabStatusFilter === 'declined' && 'No declined requests'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCollabRequests.map((request) => {
                  const channels = request.channels || [];
                  const totalReach = channels.reduce((sum: number, ch: any) => sum + (ch.subscribers || 0), 0);

                  // Determine if card should show red dot (unviewed/new)
                  const showRedDot = (() => {
                    if (userType === 'creator') {
                      // Pending statuses: show dot if not viewed by creator
                      if (['PENDING', 'ACCEPTED', 'AD_SELECTED', 'PAYMENT_PENDING'].includes(request.status) && request.viewedByCreator !== true) return true;
                      // Paid: show dot if materials not downloaded (treat null/undefined as not downloaded)
                      if (request.status === 'PAID' && request.materialsDownloaded !== true) return true;
                    } else {
                      // Brand: show dot for accepted requests not viewed (creator accepted, needs brand action)
                      if (request.status === 'ACCEPTED' && request.viewedByBrand !== true) return true;
                      // Brand: show dot for declined/rejected if not viewed
                      if (['REJECTED', 'CANCELLED'].includes(request.status) && request.viewedByBrand !== true) return true;
                    }
                    return false;
                  })();

                  // Completed cards should not be clickable for brands
                  const isClickable = !(userType === 'brand' && request.status === 'COMPLETED');

                  // Handler for clicking card
                  const handleCardClick = async () => {
                    if (!isClickable) return;

                    // Mark as viewed when clicking
                    if (showRedDot) {
                      try {
                        const token = localStorage.getItem('token');
                        await fetch(`${API_BASE_URL}/api/collaboration-requests/${request.id}/mark-viewed`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        // Update local state
                        setCollabRequests(prev => prev.map(r =>
                          r.id === request.id
                            ? {
                                ...r,
                                viewedByCreator: userType === 'creator' ? true : r.viewedByCreator,
                                viewedByBrand: userType === 'brand' ? true : r.viewedByBrand,
                                // For PAID requests viewed by creator, also mark materials as downloaded
                                materialsDownloaded: (userType === 'creator' && r.status === 'PAID') ? true : r.materialsDownloaded
                              }
                            : r
                        ));
                      } catch (e) {
                        console.error('Failed to mark as viewed', e);
                      }
                    }
                    setSelectedCollabRequest(request);
                  };

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleCardClick}
                      className={`bg-white rounded-2xl border border-gray-100 transition-all p-5 relative ${
                        isClickable
                          ? 'hover:border-gray-300 hover:shadow-md cursor-pointer'
                          : 'opacity-75'
                      }`}
                    >
                      {/* Red dot indicator for unviewed/new items */}
                      {showRedDot && (
                        <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      )}
                      <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {userType === 'brand' ? (
                              request.creator?.avatar ? (
                                <img src={`${API_BASE_URL}${request.creator.avatar}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-lg font-semibold text-gray-400">{request.creator?.name?.[0]}</span>
                              )
                            ) : (
                              request.brand?.avatar ? (
                                <img src={`${API_BASE_URL}${request.brand.avatar}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-lg font-semibold text-gray-400">{request.brand?.name?.[0]}</span>
                              )
                            )}
                          </div>
                          {request.status === 'PAID' && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {userType === 'brand' ? request.creator?.name : request.brand?.name}
                            </h3>
                            {request.isLongTermDeal && (
                              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-full flex items-center gap-1">
                                Long-term · {request.videosPosted || 0}/{request.videoCount} videos
                                {request.status === 'PAID' && (request.videosPosted || 0) < request.videoCount && (
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                )}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{channels.length} channel{channels.length !== 1 ? 's' : ''}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span>{totalReach >= 1000 ? `${(totalReach / 1000).toFixed(1)}K` : totalReach} reach</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <div className="flex items-center gap-1">
                              {[...new Set(channels.map((ch: any) => ch.platform))].slice(0, 3).map((platform: any, idx: number) => {
                                const PlatformIcon = platform === 'YOUTUBE' ? Youtube :
                                  platform === 'INSTAGRAM' ? Instagram :
                                  platform === 'TWITTER' ? Twitter :
                                  platform === 'TWITCH' ? Twitch :
                                  platform === 'FACEBOOK' ? Facebook :
                                  platform === 'TIKTOK' ? Music : Globe;
                                return <PlatformIcon key={idx} className="w-3.5 h-3.5 text-gray-400" />;
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0 mr-4">
                          <p className="text-lg font-bold text-gray-900">${request.totalPrice?.toLocaleString()}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          {userType === 'creator' && request.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => updateCollabRequestStatus(request.id, 'ACCEPTED')}
                                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateCollabRequestStatus(request.id, 'REJECTED')}
                                className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {userType === 'brand' && (request.status === 'ACCEPTED' || request.status === 'AD_SELECTED') && (
                            <button
                              onClick={() => { window.location.href = `/complete-collab/${request.id}`; }}
                              className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              Complete Payment
                            </button>
                          )}

                          {userType === 'brand' && request.status === 'PENDING' && (
                            <>
                              <span className="flex items-center gap-1.5 text-sm text-amber-600">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                Pending
                              </span>
                              <button
                                onClick={() => updateCollabRequestStatus(request.id, 'CANCELLED')}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {userType === 'brand' && request.status === 'PAID' && (
                            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              Active
                            </span>
                          )}

                          {userType === 'creator' && request.status === 'PAID' && request.ad && (
                            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              Active
                            </span>
                          )}

                          {userType === 'creator' && (request.status === 'ACCEPTED' || request.status === 'AD_SELECTED') && (
                            <span className="flex items-center gap-1.5 text-sm text-blue-600">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                              Awaiting payment
                            </span>
                          )}

                          {request.status === 'COMPLETED' && (
                            <span className="flex items-center gap-1.5 text-sm text-blue-600">
                              <CheckCircle className="w-4 h-4" />
                              Completed
                            </span>
                          )}

                          {request.status === 'REJECTED' && (
                            <span className="text-sm text-gray-400">Declined</span>
                          )}

                          {request.status === 'CANCELLED' && (
                            <span className="text-sm text-gray-400">Cancelled</span>
                          )}

                          {/* View Details Arrow */}
                          <ArrowRight className="w-4 h-4 text-gray-400 ml-2" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        );

      default:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center py-12">
            <h2 className="text-2xl font-light text-gray-900 mb-4">{activeView} View</h2>
            <p className="text-gray-600">This section is coming soon...</p>
          </motion.div>
        );
    }
  };

  const handleViewChange = (id: string) => {
    // Reset announcement editing state
    if (editingAnnouncement) {
      setEditingAnnouncement(null);
      setSelectedPlatforms([]);
      setSelectedChannelIds([]);
      setThumbnailPreview(null);
      setThumbnailFile(null);
    }

    // Reset ad editing state when navigating away from ads view
    if (editingAd && id !== 'ads') {
      setEditingAd(null);
      setSelectedNiches([]);
      setScriptRequired(false);
      setAdImages([]);
      setAdVideos([]);
      setAdImagePreviews([]);
      setAdVideoPreviews([]);
      setImagesToRemove([]);
      setVideosToRemove([]);
      setReorderedImages(null);
      setDraggedImageIndex(null);
      setReorderedVideos(null);
      setDraggedVideoIndex(null);
      setCombinedImageOrder(null);
      setCombinedVideoOrder(null);
    }

    // Also reset when going TO the ads view (to ensure fresh form)
    if (id === 'ads' && activeView !== 'ads') {
      setEditingAd(null);
      setSelectedNiches([]);
      setScriptRequired(false);
      setAdImages([]);
      setAdVideos([]);
      setAdImagePreviews([]);
      setAdVideoPreviews([]);
      setImagesToRemove([]);
      setVideosToRemove([]);
      setReorderedImages(null);
      setDraggedImageIndex(null);
      setReorderedVideos(null);
      setDraggedVideoIndex(null);
      setCombinedImageOrder(null);
      setCombinedVideoOrder(null);
    }

    setActiveView(id);
  };

  return (
    <DashboardLayout activeView={activeView} onViewChange={handleViewChange}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </div>

      {/* Collaboration Request Detail Modal */}
      {selectedCollabRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {userType === 'brand' ? (
                    selectedCollabRequest.creator?.avatar ? (
                      <img src={`${API_BASE_URL}${selectedCollabRequest.creator.avatar}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold text-gray-400">{selectedCollabRequest.creator?.name?.[0]}</span>
                    )
                  ) : (
                    selectedCollabRequest.brand?.avatar ? (
                      <img src={`${API_BASE_URL}${selectedCollabRequest.brand.avatar}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold text-gray-400">{selectedCollabRequest.brand?.name?.[0]}</span>
                    )
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {userType === 'brand' ? selectedCollabRequest.creator?.name : selectedCollabRequest.brand?.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedCollabRequest.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      selectedCollabRequest.status === 'ACCEPTED' || selectedCollabRequest.status === 'AD_SELECTED' ? 'bg-blue-100 text-blue-700' :
                      selectedCollabRequest.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                      selectedCollabRequest.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        selectedCollabRequest.status === 'PENDING' ? 'bg-amber-500' :
                        selectedCollabRequest.status === 'ACCEPTED' || selectedCollabRequest.status === 'AD_SELECTED' ? 'bg-blue-500' :
                        selectedCollabRequest.status === 'PAID' ? 'bg-emerald-500' :
                        selectedCollabRequest.status === 'COMPLETED' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`} />
                      {selectedCollabRequest.status === 'PENDING' ? 'Pending' :
                       selectedCollabRequest.status === 'ACCEPTED' ? 'Accepted' :
                       selectedCollabRequest.status === 'AD_SELECTED' ? 'Ad Selected' :
                       selectedCollabRequest.status === 'PAID' ? 'Active' :
                       selectedCollabRequest.status === 'COMPLETED' ? 'Completed' :
                       selectedCollabRequest.status === 'REJECTED' ? 'Declined' :
                       'Cancelled'}
                    </span>
                    {selectedCollabRequest.isLongTermDeal && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
                        Long-term · {selectedCollabRequest.videoCount} videos
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCollabRequest(null)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Request Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Request Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedCollabRequest.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Value</p>
                    <p className="text-sm font-bold text-gray-900">
                      ${selectedCollabRequest.totalPrice?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Platforms</p>
                    <p className="text-sm font-medium text-gray-900">
                      {(selectedCollabRequest.channels || []).length} channel{(selectedCollabRequest.channels || []).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Reach</p>
                    <p className="text-sm font-medium text-gray-900">
                      {(() => {
                        const reach = (selectedCollabRequest.channels || []).reduce((sum: number, ch: any) => sum + (ch.subscribers || 0), 0);
                        return reach >= 1000000 ? `${(reach / 1000000).toFixed(1)}M` :
                               reach >= 1000 ? `${(reach / 1000).toFixed(1)}K` : reach;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Long-term Deal Video Progress (for PAID long-term deals) */}
              {selectedCollabRequest.isLongTermDeal && selectedCollabRequest.status === 'PAID' && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">Video Progress</h3>
                      <p className="text-xs text-gray-500">Long-term deal tracking</p>
                    </div>
                  </div>

                  {/* Progress circles */}
                  <div className="flex items-center gap-2 mb-4">
                    {Array.from({ length: selectedCollabRequest.videoCount }).map((_, idx) => {
                      const isCompleted = idx < (selectedCollabRequest.videosPosted || 0);
                      const isCurrent = idx === (selectedCollabRequest.videosPosted || 0);
                      return (
                        <div
                          key={idx}
                          className={`flex-1 h-2 rounded-full transition-all ${
                            isCompleted ? 'bg-gray-900' : isCurrent ? 'bg-gray-300' : 'bg-gray-100'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-500">{selectedCollabRequest.videosPosted || 0} of {selectedCollabRequest.videoCount} videos</span>
                    <span className="font-semibold text-gray-900">
                      {Math.round(((selectedCollabRequest.videosPosted || 0) / selectedCollabRequest.videoCount) * 100)}% complete
                    </span>
                  </div>

                  {/* Creator: Buttons for video tracking */}
                  {userType === 'creator' && (
                    <>
                      <div className="flex gap-2">
                        {/* Mark as Posted button - show if not all videos posted */}
                        {(selectedCollabRequest.videosPosted || 0) < selectedCollabRequest.videoCount && (
                          <button
                            onClick={() => setShowVideoConfirmModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Video {(selectedCollabRequest.videosPosted || 0) + 1} as Posted
                          </button>
                        )}
                        {/* Undo button - show if at least one video posted */}
                        {(selectedCollabRequest.videosPosted || 0) > 0 && (
                          <button
                            onClick={() => setShowUndoVideoModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Undo Last Video Post
                          </button>
                        )}
                      </div>

                      {/* Video Confirm Modal */}
                      {showVideoConfirmModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowVideoConfirmModal(false)}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-6">
                              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Video className="w-7 h-7 text-gray-700" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirm Video Posted</h3>
                              <p className="text-sm text-gray-600 text-center mb-6">
                                Are you sure you have posted video {(selectedCollabRequest.videosPosted || 0) + 1} of {selectedCollabRequest.videoCount} with the sponsored content?
                              </p>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => setShowVideoConfirmModal(false)}
                                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={async () => {
                                    setConfirmingVideoPost(true);
                                    try {
                                      const token = localStorage.getItem('token');
                                      const res = await fetch(`${API_BASE_URL}/api/collaboration-requests/${selectedCollabRequest.id}/video-posted`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` }
                                      });
                                      const data = await res.json();
                                      if (res.ok) {
                                        setSelectedCollabRequest((prev: any) => ({
                                          ...prev,
                                          videosPosted: data.videosPosted,
                                          status: data.isComplete ? 'COMPLETED' : prev.status
                                        }));
                                        setCollabRequests(prev => prev.map(r =>
                                          r.id === selectedCollabRequest.id
                                            ? { ...r, videosPosted: data.videosPosted, status: data.isComplete ? 'COMPLETED' : r.status }
                                            : r
                                        ));
                                        setShowVideoConfirmModal(false);
                                      } else {
                                        alert(data.error || 'Failed to update');
                                      }
                                    } catch (e) {
                                      console.error(e);
                                      alert('Failed to update video count');
                                    } finally {
                                      setConfirmingVideoPost(false);
                                    }
                                  }}
                                  disabled={confirmingVideoPost}
                                  className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                  {confirmingVideoPost ? 'Confirming...' : 'Yes, Confirm'}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}

                      {/* Undo Video Modal */}
                      {showUndoVideoModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowUndoVideoModal(false)}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-6">
                              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-7 h-7 text-amber-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Undo Video Post?</h3>
                              <p className="text-sm text-gray-600 text-center mb-6">
                                This will reduce the video count from {selectedCollabRequest.videosPosted || 0} to {(selectedCollabRequest.videosPosted || 0) - 1}. Use this if you marked a video as posted by mistake.
                              </p>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => setShowUndoVideoModal(false)}
                                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={async () => {
                                    setUndoingVideoPost(true);
                                    try {
                                      const token = localStorage.getItem('token');
                                      const res = await fetch(`${API_BASE_URL}/api/collaboration-requests/${selectedCollabRequest.id}/video-undo`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` }
                                      });
                                      const data = await res.json();
                                      if (res.ok) {
                                        setSelectedCollabRequest((prev: any) => ({
                                          ...prev,
                                          videosPosted: data.videosPosted,
                                          status: 'PAID'
                                        }));
                                        setCollabRequests(prev => prev.map(r =>
                                          r.id === selectedCollabRequest.id
                                            ? { ...r, videosPosted: data.videosPosted, status: 'PAID' }
                                            : r
                                        ));
                                        setShowUndoVideoModal(false);
                                      } else {
                                        alert(data.error || 'Failed to undo');
                                      }
                                    } catch (e) {
                                      console.error(e);
                                      alert('Failed to undo video post');
                                    } finally {
                                      setUndoingVideoPost(false);
                                    }
                                  }}
                                  disabled={undoingVideoPost}
                                  className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                                >
                                  {undoingVideoPost ? 'Undoing...' : 'Yes, Undo'}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Brand: View only */}
                  {userType === 'brand' && (selectedCollabRequest.videosPosted || 0) < selectedCollabRequest.videoCount && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      Waiting for creator to post video {(selectedCollabRequest.videosPosted || 0) + 1}
                    </p>
                  )}

                  {/* Completed message */}
                  {(selectedCollabRequest.videosPosted || 0) >= selectedCollabRequest.videoCount && (
                    <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-gray-900" />
                      <span className="text-sm font-medium text-gray-900">All videos completed!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Non-long-term deal: "I have posted" button for creators */}
              {!selectedCollabRequest.isLongTermDeal && selectedCollabRequest.status === 'PAID' && userType === 'creator' && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">Mark as Completed</h3>
                      <p className="text-xs text-gray-500">Confirm you've posted the sponsored content</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowMarkCompletedModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    I Have Posted
                  </button>

                  {/* Mark Completed Modal */}
                  {showMarkCompletedModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowMarkCompletedModal(false)}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-6">
                          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-7 h-7 text-emerald-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirm Completion</h3>
                          <p className="text-sm text-gray-600 text-center mb-6">
                            Are you sure you have posted the sponsored content? This will mark this collaboration as completed.
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setShowMarkCompletedModal(false)}
                              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                setMarkingCompleted(true);
                                try {
                                  const token = localStorage.getItem('token');
                                  const res = await fetch(`${API_BASE_URL}/api/collaboration-requests/${selectedCollabRequest.id}/mark-completed`, {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  const data = await res.json();
                                  if (res.ok) {
                                    setSelectedCollabRequest((prev: any) => ({
                                      ...prev,
                                      status: 'COMPLETED'
                                    }));
                                    setCollabRequests(prev => prev.map(r =>
                                      r.id === selectedCollabRequest.id
                                        ? { ...r, status: 'COMPLETED' }
                                        : r
                                    ));
                                    setShowMarkCompletedModal(false);
                                    setSelectedCollabRequest(null); // Close the detail modal
                                  } else {
                                    alert(data.error || 'Failed to mark as completed');
                                  }
                                } catch (e) {
                                  console.error(e);
                                  alert('Failed to mark as completed');
                                } finally {
                                  setMarkingCompleted(false);
                                }
                              }}
                              disabled={markingCompleted}
                              className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                            >
                              {markingCompleted ? 'Confirming...' : 'Yes, Completed'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}

              {/* Non-long-term deal: Brand waiting message */}
              {!selectedCollabRequest.isLongTermDeal && selectedCollabRequest.status === 'PAID' && userType === 'brand' && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <p className="text-sm text-amber-800">Waiting for creator to post the sponsored content</p>
                  </div>
                </div>
              )}

              {/* Selected Channels/Placements */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Selected Placements</h3>
                <div className="space-y-2">
                  {(() => {
                    const channels = selectedCollabRequest.channels || [];
                    const platformTotal = channels.reduce((sum: number, ch: any) => sum + (ch.price || 0), 0);
                    const materialPrice = (selectedCollabRequest.totalPrice || 0) - platformTotal;
                    const materialSharePerChannel = channels.length > 0 ? Math.round(materialPrice / channels.length) : 0;

                    return channels.map((ch: any, idx: number) => {
                      const PlatformIcon = ch.platform === 'YOUTUBE' ? Youtube :
                        ch.platform === 'INSTAGRAM' ? Instagram :
                        ch.platform === 'TWITTER' ? Twitter :
                        ch.platform === 'TWITCH' ? Twitch :
                        ch.platform === 'FACEBOOK' ? Facebook :
                        ch.platform === 'TIKTOK' ? Music : Globe;
                      const fullPrice = (ch.price || 0) + (materialSharePerChannel > 0 ? materialSharePerChannel : 0);
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                              <PlatformIcon className="w-5 h-5 text-gray-700" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{ch.channelName}</p>
                              <p className="text-xs text-gray-500">{ch.placementLabel} · {ch.subscribers >= 1000 ? `${(ch.subscribers / 1000).toFixed(1)}K` : ch.subscribers} subscribers</p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">${fullPrice?.toLocaleString()}</p>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Ad Material Section (show for all requests that have ad material) */}
              {selectedCollabRequest.ad && (
                <>
                  <div className="mb-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Campaign Material</h3>
                    <p className="text-xs text-gray-500 mb-4">{selectedCollabRequest.ad.title}</p>
                  </div>

                  {/* Download Actions Bar - Only for creators */}
                  {userType === 'creator' && (selectedCollabRequest.ad.images?.length > 0 || selectedCollabRequest.ad.videos?.length > 0) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {selectedMediaForDownload.size > 0
                            ? `${selectedMediaForDownload.size} file${selectedMediaForDownload.size > 1 ? 's' : ''} selected`
                            : 'Select files to download'}
                        </span>
                        {selectedMediaForDownload.size > 0 && (
                          <button
                            onClick={() => setSelectedMediaForDownload(new Set())}
                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                          >
                            Clear selection
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedMediaForDownload.size > 0 && (
                          <button
                            onClick={downloadSelectedAsZip}
                            disabled={isDownloading}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            <Download className="w-4 h-4" />
                            {isDownloading ? 'Downloading...' : 'Download Selected'}
                          </button>
                        )}
                        <button
                          onClick={downloadAllAsZip}
                          disabled={isDownloading}
                          className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <Download className="w-4 h-4" />
                          {isDownloading ? 'Downloading...' : 'Download All'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {selectedCollabRequest.ad.images?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Images ({selectedCollabRequest.ad.images.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCollabRequest.ad.images.map((img: string, idx: number) => {
                          const fullUrl = `${API_BASE_URL}${img}`;
                          const isSelected = selectedMediaForDownload.has(fullUrl);
                          return (
                            <div key={idx} className="relative group w-24 h-24">
                              {/* Selection checkbox - Only for creators */}
                              {userType === 'creator' && (
                                <button
                                  onClick={() => toggleMediaSelection(fullUrl)}
                                  className={`absolute top-1 left-1 z-10 w-5 h-5 rounded flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-gray-900 text-white'
                                      : 'bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-white'
                                  }`}
                                >
                                  {isSelected ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                </button>
                              )}
                              {/* Download button - Only for creators */}
                              {userType === 'creator' && (
                                <button
                                  onClick={() => downloadSingleFile(fullUrl, `image_${idx + 1}.${img.split('.').pop()}`)}
                                  className="absolute top-1 right-1 z-10 w-5 h-5 rounded bg-white/80 text-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all"
                                  title="Download"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              )}
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block w-full h-full bg-gray-100 rounded-lg overflow-hidden hover:opacity-90 transition-opacity ${
                                  isSelected && userType === 'creator' ? 'ring-2 ring-gray-900' : ''
                                }`}
                              >
                                <img src={fullUrl} alt={`Ad image ${idx + 1}`} className="w-full h-full object-contain" />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {selectedCollabRequest.ad.videos?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Videos ({selectedCollabRequest.ad.videos.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCollabRequest.ad.videos.map((vid: string, idx: number) => {
                          const fullUrl = `${API_BASE_URL}${vid}`;
                          const isSelected = selectedMediaForDownload.has(fullUrl);
                          return (
                            <div key={idx} className="relative group w-36 h-24">
                              {/* Selection checkbox - Only for creators */}
                              {userType === 'creator' && (
                                <button
                                  onClick={() => toggleMediaSelection(fullUrl)}
                                  className={`absolute top-1 left-1 z-10 w-5 h-5 rounded flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-gray-900 text-white'
                                      : 'bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-white'
                                  }`}
                                >
                                  {isSelected ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                </button>
                              )}
                              {/* Download button - Only for creators */}
                              {userType === 'creator' && (
                                <button
                                  onClick={() => downloadSingleFile(fullUrl, `video_${idx + 1}.${vid.split('.').pop()}`)}
                                  className="absolute top-1 right-1 z-10 w-5 h-5 rounded bg-white/80 text-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all"
                                  title="Download"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              )}
                              <div className={`w-full h-full bg-gray-100 rounded-lg overflow-hidden ${isSelected && userType === 'creator' ? 'ring-2 ring-gray-900' : ''}`}>
                                <video src={fullUrl} controls className="w-full h-full object-cover" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Talking Points */}
                  {selectedCollabRequest.ad.talkingPoints && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Talking Points</h3>
                      <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedCollabRequest.ad.talkingPoints}
                      </div>
                    </div>
                  )}

                  {/* Guidelines */}
                  {selectedCollabRequest.ad.guidelines && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Brand Guidelines</h3>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 whitespace-pre-wrap">
                        {selectedCollabRequest.ad.guidelines}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${selectedCollabRequest.totalPrice?.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Action buttons based on status */}
                  {userType === 'creator' && selectedCollabRequest.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => {
                          updateCollabRequestStatus(selectedCollabRequest.id, 'REJECTED');
                          setSelectedCollabRequest(null);
                        }}
                        className="px-6 py-3 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          updateCollabRequestStatus(selectedCollabRequest.id, 'ACCEPTED');
                          setSelectedCollabRequest(null);
                        }}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                      >
                        Accept Request
                      </button>
                    </>
                  )}
                  {userType === 'brand' && (selectedCollabRequest.status === 'ACCEPTED' || selectedCollabRequest.status === 'AD_SELECTED') && (
                    <button
                      onClick={() => { window.location.href = `/complete-collab/${selectedCollabRequest.id}`; }}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Complete Payment
                    </button>
                  )}
                  {userType === 'brand' && selectedCollabRequest.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        updateCollabRequestStatus(selectedCollabRequest.id, 'CANCELLED');
                        setSelectedCollabRequest(null);
                      }}
                      className="px-6 py-3 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                    >
                      Cancel Request
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCollabRequest(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Remove Platform Confirmation Modal */}
      {channelToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isRemovingChannel && setChannelToRemove(null)}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6"
          >
            <div className="text-center">
              {/* Warning Icon */}
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Remove Platform
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove{' '}
                <span className="font-medium text-gray-900">
                  {channelToRemove.channelName || channelToRemove.title || channelToRemove.username}
                </span>{' '}
                from your connected platforms? This action cannot be undone.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setChannelToRemove(null)}
                  disabled={isRemovingChannel}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveChannel}
                  disabled={isRemovingChannel}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRemovingChannel ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Removing...
                    </>
                  ) : (
                    'Remove'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteAnnouncementId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !isDeleting && setDeleteAnnouncementId(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Announcement</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this announcement? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteAnnouncementId(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Success Toast */}
      {successToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">{successToast}</span>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <DashboardLayout activeView="home">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    }>
      <DashboardContent />
    </Suspense>
  );
}
