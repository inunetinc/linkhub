'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Globe,
  FileText,
  Sparkles,
  Upload,
  X,
  Building2,
  Check,
  Camera,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Edit3,
  Save,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { API_BASE_URL } from '@/config/api';

const NICHES = [
  { value: 'TECH', label: 'Tech', category: 'Premium' },
  { value: 'FINANCE', label: 'Finance', category: 'Premium' },
  { value: 'BUSINESS', label: 'Business', category: 'Premium' },
  { value: 'GAMING', label: 'Gaming', category: 'Standard' },
  { value: 'FASHION', label: 'Fashion', category: 'Standard' },
  { value: 'FITNESS', label: 'Fitness', category: 'Standard' },
  { value: 'EDUCATION', label: 'Education', category: 'Standard' },
  { value: 'HEALTH_WELLNESS', label: 'Health & Wellness', category: 'Standard' },
  { value: 'SPORTS', label: 'Sports', category: 'Standard' },
  { value: 'BEAUTY', label: 'Beauty', category: 'Lifestyle' },
  { value: 'FOOD', label: 'Food', category: 'Lifestyle' },
  { value: 'TRAVEL', label: 'Travel', category: 'Lifestyle' },
  { value: 'MUSIC', label: 'Music', category: 'Lifestyle' },
  { value: 'COMEDY', label: 'Comedy', category: 'Lifestyle' },
  { value: 'LIFESTYLE', label: 'Lifestyle', category: 'Lifestyle' },
];

const BRAND_INDUSTRIES = [
  { value: 'TECH', label: 'Technology' },
  { value: 'ECOMMERCE', label: 'E-Commerce' },
  { value: 'FINANCE', label: 'Finance & Banking' },
  { value: 'HEALTH', label: 'Health & Wellness' },
  { value: 'FOOD', label: 'Food & Beverage' },
  { value: 'FASHION', label: 'Fashion & Apparel' },
  { value: 'BEAUTY', label: 'Beauty & Cosmetics' },
  { value: 'TRAVEL', label: 'Travel & Hospitality' },
  { value: 'GAMING', label: 'Gaming & Entertainment' },
  { value: 'SPORTS', label: 'Sports & Fitness' },
  { value: 'EDUCATION', label: 'Education & Learning' },
  { value: 'OTHER', label: 'Other' },
];

