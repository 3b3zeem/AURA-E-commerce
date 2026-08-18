'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ShieldCheck, CheckCircle2, User, Send } from 'lucide-react';
import { Product, Review } from '@/types';
import { formatDate } from '@/lib/utils';
import { useUserStore } from '@/store/useUserStore';

interface ProductTabsProps {
  product: Product;
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'reviews'>('specs');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const { profile, addLoyaltyPoints } = useUserStore();

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setReviews(data);
        }
      } catch {}
    }
    if (product?.id) loadReviews();
  }, [product?.id]);

  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      product_id: product.id,
      user_id: profile?.id || 'guest',
      profile: profile || {
        id: 'guest',
        email: 'user@aura.com',
        full_name: 'Verified Customer',
        avatar_url: null,
        phone: null,
        role: 'customer',
        loyalty_points: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      rating: newRating,
      comment: newComment,
      created_at: new Date().toISOString(),
    };

    setReviews([newRev, ...reviews]);
    setNewComment('');
    addLoyaltyPoints(25);
    setReviewSuccessMsg(true);
    setTimeout(() => setReviewSuccessMsg(false), 4000);

    if (profile?.id) {
      try {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: product.id,
            user_id: profile.id,
            rating: newRating,
            comment: newComment,
          }),
        });
      } catch {}
    }
  };

  return (
    <div className="bg-white border border-slate-200 overflow-hidden mt-12 font-sans text-slate-900">
      
      {/* Tab Navigation Header */}
      <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
        <button
          onClick={() => setActiveTab('specs')}
          className={`px-6 py-4 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'specs'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-slate-900" /> Technical Specifications
        </button>

        <button
          onClick={() => setActiveTab('description')}
          className={`px-6 py-4 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'description'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Product Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-4 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-slate-900" /> Customer Reviews ({reviews.length})
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="p-6 sm:p-8 bg-white">
        
        {/* Tab 1: Specs */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(product.specs || {}).map(([key, val]) => (
              <div
                key={key}
                className="p-4 bg-slate-50 border border-slate-200 flex justify-between items-center"
              >
                <span className="text-xs text-slate-500 font-bold uppercase">{key}</span>
                <span className="text-xs font-bold text-slate-900 font-mono">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Description */}
        {activeTab === 'description' && (
          <div className="space-y-4 max-w-3xl text-xs text-slate-700 leading-relaxed">
            <p>{product.description}</p>
            <div className="p-4 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium space-y-1">
              <p className="font-black uppercase flex items-center gap-1.5 mb-2 text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-slate-900" /> Included in package:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 font-semibold pl-2">
                <li>1x {product.name}</li>
                <li>Speed Charging Cable</li>
                <li>Quick Start Guide</li>
                <li>2-Year Warranty Card</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Customer Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            
            {/* Rating Breakdown Banner */}
            <div className="p-6 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-black text-slate-900 font-mono">{product.rating_avg}</div>
                <div>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Based on {reviews.length} verified reviews</p>
                </div>
              </div>

              <div className="text-xs text-white bg-slate-900 px-4 py-2 font-bold uppercase border border-slate-800">
                🎁 Leave a review & earn +25 VIP Points!
              </div>
            </div>

            {/* Write a Review Form */}
            <form onSubmit={handleAddReview} className="p-6 bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-sm font-black text-slate-900 uppercase">Write a Customer Review</h4>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= newRating ? 'text-amber-500 fill-current' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="Share your experience with this product..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-white border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center space-x-2 transition-colors uppercase border border-slate-800 cursor-pointer"
                >
                  <span>Submit Review</span>
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
                {reviewSuccessMsg && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 font-mono">
                    ✓ +25 VIP Points added to your balance!
                  </span>
                )}
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                        {rev.profile?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 uppercase">{rev.profile?.full_name || 'Customer'}</h5>
                        <span className="text-[10px] text-slate-500 font-mono">{formatDate(rev.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
