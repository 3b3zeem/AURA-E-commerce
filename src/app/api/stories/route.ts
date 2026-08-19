import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// GET /api/stories
export async function GET() {
  try {
    const supabase = createClient();
    const { data: storiesData, error: storiesError } = await supabase
      .from('stories')
      .select('*, story_products(product:products(*))');

    if (storiesError || !storiesData) {
      return NextResponse.json([]);
    }

    // Fetch all products to use for smart fallback matching
    const { data: allProducts } = await supabase.from('products').select('*');
    const catalog = allProducts || [];

    const formatted = storiesData.map((s: any) => {
      const explicitProducts = (s.story_products?.map((sp: any) => sp.product) || []).filter(Boolean);

      let finalProducts = explicitProducts;

      // If no explicit products attached, use smart category/keyword fallback matching
      if (finalProducts.length === 0) {
        const text = `${s.title} ${s.subtitle}`.toLowerCase();

        if (s.linked_category_id) {
          finalProducts = catalog.filter((p: any) => p.category_id === s.linked_category_id);
        }
        
        // 1. Audio & Headphones Drops
        if (finalProducts.length === 0 && (text.includes('audio') || text.includes('sound') || text.includes('wireless') || text.includes('cyber') || text.includes('headphone') || text.includes('سماعة'))) {
          finalProducts = catalog.filter((p: any) => {
            const pText = `${p.name} ${p.description}`.toLowerCase();
            return pText.includes('headphone') || pText.includes('audio') || pText.includes('earbuds') || pText.includes('sound') || pText.includes('wireless');
          });
        }

        // 2. Skincare & Beauty Drops
        if (finalProducts.length === 0 && (text.includes('skincare') || text.includes('glow') || text.includes('serum') || text.includes('beauty') || text.includes('skin') || text.includes('بشرة') || text.includes('عناية'))) {
          finalProducts = catalog.filter((p: any) => {
            const pText = `${p.name} ${p.description}`.toLowerCase();
            return pText.includes('serum') || pText.includes('skin') || pText.includes('glow') || pText.includes('cleanser') || pText.includes('cream') || pText.includes('splash') || pText.includes('mist');
          });
        }

        // 3. Men Grooming & Barber Drops
        if (finalProducts.length === 0 && (text.includes('grooming') || text.includes('beard') || text.includes('barber') || text.includes('trimmer') || text.includes('men') || text.includes('حلاقة'))) {
          finalProducts = catalog.filter((p: any) => {
            const pText = `${p.name} ${p.description}`.toLowerCase();
            return pText.includes('grooming') || pText.includes('beard') || pText.includes('trimmer') || pText.includes('shaver') || pText.includes('splash') || pText.includes('fragrance');
          });
        }

        // 4. Gaming & Displays Drops
        if (finalProducts.length === 0 && (text.includes('gaming') || text.includes('monitor') || text.includes('display') || text.includes('165hz') || text.includes('keyboard') || text.includes('شاشة') || text.includes('قيمنق'))) {
          finalProducts = catalog.filter((p: any) => {
            const pText = `${p.name} ${p.description}`.toLowerCase();
            return pText.includes('gaming') || pText.includes('monitor') || pText.includes('keyboard') || pText.includes('165hz') || pText.includes('mouse');
          });
        }

        // 5. Tech Accessories & Travel Pouches
        if (finalProducts.length === 0 && (text.includes('bag') || text.includes('pouch') || text.includes('travel') || text.includes('organizer') || text.includes('leather') || text.includes('accessory'))) {
          finalProducts = catalog.filter((p: any) => {
            const pText = `${p.name} ${p.description}`.toLowerCase();
            return pText.includes('pouch') || pText.includes('organizer') || pText.includes('case') || pText.includes('bag') || pText.includes('charger') || pText.includes('leather');
          });
        }

        // 6. Final Fallback: Featured Products or top 6 items
        if (finalProducts.length === 0) {
          finalProducts = catalog.filter((p: any) => p.is_featured).slice(0, 6);
        }
        if (finalProducts.length === 0) {
          finalProducts = catalog.slice(0, 6);
        }
      }

      return {
        ...s,
        products: finalProducts.slice(0, 4),
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json([]);
  }
}

// POST /api/stories
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createClient();

    const { data, error } = await supabase
      .from('stories')
      .insert([
        {
          title: body.title,
          subtitle: body.subtitle,
          image_url: body.image_url,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
