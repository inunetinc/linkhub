"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Shield, TrendingUp, Heart } from 'lucide-react';
import Navbar from '../home/Navbar';
import Footer from '../home/Footer';

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "We believe in fair, data-driven pricing that benefits both creators and brands. No hidden fees, no surprises."
  },
  {
    icon: Users,
    title: "Creator-First",
    description: "Creators are the heart of our platform. We empower them with tools to showcase their value and earn what they deserve."
  },
  {
    icon: TrendingUp,
    title: "Data-Driven",
    description: "Our AI analyzes real metrics to calculate fair rates, removing the guesswork from influencer marketing."
  },
  {
    icon: Heart,
    title: "Authentic Partnerships",
    description: "We connect brands with creators who genuinely align with their values, creating partnerships that feel real."
  }
];

const stats = [
  { value: "10K+", label: "Creators" },
  { value: "500+", label: "Brands" },
  { value: "$2M+", label: "Paid to Creators" },
  { value: "98%", label: "Satisfaction" }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero + Mission Section */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left - Hero */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
                Connecting Creators & Brands
                <br />
                <span className="text-gray-500">The Right Way</span>
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                LinkHub is the marketplace where authentic creator-brand partnerships begin.
                We use AI-powered analytics to ensure fair pricing for creators and real value for brands.
              </p>
            </motion.div>

            {/* Right - Mission */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center md:text-left"
            >
              <div className="w-16 h-16 mx-auto md:mx-0 rounded-2xl bg-gray-900 flex items-center justify-center mb-8">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                We're building a world where every creator knows their worth and every brand finds their perfect match.
                By leveraging data and AI, we're eliminating the friction in influencer marketing and creating
                a transparent marketplace where authentic partnerships thrive.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Problem & Solution */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 rounded-3xl p-8 md:p-10"
            >
              <h3 className="text-2xl font-light text-gray-900 mb-4">The Problem</h3>
              <p className="text-gray-600 leading-relaxed">
                Influencer marketing is broken. Creators don't know what to charge, brands overpay or underpay,
                and finding the right match feels like searching for a needle in a haystack. The result?
                Wasted budgets, frustrated creators, and inauthentic partnerships.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gray-900 rounded-3xl p-8 md:p-10"
            >
              <h3 className="text-2xl font-light text-white mb-4">Our Solution</h3>
              <p className="text-white/80 leading-relaxed">
                LinkHub uses AI to analyze creator metrics and calculate fair, transparent pricing.
                Brands can discover creators filtered by niche, engagement, and reach.
                No more negotiations, no more guessing—just authentic partnerships built on real data.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              What We Stand For
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our values guide everything we build
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-900 flex items-center justify-center mb-4">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gray-50 py-16 mb-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-4xl md:text-5xl font-light text-gray-900 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
