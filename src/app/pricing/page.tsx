"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, TrendingUp, Target } from 'lucide-react';
import Navbar from '../home/Navbar';
import Footer from '../home/Footer';

const pricingFactors = [
  {
    icon: Users,
    title: "Follower Count",
    description: "Rates scale with your audience size across all connected platforms"
  },
  {
    icon: TrendingUp,
    title: "Engagement & Reach",
    description: "Higher engagement rates and broader reach command premium pricing"
  },
  {
    icon: Target,
    title: "Niche & Industry",
    description: "Specialized niches with dedicated audiences often see higher rates"
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Fair rates calculated from real metrics. AI sets the price, brands pay for value.
            </p>
          </motion.div>

          {/* Dynamic Pricing Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-8 md:p-12 mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                Dynamic Pricing That Works for Everyone
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Our platform uses data-driven pricing based on real metrics. Brands set rates based on analytics, and creators receive transparent prices that reflect true value.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingFactors.map((factor, index) => (
                <motion.div
                  key={factor.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-900 flex items-center justify-center mb-4">
                    <factor.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {factor.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {factor.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* For Creators & Brands */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Creators Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10"
            >
              <h3 className="text-2xl font-light text-gray-900 mb-4">
                For Creators
              </h3>
              <p className="text-gray-600 mb-6">
                Join for free and get fair pricing automatically. Our AI-powered tools calculate your rates based on your follower count, engagement rates, and niche expertise.
              </p>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Free to create your profile
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  AI calculates your rates based on your metrics
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  20% platform fee only when you get paid
                </li>
              </ul>
              <Button
                className="w-full py-6 rounded-full bg-gray-900 text-white hover:bg-gray-800"
                onClick={() => window.location.href = '/login'}
              >
                Join as Creator
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            {/* Brands Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10"
            >
              <h3 className="text-2xl font-light text-gray-900 mb-4">
                For Brands
              </h3>
              <p className="text-gray-600 mb-6">
                Browse creators and see upfront pricing based on their real performance data. Pay only for the collaborations you choose, with rates that reflect actual reach and engagement.
              </p>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Free to browse and discover creators
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Transparent pricing based on real metrics
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Pay per collaboration, no subscriptions
                </li>
              </ul>
              <Button
                className="w-full py-6 rounded-full bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50"
                onClick={() => window.location.href = '/login'}
              >
                Join as Brand
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>

          {/* Platform Fee Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 bg-gray-50 border border-gray-200 rounded-3xl p-8 md:p-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-6">
              <span className="text-2xl font-light text-white">20%</span>
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-4">
              Simple Platform Fee
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              LinkHub takes a 20% fee from payments made by brands to creators. This fee covers secure payment processing, platform maintenance, dispute resolution, and continuous improvements to help you grow.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="px-4 py-2 bg-white rounded-full border border-gray-200">No upfront costs</span>
              <span className="px-4 py-2 bg-white rounded-full border border-gray-200">Pay only when you earn</span>
              <span className="px-4 py-2 bg-white rounded-full border border-gray-200">Secure payments</span>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20 text-center"
          >
            <p className="text-gray-600 mb-4">
              Have questions about how pricing works?
            </p>
            <Button
              className="bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 rounded-full px-8"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Us
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
