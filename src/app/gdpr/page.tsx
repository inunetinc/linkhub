"use client"

import React from 'react';
import Navbar from '../home/Navbar';
import Footer from '../home/Footer';

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              GDPR Compliance
            </h1>
            <p className="text-gray-500 mb-12">Last updated: January 2026</p>

            <div className="prose prose-gray max-w-none">
              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  LinkHub is committed to protecting the privacy and rights of individuals in accordance with the General Data Protection Regulation (GDPR). This page explains how we comply with GDPR requirements and outlines your rights as a data subject.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">2. Data Controller</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  LinkHub acts as the data controller for personal data collected through our platform. This means we determine the purposes and means of processing your personal data.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  For any GDPR-related inquiries, you can contact our Data Protection Officer at{' '}
                  <a href="mailto:dpo@linkhub.com" className="text-gray-900 underline">dpo@linkhub.com</a>.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">3. Legal Basis for Processing</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We process your personal data based on the following legal grounds:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li><strong>Contractual necessity:</strong> Processing necessary to provide our services to you</li>
                  <li><strong>Legitimate interests:</strong> Processing necessary for our legitimate business interests, such as improving our services and preventing fraud</li>
                  <li><strong>Consent:</strong> Where you have given explicit consent for specific processing activities</li>
                  <li><strong>Legal obligation:</strong> Processing necessary to comply with legal requirements</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">4. Your Rights Under GDPR</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  As a data subject under GDPR, you have the following rights:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-3">
                  <li>
                    <strong>Right of Access:</strong> You can request a copy of the personal data we hold about you.
                  </li>
                  <li>
                    <strong>Right to Rectification:</strong> You can request correction of inaccurate or incomplete personal data.
                  </li>
                  <li>
                    <strong>Right to Erasure:</strong> You can request deletion of your personal data in certain circumstances (also known as the "right to be forgotten").
                  </li>
                  <li>
                    <strong>Right to Restrict Processing:</strong> You can request that we limit how we use your data.
                  </li>
                  <li>
                    <strong>Right to Data Portability:</strong> You can request your data in a structured, commonly used, machine-readable format.
                  </li>
                  <li>
                    <strong>Right to Object:</strong> You can object to processing based on legitimate interests or for direct marketing purposes.
                  </li>
                  <li>
                    <strong>Rights Related to Automated Decision-Making:</strong> You have rights regarding automated decisions that significantly affect you.
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">5. Exercising Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To exercise any of your GDPR rights, you can:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Email our Data Protection Officer at <a href="mailto:dpo@linkhub.com" className="text-gray-900 underline">dpo@linkhub.com</a></li>
                  <li>Use the privacy settings in your account dashboard</li>
                  <li>Submit a request through our <a href="/contact" className="text-gray-900 underline">contact form</a></li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  We will respond to your request within 30 days. In some cases, we may need to verify your identity before processing your request.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">6. Data Retention</h2>
                <p className="text-gray-600 leading-relaxed">
                  We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements. When determining retention periods, we consider the amount, nature, and sensitivity of the data, the potential risk of harm from unauthorized use or disclosure, and applicable legal requirements.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">7. International Data Transfers</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When we transfer personal data outside the European Economic Area (EEA), we ensure appropriate safeguards are in place, including:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Standard Contractual Clauses approved by the European Commission</li>
                  <li>Transfers to countries with adequate data protection laws</li>
                  <li>Other legally approved transfer mechanisms</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">8. Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, access controls, regular security assessments, and staff training on data protection.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">9. Data Breach Notification</h2>
                <p className="text-gray-600 leading-relaxed">
                  In the event of a personal data breach that poses a risk to your rights and freedoms, we will notify the relevant supervisory authority within 72 hours of becoming aware of the breach. If the breach is likely to result in a high risk to you, we will also notify you directly without undue delay.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">10. Complaints</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you believe that your data protection rights have been violated, you have the right to lodge a complaint with a supervisory authority. In the EU, you can contact the data protection authority in your country of residence. However, we encourage you to contact us first so we can address your concerns directly.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-xl font-medium text-gray-900 mb-4">11. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  For any questions about GDPR compliance or to exercise your rights:
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Data Protection Officer<br />
                  Email: <a href="mailto:dpo@linkhub.com" className="text-gray-900 underline">dpo@linkhub.com</a>
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
