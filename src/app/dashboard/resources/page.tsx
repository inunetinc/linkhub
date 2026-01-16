"use client"

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Video,
  FileText,
  Lightbulb,
  TrendingUp,
  Users,
  DollarSign,
  Camera,
  Megaphone,
  BarChart3,
  Shield,
  HelpCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import DashboardLayout from '@/components/DashboardLayout';

const resourceCategories = [
  {
    title: "Getting Started",
    description: "New to LinkHub? Start here to learn the basics.",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600",
    resources: [
      { title: "How to Set Up Your Profile", type: "Guide", link: "/dashboard/blog" },
      { title: "Understanding the Dashboard", type: "Guide", link: "/dashboard/blog" },
      { title: "Connecting Your Social Accounts", type: "Tutorial", link: "/dashboard/blog" },
    ]
  },
  {
    title: "Content Creation",
    description: "Tips and tools to create better content.",
    icon: Camera,
    color: "bg-purple-100 text-purple-600",
    resources: [
      { title: "Content Planning Best Practices", type: "Guide", link: "/dashboard/blog" },
      { title: "Photography Tips for Creators", type: "Article", link: "/dashboard/blog" },
      { title: "Writing Compelling Captions", type: "Tips", link: "/dashboard/blog" },
    ]
  },
  {
    title: "Growing Your Audience",
    description: "Strategies to expand your reach and engagement.",
    icon: TrendingUp,
    color: "bg-green-100 text-green-600",
    resources: [
      { title: "Building an Engaged Community", type: "Guide", link: "/dashboard/blog" },
      { title: "Cross-Platform Growth Strategies", type: "Article", link: "/dashboard/blog" },
      { title: "Hashtag Optimization Guide", type: "Tips", link: "/dashboard/blog" },
    ]
  },
  {
    title: "Brand Collaborations",
    description: "How to work effectively with brands.",
    icon: Users,
    color: "bg-orange-100 text-orange-600",
    resources: [
      { title: "Pitching to Brands Successfully", type: "Guide", link: "/dashboard/blog" },
      { title: "Negotiating Fair Rates", type: "Article", link: "/dashboard/blog" },
      { title: "Creating Sponsored Content", type: "Tutorial", link: "/dashboard/blog" },
    ]
  },
  {
    title: "Monetization",
    description: "Turn your influence into income.",
    icon: DollarSign,
    color: "bg-emerald-100 text-emerald-600",
    resources: [
      { title: "Pricing Your Services", type: "Calculator", link: "/dashboard?view=pricing" },
      { title: "Diversifying Income Streams", type: "Guide", link: "/dashboard/blog" },
      { title: "Tax Tips for Creators", type: "Article", link: "/dashboard/blog" },
    ]
  },
  {
    title: "Analytics & Insights",
    description: "Understand your performance and grow.",
    icon: BarChart3,
    color: "bg-indigo-100 text-indigo-600",
    resources: [
      { title: "Reading Your Analytics", type: "Guide", link: "/dashboard/blog" },
      { title: "Key Metrics That Matter", type: "Article", link: "/dashboard/blog" },
      { title: "Reporting for Brand Partners", type: "Template", link: "/dashboard/blog" },
    ]
  }
];

const quickLinks = [
  { title: "Help Center", description: "Get support and answers", icon: HelpCircle, link: "/dashboard/support", external: false },
  { title: "Blog", description: "Latest articles and tips", icon: FileText, link: "/dashboard/blog", external: false },
  { title: "Pricing", description: "Plans and features", icon: DollarSign, link: "/dashboard?view=pricing", external: false },
  { title: "Terms of Service", description: "Our policies", icon: Shield, link: "/terms", external: true },
];

export default function ResourcesPage() {
  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              Resources
            </h1>
            <p className="text-gray-600">
              Everything you need to succeed as a creator on LinkHub.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            {quickLinks.map((item, index) => (
              <a
                key={item.title}
                href={item.link}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                    <item.icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </motion.div>

          {/* Resource Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resourceCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${category.color} flex items-center justify-center`}>
                      <category.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{category.description}</p>

                  <div className="space-y-2">
                    {category.resources.map((resource) => (
                      <a
                        key={resource.title}
                        href={resource.link}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">
                            {resource.title}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full">
                          {resource.type}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 text-center"
          >
            <div className="bg-gray-50 rounded-2xl p-8">
              <Lightbulb className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Can't find what you're looking for?
              </h3>
              <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                Our support team is here to help. Reach out and we'll get back to you within 24 hours.
              </p>
              <Button
                onClick={() => window.location.href = '/dashboard/support'}
                className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6"
              >
                Contact Support
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
