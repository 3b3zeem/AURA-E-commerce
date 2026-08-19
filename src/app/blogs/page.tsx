'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { getBlogs, getBlogCategories } from '@/lib/services/db';
import {
  Search,
  BookOpen,
  Clock,
  Tag,
  ArrowRight,
  Sparkles,
  User,
  X,
  Filter,
} from 'lucide-react';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch categories from dedicated API via db service
  useEffect(() => {
    async function loadCategories() {
      const cats = await getBlogCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

  // Fetch blogs via db service
  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      const data = await getBlogs(activeCategory, searchQuery);
      setBlogs(data);
      setLoading(false);
    }

    const timer = setTimeout(() => {
      loadBlogs();
    }, 200);

    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery]);

  const featuredBlog = blogs.find((b) => b.is_featured) || blogs[0];
  const regularBlogs = blogs.filter((b) => b.id !== featuredBlog?.id);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Page Header */}
        <section className="space-y-4 text-center pt-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-amber-100 border border-amber-300 rounded-full text-xs font-mono font-bold text-amber-900">
            <BookOpen className="w-3.5 h-3.5 text-amber-800" />
            <span>AURA JOURNAL & INSIGHTS</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 uppercase font-mono leading-none">
            ENGINEERING & HARDWARE STORIES
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Deep dives into planar acoustic driver design, aerospace titanium craftsmanship, ergonomic workspace guides, and flagship product releases.
          </p>
        </section>

        {/* Search & Category Filter Controls */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 shrink-0 mr-2">
              <Filter className="w-3.5 h-3.5 text-slate-700" />
              <span>Filter:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase transition-colors shrink-0 cursor-pointer border ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles, guides, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </section>

        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center space-y-4 border border-dashed border-slate-300 p-8">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-black uppercase text-slate-900">No Articles Found</h3>
            <p className="text-xs text-slate-600">Try adjusting your search terms or selecting a different category.</p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured Article Card */}
            {featuredBlog && activeCategory === 'All' && !searchQuery && (
              <div className="bg-slate-900 text-white border border-slate-800 grid grid-cols-1 lg:grid-cols-2 overflow-hidden shadow-xl">
                <div className="relative aspect-video lg:aspect-auto bg-slate-950 overflow-hidden">
                  <img
                    src={featuredBlog.cover_image}
                    alt={featuredBlog.title}
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-amber-400 text-slate-950 font-mono font-black text-[10px] uppercase tracking-wider">
                    FEATURED STORY
                  </span>
                </div>

                <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-xs font-mono text-amber-400">
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 uppercase font-bold">
                        {featuredBlog.category}
                      </span>
                      <span className="flex items-center space-x-1 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{featuredBlog.read_time_minutes} min read</span>
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight leading-snug">
                      <Link href={`/blogs/${featuredBlog.id}`} className="hover:text-amber-400 transition-colors">
                        {featuredBlog.title}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {featuredBlog.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      {featuredBlog.author_avatar ? (
                        <img
                          src={featuredBlog.author_avatar}
                          alt={featuredBlog.author_name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-200">{featuredBlog.author_name}</span>
                    </div>

                    <Link
                      href={`/blogs/${featuredBlog.id}`}
                      className="inline-flex items-center space-x-2 text-xs font-bold text-amber-400 hover:text-amber-300 uppercase tracking-wider"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {regularBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="bg-white border border-slate-200 flex flex-col justify-between hover:border-slate-900 transition-all shadow-sm group"
                >
                  <div>
                    {/* Article Thumbnail Frame */}
                    <Link href={`/blogs/${blog.id}`} className="block relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-200">
                      <img
                        src={blog.cover_image}
                        alt={blog.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-[10px] uppercase">
                        {blog.category}
                      </span>
                    </Link>

                    {/* Card Content */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
                        <Clock className="w-3 h-3 text-slate-700" />
                        <span>{blog.read_time_minutes} min read</span>
                        <span>•</span>
                        <span>{new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      <h3 className="text-base font-black uppercase text-slate-900 group-hover:text-black line-clamp-2 leading-tight">
                        <Link href={`/blogs/${blog.id}`}>{blog.title}</Link>
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {blog.summary}
                      </p>

                      {/* Tag Badges */}
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {blog.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2 pt-4">
                      {blog.author_avatar && (
                        <img src={blog.author_avatar} alt={blog.author_name} className="w-6 h-6 rounded-full object-cover" />
                      )}
                      <span className="text-xs font-bold text-slate-800">{blog.author_name}</span>
                    </div>

                    <Link
                      href={`/blogs/${blog.id}`}
                      className="pt-4 text-xs font-bold text-slate-900 group-hover:text-black uppercase flex items-center space-x-1"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
