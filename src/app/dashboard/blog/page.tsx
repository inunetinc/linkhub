"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DashboardLayout from '@/components/DashboardLayout';

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

export default function DashboardBlogPage() {
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

      const res = await fetch(`http://localhost:5000/api/blog?${params}`);
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
      const res = await fetch('http://localhost:5000/api/blog?featured=true&limit=3');
      const data = await res.json();
      setFeaturedPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching featured posts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/blog-categories');
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
    <DashboardLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              Blog
            </h1>
            <p className="text-gray-600">
              Insights, tips, and stories for creators and brands navigating the world of influencer marketing.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
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
              className="mb-12"
            >
              <h2 className="text-xl font-medium text-gray-900 mb-6">Featured</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredPosts.map((post, index) => (
                  <motion.a
                    key={post.id}
                    href={`/dashboard/blog/${post.slug}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                      {post.coverImage ? (
                        <img
                          src={`http://localhost:5000${post.coverImage}`}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-gray-500 mb-2 block">
                        {categoryLabels[post.category] || post.category}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.publishedAt)}
                        </span>
                        {post.readTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime} min
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.section>
          )}

          {/* All Posts */}
          <section>
            {!selectedCategory && !searchQuery && featuredPosts.length > 0 && (
              <h2 className="text-xl font-medium text-gray-900 mb-6">Latest Articles</h2>
            )}

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="aspect-[16/10] bg-gray-200" />
                    <div className="p-4">
                      <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post, index) => (
                  <motion.a
                    key={post.id}
                    href={`/dashboard/blog/${post.slug}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                      {post.coverImage ? (
                        <img
                          src={`http://localhost:5000${post.coverImage}`}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-gray-500 mb-2 block">
                        {categoryLabels[post.category] || post.category}
                      </span>
                      <h3 className="text-base font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.publishedAt)}
                        </span>
                        {post.readTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime} min
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
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
      </div>
    </DashboardLayout>
  );
}
