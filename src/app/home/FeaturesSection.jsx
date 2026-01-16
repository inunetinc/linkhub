"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Zap, 
  Wallet,
  Users,
  TrendingUp,
  FileImage
} from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Analytics-Based Pricing',
    description: 'Our AI calculates fair ad rates based on your real engagement metrics and audience demographics',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    icon: MessageSquare,
    title: 'Built-in Messaging',
    description: 'Seamless communication between creators and brands with file sharing and proposal management',
    gradient: 'from-fuchsia-500 to-pink-600'
  },
  {
    icon: Shield,
    title: 'Verified Accounts',
    description: 'Every creator channel is verified through official platform APIs for authenticity',
    gradient: 'from-cyan-500 to-blue-600'
  },
  {
    icon: Wallet,
    title: 'Secure Payments',
    description: 'Escrow-protected transactions with Paystack integration for hassle-free payouts',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    icon: FileImage,
    title: 'Media Hub',
    description: 'Brands can upload and manage ad materials, briefs, and creative assets in one place',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    icon: TrendingUp,
    title: 'Campaign Tracking',
    description: 'Real-time analytics on campaign performance and ROI across all platforms',
    gradient: 'from-rose-500 to-red-600'
  }
];

export default function FeaturesSection() {
  return (
    <section className="relative py-32 bg-gray-50">
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
            Everything You Need to
            <br />
            Succeed Together
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light">
            A complete suite of tools designed to make creator-brand collaborations 
            effortless, transparent, and profitable
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative h-full bg-white border border-gray-200 rounded-3xl p-8 transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
                <div className="relative w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="relative text-xl font-normal text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="relative text-gray-600 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}