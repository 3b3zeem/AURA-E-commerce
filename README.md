<h1 align="center">
  AURA — Enterprise Audio & Tech Platform
</h1>

<p align="center">
  A state-of-the-art, AI-powered E-Commerce platform built for high-fidelity audio hardware & smart technology. Built with Next.js 16 (App Router), Supabase, Tailwind CSS, Framer Motion, and Google Gemini AI.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SEO-100%2F100-emerald?style=flat-square&logo=google" />
  <img src="https://img.shields.io/badge/Accessibility-100%2F100-emerald?style=flat-square&logo=w3c" />
  <img src="https://img.shields.io/badge/Best_Practices-96%2F100-emerald?style=flat-square" />
  <img src="https://img.shields.io/badge/Performance-93%2F100-emerald?style=flat-square&logo=lighthouse" />
  <img src="https://img.shields.io/badge/Agentic_Browsing-3%2F3_Passed-blue?style=flat-square&logo=openai" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/Supabase-DB-3ECF8E?style=flat-square&logo=supabase" />
</p>

---

## ✨ Executive Overview

**AURA** is a production-ready enterprise e-commerce platform offering a high-density, luxury shopping experience for audiophiles and technology enthusiasts. It features an AI-powered conversational shopping concierge (Google Gemini), app-style curated drop stories, an Apple-inspired Bento Grid hero, a full CMS & Admin Control Panel with referential integrity enforcement, and AI-Agent web browsing readiness via `llms.txt` and WebMCP form schemas.

---

## ⚡ Performance & AI Agent Readiness

| Benchmark Metric | Score / Status | Description |
|------------------|----------------|-------------|
| **SEO** | 🟢 **100 / 100** | Full OpenGraph metadata, structured JSON-LD schemas, and dynamic sitemaps. |
| **Accessibility** | 🟢 **100 / 100** | Sequential heading hierarchy, high-contrast Slate design system, and full ARIA semantics. |
| **Best Practices** | 🟢 **96 / 100** | Modern JS bundling, zero console errors, and secure web headers. |
| **Performance** | 🟢 **93 / 100** | Ultra-low Cumulative Layout Shift (CLS = 0.006) with layout-preserved skeletons. |
| **Agentic Browsing** | 🤖 **3 / 3 Passed** | `llms.txt` compliant root file + WebMCP form annotations for AI agents. |

---

## 🚀 Key Features

### 🛒 Storefront & UX Architecture
- **Apple-Inspired Bento Grid Hero** — Dynamic asymmetrical hero with 4 modular box types: Spotlight, Flash Deals, Store Guarantee, and Category Showcase.
- **Curated Drops & Story Carousel** — App-Store-style story bar with automated fallback matching for planar audio, skincare, and tech hardware.
- **Product Card Image Carousel** — Automated slideshow with Framer Motion transitions, hover states, and direct action triggers (`View Specs` & `Place Fast Order`).
- **Zero-CLS Skeleton Placeholders** — Pre-reserved layout aspect ratios preventing visual jump during asynchronous Supabase data fetching.
- **Recommended For You Engine** — Personalized recommendations powered by Supabase query matching with 1-click Express Order modal.
- **Category & Blog Hub** — Dynamic categories with blog articles, technical guides, author avatars, and publication filters.

### 🤖 AI Assistant & WebMCP Integration
- **Google Gemini Concierge** — Dual Arabic/English AI shopping assistant with strict budget enforcement and local intent parsing.
- **Agentic AI Web Browsing** — Exposes `/llms.txt` endpoint to guide AI Web Crawlers and LLM Agents.
- **WebMCP Form Schemas** — Embedded `data-webmcp-*` annotations on contact, search, and checkout forms for agentic action execution.

### 🛠️ Enterprise Admin & CMS Dashboard
- **Referential Integrity Enforcement** — Blocks accidental deletion of categories currently assigned to active products or blog posts with server-side validation.
- **Clean Form Architecture** — Zero hardcoded default values across all admin management forms.
- **Blog & Author Management** — Native avatar upload, cover image previews, custom author names, and category tagging.
- **Bento & Offer Managers** — Real-time customization of home spotlight cards, promotional banners, and discount percentages.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Language** | TypeScript |
| **Styling** | Vanilla CSS + Tailwind CSS |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **State Management** | Zustand (Persistent Store) |
| **Data Fetching** | TanStack React Query v5 |
| **Database** | Supabase PostgreSQL + Row Level Security (RLS) |
| **Authentication** | Supabase Auth |
| **AI Integration** | Google Gemini API (`@google/genai`) |
| **Testing** | Playwright (E2E) & Vitest (Unit) |
| **Hosting** | Vercel |

---

## 🗄️ Database Schemas & Setup

### 1. Blog Categories Table
```sql
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Allow write access" ON public.blog_categories FOR ALL USING (true) WITH CHECK (true);
```

### 2. Bento Items Table
```sql
CREATE TABLE IF NOT EXISTS public.bento_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    box_type TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    badge_text TEXT,
    image_url TEXT,
    cta_text TEXT DEFAULT 'SHOP NOW',
    cta_link TEXT DEFAULT '/products',
    discount_percentage INT,
    display_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bento_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.bento_items FOR SELECT USING (true);
CREATE POLICY "Allow write access" ON public.bento_items FOR ALL USING (true) WITH CHECK (true);
```

---

## ⚙️ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/3b3zeem/AURA-E-commerce.git
cd AURA-E-commerce

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key

# 4. Start local development server
npm run dev

# 5. Run test suites
npm run test:unit
npm run test:e2e
```

---

## 📄 License

MIT © [AURA Team](https://go-aura.vercel.app) — Free to use, modify, and distribute.
