import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const supabase = createClient();

    let categoryNames: string[] = [];
    let historyProductIds: string[] = [];

    // 1. Fetch user persistent cart history from Supabase (never deleted)
    if (userId) {
      const { data: userHistory } = await supabase
        .from('cart_history')
        .select('product_id, category_name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (userHistory && userHistory.length > 0) {
        historyProductIds = userHistory.map((h) => h.product_id).filter(Boolean);
        categoryNames = userHistory.map((h) => h.category_name).filter(Boolean);
      }
    }

    // Fallback: If no user history, check global recent cart history
    if (categoryNames.length === 0) {
      const { data: globalHistory } = await supabase
        .from('cart_history')
        .select('product_id, category_name')
        .order('created_at', { ascending: false })
        .limit(10);

      if (globalHistory && globalHistory.length > 0) {
        historyProductIds = globalHistory.map((h) => h.product_id).filter(Boolean);
        categoryNames = globalHistory.map((h) => h.category_name).filter(Boolean);
      }
    }

    // 2. Query products from Supabase
    let recommendedProducts: any[] = [];

    if (categoryNames.length > 0) {
      // Fetch products matching interest categories from Supabase
      const { data: matchedProds } = await supabase
        .from('products')
        .select('*, categories(*)')
        .limit(24);

      if (matchedProds) {
        recommendedProducts = matchedProds;
      }
    }

    // 3. Fallback: If no products found, fetch featured products from Supabase
    if (recommendedProducts.length < 4) {
      const { data: featured } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('is_featured', true)
        .limit(24);

      if (featured && featured.length > 0) {
        recommendedProducts = featured;
      } else {
        const { data: allProds } = await supabase
          .from('products')
          .select('*, categories(*)')
          .limit(24);

        recommendedProducts = allProds || [];
      }
    }

    return NextResponse.json(recommendedProducts);
  } catch (err: any) {
    return NextResponse.json([], { status: 500 });
  }
}
