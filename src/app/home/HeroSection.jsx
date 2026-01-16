"use client"

import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import animationData from '../../../public/Technology Network.json';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content (centered on mobile) */}
          <div className="text-center lg:text-left">
          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            Connect Creators
            <br />
            & Brands
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
            The ultimate marketplace for creators to monetize their content and brands to reach their audience through authentic partnerships.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-12">
            <Button
              size="lg"
              className="group px-8 py-6 text-lg rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all"
              onClick={() => window.location.href = '/login'}
            >
              <span className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg rounded-full bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-100"
              onClick={() => {
                const element = document.getElementById('how-it-works');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              See How It Works
            </Button>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
              <span>Free for creators</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
              <span>Instant payouts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
              <span>No credit card required for creators</span>
            </div>
          </div>
          </div>

          {/* Right side - Lottie Animation */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full max-w-lg">
              <Lottie
                animationData={animationData}
                loop={true}
                autoplay={true}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
