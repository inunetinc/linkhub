"use client"

import React from 'react';
import { FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#how-it-works' },
    { label: 'Pricing', href: '/pricing' }
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' }
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'GDPR', href: '/gdpr' }
  ]
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
          {/* Logo column - left */}
          <div className="md:max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/v2.png"
                alt="LinkHub"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-semibold text-gray-900">LinkHub</span>
            </div>
            <p className="text-gray-600 text-sm mb-6 font-light">
              The premium marketplace for authentic creator-brand partnerships.
            </p>
            <div className="flex gap-4">
              {[
                { name: 'x', icon: FaXTwitter, url: 'https://x.com' },
                { name: 'instagram', icon: FaInstagram, url: 'https://instagram.com' },
                { name: 'linkedin', icon: FaLinkedin, url: 'https://linkedin.com' },
                { name: 'youtube', icon: FaYoutube, url: 'https://youtube.com' }
              ].map(({ name, icon: Icon, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600 hover:text-gray-900"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns - right */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16 md:gap-32">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="font-normal text-gray-900 mb-4">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-gray-600 hover:text-gray-900 text-sm transition-colors font-light"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm font-light">
            © {new Date().getFullYear()} LinkHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}