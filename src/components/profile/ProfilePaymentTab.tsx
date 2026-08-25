"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, Banknote, Zap, Plus, Check } from "lucide-react";
import { Profile } from "@/types";

interface ProfilePaymentTabProps {
  profile: Profile;
}

export function ProfilePaymentTab({ profile }: ProfilePaymentTabProps) {
  const [expressCheckoutEnabled, setExpressCheckoutEnabled] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"cod" | "card">("cod");
  const [savedCards, setSavedCards] = useState([
    {
      id: "card-1",
      brand: "Visa",
      last4: "4242",
      expMonth: "12",
      expYear: "28",
      holderName: profile?.full_name || "AURA MEMBER",
      isDefault: true,
    },
  ]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardForm, setNewCardForm] = useState({
    cardNumber: "",
    holderName: profile?.full_name || "",
    expMonth: "12",
    expYear: "28",
  });

  return (
    <div className="p-6 bg-white border border-slate-200 space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-black text-slate-900 uppercase">
              Payment Methods & Express Buy
            </h2>
            <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-mono text-[10px] font-black uppercase border border-amber-300">
              FAST BUY ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your preferred payment options and 1-Click Express Buy settings for fast purchasing.
          </p>
        </div>

        <div className="p-3 bg-slate-50 text-slate-900 border border-slate-200 text-right font-mono">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">
            Default Payment
          </span>
          <span className="text-xs font-black text-slate-900 flex items-center justify-end gap-1">
            <Banknote className="w-4 h-4 text-emerald-600" />
            Cash on Delivery
          </span>
        </div>
      </div>

      {/* SECTION 1: 1-CLICK EXPRESS CHECKOUT SETTINGS */}
      <div className="p-5 bg-slate-50 text-slate-900 space-y-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-400 text-slate-950 font-bold border border-amber-300">
              <Zap className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                1-Click Express Buy Now
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Bypass multi-step checkout and confirm orders in 1 second
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setExpressCheckoutEnabled(!expressCheckoutEnabled);
              toast.success(
                expressCheckoutEnabled
                  ? "Express Checkout Disabled"
                  : "Express Checkout Enabled!"
              );
            }}
            className={`px-4 py-2 text-xs font-black uppercase transition-all border cursor-pointer ${
              expressCheckoutEnabled
                ? "bg-amber-400 text-slate-950 border-amber-300"
                : "bg-slate-200 text-slate-700 border-slate-300"
            }`}
          >
            {expressCheckoutEnabled ? "ENABLED" : "DISABLED"}
          </button>
        </div>

        <div className="p-4 bg-white border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed font-mono">
          <div className="flex items-center justify-between text-slate-900 font-bold pb-2 border-b border-slate-200">
            <span>How Express Buy Works:</span>
            <span className="text-amber-600 font-mono text-[11px] font-bold">
              Instant Order Creation
            </span>
          </div>
          <p>
            When enabled, clicking the{" "}
            <strong className="text-slate-900 font-black">"Place Order"</strong> button
            on any product instantly opens a 1-second order confirmation drawer using your
            saved delivery address and Cash on Delivery option.
          </p>
          <div className="flex items-center space-x-2 pt-1 text-slate-600">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>No need to re-enter shipping details or credit cards every time.</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: PAYMENT METHODS MANAGEMENT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-900" />
            Saved Payment Methods & Preferences
          </h3>

          <button
            onClick={() => setShowAddCardModal(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold uppercase border border-slate-800 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Payment Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cash on Delivery Card */}
          <div
            onClick={() => setSelectedPaymentMethod("cod")}
            className={`p-5 border-2 transition-all cursor-pointer space-y-3 relative ${
              selectedPaymentMethod === "cod"
                ? "border-slate-900 bg-slate-50 shadow-md"
                : "border-slate-200 bg-white hover:border-slate-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900">
                    Cash on Delivery (COD)
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Pay in cash upon physical item delivery
                  </span>
                </div>
              </div>

              {selectedPaymentMethod === "cod" && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-mono font-bold uppercase">
                  DEFAULT
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed font-sans border-t border-slate-200 pt-3">
              Recommended for Egyptian regional deliveries. Inspect your hardware item
              before cash payment.
            </p>
          </div>

          {/* Saved Cards */}
          {savedCards.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedPaymentMethod("card")}
              className={`p-5 border-2 transition-all cursor-pointer space-y-3 relative ${
                selectedPaymentMethod === "card"
                  ? "border-slate-900 bg-slate-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-900 text-white border border-slate-800 flex items-center justify-center font-mono font-bold text-xs">
                    VISA
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-900 font-mono">
                      •••• •••• •••• {card.last4}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Expires {card.expMonth}/{card.expYear} • {card.holderName}
                    </span>
                  </div>
                </div>

                {selectedPaymentMethod === "card" && (
                  <span className="px-2 py-0.5 bg-slate-900 text-amber-400 text-[10px] font-mono font-bold uppercase">
                    SELECTED
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] font-mono text-slate-500">
                <span>Card Status: Verified Active</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSavedCards(savedCards.filter((c) => c.id !== card.id));
                    toast.success("Card removed");
                  }}
                  className="text-rose-600 hover:underline font-bold uppercase cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-900 w-full max-w-md p-6 space-y-4 shadow-2xl font-sans text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-slate-900" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Add New Payment Card
                </h3>
              </div>
              <button
                onClick={() => setShowAddCardModal(false)}
                className="text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCardForm.cardNumber || newCardForm.cardNumber.length < 4) {
                  toast.error("Please enter a valid card number");
                  return;
                }

                const added = {
                  id: `card-${Date.now()}`,
                  brand: "Visa",
                  last4: newCardForm.cardNumber.slice(-4),
                  expMonth: newCardForm.expMonth,
                  expYear: newCardForm.expYear,
                  holderName: newCardForm.holderName || "AURA MEMBER",
                  isDefault: false,
                };

                setSavedCards([...savedCards, added]);
                setShowAddCardModal(false);
                toast.success("New payment card added successfully!");
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={newCardForm.holderName}
                  onChange={(e) =>
                    setNewCardForm({ ...newCardForm, holderName: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 font-medium text-slate-900 focus:border-slate-900 outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={newCardForm.cardNumber}
                  onChange={(e) =>
                    setNewCardForm({ ...newCardForm, cardNumber: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 font-mono font-medium text-slate-900 focus:border-slate-900 outline-none"
                  placeholder="4532 0000 0000 4242"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Expiry Month / Year
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={newCardForm.expMonth}
                      onChange={(e) =>
                        setNewCardForm({ ...newCardForm, expMonth: e.target.value })
                      }
                      className="w-full p-2 border border-slate-300 font-mono text-center focus:border-slate-900 outline-none"
                      placeholder="12"
                    />
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={newCardForm.expYear}
                      onChange={(e) =>
                        setNewCardForm({ ...newCardForm, expYear: e.target.value })
                      }
                      className="w-full p-2 border border-slate-300 font-mono text-center focus:border-slate-900 outline-none"
                      placeholder="28"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    CVV Code
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    className="w-full p-2 border border-slate-300 font-mono text-center focus:border-slate-900 outline-none"
                    placeholder="***"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider border border-slate-800 transition-colors cursor-pointer"
                >
                  Save Payment Card
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase border border-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
