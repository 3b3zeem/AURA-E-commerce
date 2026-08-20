'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  PackageCheck,
  Truck,
  Sparkles,
  HelpCircle,
  ChevronDown,
  UserCircle2,
  X,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Product } from '@/types';
import { formatDate } from '@/lib/utils';
import { useUserStore } from '@/store/useUserStore';
import toast from 'react-hot-toast';
import {
  useProductReviews,
  useAddReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from '@/hooks/useStoreData';

interface ProductTabsProps {
  product: Product;
}

type TabType = 'overview' | 'specs' | 'usage' | 'shipping';

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);

  const { profile, addLoyaltyPoints } = useUserStore();
  const [publicName, setPublicName] = useState(profile?.full_name || 'Ahmed mostafa');

  useEffect(() => {
    if (profile?.full_name) {
      setPublicName(profile.full_name);
    }
  }, [profile]);

  // Prevent background scrolling when write review modal is open
  useEffect(() => {
    if (showWriteForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showWriteForm]);

  const { data: reviews = [] } = useProductReviews(product?.id || '');
  const addReviewMutation = useAddReviewMutation();
  const updateReviewMutation = useUpdateReviewMutation();
  const deleteReviewMutation = useDeleteReviewMutation();

  const handleStartEdit = (rev: any) => {
    setEditingReviewId(rev.id);
    setNewRating(rev.rating || 5);
    const lines = rev.comment?.split('\n') || [];
    if (lines.length > 1) {
      setReviewTitle(lines[0]);
      setNewComment(lines.slice(1).join('\n'));
    } else {
      setReviewTitle('');
      setNewComment(rev.comment || '');
    }
    setShowWriteForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReviewMutation.mutateAsync({
        review_id: reviewId,
        product_id: product.id,
      });
      toast.success('Review deleted successfully!', {
        style: {
          background: '#0f172a',
          color: '#fff',
          fontSize: '12px',
          borderRadius: '9999px',
        },
      });
    } catch {
      toast.error('An error occurred while deleting your review.');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && !reviewTitle.trim()) return;

    const formattedComment = reviewTitle.trim()
      ? `${reviewTitle.trim()}\n${newComment.trim()}`
      : newComment.trim();

    try {
      if (editingReviewId) {
        await updateReviewMutation.mutateAsync({
          review_id: editingReviewId,
          product_id: product.id,
          rating: newRating,
          comment: formattedComment,
        });
        toast.success('Review updated successfully!', {
          style: {
            background: '#0f172a',
            color: '#fff',
            fontSize: '12px',
            borderRadius: '9999px',
          },
        });
      } else {
        await addReviewMutation.mutateAsync({
          product_id: product.id,
          user_id: profile?.id || 'user_session_' + Date.now(),
          rating: newRating,
          comment: formattedComment,
        });
        addLoyaltyPoints(25);
        toast.success('Review submitted! (+25 VIP Loyalty Points)', {
          style: {
            background: '#0f172a',
            color: '#fff',
            fontSize: '12px',
            borderRadius: '9999px',
          },
        });
      }
    } catch {
      toast.error('An error occurred while saving your review.');
    }

    setNewComment('');
    setReviewTitle('');
    setEditingReviewId(null);
    setShowWriteForm(false);
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
      
      {/* 4-Tab Navigation Header (Overview, Specs, Usage, Shipping) */}
      <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-4 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-slate-400" /> Product Overview
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`px-5 py-4 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'specs'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-slate-400" /> Specifications & Specs
        </button>

        <button
          onClick={() => setActiveTab('usage')}
          className={`px-5 py-4 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'usage'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4 text-slate-400" /> How to Use & Care
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-5 py-4 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PackageCheck className="w-4 h-4 text-slate-400" /> Box Contents & Delivery
        </button>
      </div>

      {/* Product Information Tab Panels */}
      <div className="p-6 sm:p-8 bg-white">
        
        {/* Tab 1: Product Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-4xl">
            <p className="text-sm font-medium text-slate-800 leading-relaxed">{product.description}</p>

            {/* Key Benefits */}
            {product.key_benefits && (
              <div className="p-4 bg-slate-100 border border-slate-300 text-slate-900 space-y-1">
                <h5 className="font-black uppercase text-slate-950 flex items-center gap-1.5 text-xs">
                  Key Benefit:
                </h5>
                <p className="text-xs font-bold text-slate-900">{product.key_benefits}</p>
              </div>
            )}

            {/* Highlights Bullets */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="p-5 bg-slate-900 text-white rounded-none border border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  Key Product Highlights:
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium">
                  {product.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
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
            <div className="p-5 bg-slate-100 border border-slate-300 text-slate-900 space-y-2">
              <h5 className="font-black uppercase text-slate-950 flex items-center gap-1.5 text-xs">
                Usage & Application Guide:
              </h5>
              <p className="text-xs font-medium text-slate-900 leading-relaxed">
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
                <CheckCircle2 className="w-4 h-4 text-slate-900" /> Package Includes (Inside the Box):
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
      </div>

      {/* Standalone Customer Reviews & FAQ Section (ALWAYS VISIBLE BELOW TABS) */}
      <div className="border-t-2 border-slate-200 p-6 sm:p-8 bg-white space-y-12">
        
        {/* Amazon Write/Edit Review Full Modal Form */}
        {showWriteForm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn h-screen">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 font-sans">
              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  setShowWriteForm(false);
                  setEditingReviewId(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg font-bold p-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Product info header: How was the item? */}
              <div className="space-y-3 pb-4 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingReviewId ? 'Edit your review' : 'How was the item?'}
                </h3>
                <div className="flex items-center gap-3">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'}
                    alt={product.name}
                    className="w-14 h-14 object-contain rounded-md border border-slate-200 p-1 bg-white"
                  />
                  <span className="text-xs font-bold text-slate-900 line-clamp-2">
                    {product.name}
                  </span>
                </div>
              </div>

              {/* Interactive Star rating selector */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Overall rating</h4>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-9 h-9 ${
                          star <= newRating ? 'text-slate-900 fill-slate-900' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddReview} className="space-y-4">
                {/* Write a review */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 block">Write a review</label>
                  <textarea
                    rows={4}
                    placeholder="What should other customers know?"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 p-3 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Title your review (required) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 block">Title your review (required)</label>
                  <input
                    type="text"
                    placeholder="What's most important to know?"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 px-4 py-2.5 text-xs text-slate-900 rounded-full focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* What's your public name? (required) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 block">What's your public name? (required)</label>
                  <input
                    type="text"
                    placeholder="Ahmed mostafa"
                    value={publicName}
                    onChange={(e) => setPublicName(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 px-4 py-2.5 text-xs text-slate-900 rounded-full focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 font-semibold"
                  />
                </div>

                {/* Submit black pill button */}
                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWriteForm(false);
                      setEditingReviewId(null);
                    }}
                    className="px-5 py-2 border border-slate-300 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2 bg-slate-900 hover:bg-black active:scale-95 text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
                  >
                    {editingReviewId ? 'Update Review' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Amazon Customer Reviews 2-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start font-sans text-slate-900">
          
          {/* Left Column: Rating Summary & Write Review CTA */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-slate-900" /> Customer Reviews ({reviews.length})
            </h3>
            
            {/* Rating Average & Stars */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex text-slate-900">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= Math.round(product.rating_avg || (reviews.length > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 0))
                          ? "text-slate-900 fill-slate-900"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-base font-bold text-slate-900">
                  {(product.rating_avg || (reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : 0))} out of 5
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {reviews.length} customer ratings
              </p>
            </div>

            {/* Rating Breakdown Bars (Black Bars) */}
            <div className="space-y-2.5 pt-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const pct = reviews.length === 0 ? 0 : Math.round((reviews.filter(r => Math.round(r.rating) === star).length / reviews.length) * 100);
                return (
                  <div key={star} className="flex items-center text-xs gap-3 group cursor-pointer">
                    <span className="w-10 font-bold text-slate-900 group-hover:underline shrink-0">
                      {star} star
                    </span>
                    <div className="flex-1 bg-slate-100 h-4 rounded-full border border-slate-200 relative overflow-hidden shadow-inner">
                      <div
                        className="bg-black h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-9 text-right font-bold text-slate-900 group-hover:underline shrink-0">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* How ratings calculated */}
            <button
              type="button"
              onClick={() => setExpandedFaq(expandedFaq === 999 ? null : 999)}
              className="flex items-center gap-1 text-xs text-slate-700 hover:text-black hover:underline font-semibold pt-1 cursor-pointer"
            >
              <span>How are ratings calculated?</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {expandedFaq === 999 && (
              <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 border border-slate-200 rounded-md animate-fadeIn">
                To calculate the overall star rating and percentage breakdown by star, we don't use a simple average. Instead, our system considers things like how recent a review is and if the reviewer bought the item on AURA.
              </p>
            )}

            <hr className="my-6 border-slate-200" />

            {/* Review this product Box */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-base font-bold text-slate-900">Review this product</h4>
              <p className="text-xs text-slate-600">Share your thoughts with other customers</p>
              <button
                type="button"
                onClick={() => {
                  setEditingReviewId(null);
                  setNewRating(5);
                  setNewComment('');
                  setReviewTitle('');
                  setShowWriteForm(true);
                }}
                className="w-full py-2.5 px-4 border border-slate-900 hover:bg-slate-900 hover:text-white rounded-full text-xs font-bold text-slate-900 transition-all shadow-xs cursor-pointer text-center active:scale-[0.99]"
              >
                Write a customer review
              </button>

              {reviewSuccessMsg && (
                <p className="text-xs font-bold text-slate-900 text-center font-mono pt-2">
                  ✓ Review updated successfully!
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Customer Reviews Feed */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Feed Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Top reviews from Egypt</h3>
              <button
                type="button"
                className="px-4 py-1.5 border border-slate-300 rounded-full text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                Translate all reviews to English
              </button>
            </div>

            {/* Reviews List or Empty State */}
            {reviews.length === 0 ? (
              <div className="py-10 text-center space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-6">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">No customer reviews yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Be the first to review this product and share your thoughts with other customers.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingReviewId(null);
                    setShowWriteForm(true);
                  }}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-full transition-colors cursor-pointer shadow-xs"
                >
                  Write a customer review
                </button>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-slate-100">
                {reviews.map((rev, idx) => {
                  const authorName =
                    rev.profile?.full_name ||
                    (rev as any).profiles?.full_name ||
                    (rev as any).profiles?.[0]?.full_name ||
                    (profile?.id && rev.user_id === profile.id ? (profile.full_name || publicName) : null) ||
                    profile?.full_name ||
                    publicName ||
                    "AURA Customer";

                  const isOwner = Boolean(
                    (profile?.id && rev.user_id === profile.id) || profile?.role === 'admin'
                  );

                  const reviewLines = rev.comment?.split('\n') || [];
                  const titleText = reviewLines.length > 1 ? reviewLines[0] : (rev.comment?.substring(0, 30) || "Customer Review");
                  const bodyText = reviewLines.length > 1 ? reviewLines.slice(1).join('\n') : rev.comment;

                  return (
                    <div key={rev.id || idx} className="pt-6 first:pt-0 space-y-2">
                      
                      {/* Avatar & User Name */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {rev.profile?.avatar_url ? (
                            <img src={rev.profile.avatar_url} alt={authorName} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <UserCircle2 className="w-7 h-7 text-slate-400" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {authorName}
                        </span>
                      </div>

                      {/* Stars & Short Title */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="flex text-slate-900">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= (rev.rating || 5)
                                  ? "text-slate-900 fill-slate-900"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {titleText}
                        </span>
                      </div>

                      {/* Date & Country */}
                      <p className="text-[11px] text-slate-500">
                        Reviewed in Egypt on {formatDate(rev.created_at || new Date().toISOString())}
                      </p>

                      {/* Review Comment Body */}
                      <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-line font-normal pt-1">
                        {bodyText}
                      </p>

                      {/* Action buttons & feedback */}
                      <div className="pt-2 space-y-2">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {/* Owner Edit & Delete Buttons */}
                          {isOwner && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(rev)}
                                className="flex items-center gap-1 text-xs text-slate-800 hover:text-black font-bold cursor-pointer py-1 px-3 rounded-full border border-slate-300 hover:bg-slate-100 transition-colors shadow-2xs"
                              >
                                <Pencil className="w-3 h-3 text-slate-700" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev.id)}
                                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer py-1 px-3 rounded-full border border-rose-200 hover:bg-rose-50 transition-colors shadow-2xs"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600" /> Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Product FAQ Accordion */}
        <div className="pt-8 border-t border-slate-200 space-y-4">
          <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-900" /> Product FAQ (Frequently Asked Questions):
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
    </div>
  );
}
