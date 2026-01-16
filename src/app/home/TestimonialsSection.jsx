"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Search, TrendingUp } from 'lucide-react';

const highlights = [
  {
    icon: Zap,
    title: "Land Deals Fast",
    description: "Showcase your content and connect with brands that align with your values. Get discovered and close deals quickly."
  },
  {
    icon: Search,
    title: "Find Creators in Minutes",
    description: "Browse verified creators filtered by niche, reach, and engagement. No more weeks of searching—find your perfect match instantly."
  },
  {
    icon: TrendingUp,
    title: "Know Your Worth",
    description: "AI-powered analytics calculate fair rates based on real metrics. Transparent pricing that creators and brands both trust."
  }
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-32 bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            Why LinkHub
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Built for creators and brands who value authentic partnerships
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {highlights.map((highlight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative h-full bg-white border border-gray-200 rounded-3xl p-8 transition-all duration-300 hover:shadow-sm hover:border-gray-300">
                <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mb-6">
                  <highlight.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-normal text-gray-900 mb-3">
                  {highlight.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
