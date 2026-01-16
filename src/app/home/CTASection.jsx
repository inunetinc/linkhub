"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden bg-white">
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Join creators and brands building authentic partnerships.
          </p>

          <Button
            size="lg"
            className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-6 text-lg rounded-full"
            onClick={() => window.location.href = '/login'}
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
