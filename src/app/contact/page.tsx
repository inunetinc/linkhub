"use client"

import React, { useState } from 'react';
import { Mail, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Navbar from '../home/Navbar';
import Footer from '../home/Footer';

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    description: "info@linkhub.com",
    subtext: "We'll respond within 24 hours"
  },
  {
    icon: Clock,
    title: "Business Hours",
    description: "Mon - Fri: 9am - 6pm",
    subtext: "Pacific Time"
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Have a question or want to learn more? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              {submitted ? (
                <div className="bg-gray-50 rounded-3xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-900 flex items-center justify-center mb-6">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-light text-gray-900 mb-2">
                    Message Sent
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thanks for reaching out! We'll get back to you within 24 hours.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-0 focus:outline-none transition-colors bg-white text-gray-900"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-0 focus:outline-none transition-colors bg-white text-gray-900"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-0 focus:outline-none transition-colors bg-white text-gray-900"
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="creator">Creator Questions</option>
                      <option value="brand">Brand Partnership</option>
                      <option value="support">Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-0 focus:outline-none transition-colors resize-none bg-white text-gray-900"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 rounded-full bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              {contactInfo.map((item, index) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-900">{item.description}</p>
                    <p className="text-gray-500 text-sm">{item.subtext}</p>
                  </div>
                </div>
              ))}

              {/* FAQ Link */}
              <div className="pt-8 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">
                  Looking for quick answers?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Check out our frequently asked questions for instant help.
                </p>
                <Button
                  variant="outline"
                  className="border-gray-900 text-gray-900 bg-white hover:bg-gray-50 rounded-full"
                  onClick={() => window.location.href = '/pricing'}
                >
                  View Pricing & FAQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
