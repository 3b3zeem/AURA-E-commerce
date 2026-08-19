'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { getBlogById } from '@/lib/services/db';
import {
  ArrowLeft,
  Clock,
  User,
  Share2,
  Bookmark,
  Check,
  Tag,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BlogClientPage({ blogId }: { blogId: string }) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!blogId) return;
    async function fetchBlogDetail() {
      setLoading(true);
      const data = await getBlogById(blogId);
      setBlog(data);
      setLoading(false);
    }
    fetchBlogDetail();
  }, [blogId]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Article link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-8 font-sans">
        <div className="space-y-4 text-center">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono font-bold text-slate-600 uppercase">Loading Article...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-8 font-sans">
        <div className="text-center space-y-4 max-w-md">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h1 className="text-2xl font-black uppercase text-slate-900">Article Not Found</h1>
          <p className="text-xs text-slate-600">The article you are looking for does not exist or has been removed.</p>
          <Link
            href="/blogs"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider border border-slate-800 hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Journal</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white text-slate-900 font-sans pb-24">
      {/* Header Banner */}
      <div className="w-full bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            href="/blogs"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Journal</span>
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-white text-slate-950 font-black text-[10px] uppercase tracking-wider inline-flex items-center space-x-1.5">
                <Tag className="w-3 h-3 text-slate-900" />
                <span>{blog.category || 'Tech Guide'}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{blog.read_time_minutes ? `${blog.read_time_minutes} min read` : '5 min read'}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight text-white">
              {blog.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {blog.summary}
            </p>

            {/* Author Info */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex items-center space-x-3">
                {blog.author_avatar ? (
                  <img
                    src={blog.author_avatar}
                    alt={blog.author_name || 'Author Avatar'}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 font-black text-sm">
                    {blog.author_name ? blog.author_name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-white uppercase block">
                    {blog.author_name || 'AURA Editorial Team'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Published on {new Date(blog.published_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                  title="Share Article"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Image */}
      {blog.cover_image && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden border border-slate-200 bg-slate-100 shadow-md">
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-h2:text-2xl prose-h3:text-xl prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-slate-900 prose-a:underline font-sans space-y-6">
          {blog.content ? (
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          ) : (
            <p className="text-slate-600 leading-relaxed text-sm">
              {blog.summary}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-500 uppercase">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AURA Hardware & Engineering Journal</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider border border-slate-800 transition-colors flex items-center space-x-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
            </button>
            <Link
              href="/blogs"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider border border-slate-300 transition-colors"
            >
              More Articles
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
