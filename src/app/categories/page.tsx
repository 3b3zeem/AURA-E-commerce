'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategories, getProducts } from '@/lib/services/db';
import { Category, Product } from '@/types';
import { ArrowRight, Layers, RefreshCw, FolderX } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CategoriesShowcasePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const cats = await getCategories();
      const prods = await getProducts();
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    }
    loadData();

    const handleDataChanged = () => {
      loadData();
    };

    window.addEventListener("aura_data_changed", handleDataChanged);
    window.addEventListener("focus", handleDataChanged);
    return () => {
      window.removeEventListener("aura_data_changed", handleDataChanged);
      window.removeEventListener("focus", handleDataChanged);
    };
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-white text-black font-sans">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 border-b border-black pb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider border border-black">
          <Layers className="w-3.5 h-3.5 text-white" />
          <span>Product Directory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black uppercase">
          Product Categories
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600">
          Explore specialized tech categories and flagship hardware accessories.
        </p>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-black" />
          <p className="text-xs font-bold text-black uppercase mt-2">Loading Categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderX}
          title="No Categories Found"
          description="There are currently no store categories registered."
          actionText="Browse Hardware Products"
          actionHref="/products"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat) => {
            const catProducts = products.filter((p) => p.category_id === cat.id);

            return (
              <div
                key={cat.id}
                className="bg-white border border-black p-8 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-black uppercase tracking-wider block">
                        Category
                      </span>
                      <h2 className="text-xl font-black text-black uppercase">{cat.name}</h2>
                    </div>
                    <span className="px-3 py-1 bg-black text-white text-xs font-bold border border-black uppercase font-mono">
                      {catProducts.length} Products
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {cat.description || 'High performance tech components designed for maximum precision.'}
                  </p>

                  {/* Featured Product Preview */}
                  {catProducts.length > 0 && (
                    <div className="pt-4 border-t border-black">
                      <span className="text-[11px] text-black font-bold uppercase block mb-2">
                        Featured in this collection:
                      </span>
                      <div className="flex items-center space-x-3 bg-white p-3 border border-black">
                        <img
                          src={catProducts[0].images[0]}
                          alt=""
                          className="w-12 h-12 object-cover border border-black"
                        />
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-black uppercase truncate">
                            {catProducts[0].name}
                          </h4>
                          <span className="text-xs text-black font-bold font-mono">
                            ${catProducts[0].price}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href={`/products?category=${cat.id}`}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase flex items-center justify-center space-x-2 border border-black cursor-pointer transition-colors"
                >
                  <span>Explore {cat.name} Catalog</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
