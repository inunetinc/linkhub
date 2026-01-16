"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Award, Clock, HeartHandshake } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: "100% Secure",
    description: "Escrow payments and verified accounts protect every transaction"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get matched with relevant brands or creators in minutes"
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with creators and brands from around the world"
  },
  {
    icon: Award,
    title: "Fair Pricing",
    description: "AI-powered rates based on real engagement metrics"
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our team is always here to help you succeed"
  },
  {
    icon: HeartHandshake,
    title: "Built for Trust",
    description: "Transparent processes that benefit everyone"
  }
];

export default function WhyChooseUsSection() {
  return (
    <section className="relative py-24 bg-gray-900 overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            Why Choose LinkHub?
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            We're building the future of creator-brand partnerships
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-14 h-14 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-4"
              >
                <benefit.icon className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10"
        >
          <div className="text-center">
            <p className="text-4xl font-bold text-white mb-1">10K+</p>
            <p className="text-gray-400 text-sm">Active Creators</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-white mb-1">500+</p>
            <p className="text-gray-400 text-sm">Brand Partners</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-white mb-1">$2M+</p>
            <p className="text-gray-400 text-sm">Paid Out</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-white mb-1">98%</p>
            <p className="text-gray-400 text-sm">Satisfaction Rate</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
