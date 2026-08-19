'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

export default function BlogDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchBlogDetail() {
      setLoading(true);
      const data = await getBlogById(id);
      setBlog(data);
      setLoading(false);
    }
    fetchBlogDetail();
  }, [id]);

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
        <div className="max-w-md text-center space-y-4 border border-slate-200 p-8 bg-slate-50">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900 uppercase">Article Not Found</h2>
          <p className="text-xs text-slate-600">The requested blog post could not be located or has been moved.</p>
          <Link
            href="/blogs"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        {/* Back Link */}
        <Link
          href="/blogs"
          className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-slate-700 hover:text-slate-900 uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </Link>

        {/* Article Header */}
        <header className="space-y-6">
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold uppercase">
              {blog.category}
            </span>
            <span className="flex items-center space-x-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-700" />
              <span>{blog.read_time_minutes} min read</span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-medium">
              {new Date(blog.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase text-slate-900 tracking-tight leading-tight">
            {blog.title}
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
            {blog.summary}
          </p>

          {/* Author & Share Bar */}
          <div className="py-4 border-t border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              {blog.author_avatar ? (
                <img
                  src={blog.author_avatar}
                  alt={blog.author_name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">
                  {blog.author_name[0]}
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-slate-900 block">{blog.author_name}</span>
                <span className="text-[11px] text-slate-500">AURA Engineering & Design</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-300 text-xs font-bold uppercase transition-colors flex items-center space-x-2 cursor-pointer text-slate-800"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Share Article'}</span>
            </button>
          </div>
        </header>

        {/* Cover Image Frame */}
        <div className="relative aspect-video w-full bg-slate-100 border border-slate-200 overflow-hidden shadow-md">
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body Content */}
        <article className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-6 text-sm sm:text-base">
          {blog.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('# ')) {
              return (
                <h2 key={index} className="text-2xl sm:text-3xl font-black text-slate-900 uppercase pt-4 tracking-tight">
                  {paragraph.replace('# ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl font-bold text-slate-900 uppercase pt-2">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            return (
              <p key={index} className="text-slate-700 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </article>

        {/* Tags Section */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="pt-8 border-t border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 font-bold uppercase">
              <Tag className="w-3.5 h-3.5 text-slate-900" />
              <span>Article Topics:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-300 text-xs font-mono font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Catalog Exploration CTA Banner */}
        <section className="p-8 bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xl font-black uppercase text-white">READY TO EXPERIENCE AURA HARDWARE?</h4>
            <p className="text-xs text-slate-300">Discover planar audio gear, mechanical keyboards, and titanium wearables.</p>
          </div>
          <Link
            href="/products"
            className="px-6 py-3 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors shrink-0 cursor-pointer"
          >
            Explore Catalog
          </Link>
        </section>
      </main>
    </div>
  );
}
