"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Navbar from '../home/Navbar';
import Footer from '../home/Footer';
import { API_BASE_URL } from '@/config/api';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  views: number;
  readTime: number | null;
  publishedAt: string;
  createdAt: string;
}

interface CategoryCount {
  category: string;
  count: number;
}

const categoryLabels: Record<string, string> = {
  GENERAL: 'General',
  CREATOR_TIPS: 'Creator Tips',
  BRAND_MARKETING: 'Brand Marketing',
  INDUSTRY_NEWS: 'Industry News',
  TUTORIALS: 'Tutorials',
  CASE_STUDIES: 'Case Studies',
  PLATFORM_UPDATES: 'Platform Updates',
  SUCCESS_STORIES: 'Success Stories'
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchFeaturedPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('limit', '12');

      const res = await fetch(`${API_BASE_URL}/api/blog?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blog?featured=true&limit=3`);
      const data = await res.json();
      setFeaturedPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching featured posts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blog-categories`);
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Blog
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Insights, tips, and stories for creators and brands navigating the world of influencer marketing.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-12"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-gray-900 focus:ring-0 focus:outline-none transition-colors bg-white text-gray-900"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedCategory === ''
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedCategory === cat.category
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {categoryLabels[cat.category] || cat.category} ({cat.count})
                </button>
              ))}
            </div>
          </motion.div>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && !selectedCategory && !searchQuery && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-light text-gray-900 mb-8">Featured</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {featuredPosts.map((post, index) => (
                  <motion.a
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                      {post.coverImage ? (
                        <img
                          src={`${API_BASE_URL}${post.coverImage}`}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                    </div>
                    <span className="text-sm text-gray-500 mb-2 block">
                      {categoryLabels[post.category] || post.category}
                    </span>
                    <h3 className="text-xl font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.publishedAt)}
                      </span>
                      {post.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime} min read
                        </span>
                      )}
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.section>
          )}

          {/* All Posts */}
          <section>
            {!selectedCategory && !searchQuery && featuredPosts.length > 0 && (
              <h2 className="text-2xl font-light text-gray-900 mb-8">Latest Articles</h2>
            )}

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[16/10] rounded-2xl bg-gray-200 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.a
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                      {post.coverImage ? (
                        <img
                          src={`${API_BASE_URL}${post.coverImage}`}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                    </div>
                    <span className="text-sm text-gray-500 mb-2 block">
                      {categoryLabels[post.category] || post.category}
                    </span>
                    <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.publishedAt)}
                      </span>
                      {post.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime} min
                        </span>
                      )}
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No articles found.</p>
                {(selectedCategory || searchQuery) && (
                  <Button
                    onClick={() => {
                      setSelectedCategory('');
                      setSearchQuery('');
                    }}
                    className="mt-4 bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
