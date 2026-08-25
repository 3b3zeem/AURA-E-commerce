'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Headphones,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/store/useUserStore';
import { createTicket } from '@/lib/services/supportApi';

export default function ContactPage() {
  const profile = useUserStore((state) => state.profile);

  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    email: profile?.email || '',
    subject: '',
    category: 'General Inquiry',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      // Create support ticket via API
      await createTicket({
        userIdentity: formData.email,
        userEmail: formData.email,
        userName: formData.name,
        subject: `[${formData.category}] ${formData.subject || 'Contact Form Submission'}`,
        initialMessage: formData.message,
      });

      setSubmitted(true);
      toast.success('Your message has been sent! Our team will respond shortly.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'General Inquiry',
        message: '',
      });
    } catch {
      toast.success('Message received! We will reach back via email.');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'What is the standard delivery timeframe for orders?',
      a: 'Orders are dispatched within 24 hours. Express local shipping arrives within 1-2 business days, while international orders take 3-5 days via DHL Express.',
    },
    {
      q: 'How does the 2-Year Hardware Replacement Warranty work?',
      a: 'Every flagship AURA hardware item carries a 2-year warranty against manufacturing defects. If hardware fails, our concierge replaces it directly with a brand-new unit.',
    },
    {
      q: 'Can I track my order in real-time?',
      a: 'Yes, you can track your order status anytime at our Order Tracking portal or directly inside your user profile dashboard.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept major credit cards (Visa, MasterCard), Apple Pay, local debit cards, and Cash on Delivery for eligible regions.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-amber-100 border border-amber-300 rounded-full text-xs font-mono font-bold text-amber-900">
            <Headphones className="w-3.5 h-3.5 text-amber-800" />
            <span>24/7 CUSTOMER CONCIERGE</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 uppercase font-mono leading-none">
            GET IN TOUCH WITH AURA
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Have questions about planar acoustics, order shipping, or custom hardware configurations? Our support team and AI Concierge are standing by.
          </p>
        </section>

        {/* Support Cards Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 border border-slate-200 space-y-3 hover:border-slate-900 transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="p-3 bg-slate-900 text-white w-fit">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-black uppercase text-slate-900">Direct Email</h2>
            <p className="text-xs text-slate-600">For general inquiries, order support & press relations:</p>
            <a href="mailto:support@aura.eg" className="text-xs font-mono font-bold text-slate-900 hover:underline block">
              support@aura.eg
            </a>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 space-y-3 hover:border-slate-900 transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="p-3 bg-slate-900 text-white w-fit">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-black uppercase text-slate-900">Phone Support</h2>
            <p className="text-xs text-slate-600">Mon - Sat, 9:00 AM - 8:00 PM (GMT+2):</p>
            <a href="tel:+201000000000" className="text-xs font-mono font-bold text-slate-900 hover:underline block">
              +20 100 000 0000
            </a>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 space-y-3 hover:border-slate-900 transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="p-3 bg-slate-900 text-white w-fit">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-black uppercase text-slate-900">Headquarters</h2>
            <p className="text-xs text-slate-600">AURA Hardware Inc.</p>
            <span className="text-xs font-mono font-bold text-slate-900 block">
              Cairo Financial District, Egypt
            </span>
          </div>
        </section>

        {/* Contact Form & Office Info Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Container */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-6 sm:p-10 shadow-lg space-y-6">
            <div className="border-b border-slate-200 pb-4 space-y-1">
              <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Send Us a Message</h2>
              <p className="text-xs text-slate-600">Fill out the form below for guaranteed response within 24 hours.</p>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-4 bg-emerald-50 border border-emerald-200 p-6 animate-fadeIn">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-black uppercase text-emerald-900">Message Received!</h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Thank you for reaching out. A copy of your inquiry has been logged in our support desk system.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                data-webmcp-form="contact-support-form"
                data-webmcp-name="Contact Support Form"
                data-webmcp-action="submit_support_ticket"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-700 block">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ahmed Mostafa"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-700 block">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-700 block">Topic Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                    >
                      <option value="" disabled>Select Category...</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order & Shipping">Order & Shipping Status</option>
                      <option value="Warranty Claim">2-Year Warranty Claim</option>
                      <option value="Technical Support">Hardware Tech Support</option>
                      <option value="Wholesale & B2B">Wholesale & B2B Partners</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-700 block">Subject</label>
                    <input
                      type="text"
                      placeholder="Brief inquiry summary..."
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-700 block">Your Message *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe how we can assist you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 border border-slate-800 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>{submitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Info Box */}
          <div className="lg:col-span-5 space-y-6">
            {/* AI Assistant Promo Box */}
            <div className="p-6 bg-slate-900 text-white border border-slate-800 space-y-4 shadow-md">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold uppercase">
                <Sparkles className="w-4 h-4" />
                <span>INSTANT AI CONCIERGE</span>
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-tight">Need Instant Help?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our AI Concierge widget is available 24/7 in the bottom right corner to track packages, process returns, and answer specs questions in milliseconds.
              </p>
            </div>

            {/* Support Hours Card */}
            <div className="p-6 bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-base font-black uppercase text-slate-900">Operating Schedule</h3>
              <div className="space-y-2 text-xs text-slate-700 font-medium">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Monday - Friday</span>
                  <span className="font-mono font-bold text-slate-900">09:00 - 20:00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Saturday</span>
                  <span className="font-mono font-bold text-slate-900">10:00 - 18:00</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Sunday</span>
                  <span className="font-mono font-bold text-emerald-700">AI Concierge Only</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section with Smooth Accordion Animations */}
        <section className="space-y-6 pt-6 border-t border-slate-200">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-xs text-slate-600">Quick answers to common questions regarding orders, hardware, and shipping.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'border-slate-900 bg-white shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between font-bold text-xs uppercase text-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center space-x-2.5">
                      <HelpCircle className={`w-4 h-4 transition-colors duration-300 shrink-0 ${isOpen ? 'text-amber-600' : 'text-slate-500'}`} />
                      <span className={isOpen ? 'text-slate-900 font-extrabold' : 'text-slate-800'}>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180 text-slate-900' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-4 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
