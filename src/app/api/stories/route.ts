import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// GET /api/stories
export async function GET() {
  try {
    const supabase = createClient();
    let storiesData: any[] = [];
    const { data: resData, error: storiesError } = await supabase
      .from('stories')
      .select('*, story_products(product:products(*))');

    if (storiesError) {
      // Fallback if story_products table has not been created yet in Supabase
      const { data: simpleStories } = await supabase.from('stories').select('*');
      storiesData = simpleStories || [];
    } else {
      storiesData = resData || [];
    }

    // Fetch all products to use for smart fallback matching
    const { data: allProducts } = await supabase.from('products').select('*');
    const catalog = allProducts || [];

    const formatted = storiesData
      .filter((s: any) => {
        if (!s.created_at) return true;
        const createdAt = new Date(s.created_at).getTime();
        const now = Date.now();
        // 24 hours = 86,400,000 ms
        return (now - createdAt) <= 24 * 60 * 60 * 1000;
      })
      .map((s: any) => {
        const explicitProducts = (s.story_products?.map((sp: any) => sp.product) || []).filter(Boolean);
        const text = `${s.title} ${s.subtitle}`.toLowerCase();

        let finalProducts: any[] = explicitProducts;

        // Smart thematic product matching
        const findMatchingProducts = () => {
          // 1. Audio & Headphones
          if (text.includes('audio') || text.includes('sound') || text.includes('wireless') || text.includes('cyber') || text.includes('headphone') || text.includes('silent') || text.includes('سماعة')) {
            return catalog.filter((p: any) => {
              const pText = `${p.name} ${p.description} ${p.brand} ${p.category?.name || ''}`.toLowerCase();
              return pText.includes('headphone') || pText.includes('audio') || pText.includes('earbuds') || pText.includes('sound') || pText.includes('bose') || pText.includes('sony') || pText.includes('sennheiser');
            });
          }

          // 2. Skincare & Beauty
          if (text.includes('skincare') || text.includes('glow') || text.includes('serum') || text.includes('beauty') || text.includes('botanical') || text.includes('skin') || text.includes('بشرة')) {
            return catalog.filter((p: any) => {
              const pText = `${p.name} ${p.description} ${p.category?.name || ''}`.toLowerCase();
              return pText.includes('serum') || pText.includes('skin') || pText.includes('glow') || pText.includes('cleanser') || pText.includes('cream') || pText.includes('hydration') || pText.includes('moisturizer');
            });
          }

          // 3. Men & Gentlemen Care / Apparel
          if (text.includes('gentlemen') || text.includes('grooming') || text.includes('suit') || text.includes('leather') || text.includes('man') || text.includes('men') || text.includes('رجالي')) {
            return catalog.filter((p: any) => {
              const pText = `${p.name} ${p.description} ${p.brand} ${p.category?.name || ''}`.toLowerCase();
              return pText.includes('leather') || pText.includes('suit') || pText.includes('travel') || pText.includes('grooming') || pText.includes('watch') || pText.includes('trimmer') || pText.includes('jacket') || pText.includes('wallet');
            });
          }

          // 4. Gaming & Displays
          if (text.includes('gaming') || text.includes('desk') || text.includes('monitor') || text.includes('display') || text.includes('oled') || text.includes('keyboard') || text.includes('شاشة')) {
            return catalog.filter((p: any) => {
              const pText = `${p.name} ${p.description} ${p.category?.name || ''}`.toLowerCase();
              return pText.includes('gaming') || pText.includes('monitor') || pText.includes('keyboard') || pText.includes('mouse') || pText.includes('oled') || pText.includes('display');
            });
          }

          // 5. Drones & Cameras
          if (text.includes('drone') || text.includes('aerial') || text.includes('camera') || text.includes('fpv') || text.includes('gimbal') || text.includes('تصوير')) {
            return catalog.filter((p: any) => {
              const pText = `${p.name} ${p.description} ${p.category?.name || ''}`.toLowerCase();
              return pText.includes('drone') || pText.includes('camera') || pText.includes('gimbal') || pText.includes('lens') || pText.includes('dji') || pText.includes('gopro');
            });
          }

          // 6. Fragrance & Perfumes
          if (text.includes('fragrance') || text.includes('perfume') || text.includes('oud') || text.includes('royal') || text.includes('عطر')) {
            return catalog.filter((p: any) => {
              const pText = `${p.name} ${p.description} ${p.category?.name || ''}`.toLowerCase();
              return pText.includes('perfume') || pText.includes('fragrance') || pText.includes('oud') || pText.includes('cologne') || pText.includes('scent');
            });
          }

          // 7. Smartwatches & Wearables
          if (text.includes('watch') || text.includes('smart') || text.includes('wearable') || text.includes('fitness') || text.includes('ساعة')) {
            return catalog.filter((p: any) => {
              const pText = `${p.name} ${p.description} ${p.category?.name || ''}`.toLowerCase();
              return pText.includes('watch') || pText.includes('apple watch') || pText.includes('garmin') || pText.includes('fitness') || pText.includes('band') || pText.includes('tracker');
            });
          }

          // 8. Coffee & Kitchen
          if (text.includes('coffee') || text.includes('espresso') || text.includes('kitchen') || text.includes('barista') || text.includes('قهوة')) {
            return catalog.filter((p: any) => {
              const pText = `${p.name} ${p.description} ${p.category?.name || ''}`.toLowerCase();
              return pText.includes('coffee') || pText.includes('espresso') || pText.includes('kitchen') || pText.includes('maker') || pText.includes('grinder') || pText.includes('kettle');
            });
          }

          // Default fallback
          return catalog.filter((p: any) => p.is_featured);
        };

        if (finalProducts.length === 0) {
          finalProducts = findMatchingProducts();
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