function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    niches: [] as string[],
    industry: '',
    phone: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      const decoded = decodeJWT(storedToken);
      if (decoded) {
        setUser(decoded);
        // Set initial form data from JWT token
        setFormData(prev => ({
          ...prev,
          name: decoded.name || '',
        }));
        // Fetch full profile data from API
        fetchProfileData(storedToken, decoded);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchProfileData = async (authToken: string, jwtUser?: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        // Use API data, fallback to JWT user data, then to empty string
        setFormData({
          name: data.name || jwtUser?.name || '',
          bio: data.bio || data.description || '',
          location: data.location || data.headquarters || '',
          website: data.website || '',
          niches: data.niches || data.contentNiches || [],
          industry: data.industry || '',
          phone: data.phone || '',
        });
        if (data.logoUrl || data.logo) {
          setLogoPreview(data.logoUrl || data.logo);
        }
      } else {
        // If API fails, still use JWT data
        if (jwtUser) {
          setFormData(prev => ({
            ...prev,
            name: jwtUser.name || '',
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If API fails, still use JWT data
      if (jwtUser) {
        setFormData(prev => ({
          ...prev,
          name: jwtUser.name || '',
        }));
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = e => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleNiche = (nicheValue: string) => {
    setFormData(prev => {
      const niches = prev.niches.includes(nicheValue)
        ? prev.niches.filter(n => n !== nicheValue)
        : [...prev.niches, nicheValue];
      return { ...prev, niches };
    });
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) {
      newErrors.name = user?.type === 'BRAND' ? 'Brand name is required' : 'Full name is required';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'niches') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (typeof value === 'string' && value.trim()) {
          formDataToSend.append(key, value.trim());
        }
      });
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          const decoded = decodeJWT(data.token);
          if (decoded) setUser(decoded);
        }
        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Refresh profile data
        if (token) fetchProfileData(token);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Error updating profile' });
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const isBrand = user?.type === 'BRAND';

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Account</h1>
              <p className="text-gray-500 mt-1">View and manage your profile information</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data using same logic as fetchProfileData
                    if (profileData || user) {
                      setFormData({
                        name: profileData?.name || user?.name || '',
                        bio: profileData?.bio || profileData?.description || '',
                        location: profileData?.location || profileData?.headquarters || '',
                        website: profileData?.website || '',
                        niches: profileData?.niches || profileData?.contentNiches || [],
                        industry: profileData?.industry || '',
                        phone: profileData?.phone || '',
                      });
                    }
                  }}
                  className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-green-600 text-sm bg-green-50 px-4 py-2 rounded-lg"
            >
              <Check className="w-4 h-4" />
              Profile updated successfully
            </motion.div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-6">
              {/* Avatar/Logo */}
              <div className="relative">
                {logoPreview ? (
                  <div className="w-24 h-24 rounded-2xl bg-white border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                    <img src={logoPreview} alt="Profile" className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-900 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-3xl font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    {isBrand ? 'Brand' : 'Creator'}
                  </span>
                </div>
                <p className="text-gray-500 mt-1">{user.email}</p>
                {profileData?.createdAt && (
                  <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Member since {new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                {isBrand ? 'Brand Name' : 'Full Name'}
              </label>
              {isEditing ? (
                <div className="relative">
                  {isBrand ? (
                    <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  ) : (
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  )}
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className={`text-gray-900 pl-12 w-full border rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
              ) : (
                <p className="text-gray-900 font-medium">{formData.name || '—'}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
              <div className="flex items-center gap-2 text-gray-900">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{user.email}</span>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                {isBrand ? 'Brand Description' : 'Bio'}
              </label>
              {isEditing ? (
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    value={formData.bio}
                    onChange={e => handleInputChange('bio', e.target.value)}
                    rows={4}
                    placeholder={isBrand ? 'Tell creators about your brand...' : 'Tell us about yourself...'}
                    className="text-gray-900 pl-12 w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  />
                </div>
              ) : (
                <p className="text-gray-900">{formData.bio || '—'}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                {isBrand ? 'Headquarters' : 'Location'}
              </label>
              {isEditing ? (
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
                    className="text-gray-900 pl-12 w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{formData.location || '—'}</span>
                </div>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Website</label>
              {isEditing ? (
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={e => handleInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className={`text-gray-900 pl-12 w-full border rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.website ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  {formData.website ? (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {formData.website}
                    </a>
                  ) : (
                    <span className="text-gray-900">—</span>
                  )}
                </div>
              )}
            </div>

            {/* Industry (Brand only) */}
            {isBrand && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Industry</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BRAND_INDUSTRIES.map(industry => (
                      <button
                        key={industry.value}
                        type="button"
                        onClick={() => handleInputChange('industry', industry.value)}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-center ${
                          formData.industry === industry.value
                            ? 'bg-gray-900 border-gray-900 text-white'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {industry.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span>{BRAND_INDUSTRIES.find(i => i.value === formData.industry)?.label || '—'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Niches (Creator only) */}
            {!isBrand && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Content Niches</span>
                  </div>
                </label>
                {isEditing ? (
                  <>
                    <p className="text-xs text-gray-400 mb-3">Select all that apply</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {NICHES.map(niche => (
                        <button
                          key={niche.value}
                          type="button"
                          onClick={() => toggleNiche(niche.value)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                            formData.niches.includes(niche.value)
                              ? 'bg-gray-900 border-gray-900 text-white'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <span>{niche.label}</span>
                          {niche.category === 'Premium' && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              formData.niches.includes(niche.value) ? 'bg-yellow-400 text-yellow-900' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              Premium
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.niches.length > 0 ? (
                      formData.niches.map(niche => {
                        const nicheInfo = NICHES.find(n => n.value === niche);
                        return (
                          <span
                            key={niche}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                          >
                            {nicheInfo?.label || niche}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-400">No niches selected</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm"
              >
                {errors.submit}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
