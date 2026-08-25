"use client";

import React from "react";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Product } from "@/types";

interface ProfileWishlistTabProps {
  wishlistProducts: Product[];
}

export function ProfileWishlistTab({ wishlistProducts }: ProfileWishlistTabProps) {
  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 uppercase">
          Your Saved Wishlist ({wishlistProducts.length})
        </h2>
      </div>

      {wishlistProducts.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Explore our catalog and tap Add to List on any product to save items for later."
          actionText="Browse Hardware Products"
          actionHref="/products"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
