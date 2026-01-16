'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Mail,
  Smartphone,
  Check,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewRequests: true,
    emailMessages: true,
    emailPayments: true,
    pushNewRequests: true,
    pushMessages: true,
    pushPayments: false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEarnings: false,
    allowMessages: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setUser(decoded);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const menuItems = [
    { id: 'account', label: 'Account', icon: User, description: 'Manage your account details' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Control how you receive updates' },
    { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Manage your visibility and data' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, description: 'Get help and contact support' },
  ];

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account preferences</p>
          </div>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-4 py-2 rounded-lg"
            >
              <Check className="w-4 h-4" />
              Saved
            </motion.div>
          )}
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Menu */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}

              <div className="pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Log out</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
            >
              {/* Account Section */}
              {activeSection === 'account' && (
                <div>
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Profile Info */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                          <span className="text-white text-xl font-medium">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/account')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Edit Profile
                      </button>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">Email Address</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button className="text-sm text-gray-600 hover:text-gray-900">
                        Change
                      </button>
                    </div>

                    {/* Account Type */}
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium text-gray-900">Account Type</p>
                        <p className="text-sm text-gray-500">{user.type === 'BRAND' ? 'Brand Account' : 'Creator Account'}</p>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {user.type}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <div>
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                    <p className="text-sm text-gray-500 mt-1">Choose how you want to be notified</p>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Email Notifications */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      </div>
                      <div className="space-y-4">
                        {[
                          { key: 'emailNewRequests', label: 'New collaboration requests' },
                          { key: 'emailMessages', label: 'New messages' },
                          { key: 'emailPayments', label: 'Payment updates' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <span className="text-gray-700">{item.label}</span>
                            <button
                              onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                              className={`relative w-12 h-6 rounded-full transition-colors ${
                                notifications[item.key as keyof typeof notifications] ? 'bg-gray-900' : 'bg-gray-200'
                              }`}
                            >
                              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                              }`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      {/* Push Notifications */}
                      <div className="flex items-center gap-2 mb-4">
                        <Smartphone className="w-5 h-5 text-gray-400" />
                        <h3 className="font-medium text-gray-900">Push Notifications</h3>
                      </div>
                      <div className="space-y-4">
                        {[
                          { key: 'pushNewRequests', label: 'New collaboration requests' },
                          { key: 'pushMessages', label: 'New messages' },
                          { key: 'pushPayments', label: 'Payment updates' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <span className="text-gray-700">{item.label}</span>
                            <button
                              onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                              className={`relative w-12 h-6 rounded-full transition-colors ${
                                notifications[item.key as keyof typeof notifications] ? 'bg-gray-900' : 'bg-gray-200'
                              }`}
                            >
                              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                              }`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Section */}
              {activeSection === 'privacy' && (
                <div>
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
                    <p className="text-sm text-gray-500 mt-1">Control your visibility and data</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      {[
                        { key: 'profileVisible', label: 'Profile visible to others', description: 'Allow brands/creators to find you in the marketplace' },
                        { key: 'showEarnings', label: 'Show earnings publicly', description: 'Display your earnings on your profile' },
                        { key: 'allowMessages', label: 'Allow direct messages', description: 'Let others send you messages' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <button
                            onClick={() => setPrivacy(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              privacy[item.key as keyof typeof privacy] ? 'bg-gray-900' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              privacy[item.key as keyof typeof privacy] ? 'left-7' : 'left-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="font-medium text-gray-900 mb-4">Danger Zone</h3>
                      <button className="flex items-center gap-2 px-4 py-2.5 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>
                      <p className="text-xs text-gray-500 mt-2">This action is irreversible and will delete all your data.</p>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Help Section */}
              {activeSection === 'help' && (
                <div>
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Help & Support</h2>
                    <p className="text-sm text-gray-500 mt-1">Get help with your account</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { label: 'Contact Support', description: 'Get in touch with our team', href: '/dashboard/support', external: false },
                      { label: 'Report a Problem', description: 'Let us know if something is wrong', href: '/dashboard/support', external: false },
                      { label: 'Terms of Service', description: 'Read our terms and conditions', href: '/terms', external: true },
                      { label: 'Privacy Policy', description: 'Learn how we handle your data', href: '/privacy', external: true },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => item.external ? window.open(item.href, '_blank') : router.push(item.href)}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
