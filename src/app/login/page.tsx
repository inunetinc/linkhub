'use client';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

export default function Login() {
  const handleLogin = () => {
    const authUrl = `${API_BASE_URL}/auth/google`;
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center overflow-hidden relative">
      {/* Very subtle background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] bg-cyan-200/30 rounded-full blur-3xl" />
      </div>

      {/* Centered Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-6"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
          {/* Small Logo/Icon */}
          {/* <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mb-8">
            <Sparkles className="w-7 h-7 text-white" />
          </div> */}

          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome to LinkHub
          </h1>
          <p className="text-base text-gray-600 mb-10">
            Sign in to continue
          </p>

          {/* Google Button */}
          <Button
            onClick={handleLogin}
            className="w-full py-6 text-base font-medium rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
              <ArrowRight className="w-5 h-5 ml-2 opacity-70" />
            </span>
          </Button>

          {/* Small footer note */}
          <p className="mt-8 text-xs text-gray-500">
            By signing in, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}