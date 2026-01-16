"use client"

import React from 'react';
import Navbar from '../home/Navbar';
import Footer from '../home/Footer';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Cookie Policy
            </h1>
            <p className="text-gray-500 mb-12">Last updated: January 2026</p>

            <div className="prose prose-gray max-w-none">
              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">1. What Are Cookies</h2>
                <p className="text-gray-600 leading-relaxed">
                  Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site. Cookies help us remember your preferences and improve your experience on LinkHub.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">2. How We Use Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use cookies for the following purposes:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li><strong>Essential cookies:</strong> Required for the platform to function properly, including authentication and security.</li>
                  <li><strong>Functional cookies:</strong> Remember your preferences and settings to enhance your experience.</li>
                  <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our platform so we can improve it.</li>
                  <li><strong>Performance cookies:</strong> Collect information about how you use our platform to optimize performance.</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">3. Types of Cookies We Use</h2>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Session Cookies</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  These are temporary cookies that expire when you close your browser. They are essential for features like keeping you logged in during your visit.
                </p>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Persistent Cookies</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  These cookies remain on your device for a set period or until you delete them. They help us recognize you when you return to LinkHub.
                </p>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Third-Party Cookies</h3>
                <p className="text-gray-600 leading-relaxed">
                  Some cookies are placed by third-party services that appear on our pages, such as analytics providers. We do not control these cookies.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">4. Managing Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>View what cookies are stored on your device</li>
                  <li>Delete cookies individually or all at once</li>
                  <li>Block cookies from specific or all websites</li>
                  <li>Set your browser to notify you when a cookie is being set</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Please note that blocking certain cookies may affect your experience on LinkHub and limit the functionality available to you.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">5. Cookie List</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Below is a list of the main cookies we use:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-gray-600 text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 pr-4 font-medium text-gray-900">Cookie Name</th>
                        <th className="text-left py-3 pr-4 font-medium text-gray-900">Purpose</th>
                        <th className="text-left py-3 font-medium text-gray-900">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 pr-4">session_id</td>
                        <td className="py-3 pr-4">User authentication</td>
                        <td className="py-3">Session</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 pr-4">preferences</td>
                        <td className="py-3 pr-4">Store user preferences</td>
                        <td className="py-3">1 year</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 pr-4">_analytics</td>
                        <td className="py-3 pr-4">Usage analytics</td>
                        <td className="py-3">2 years</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">6. Updates to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this policy periodically.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">7. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about our use of cookies, please contact us at{' '}
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
