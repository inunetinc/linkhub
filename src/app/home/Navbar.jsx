"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'For Creators', href: '#how-it-works-creators' },
  { label: 'For Brands', href: '#how-it-works-brands' },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
];

const handleHowItWorksClick = (hash) => {
  // Check if we're on the homepage
  if (window.location.pathname === '/') {
    // On homepage, just scroll to the section
    window.location.hash = hash;
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    // On another page, navigate to homepage with the hash
    window.location.href = '/' + hash;
  }
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <img
                src="/v2.png"
                alt="LinkHub"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-semibold text-gray-900">LinkHub</span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    if (link.href.startsWith('#how-it-works')) {
                      e.preventDefault();
                      handleHowItWorksClick(link.href);
                    }
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-normal cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => window.location.href = '/login'}
              >
                Log in
              </Button>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6" onClick={() => window.location.href = '/login'}>
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl md:hidden transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Close button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <span className="text-lg font-semibold text-gray-900">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto py-4">
            {navLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  if (link.href.startsWith('#how-it-works')) {
                    e.preventDefault();
                    handleHowItWorksClick(link.href);
                  }
                }}
                className="block px-6 py-4 text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                style={{
                  transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms'
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="p-6 border-t border-gray-100 space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-gray-300 text-gray-900 bg-white hover:bg-gray-50 rounded-full"
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.location.href = '/login';
              }}
            >
              Log in
            </Button>
            <Button
              size="lg"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full"
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.location.href = '/login';
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}