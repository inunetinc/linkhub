"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CreatorsShowcase() {
  return (
    <section className="relative py-32 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            Featured Creators
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Discover talented creators ready to amplify your brand's message
          </p>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-12 md:p-16 text-center">
            <div className="relative z-10">
              {/* Icon */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-900 flex items-center justify-center"
              >
                <Users className="w-10 h-10 text-white" />
              </motion.div>

              <h3 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                Be the First Featured Creator
              </h3>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                Join LinkHub today and showcase your content to brands looking for authentic partnerships. Early creators get priority placement.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="group px-8 py-6 text-lg rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 shadow-lg transition-all hover:scale-105"
                  onClick={() => window.location.href = '/login'}
                >
                  <span className="flex items-center gap-2">
                    Become a Creator
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
