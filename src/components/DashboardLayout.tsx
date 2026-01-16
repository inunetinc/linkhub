'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bell,
  Settings,
  Menu,
  X,
  Home,
  Plus,
  Megaphone,
  Link2,
  Inbox,
  FileVideo,
  Users,
  Send,
  LayoutDashboard,
  FolderOpen,
  Handshake,
  CircleDollarSign,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Wallet,
} from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';

function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function DashboardLayout({ children, activeView = 'home', onViewChange }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Get unread message count and request count from socket context
  const { totalUnread, pendingRequestCount, setRequestCount, onNewCollabRequest, onCollabRequestUpdated } = useSocket();

  // Fetch collaboration request count (PENDING + PAID) and sync with socket context
  const fetchRequestCount = async (storedToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/collaboration-requests/count', {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRequestCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching request count:', error);
    }
  };

  // Load cart count from localStorage
  const updateCartCount = () => {
    const cart = localStorage.getItem('brandCart');
    if (cart) {
      const items = JSON.parse(cart);
      setCartCount(items.length);
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      const decoded = decodeJWT(storedToken);
      if (decoded) {
        setUser(decoded);
        // Load cart count for brands
        if (decoded.type === 'BRAND') {
          updateCartCount();
        }
        // Fetch collaboration request count
        fetchRequestCount(storedToken);
      } else {
        // Invalid token, redirect to login
        router.push('/login');
      }
    } else {
      // No token, redirect to login
      router.push('/login');
    }

    // Listen for cart updates
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);

    // Listen for request updates (manual refresh)
    const handleRequestUpdate = () => {
      const t = localStorage.getItem('token');
      if (t) fetchRequestCount(t);
    };
    window.addEventListener('requestUpdated', handleRequestUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('requestUpdated', handleRequestUpdate);
    };
  }, []);

  // Listen for real-time collaboration requests via socket
  useEffect(() => {
    const unsubscribe = onNewCollabRequest(() => {
      // The socket context already increments the count
      // Just dispatch event to notify any other listeners
      window.dispatchEvent(new Event('requestUpdated'));
    });
    return unsubscribe;
  }, [onNewCollabRequest]);

  // Listen for collaboration request status updates (accept/reject)
  useEffect(() => {
    const unsubscribe = onCollabRequestUpdated(() => {
      // Refetch the count when a request status changes
      const t = localStorage.getItem('token');
      if (t) fetchRequestCount(t);
    });
    return unsubscribe;
  }, [onCollabRequestUpdated]);

  // Different sidebar items for creators vs brands
  const creatorSidebarIcons = [
    { icon: Home, label: 'Home', id: 'home', path: '/dashboard' },
    { icon: Plus, label: 'Quick Add', id: 'quick-add', path: '/dashboard?view=quick-add' },
    { icon: Megaphone, label: 'Announcements', id: 'announcements', path: '/dashboard?view=announcements' },
    { icon: Link2, label: 'Add Platform', id: 'add-platform', path: '/dashboard?view=add-platform' },
    { icon: CircleDollarSign, label: 'Pricing', id: 'pricing', path: '/dashboard?view=pricing' },
    { icon: Handshake, label: 'Requests', id: 'requests', path: '/dashboard?view=requests' },
    { icon: Wallet, label: 'Payouts', id: 'payouts', path: '/dashboard?view=payouts' },
    { icon: Inbox, label: 'Messages', id: 'messages', path: '/dashboard?view=messages' },
  ];

  const brandSidebarIcons = [
    { icon: Home, label: 'Home', id: 'home', path: '/dashboard' },
    { icon: Plus, label: 'Create Ad', id: 'ads', path: '/dashboard?view=ads' },
    { icon: FolderOpen, label: 'My Ads', id: 'my-ads', path: '/dashboard?view=my-ads' },
    { icon: Handshake, label: 'Requests', id: 'requests', path: '/dashboard?view=requests' },
    { icon: Users, label: 'Campaigns', id: 'campaigns', path: '/dashboard?view=campaigns' },
    { icon: Send, label: 'Messages', id: 'messages', path: '/dashboard?view=messages' },
  ];

  const sidebarIcons = user?.type === 'BRAND' ? brandSidebarIcons : creatorSidebarIcons;

  const goToMarketplace = () => {
    router.push('/hub');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-dropdown') && !target.closest('.notifications-dropdown')) {
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSidebarClick = (id: string, path: string) => {
    // If we're on the dashboard and have onViewChange, use it for faster view switching
    if (pathname.startsWith('/dashboard') && onViewChange) {
      onViewChange(id);
    } else {
      // Otherwise, always navigate to the path
      router.push(path);
    }
  };

  const isActiveView = (id: string) => {
    if (pathname === '/hub') return false;
    return activeView === id;
  };

  const isMarketplaceActive = pathname === '/hub';

  // Show layout skeleton while loading user - keeps navbar/sidebar visible
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top Navbar Skeleton */}
        <header className="bg-white sticky top-0 z-50 w-full border-b border-gray-100">
          <div className="flex items-center justify-between h-16 px-4 w-full">
            <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="hidden md:flex items-center gap-8">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          {/* Sidebar Skeleton */}
          <aside className="hidden md:flex fixed left-0 top-16 bottom-0 z-40 w-20 bg-white border-r border-gray-100 flex-col items-center py-6 space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </aside>

          {/* Main Content Loading */}
          <main className="flex-1 md:ml-20 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white sticky top-0 z-50 w-full border-b border-gray-100">
        <div className="flex items-center justify-between h-16 px-4 w-full">
          <div className="flex items-center">
            <img src="/v2.png" alt="Logo" className="h-12 w-auto cursor-pointer" onClick={() => router.push('/dashboard')} />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={goToMarketplace}
              className={`text-sm font-medium transition-colors ${
                isMarketplaceActive
                  ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {user.type === 'CREATOR' ? 'Brands' : 'Creators'}
            </button>
            <button
              onClick={() => router.push('/dashboard/resources')}
              className={`text-sm font-medium transition-colors ${
                pathname === '/dashboard/resources'
                  ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => router.push('/dashboard/support')}
              className={`text-sm font-medium transition-colors ${
                pathname === '/dashboard/support'
                  ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Support
            </button>
            <button
              onClick={() => router.push('/dashboard/blog')}
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith('/dashboard/blog')
                  ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Blog
            </button>
          </nav>

          <div className="flex items-center gap-4 md:gap-6">
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center gap-4 md:gap-6">
              {user.type === 'BRAND' && (
                <button
                  onClick={() => router.push('/cart')}
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                  title="Campaign Builder"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Notifications Dropdown */}
              <div className="relative notifications-dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationsOpen(!notificationsOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif, idx) => (
                          <div key={idx} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm text-gray-900">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                      <button className="w-full text-sm text-gray-600 hover:text-gray-900">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                  >
                    {/* User Info Header */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push('/account');
                          setProfileDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-5 h-5 text-gray-400" />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          router.push('/settings');
                          setProfileDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-5 h-5 text-gray-400" />
                        <span>Settings</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-6 py-4 space-y-3 w-full">
              <button
                onClick={() => { goToMarketplace(); setMobileMenuOpen(false); }}
                className="block w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900 py-2"
              >
                {user.type === 'CREATOR' ? 'Brands' : 'Creators'}
              </button>
              {sidebarIcons.map(({ icon: Icon, label, id, path }) => (
                <button
                  key={id}
                  onClick={() => { handleSidebarClick(id, path); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900 py-2"
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {id === 'messages' && totalUnread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </span>
                    )}
                    {id === 'requests' && pendingRequestCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                        {pendingRequestCount > 9 ? '9+' : pendingRequestCount}
                      </span>
                    )}
                  </div>
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex fixed left-0 top-16 bottom-0 z-40 w-20 bg-white border-r border-gray-100 flex-col items-center py-6 space-y-6">
          {sidebarIcons.map(({ icon: Icon, label, id, path }) => (
            <button
              key={id}
              onClick={() => handleSidebarClick(id, path)}
              className={`group relative p-3 rounded-xl transition ${
                isActiveView(id)
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              aria-label={label}
            >
              <Icon className="w-6 h-6" />
              {/* Unread message badge */}
              {id === 'messages' && totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
              {/* Collaboration request badge */}
              {id === 'requests' && pendingRequestCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {pendingRequestCount > 9 ? '9+' : pendingRequestCount}
                </span>
              )}
              <span className="absolute left-full ml-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
                {label}
              </span>
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-20">
          {children}
        </main>
      </div>
    </div>
  );
}
