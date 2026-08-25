"use client";

import React from "react";
import { MapPin, Heart } from "lucide-react";
import { Product, UserAddress } from "@/types";
import { formatPrice } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { calculateExpressDelivery, getShippingFee } from "@/lib/shipping";

interface ProductBuyBoxProps {
  product: Product;
  quantity: number;
  setQuantity: (val: number) => void;
  selectedGovernorate: string;
  storedGovs: any[];
  selectedAddress: UserAddress | null;
  setIsLocationModalOpen: (val: boolean) => void;
  handleAddToCart: () => void;
  setIsExpressModalOpen: (val: boolean) => void;
  isLiked: boolean;
  toggleWishlist: (id: string) => void;
}

export function ProductBuyBox({
  product,
  quantity,
  setQuantity,
  selectedGovernorate,
  storedGovs,
  selectedAddress,
  setIsLocationModalOpen,
  handleAddToCart,
  setIsExpressModalOpen,
  isLiked,
  toggleWishlist,
}: ProductBuyBoxProps) {
  const est = calculateExpressDelivery(17, selectedGovernorate, storedGovs);
  const shipInfo = getShippingFee(selectedGovernorate, product.price);

  return (
    <div className="lg:col-span-3 bg-white border border-slate-300 p-4 space-y-3.5 sticky top-24 shadow-sm text-slate-900 font-sans">
      <div className="space-y-1.5 pb-3 border-b border-slate-200">
        <span className="text-2xl font-black text-slate-900 font-mono block">
          {formatPrice(product.price)}
        </span>
        <span className="text-[11px] font-bold text-slate-700 uppercase block tracking-wider">
          FREE Returns
        </span>

        <div className="space-y-1.5 mt-2 text-xs">
          <p className="text-slate-900">
            {shipInfo.isFree ? (
              <>
                FREE delivery{" "}
                <strong className="font-bold text-slate-950">
                  {est.formattedStandardDate}
                </strong>
              </>
            ) : (
              <>
                Shipping:{" "}
                <strong className="font-bold">{formatPrice(shipInfo.fee)}</strong> • Delivery by{" "}
                <strong className="font-bold text-slate-950">
                  {est.formattedStandardDate}
                </strong>
              </>
            )}
          </p>

          <p className="text-slate-800 text-xs">
            Or fastest delivery{" "}
            <strong className="font-bold text-slate-950">{est.deliveryText}</strong>. Order
            within <span className="text-slate-900 font-bold">{est.formattedCountdown}</span>
          </p>

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1 text-xs text-slate-900 hover:text-black font-semibold pt-1 underline transition-colors cursor-pointer group"
          >
            <MapPin className="w-3.5 h-3.5 text-slate-900 shrink-0 group-hover:text-black" />
            <span className="truncate">
              Deliver to{" "}
              {selectedAddress
                ? `${selectedAddress.full_name?.split(" ")[0] || "User"} - ${
                    selectedAddress.city || selectedAddress.state_region
                  }`
                : selectedGovernorate}
            </span>
          </button>
        </div>
      </div>

      {/* Stock Status Alert */}
      <div>
        {product.stock > 5 ? (
          <span className="text-xs font-bold uppercase text-slate-900 block tracking-wider">
            In Stock
          </span>
        ) : product.stock > 0 ? (
          <span className="text-xs font-black text-slate-900 uppercase block bg-slate-100 p-2 border border-slate-300">
            Only {product.stock} left in stock - order soon.
          </span>
        ) : (
          <span className="text-xs font-black text-slate-900 uppercase block bg-slate-100 p-2 border border-slate-300">
            Out of Stock
          </span>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="space-y-1">
        <CustomSelect
          value={String(quantity)}
          onChange={(val) => setQuantity(Number(val))}
          options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => ({
            value: String(num),
            label: `Quantity: ${num}`,
          }))}
          className="w-full"
          triggerClassName="w-full justify-between py-2 text-xs font-bold"
        />
      </div>

      {/* Action CTAs */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleAddToCart}
          className="w-full h-10 bg-slate-950 hover:bg-black text-white rounded-none font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] uppercase tracking-wider"
        >
          <span>Add to cart</span>
        </button>

        <button
          onClick={() => setIsExpressModalOpen(true)}
          className="w-full h-10 bg-white hover:bg-slate-100 text-slate-950 border border-slate-900 rounded-none font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] uppercase tracking-wider"
        >
          <span>Buy Now</span>
        </button>
      </div>

      {/* Shipper & Payment */}
      <div className="text-[11px] space-y-1.5 pt-3 border-t border-slate-200 text-slate-600 font-medium">
        <div className="grid grid-cols-2">
          <span className="text-slate-500">Shipper / Seller</span>
          <span className="font-bold text-slate-900 text-right">AURA.eg</span>
        </div>
        <div className="grid grid-cols-2">
          <span className="text-slate-500">Payment</span>
          <span className="font-bold text-slate-900 hover:underline cursor-pointer text-right">
            Secure transaction
          </span>
        </div>
        <div className="grid grid-cols-2">
          <span className="text-slate-500">Customer service</span>
          <span className="font-bold text-slate-900 hover:underline cursor-pointer text-right">
            AURA.eg
          </span>
        </div>
      </div>

      {/* Wishlist Button */}
      <div className="pt-2 border-t border-slate-200">
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`w-full py-2 px-3 border text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            isLiked
              ? "bg-black text-white border-black"
              : "bg-white text-slate-900 border-slate-300 hover:border-slate-900"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-white text-white" : ""}`} />
          <span>{isLiked ? "In Your Wishlist" : "Add to Wishlist"}</span>
        </button>
      </div>
    </div>
  );
}
