import { Product, Category, Story, Review, Order } from "@/types";

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Audio & Acoustics",
    slug: "audio",
    description:
      "High-fidelity spatial sound gear, active noise cancellation, & audiophile studio monitors.",
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Wearable Tech",
    slug: "wearables",
    description:
      "Biometric smartwatches, titanium activity trackers, & augmented reality eyewear.",
    image_url:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Cyberpunk Keyboards",
    slug: "keyboards",
    description:
      "Custom mechanical keyboards with hot-swappable switches and custom keycaps.",
    image_url:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Minimalist Workspace",
    slug: "workspace",
    description:
      "Ergonomic desk setups, ambient lightbars, and wireless charging pads.",
    image_url:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
    is_featured: true,
    created_at: new Date().toISOString(),
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    category_id: "11111111-1111-4111-8111-111111111111",
    name: "AURA Void Pro Wireless ANC Headphones",
    slug: "aura-void-pro-wireless-anc",
    description:
      "Experience ultra-pure spatial sound with customized 40mm planar magnetic drivers. Features active noise cancellation up to -45dB, 60-hour battery life, and ultra-plush memory foam earcups encased in anodized aerospace aluminum.",
    specs: {
      "Driver Size": "40mm Planar Magnetic",
      "Battery Life": "60 Hours (ANC On)",
      Bluetooth: "v5.4 / LDAC / aptX Lossless",
      Weight: "285g",
      "ANC Levels": "Adaptive Multi-Mode (-45dB)",
    },
    price: 349.99,
    original_price: 449.99,
    stock: 24,
    is_featured: true,
    is_flash_deal: true,
    flash_deal_ends_at: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80",
    ],
    variants: [
      {
        name: "Color",
        options: ["Matte Obsidian", "Starlight Silver", "Cyber Violet"],
      },
    ],
    rating_avg: 4.9,
    reviews_count: 128,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "b2222222-2222-4222-8222-222222222222",
    category_id: "22222222-2222-4222-8222-222222222222",
    name: "AURA Horizon Titanium Smartwatch",
    slug: "aura-horizon-titanium-smartwatch",
    description:
      "Crafted from grade-5 titanium with a sapphire glass AMOLED display. Continuous heart-rate, SpO2 tracking, ECG monitoring, and dual-frequency GPS navigation with up to 14 days of battery.",
    specs: {
      "Case Material": "Grade 5 Titanium",
      Display: '1.43" Super AMOLED (1000 nits)',
      "Water Resistance": "10 ATM (100m)",
      Sensors: "Optical Heart Rate, ECG, SpO2, Altimeter",
    },
    price: 299.0,
    original_price: 399.0,
    stock: 15,
    is_featured: true,
    is_flash_deal: true,
    flash_deal_ends_at: new Date(Date.now() + 86400000 * 1.5).toISOString(),
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80",
    ],
    variants: [
      {
        name: "Band",
        options: ["Titanium Link", "Sport Silicone", "Leather Strap"],
      },
    ],
    rating_avg: 4.8,
    reviews_count: 89,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "c3333333-3333-4333-8333-333333333333",
    category_id: "33333333-3333-4333-8333-333333333333",
    name: "AURA Matrix 75% Custom RGB Mechanical Keyboard",
    slug: "aura-matrix-75-mechanical-keyboard",
    description:
      "Full CNC aluminum chassis with gasket mount structure, sound-dampening foam layers, and pre-lubed linear switches. Customizable per-key RGB backlighting and QMK/VIA compatibility.",
    specs: {
      Layout: "75% Compact (82 Keys)",
      "Switch Type": "AURA Butter-Linear (Pre-lubed)",
      Connectivity: "Tri-mode (2.4GHz, Bluetooth 5.1, Type-C)",
      Battery: "4000mAh",
    },
    price: 189.5,
    original_price: 229.5,
    stock: 42,
    is_featured: true,
    is_flash_deal: false,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80",
    ],
    variants: [
      {
        name: "Switch",
        options: ["Butter Linear", "Silent Tactile", "Clicky Jade"],
      },
    ],
    rating_avg: 4.95,
    reviews_count: 210,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "d4444444-4444-4444-8444-444444444444",
    category_id: "44444444-4444-4444-8444-444444444444",
    name: "AURA Prism Ambient Monitor Lightbar",
    slug: "aura-prism-ambient-lightbar",
    description:
      "Dual light source desk lamp with zero-screen-glare optical geometry and back ambient RGB sync mode. Wirelessly controlled with an aluminum touch knob.",
    specs: {
      Control: "2.4GHz Wireless Rotary Knob",
      "Color Temp": "2700K - 6500K Stepless",
      CRI: "Ra >= 95 Color Rendering",
      "Power Input": "USB Type-C (5V 2A)",
    },
    price: 89.99,
    original_price: 119.99,
    stock: 60,
    is_featured: false,
    is_flash_deal: true,
    flash_deal_ends_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    images: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80",
    ],
    variants: [{ name: "Finish", options: ["Space Gray", "Pure White"] }],
    rating_avg: 4.7,
    reviews_count: 64,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_STORIES: Story[] = [
  {
    id: "11111111-0000-4000-8000-000000000001",
    title: "Cyberpunk Acoustics 2026",
    subtitle: "Next-gen audio precision built for audiophiles and creators.",
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    bg_gradient: "from-purple-900 via-indigo-900 to-black",
    linked_category_id: "11111111-1111-4111-8111-111111111111",
    is_active: true,
    display_order: 1,
    products: [MOCK_PRODUCTS[0]],
    created_at: new Date().toISOString(),
  },
  {
    id: "11111111-0000-4000-8000-000000000002",
    title: "Future Wearables & Health",
    subtitle: "Titanium bio-tracking devices crafted for high performers.",
    image_url:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    bg_gradient: "from-blue-900 via-cyan-900 to-slate-900",
    linked_category_id: "22222222-2222-4222-8222-222222222222",
    is_active: true,
    display_order: 2,
    products: [MOCK_PRODUCTS[1]],
    created_at: new Date().toISOString(),
  },
  {
    id: "11111111-0000-4000-8000-000000000003",
    title: "Tactile Keyboard Masterpieces",
    subtitle: "Custom acoustic foam, CNC alloy bodies & custom keycaps.",
    image_url:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    bg_gradient: "from-emerald-900 via-teal-900 to-slate-950",
    linked_category_id: "33333333-3333-4333-8333-333333333333",
    is_active: true,
    display_order: 3,
    products: [MOCK_PRODUCTS[2]],
    created_at: new Date().toISOString(),
  },
  {
    id: "11111111-0000-4000-8000-000000000004",
    title: "Minimalist Workspace Elevate",
    subtitle: "Transform your desk with screen-glare-free ambient lighting.",
    image_url:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
    bg_gradient: "from-rose-950 via-purple-950 to-neutral-950",
    linked_category_id: "44444444-4444-4444-8444-444444444444",
    is_active: true,
    display_order: 4,
    products: [MOCK_PRODUCTS[3]],
    created_at: new Date().toISOString(),
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "11111111-0000-4000-9000-000000000001",
    product_id: "a1111111-1111-4111-8111-111111111111",
    user_id: "usr-1",
    profile: {
      id: "usr-1",
      email: "alex.v@aura.tech",
      full_name: "Alex Vance",
      avatar_url:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      phone: null,
      role: "customer",
      loyalty_points: 350,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    rating: 5,
    comment:
      "The soundstage on these planar magnetic drivers is unreal! The active noise cancellation easily blocks out office noise and subway rumble. 10/10 portfolio product!",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "11111111-0000-4000-9000-000000000002",
    product_id: "a1111111-1111-4111-8111-111111111111",
    user_id: "usr-2",
    profile: {
      id: "usr-2",
      email: "sarah.k@aura.tech",
      full_name: "Sarah Chen",
      avatar_url:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      phone: null,
      role: "customer",
      loyalty_points: 120,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    rating: 5,
    comment:
      "Super fast shipping and premium packaging. The memory foam earcups feel weightless even after an 8-hour editing session.",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export const MOCK_ORDER: Order = {
  id: "ORD-849204",
  user_id: "demo-user-id",
  status: "shipped",
  total_amount: 539.49,
  points_earned: 54,
  points_redeemed: 0,
  discount_amount: 0,
  shipping_address: {
    fullName: "David Sterling",
    street: "742 Evergreen Terrace",
    city: "San Francisco",
    state: "CA",
    zipCode: "94107",
    country: "United States",
    phone: "+1 (415) 555-0199",
  },
  tracking_number: "AURA-TRK-99248102",
  estimated_delivery: new Date(Date.now() + 86400000 * 2).toISOString(),
  created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  updated_at: new Date().toISOString(),
  order_items: [
    {
      id: "oi-1",
      order_id: "ORD-849204",
      product_id: "prod-1",
      product_name: "AURA Void Pro Wireless ANC Headphones",
      product_image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
      variant: { Color: "Matte Obsidian" },
      price: 349.99,
      quantity: 1,
    },
    {
      id: "oi-2",
      order_id: "ORD-849204",
      product_id: "prod-3",
      product_name: "AURA Matrix 75% Custom RGB Mechanical Keyboard",
      product_image:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
      variant: { Switch: "Butter Linear" },
      price: 189.5,
      quantity: 1,
    },
  ],
};
