"use client"

import React from 'react';
import Navbar from '../home/Navbar';
import Footer from '../home/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-500 mb-12">Last updated: January 2026</p>

            <div className="prose prose-gray max-w-none">
              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  LinkHub ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using LinkHub, you agree to the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">2. Information We Collect</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                  <li>Account information (name, email address, password)</li>
                  <li>Profile information (bio, profile picture, social media handles)</li>
                  <li>Payment information (processed securely through our payment providers)</li>
                  <li>Communications you send to us</li>
                  <li>Content you create or share on our platform</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  We also automatically collect certain information when you use our platform, including your IP address, browser type, device information, and usage data.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Connect creators with brands and facilitate partnerships</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">4. Information Sharing</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>With other users as part of the platform's functionality (e.g., your public profile)</li>
                  <li>With service providers who perform services on our behalf</li>
                  <li>In response to legal process or government requests</li>
                  <li>To protect the rights, privacy, safety, or property of LinkHub and our users</li>
                  <li>In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">6. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Access to your personal information</li>
                  <li>Correction of inaccurate or incomplete data</li>
                  <li>Deletion of your personal information</li>
                  <li>Data portability</li>
                  <li>Objection to processing</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">7. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:privacy@linkhub.com" className="text-gray-900 underline">privacy@linkhub.com</a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
