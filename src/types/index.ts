export type UserRole = 'customer' | 'admin';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  category_id?: string | null;
  category?: Category;
  name: string;
  slug: string;
  description: string;
  specs: Record<string, string>;
  price: number;
  original_price?: number | null;
  stock: number;
  is_featured: boolean;
  is_flash_deal: boolean;
  flash_deal_ends_at?: string | null;
  images: string[];
  variants: ProductVariant[];
  badge?: string;
  in_stock?: boolean;
  rating_avg: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  bg_gradient?: string;
  linked_category_id?: string | null;
  is_active: boolean;
  display_order: number;
  products?: Product[];
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id?: string;
  product_id: string;
  product: Product;
  selected_variant?: Record<string, string>;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  full_name: string;
  street_address: string;
  building_no?: string;
  city: string;
  state_region: string;
  zip_code: string;
  country: string;
  phone_number: string;
  delivery_instructions?: string;
  is_default: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  product_image?: string | null;
  variant: Record<string, string>;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id?: string | null;
  status: OrderStatus;
  total_amount: number;
  points_earned: number;
  points_redeemed: number;
  discount_amount: number;
  shipping_address: ShippingAddress;
  tracking_number?: string | null;
  estimated_delivery?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  profile?: Profile;
  rating: number;
  comment: string;
  created_at: string;
}

export interface LoyaltyLog {
  id: string;
  user_id: string;
  points: number;
  action: 'PURCHASE' | 'REVIEW' | 'REDEEM' | 'BONUS';
  description: string;
  created_at: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
}

export type BentoBoxType = 'spotlight' | 'flash_deals' | 'guarantee' | 'categories';

export interface BentoItem {
  id: string;
  box_type: BentoBoxType;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  badge_text?: string | null;
  badge_icon?: string | null;
  image_url?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
  bg_gradient?: string | null;
  accent_color?: string | null;
  discount_percentage?: number | null;
  timer_target_date?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

