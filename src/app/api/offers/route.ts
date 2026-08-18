import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { Offer } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const overlayOnly = searchParams.get('overlay') === 'true';

    const supabase = createClient();

    // Fetch catalog products to attach details to offers
    const { data: allProds } = await supabase.from('products').select('*');
    const catalogProducts = allProds && allProds.length > 0 ? allProds : [];

    const { data: dbOffers, error } = await supabase
      .from('offers')
      .select('*, offer_products(product_id)')
      .order('created_at', { ascending: false });

    if (error || !dbOffers) {
      return NextResponse.json([]);
    }

    let formatted: Offer[] = dbOffers.map((off: any) => {
      const pIds = off.offer_products ? off.offer_products.map((op: any) => op.product_id) : [];
      const attachedProducts = catalogProducts.filter((p: any) => pIds.includes(p.id));
      return {
        ...off,
        product_ids: pIds,
        products: attachedProducts,
      };
    });

    if (overlayOnly) {
      formatted = formatted.filter((o) => o.is_active && o.show_in_overlay);
    }

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json([], { status: 500 });
  }
}
