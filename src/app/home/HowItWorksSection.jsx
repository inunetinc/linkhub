
"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Link2, Megaphone, Search, Send, CreditCard, CheckCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const creatorSteps = [
  {
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Sign up with Google and set up your creator profile in minutes',
    color: 'from-violet-500 to-purple-600'
  },
  {
    icon: Link2,
    title: 'Connect Channels',
    description: 'Link your YouTube, Instagram, TikTok, and other social accounts',
    color: 'from-fuchsia-500 to-pink-600'
  },
  {
    icon: Megaphone,
    title: 'Post Your Rates',
    description: 'Create ad cards with AI-powered pricing based on your analytics',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    icon: CreditCard,
    title: 'Get Paid',
    description: 'Receive secure payments directly through our platform',
    color: 'from-green-500 to-emerald-600'
  }
];

const brandSteps = [
  {
    icon: UserPlus,
    title: 'Create Brand Profile',
    description: 'Set up your brand account with company details and preferences',
    color: 'from-violet-500 to-purple-600'
  },
  {
    icon: Search,
    title: 'Discover Creators',
    description: 'Browse and filter creators by niche, reach, and engagement rates',
    color: 'from-fuchsia-500 to-pink-600'
  },
  {
    icon: Send,
    title: 'Send Proposals',
    description: 'Upload ad materials and message creators directly',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    icon: CheckCircle,
    title: 'Launch Campaigns',
    description: 'Manage collaborations and track campaign performance',
    color: 'from-green-500 to-emerald-600'
  }
];

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState('creator');
  const steps = activeTab === 'creator' ? creatorSteps : brandSteps;

  // Listen for hash changes to switch tabs and scroll
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#how-it-works-creators' || hash === '#how-it-works-brands') {
        // Set the correct tab
        if (hash === '#how-it-works-creators') {
          setActiveTab('creator');
        } else {
          setActiveTab('brand');
        }

        // Scroll to the section after a small delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById('how-it-works');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    // Check on mount
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <section id="how-it-works" className="relative py-32 bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10 font-light">
            Whether you're a creator looking for brand deals or a brand seeking authentic partnerships, 
            we've streamlined the entire process
          </p>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="inline-flex">
                <TabsList className="bg-gray-100 border border-gray-200 p-1 rounded-full">
                    <TabsTrigger 
                    value="creator" 
                    className="px-8 py-3 rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all text-gray-700" // Added text-gray-700 for inactive
                    >
                    For Creators
                    </TabsTrigger>
                    <TabsTrigger 
                    value="brand" 
                    className="px-8 py-3 rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all text-gray-700" // Added text-gray-700 for inactive
                    >
                    For Brands
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-px bg-gray-200" />
                )}
                
                <div className="relative bg-white border border-gray-200 rounded-3xl p-8 h-full transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
                  {/* Step number */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mb-6">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-normal text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}