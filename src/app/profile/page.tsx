

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
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
  Target,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
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

function ProfileSetupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlToken = searchParams.get('token');
  const typeParam = searchParams.get('type'); // CREATOR | BRAND
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    niches: [] as string[],
    industry: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [submitError, setSubmitError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const accountType = typeParam?.toUpperCase() || user?.type || 'CREATOR';

  useEffect(() => {
    // Check URL token first, then localStorage
    const storedToken = localStorage.getItem('token');
    const token = urlToken || storedToken;

    if (token) {
      localStorage.setItem('token', token);
      setActiveToken(token);
      const decoded = decodeJWT(token);
      if (decoded) {
        setUser(decoded);
        setFormData(prev => ({ ...prev, name: decoded.name || '' }));
      }
    } else {
      // No token, redirect to login
      router.push('/login');
    }
  }, [urlToken, router]);

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

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
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
    if (!formData.name.trim()) newErrors.name = accountType === 'BRAND' ? 'Brand name is required' : 'Full name is required';
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) newErrors.website = 'Website must start with http:// or https://';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For brand accounts on step 1, move to step 2 instead of submitting
    const isBrandAccount = (typeParam?.toUpperCase() || user?.type || 'CREATOR') === 'BRAND';
    if (isBrandAccount && currentStep === 1) {
      if (formData.name.trim()) {
        setCurrentStep(2);
      }
      return;
    }

    setSubmitError('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'niches') {
          // Send niches as JSON array
          formDataToSend.append(key, JSON.stringify(value));
        } else if (typeof value === 'string' && value.trim()) {
          formDataToSend.append(key, value.trim());
        }
      });
      if (logoFile) formDataToSend.append('logo', logoFile);

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${activeToken}` },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || 'Error updating profile');
      }
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!activeToken || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isBrand = accountType === 'BRAND';

  // Brand Profile Setup - New Design
  if (isBrand) {
    const benefits = [
      { icon: Target, title: 'Find Perfect Creators', desc: 'Match with creators in your niche' },
      { icon: Users, title: 'Reach New Audiences', desc: 'Expand your brand visibility' },
      { icon: Zap, title: 'Fast Collaboration', desc: 'Connect and launch campaigns quickly' },
    ];

    const canProceed = currentStep === 1 ? formData.name.trim() : true;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="px-6 py-4">
            <img src="/v2.png" alt="LinkHub" className="h-10" />
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left Side - Benefits & Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 hidden lg:block"
            >
              <div className="sticky top-32">
                <div className="mb-8">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full mb-4">
                    <Building2 className="w-3 h-3" />
                    Brand Account
                  </span>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    Set up your brand profile
                  </h2>
                  <p className="text-gray-600">
                    A complete profile helps creators understand your brand and increases collaboration opportunities.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                    >
                      <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{benefit.title}</h3>
                        <p className="text-sm text-gray-500">{benefit.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Did you know?</span> Brands with complete profiles receive 3x more collaboration requests from creators.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-100/50 overflow-hidden">
                {/* Form Header */}
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-semibold text-gray-900">
                      {currentStep === 1 ? 'Brand Information' : 'Brand Identity'}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Step {currentStep} of 2</span>
                      <div className="flex gap-1">
                        <div className={`w-8 h-1 rounded-full ${currentStep >= 1 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
                        <div className={`w-8 h-1 rounded-full ${currentStep >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-500">
                    {currentStep === 1
                      ? 'Tell us about your brand and what you do'
                      : 'Upload your logo and finalize your profile'}
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  onKeyDown={(e) => {
                    // Prevent Enter key from submitting on step 1
                    if (e.key === 'Enter' && currentStep === 1) {
                      e.preventDefault();
                      if (formData.name.trim()) {
                        setCurrentStep(2);
                      }
                    }
                  }}
                  className="p-8"
                >
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {/* Brand Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={e => handleInputChange('name', e.target.value)}
                            placeholder="e.g., Acme Corporation"
                            className={`text-gray-900 pl-12 w-full border rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 transition-all ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                          />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-2">{errors.name}</p>}
                      </div>

                      {/* Industry Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Industry
                        </label>
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
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand Description
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                          <textarea
                            value={formData.bio}
                            onChange={e => handleInputChange('bio', e.target.value)}
                            rows={4}
                            placeholder="Tell creators about your brand, products, and what makes you unique..."
                            className="text-gray-900 pl-12 w-full border border-gray-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none placeholder-gray-400"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">This helps creators understand if they're a good fit for your brand</p>
                      </div>

                      {/* Location & Website - Two columns */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={formData.location}
                              onChange={e => handleInputChange('location', e.target.value)}
                              placeholder="City, Country"
                              className="text-gray-900 pl-12 w-full border border-gray-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="url"
                              value={formData.website}
                              onChange={e => handleInputChange('website', e.target.value)}
                              placeholder="https://yourbrand.com"
                              className={`text-gray-900 pl-12 w-full border rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 ${errors.website ? 'border-red-500' : 'border-gray-200'}`}
                            />
                          </div>
                          {errors.website && <p className="text-red-500 text-xs mt-2">{errors.website}</p>}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {/* Logo Upload - Left aligned */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Brand Logo
                        </label>
                        {!logoPreview ? (
                          <label className="relative flex flex-col items-center justify-center w-72 h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-gray-400 transition-all bg-gray-50 hover:bg-gray-100 group">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-300 transition-colors">
                              <Upload className="w-8 h-8 text-gray-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Upload Logo</span>
                            <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                            <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                          </label>
                        ) : (
                          <div className="relative inline-block">
                            <div className="w-72 h-48 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                              <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain p-4" />
                            </div>
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <p className="text-sm text-green-600 mt-3 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              Logo uploaded
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Profile Summary */}
                      <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
                        <h3 className="font-medium text-gray-900 mb-4">Profile Summary</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Brand Name</span>
                            <span className="font-medium text-gray-900">{formData.name || '—'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Industry</span>
                            <span className="font-medium text-gray-900">
                              {BRAND_INDUSTRIES.find(i => i.value === formData.industry)?.label || '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Location</span>
                            <span className="font-medium text-gray-900">{formData.location || '—'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Website</span>
                            <span className="font-medium text-gray-900 truncate max-w-[200px]">{formData.website || '—'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Logo</span>
                            <span className={`font-medium ${logoPreview ? 'text-green-600' : 'text-gray-400'}`}>
                              {logoPreview ? 'Uploaded' : 'Not uploaded'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm"
                    >
                      {submitError}
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
                      >
                        Back
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors"
                      >
                        Skip for now
                      </button>
                    )}

                    {currentStep === 1 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (canProceed) {
                            setCurrentStep(2);
                          }
                        }}
                        disabled={!canProceed}
                        className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            Complete Setup
                            <CheckCircle2 className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Mobile Benefits - Only visible on mobile */}
              <div className="lg:hidden mt-8 space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
                  >
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{benefit.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Creator Profile Setup - Keep original design
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="w-full mx-4 max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-2">
            Complete Your Creator Profile
          </h1>
          <p className="text-lg text-gray-600 font-light max-w-xl mx-auto">
            Tell us a bit about yourself to get started
          </p>
        </motion.div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm mx-auto" style={{ maxWidth: '640px' }}>
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className={`text-gray-900 pl-10 w-full border rounded-xl py-2 px-3 focus:ring-2 focus:ring-gray-300 placeholder-gray-500 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                    required
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={formData.bio}
                    onChange={e => handleInputChange('bio', e.target.value)}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="text-gray-900 pl-10 w-full border border-gray-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-gray-300 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Niche Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Content Niches (Select all that apply)</span>
                  </div>
                </label>
                <p className="text-xs text-gray-500 mb-3">Your niches help brands find you and affect your pricing</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {NICHES.map(niche => (
                    <label
                      key={niche.value}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                        formData.niches.includes(niche.value)
                          ? 'bg-gray-900 border-gray-900 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.niches.includes(niche.value)}
                        onChange={() => toggleNiche(niche.value)}
                        className="hidden"
                      />
                      <span className="text-sm font-medium">{niche.label}</span>
                      {niche.category === 'Premium' && (
                        <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Premium</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </form>

            {/* Skip */}
            <div className="text-center mt-4">
              <button onClick={() => router.push('/dashboard')} className="text-gray-500 text-sm hover:text-gray-700">
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileSetup() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ProfileSetupContent />
    </Suspense>
  );
}
