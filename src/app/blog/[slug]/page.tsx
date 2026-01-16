"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Share2, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Navbar from '../../home/Navbar';
import Footer from '../../home/Footer';
import { useParams } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
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

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/blog/${slug}`);
      if (!res.ok) {
        throw new Error('Post not found');
      }
      const data = await res.json();
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Post not found');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || '',
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="max-w-3xl mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
              <div className="aspect-[16/9] bg-gray-200 rounded-2xl mb-8" />
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-light text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Button
              onClick={() => window.location.href = '/blog'}
              className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <article className="max-w-3xl mx-auto px-6">
          {/* Back Link */}
          <motion.a
            href="/blog"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </motion.a>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="text-sm text-gray-500 mb-3 block">
              {categoryLabels[post.category] || post.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <span>By {post.author}</span>
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
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views} views
              </span>
            </div>

            {/* Share Button */}
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </motion.header>

          {/* Cover Image */}
          {post.coverImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="aspect-[16/9] rounded-2xl overflow-hidden mb-10"
            >
              <img
                src={`${API_BASE_URL}${post.coverImage}`}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-gray prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 pt-8 border-t border-gray-200"
            >
              <h3 className="text-sm font-medium text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <a
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {/* Back to Blog */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-gray-200 text-center"
          >
            <Button
              onClick={() => window.location.href = '/blog'}
              className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Articles
            </Button>
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
