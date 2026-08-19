'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Send,
  BookOpen,
  PackageCheck,
  Truck,
  Sparkles,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { Product, Review } from '@/types';
import { formatDate } from '@/lib/utils';
import { useUserStore } from '@/store/useUserStore';

import { useProductReviews, useAddReviewMutation } from '@/hooks/useStoreData';

interface ProductTabsProps {
  product: Product;
}

type TabType = 'overview' | 'specs' | 'usage' | 'shipping' | 'reviews';

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { profile, addLoyaltyPoints } = useUserStore();

  const { data: reviews = [] } = useProductReviews(product?.id || '');
  const addReviewMutation = useAddReviewMutation();
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (profile?.id) {
      try {
        await addReviewMutation.mutateAsync({
          product_id: product.id,
          user_id: profile.id,
          rating: newRating,
          comment: newComment,
        });
      } catch {}
    }

    setNewComment('');
    addLoyaltyPoints(25);
    setReviewSuccessMsg(true);
    setTimeout(() => setReviewSuccessMsg(false), 4000);
  };

  const defaultFaqs = [
    {
      question: 'Is this product 100% original and guaranteed?',
      answer: 'Yes, all products sold on AURA Store are 100% authentic, sourced directly from certified brand distributors with warranty coverage.',
    },
    {
      question: 'What is the return & inspection policy upon delivery?',
      answer: 'You have full right of opening and inspecting the package upon delivery before paying. We also provide a free 14-day replacement and return guarantee.',
    },
    {
      question: 'How fast is shipping & delivery?',
      answer: 'We deliver orders within 24 to 48 hours to Greater Cairo and Alexandria, and within 2-3 business days to all other Egyptian governorates.',
    },
  ];

  const faqsList = product.faqs && product.faqs.length > 0 ? product.faqs : defaultFaqs;

  return (
    <div className="bg-white border border-slate-200 overflow-hidden mt-12 font-sans text-slate-900 shadow-sm">
      
      {/* 5-Tab Navigation Header */}
      <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-4 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> Product Overview
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`px-5 py-4 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'specs'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> Specifications & Specs
        </button>

        <button
          onClick={() => setActiveTab('usage')}
          className={`px-5 py-4 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'usage'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" /> How to Use & Care
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-5 py-4 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PackageCheck className="w-4 h-4 text-cyan-400" /> Box Contents & Delivery
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-4 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-rose-400" /> Reviews ({reviews.length}) & FAQ
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 sm:p-8 bg-white">
        
        {/* Tab 1: Product Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-4xl">
            <p className="text-sm font-medium text-slate-800 leading-relaxed">{product.description}</p>

            {/* Key Benefits */}
            {product.key_benefits && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-slate-900 space-y-1">
                <h5 className="font-black uppercase text-amber-950 flex items-center gap-1.5 text-xs">
                  Key Benefit:
                </h5>
                <p className="text-xs font-bold text-amber-900">{product.key_benefits}</p>
              </div>
            )}

            {/* Highlights Bullets */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="p-5 bg-slate-900 text-white rounded-none border border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  Key Product Highlights:
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium">
                  {product.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 pt-2">
              <span className="bg-slate-100 px-3 py-1 border border-slate-200">
                Target Category: <strong className="text-slate-900 uppercase">{product.target_gender || 'Unisex'}</strong>
              </span>
              <span className="bg-slate-100 px-3 py-1 border border-slate-200">
                Origin Country: <strong className="text-slate-900">{product.origin_country || 'Imported'}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Technical Specifications */}
        {activeTab === 'specs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold uppercase">Brand / Manufacturer</span>
                <span className="text-xs font-bold text-slate-900 font-mono">{product.brand || 'AURA Official'}</span>
              </div>

              {product.sku && (
                <div className="p-4 bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold uppercase">SKU Code</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">{product.sku}</span>
                </div>
              )}

              {product.shelf_life && (
                <div className="p-4 bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold uppercase">Shelf Life / Expiry</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">{product.shelf_life}</span>
                </div>
              )}

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
          </div>
        )}

        {/* Tab 3: How to Use & Care Guide */}
        {activeTab === 'usage' && (
          <div className="space-y-6 max-w-3xl">
            <div className="p-5 bg-indigo-50 border border-indigo-200 text-slate-900 space-y-2">
              <h5 className="font-black uppercase text-indigo-950 flex items-center gap-1.5 text-xs">
                Usage & Application Guide:
              </h5>
              <p className="text-xs font-medium text-indigo-900 leading-relaxed">
                {product.usage_instructions || 'استخدم المنتج طبقاً لإرشادات التشغيل المرفقة في الكتالوج لضمان الأداء الفائق والنتائج المباشرة.'}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 text-slate-900 space-y-2">
              <h5 className="font-black uppercase text-slate-950 flex items-center gap-1.5 text-xs">
                Storage & Maintenance Tips:
              </h5>
              <p className="text-xs font-medium text-slate-700 leading-relaxed">
                {product.care_instructions || 'يحفظ في مكان جاف بعيداً عن درجات الحرارة المباشرة. يفضل تنظيف الأسطح بقطعة قماش ناعمة للحفاظ على جودة وسلاسة التصنيع.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Box Contents & Delivery */}
        {activeTab === 'shipping' && (
          <div className="space-y-6 max-w-3xl">
            <div className="p-5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium space-y-2">
              <p className="font-black uppercase flex items-center gap-1.5 text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Package Includes (Inside the Box):
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700 font-semibold pl-2">
                {product.package_includes && product.package_includes.length > 0 ? (
                  product.package_includes.map((item, i) => <li key={i}>{item}</li>)
                ) : (
                  <>
                    <li>1x {product.name}</li>
                    <li>Official User Documentation & Guarantee Card</li>
                  </>
                )}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-100 border border-slate-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-slate-700" /> Shipping Policy:
                </span>
                <p className="text-xs font-bold text-slate-900">{product.delivery_info || 'توصيل سريع خلال 24 - 48 ساعة | شحن مجاني للطلبات أكثر من 500 ج.م'}</p>
              </div>

              <div className="p-4 bg-slate-100 border border-slate-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-700" /> Inspection & Return:
                </span>
                <p className="text-xs font-bold text-slate-900">{product.return_policy || 'حق المعاينة والتأكد عند الاستلام + استبدال واسترجاع مجاني خلال 14 يوم'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Reviews & FAQ */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            
            {/* Reviews Section Header Banner */}
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

              <div className="text-xs text-white bg-slate-900 px-4 py-2.5 font-bold uppercase border border-slate-800">
                Write a review & earn +25 VIP Loyalty Points!
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

            {/* Product FAQ Accordion */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-600" /> Product FAQ (Frequently Asked Questions):
              </h4>
              <div className="space-y-2">
                {faqsList.map((faq, idx) => (
                  <div key={idx} className="border border-slate-200 bg-slate-50">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full text-left p-4 text-xs font-bold text-slate-900 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          expandedFaq === idx ? 'rotate-180 text-slate-900' : ''
                        }`}
                      />
                    </button>
                    {expandedFaq === idx && (
                      <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-3 bg-white">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
