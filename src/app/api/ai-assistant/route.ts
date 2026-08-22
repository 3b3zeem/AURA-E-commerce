import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/lib/supabase/client';

// Simple In-Memory Rate Limiter (20 requests/minute per IP)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;

  const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(ip, record);
  return record.count > maxRequests;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous-client';
    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before asking again.' },
        { status: 429 }
      );
    }

    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const supabase = createClient();

    // Fetch products with category relationship
    const { data: dbProducts } = await supabase.from('products').select('*, category:categories(*)');
    const catalog = dbProducts || [];

    const lowerQuery = message.toLowerCase();

    // Extract numerical budget if user specifies "under 200", "أقل من 500", "less than 300", "تحت 200$"
    let maxBudget: number | null = null;
    const budgetMatch = lowerQuery.match(/(?:تحت|أقل من|اقل من|تحت ال|under|less than|below|\$|egp|جنيه)\s*(\d+)/i) ||
                        lowerQuery.match(/(\d+)\s*(?:دولار|\$|جنيه|egp|مصر)/i);

    if (budgetMatch && budgetMatch[1]) {
      const parsed = parseFloat(budgetMatch[1]);
      if (!isNaN(parsed) && parsed > 0) {
        maxBudget = parsed;
      }
    }

    // Helper: High-Precision Local Intent, Category & Budget Engine
    const getLocalSmartResponse = () => {
      // Category Keywords Dictionary
      const categoryMap: { [key: string]: string[] } = {
        audio: ['سماعة', 'سماعات', 'headphone', 'headset', 'earbuds', 'audio', 'sound', 'anc', 'صوت'],
        monitors: ['شاشة', 'شاشات', 'monitor', 'screen', 'display', '165hz', '4k'],
        keyboards: ['كيبورد', 'لوحة مفاتيح', 'keyboard', 'switches', 'mechanical'],
        mice: ['ماوس', 'فأرة', 'mouse', 'dpi'],
        skincare: ['بشرة', 'غسول', 'سيروم', 'skincare', 'serum', 'cleanser', 'cream', 'عناية', 'glow', 'hyaluronic', 'skin', 'عنايه'],
        grooming: ['حلاقة', 'دقن', 'شعر', 'grooming', 'beard', 'trimmer', 'shaver', 'رجالي', 'perfume', 'splash'],
        accessories: ['شنطة', 'جراب', 'محفظة', 'شاحن', 'pouch', 'case', 'charger', 'cable', 'holder', 'watch'],
      };

      // Detect user intent categories
      const detectedCategories: string[] = [];
      for (const [cat, keywords] of Object.entries(categoryMap)) {
        if (keywords.some((kw) => lowerQuery.includes(kw))) {
          detectedCategories.push(cat);
        }
      }

      // Detect specific modifier tags
      const isAskingCheapest = lowerQuery.includes('أرخص') || lowerQuery.includes('رخيص') || lowerQuery.includes('cheap') || lowerQuery.includes('lowest') || lowerQuery.includes('اقل سعر');
      const isAskingGaming = lowerQuery.includes('gaming') || lowerQuery.includes('ألعاب') || lowerQuery.includes('قيمنق') || lowerQuery.includes('جيمنج');

      // Filter catalog by maxBudget if specified
      let filteredCatalog = catalog;
      if (maxBudget !== null) {
        filteredCatalog = catalog.filter((p: any) => p.price <= (maxBudget as number));
      }

      // If budget hard-filter results in 0 items, find items closest to budget
      const hasBudgetOverrun = maxBudget !== null && filteredCatalog.length === 0;
      if (hasBudgetOverrun) {
        filteredCatalog = [...catalog].sort((a: any, b: any) => a.price - b.price);
      }

      // Score products based on precision matching
      const scoredProducts = filteredCatalog.map((p: any) => {
        const text = `${p.name} ${p.description} ${p.badge || ''} ${p.category?.name || ''}`.toLowerCase();
        let score = 0;

        // Category direct name match (+50)
        if (p.category?.name) {
          const catNameLower = p.category.name.toLowerCase();
          detectedCategories.forEach((cat) => {
            if (catNameLower.includes(cat)) score += 50;
          });
        }

        // Category keyword match (+20)
        detectedCategories.forEach((cat) => {
          const catKws = categoryMap[cat];
          if (catKws.some((kw) => text.includes(kw))) {
            score += 20;
          }
        });

        // Keyword exact matches (+5 per word)
        const words = lowerQuery.split(/\s+/).filter((w) => w.length > 2 && w !== 'gaming' && w !== 'best');
        words.forEach((word) => {
          if (text.includes(word)) score += 5;
        });

        // Gaming match bonus (+10 if both requested and present)
        if (isAskingGaming && (text.includes('gaming') || text.includes('headset') || text.includes('headphone') || text.includes('165hz'))) {
          score += 10;
        }

        return { product: p, score };
      });

      // Filter matched products with score > 0
      let matchedItems = scoredProducts.filter((item) => item.score > 0);

      // Sort by score & price
      if (isAskingCheapest || maxBudget !== null) {
        matchedItems.sort((a, b) => b.score - a.score || a.product.price - b.product.price);
      } else {
        matchedItems.sort((a, b) => b.score - a.score || (b.product.is_featured ? 1 : 0) - (a.product.is_featured ? 1 : 0));
      }

      let matched = matchedItems.map((item) => item.product);

      // Fallback to budget catalog if score filtering yielded 0
      if (matched.length === 0) {
        matched = [...filteredCatalog];
      }

      const topProducts = matched.slice(0, 3);

      if (topProducts.length > 0) {
        const bestProduct = topProducts[0];

        if (hasBudgetOverrun) {
          return {
            reply: `Sorry, there are no options available under **${maxBudget} EGP** in this category. However, here is the lowest priced item available close to your budget:\n\n**${bestProduct.name}** at **${bestProduct.price} EGP**.`,
            recommendedProducts: topProducts,
          };
        }

        if (maxBudget !== null) {
          return {
            reply: `Here are the best recommendations matching your budget (under **${maxBudget} EGP**):\n\n**${bestProduct.name}** at **${bestProduct.price} EGP**.\n\nFeel free to explore the list below and add items to your cart:`,
            recommendedProducts: topProducts,
          };
        }

        return {
          reply: `Here are the top AURA recommendations matching your request:\n\n**${bestProduct.name}** at **${bestProduct.price} EGP**.\n\nFeel free to check out the products below and add your favorites to your cart:`,
          recommendedProducts: topProducts,
        };
      }

      return {
        reply: `Welcome to AURA! I'd be happy to assist you in selecting the best products. Feel free to browse our catalog or search for any item!`,
        recommendedProducts: catalog.slice(0, 3),
      };
    };

    // If no API Key is provided, use the Local Smart Response Engine directly
    if (!apiKey) {
      return NextResponse.json(getLocalSmartResponse());
    }

    // Try Gemini API call
    try {
      const productsContext = catalog.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category?.name || '',
        price: p.price,
        original_price: p.original_price,
        description: p.description,
        in_stock: p.stock > 0,
      }));

      const systemPrompt = `You are "AURA AI", a sleek, friendly, and expert sales consultant for AURA - a premium high-performance tech and lifestyle store.

YOUR INSTRUCTIONS:
1. Respond STRICTLY IN ENGLISH ALWAYS regardless of the user language.
2. Recommend products STRICTLY from the AURA catalog provided below.
3. CRITICAL BUDGET RULE: If user asks for products under/below a certain price (e.g. "under 200" or "تحت 200"), ONLY recommend products with price <= budget! Do NOT recommend items that exceed the user budget!
4. When recommending, mention the product name and price accurately in English.

AURA CATALOG DATABASE:
${JSON.stringify(productsContext, null, 2)}`;

      const ai = new GoogleGenAI({ apiKey });
      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] },
        ],
      });

      const replyText = aiResponse.text || "Hello! How can I assist you today?";
      const recommended = catalog.filter((p: any) =>
        replyText.toLowerCase().includes(p.name.toLowerCase())
      );

      return NextResponse.json({
        reply: replyText,
        recommendedProducts: recommended.length > 0 ? recommended.slice(0, 3) : catalog.slice(0, 3),
      });
    } catch (aiError) {
      console.warn('Gemini API call failed, falling back to smart local response:', aiError);
      return NextResponse.json(getLocalSmartResponse());
    }

  } catch (err: any) {
    console.error('AI Assistant API Error:', err);
    return NextResponse.json({ error: 'Failed to generate response.' }, { status: 500 });
  }
}
