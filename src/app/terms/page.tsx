"use client"

import React from 'react';
import Navbar from '../home/Navbar';
import Footer from '../home/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-500 mb-12">Last updated: January 2026</p>

            <div className="prose prose-gray max-w-none">
              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using LinkHub, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-600 leading-relaxed">
                  LinkHub is a marketplace platform that connects content creators with brands for partnership opportunities. We provide tools for creators to showcase their work and for brands to discover and collaborate with creators. LinkHub facilitates these connections but is not a party to any agreements made between creators and brands.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">3. User Accounts</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To use certain features of LinkHub, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Provide accurate and complete information during registration</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">4. User Conduct</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Use the platform for any unlawful purpose</li>
                  <li>Impersonate any person or entity</li>
                  <li>Upload false, misleading, or fraudulent content</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Attempt to gain unauthorized access to any part of the platform</li>
                  <li>Use automated systems to access the platform without permission</li>
                  <li>Interfere with or disrupt the platform or servers</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">5. Creator Terms</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  As a creator on LinkHub, you agree that:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>You own or have the necessary rights to all content you upload</li>
                  <li>Your profile information accurately represents your reach and engagement</li>
                  <li>You will fulfill all partnership agreements in good faith</li>
                  <li>You will comply with all applicable advertising disclosure requirements</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">6. Brand Terms</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  As a brand on LinkHub, you agree that:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>You have authority to act on behalf of the brand you represent</li>
                  <li>You will provide clear campaign requirements and expectations</li>
                  <li>You will pay creators according to agreed-upon terms</li>
                  <li>You will respect creators' creative freedom within campaign guidelines</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">7. Fees and Payments</h2>
                <p className="text-gray-600 leading-relaxed">
                  LinkHub charges a platform fee for successful partnerships. All fees are clearly disclosed before any transaction. Payment terms and processing are handled through our secure payment system. Refunds and disputes will be handled according to our dispute resolution process.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">8. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed">
                  The LinkHub platform, including its design, features, and content (excluding user-generated content), is owned by LinkHub and protected by intellectual property laws. Users retain ownership of their content but grant LinkHub a license to use, display, and distribute such content on the platform.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  LinkHub is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform. Our total liability shall not exceed the amount you paid to LinkHub in the past twelve months.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">10. Termination</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may terminate or suspend your account at any time for violations of these terms or for any other reason at our discretion. You may also delete your account at any time. Upon termination, your right to use the platform will immediately cease.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">11. Changes to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">12. Contact</h2>
                <p className="text-gray-600 leading-relaxed">
                  For questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:legal@linkhub.com" className="text-gray-900 underline">legal@linkhub.com</a>.
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
