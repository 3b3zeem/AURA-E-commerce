<h1 align="center">
  AURA — Lifestyle Store
</h1>

<p align="center">
  A full-stack, AI-powered e-commerce storefront built for lifestyle products. Built with Next.js 16, Supabase, Tailwind CSS, and Framer Motion.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Supabase-DB-3ECF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38BDF8?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Framer_Motion-13-FF0055?style=flat-square&logo=framer" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=flat-square&logo=google" />
</p>

---

## ✨ Overview

**AURA** is a production-ready e-commerce web application offering a premium shopping experience for tech enthusiasts and lifestyle consumers. It features an AI-powered product assistant, curated story-based drops, an Apple-inspired Bento Grid hero, a full CMS admin dashboard, and a real-time cart and order system — all backed by Supabase.

---

## 🚀 Features

### 🛒 Storefront
- **Apple-Inspired Bento Grid Hero** — Dynamic, asymmetrical homepage hero with 4 card types: Spotlight, Flash Deals, Store Guarantee, and Category Showcase.
- **Story / Curated Drops Carousel** — App-store-style horizontal story bar with smart product auto-matching by keywords and categories.
- **Product Card Image Carousel & Autoplay** — Automated slideshow with manual prev/next arrow navigation, framer-motion transitions, and direct action buttons (`View Specs` & `Place Order`).
- **Recommended For You Section** — Dark-themed curated product showcase with multi-image carousel and 1-click Express Order checkout modal.
- **Flash Deals Section** — Live countdown timers for limited-time offers.
- **Category Grid Showcase** — Visual category browsing with featured imagery.
- **Product Detail Pages** — Vertical thumbnail gallery, spec tabs, smooth scroll reset on navigation, and bundle recommendation wizard.

### 🤖 AI Assistant & Customer Support
- **Gemini-Powered Chat Widget** — Natural language product recommendations with Arabic & English support.
- **Optimized Real-Time Customer Service** — React Query support ticket fetching throttled with `enabled` flag to eliminate redundant background API requests.
- **Local Intent Engine** — Fallback local parser with category synonyms and strict budget filtering via Regex.
- **Quick Prompt Chips** — One-tap prompts for headphones, gaming, skincare, and flash deals.
- **Budget Enforcement** — AI never recommends products over the user's stated budget.

### 🧪 Automated Testing Suite
- **End-to-End Testing (Playwright)** — Full browser E2E test suite running real user journeys (catalog browsing, ProductCard interactions, Express Order modal).
- **Unit Testing (Vitest)** — High-speed unit tests verifying core business logic and utility helpers (`formatPrice`, `calculateDiscountPercentage`).

### 🛡️ Auth & Users
- Supabase Auth (Email / Magic Link)
- Role-based access: `customer` and `admin`
- User profiles, saved addresses, and order history

### 🛒 Cart & Orders
- Persistent cart synced to Supabase
- 1-Click Express Order Confirmation Modal
- Checkout flow with address management
- Order status tracking (Pending → Processing → Shipped → Delivered)
- Loyalty points system per purchase

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Animations | Framer Motion 13 |
| Icons | Lucide React |
| E2E Testing | Playwright |
| Unit Testing | Vitest |
| Data Fetching | React Query (@tanstack/react-query) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | Google Gemini API (`@google/genai`) |
| State | Zustand |
| Hosting | Vercel (recommended) |

---

## 🗄️ Database Setup

Run the following in your **Supabase SQL Editor** to create the Bento Grid table:

```sql
CREATE TABLE IF NOT EXISTS public.bento_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  box_type TEXT NOT NULL, -- 'spotlight' | 'flash_deals' | 'guarantee' | 'categories'
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  badge_text TEXT,
  badge_icon TEXT,
  image_url TEXT,
  cta_text TEXT DEFAULT 'SHOP NOW',
  cta_link TEXT DEFAULT '/products',
  bg_gradient TEXT,
  accent_color TEXT,
  discount_percentage INT,
  timer_target_date TIMESTAMPTZ,
  display_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bento_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.bento_items FOR SELECT USING (true);
CREATE POLICY "Allow full write" ON public.bento_items FOR ALL USING (true) WITH CHECK (true);
```

> For the full schema (products, orders, profiles, etc.) see `supabase/`.

---

## ⚙️ Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/aura.git
cd aura
npm install
```

### 2. Set Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Run Automated Tests

```bash
# Run End-to-End Tests with Playwright
npm run test:e2e

# Run Unit Tests with Vitest
npm run test:unit
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/          # REST API routes (products, orders, bento, AI, support, etc.)
│   ├── admin/        # Admin dashboard page
│   ├── products/     # Product listing & detail pages
│   └── page.tsx      # Homepage
├── components/
│   ├── admin/        # AdminProductsTab, AdminBentoTab, etc.
│   ├── home/         # BentoGridHero, StoryHero, FlashDeals, RecommendedProductsSection
│   ├── product/      # ProductCard (with Carousel & Action Grid), ProductDetail, ProductTabs
│   ├── ai/           # AIChatWidget
│   └── ui/           # CustomSelect, shared UI components
├── lib/
│   ├── services/db.ts  # All Supabase service functions
│   └── supabase/       # Supabase client setup
├── store/              # Zustand global state
├── types/              # TypeScript interfaces (Product, BentoItem, etc.)
tests/
├── e2e/                # Playwright End-to-End test suites
└── unit/               # Vitest unit test suites
```

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<p align="center">Built with ❤️ for premium digital shopping experiences.</p>
