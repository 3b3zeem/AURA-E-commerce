'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getProductById } from '@/lib/services/db';
import { Product } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { ProductTabs } from '@/components/product/ProductTabs';
import { useCartStore } from '@/store/useCartStore';
import { useUserStore } from '@/store/useUserStore';
import { Star, Heart, ShoppingBag, Share2, Check, ShieldCheck, Truck, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useUserStore();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const prod = await getProductById(productId);
      if (prod) {
        setProduct(prod);
        setSelectedImage(prod.images[0] || '');
        const initialVariants: Record<string, string> = {};
        prod.variants?.forEach((v) => {
          if (v.options.length > 0) initialVariants[v.name] = v.options[0];
        });
        setSelectedVariants(initialVariants);
      }
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-900 font-sans space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-900" />
        <p className="text-xs uppercase font-bold text-slate-600">Loading Product Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-900 font-sans space-y-4">
        <h1 className="text-2xl font-black uppercase text-slate-900">Product Not Found</h1>
        <Link href="/products" className="px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase border border-slate-800 inline-block hover:bg-black transition-colors">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  const discount = product.original_price
    ? calculateDiscountPercentage(product.original_price, product.price)
    : 0;

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-slate-900 font-sans">
      
      {/* Breadcrumb / Back button */}
      <div className="flex items-center space-x-2 text-xs text-slate-600 uppercase font-bold">
        <Link href="/products" className="hover:text-slate-900 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">{product.category?.name || 'Products'}</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-black truncate">{product.name}</span>
      </div>

      {/* Main Grid: Gallery & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-white border border-slate-200 overflow-hidden group">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-slate-900 text-white text-xs font-black px-3 py-1 uppercase border border-slate-800">
                SAVE {discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 bg-white border transition-all flex-shrink-0 cursor-pointer ${
                    selectedImage === img
                      ? 'border-slate-900 border-2'
                      : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Metadata & Actions */}
        <div className="space-y-6">
          <div className="space-y-2 border-b border-slate-200 pb-6">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              {product.category?.name || 'Hardware'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>

            {/* Ratings */}
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="text-xs font-bold text-slate-900">{product.rating_avg}</span>
              </div>
              <span className="text-xs text-slate-500 uppercase">({product.reviews_count} Verified Reviews)</span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-emerald-600 font-bold uppercase">
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-4">
            <span className="text-3xl font-black text-slate-900 font-mono">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-base line-through text-slate-400 font-mono">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              {product.variants.map((v) => (
                <div key={v.name} className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase block">{v.name}:</span>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariants({ ...selectedVariants, [v.name]: opt })}
                        className={`px-3 py-1.5 text-xs font-bold uppercase border transition-all cursor-pointer ${
                          selectedVariants[v.name] === opt
                            ? 'bg-slate-900 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900 hover:text-slate-900'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Cart Action Buttons */}
          <div className="flex items-center space-x-4 pt-4 border-t border-slate-200">
            <div className="flex items-center border border-slate-300 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2 text-xs font-bold w-10 text-center font-mono text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addItem(product, quantity, selectedVariants)}
              className="flex-1 py-3 px-6 bg-slate-900 hover:bg-black text-white border border-slate-800 text-xs font-bold uppercase flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>Add {quantity} To Shopping Bag</span>
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3 border transition-colors cursor-pointer ${
                isLiked
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              title="Share URL"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 text-xs uppercase text-slate-600 font-bold">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-slate-900" />
              <span>Express Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-slate-900" />
              <span>2-Year Hardware Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications & Customer Reviews */}
      <ProductTabs product={product} />
    </div>
  );
}
