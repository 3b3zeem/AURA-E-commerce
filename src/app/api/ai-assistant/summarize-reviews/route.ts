import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 1. Fetch product details & reviews from Supabase DB
    const [prodRes, reviewsRes] = await Promise.all([
      supabase.from("products").select("*").eq("id", productId).single(),
      supabase.from("reviews").select("*").eq("product_id", productId),
    ]);

    const product = prodRes.data;
    const reviews = reviewsRes.data || [];

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    // 2. Generate Sentiment Analysis
    const totalReviews = reviews.length;

    // If 0 reviews, strictly return hasReviews: false
    if (totalReviews === 0) {
      return NextResponse.json({
        totalReviews: 0,
        hasReviews: false,
        recommendationRate: 0,
        sentimentScore: 0,
        aiVerdict: "",
        pros: [],
        cons: [],
        isAIPreview: false,
      });
    }

    // Text-aware sentiment pre-calculation (detects negative words even with 5-star rating)
    const negativeKeywords = [
      "bad",
      "terrible",
      "worst",
      "broken",
      "poor",
      "not good",
      "cheap",
      "waste",
      "refund",
      "defect",
      "defective",
      "fake",
      "disappointed",
      "return",
      "horrible",
      "trash",
      "crap",
      "flaw",
      "سيء",
      "وحش",
      "مش حلو",
      "زفت",
      "خربان",
    ];

    let positiveReviewsCount = 0;
    let evaluatedRatingsSum = 0;

    reviews.forEach((r: any) => {
      const text = `${r.title || ""} ${r.comment || ""}`.toLowerCase();
      const isTextNegative = negativeKeywords.some((word) =>
        text.includes(word)
      );

      let effectiveRating = r.rating || 5;
      // If user selected 5 stars but wrote negative text, adjust effective rating
      if (isTextNegative && effectiveRating > 3) {
        effectiveRating = 2.0;
      }

      if (!isTextNegative && effectiveRating >= 4) {
        positiveReviewsCount++;
      }

      evaluatedRatingsSum += effectiveRating;
    });

    const recRate = Math.round((positiveReviewsCount / totalReviews) * 100);
    const avgRating = (evaluatedRatingsSum / totalReviews).toFixed(1);

    // Call Gemini API for deep natural language sentiment analysis
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const reviewListText = reviews
          .map(
            (r: any, idx: number) =>
              `${idx + 1}. Star Rating: ${r.rating || 5}/5, Title: "${r.title || ""}", Comment: "${r.comment || "No text"}"`
          )
          .join("\n");

        const prompt = `You are AURA AI Advanced Sentiment Analyzer.
Analyze the following REAL customer reviews for product "${product.name}" (Brand: ${product.brand || "AURA"}):

Customer Reviews:
${reviewListText}

CRITICAL SENTIMENT ANALYSIS RULES:
1. Do NOT rely solely on numeric star ratings! Users frequently select 5 stars by mistake while writing negative comments (e.g. "not good", "bad product", "terrible quality").
2. Read the ACTUAL TEXT of every review carefully. If a review text expresses dissatisfaction or complaints (e.g. "bad", "not good", "broken", "poor"), classify that review as NEGATIVE regardless of its star rating!
3. "recommendationRate": Calculate the true percentage (0-100) of buyers who genuinely recommend the product based on TEXT comments + rating context.
4. "sentimentScore": Calculate the true overall sentiment rating (1.0 to 5.0) reflecting actual written text sentiment.
5. "aiVerdict": Write 1-2 concise, objective sentences in English summarizing what buyers actually experienced.
6. "pros": Array of up to 3 actual positive aspects mentioned in positive comments.
7. "cons": Array of up to 3 negative issues, complaints, or concerns mentioned in the review text.

Respond STRICTLY with valid JSON object:
{
  "sentimentScore": 2.5,
  "recommendationRate": 50,
  "aiVerdict": "Customer feedback is mixed: while some users rating is high, written comments highlight product flaws and dissatisfaction.",
  "pros": ["Fast delivery"],
  "cons": ["Reported bad product quality", "Item not meeting expectations"]
}`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const textResult = aiResponse.text?.trim() || "";
        const jsonMatch = textResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            totalReviews,
            hasReviews: true,
            recommendationRate:
              typeof parsed.recommendationRate === "number"
                ? parsed.recommendationRate
                : recRate,
            sentimentScore:
              typeof parsed.sentimentScore === "number"
                ? parsed.sentimentScore
                : parseFloat(avgRating),
            aiVerdict:
              parsed.aiVerdict ||
              `Customer sentiment for ${product.name} reflects written buyer feedback.`,
            pros: Array.isArray(parsed.pros) && parsed.pros.length > 0
              ? parsed.pros.slice(0, 3)
              : ["Fast delivery & official warranty"],
            cons: Array.isArray(parsed.cons) && parsed.cons.length > 0
              ? parsed.cons.slice(0, 3)
              : ["Review text notes quality concerns"],
            isAIPreview: false,
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini review summary prompt call warning:", geminiErr);
      }
    }

    // Local fallback with text-aware sentiment analysis if Gemini API is unavailable
    const reviewTexts = reviews
      .map((r: any) => `${r.title || ""} ${r.comment || ""}`)
      .filter(Boolean)
      .join(" ");

    const prosSet = new Set<string>();
    const consSet = new Set<string>();
    const textLower = reviewTexts.toLowerCase();

    if (textLower.includes("good") || textLower.includes("great") || textLower.includes("excellent")) {
      prosSet.add("Positive buyer satisfaction");
    }
    if (textLower.includes("fast") || textLower.includes("delivery")) {
      prosSet.add("Fast delivery & secure packaging");
    }
    if (prosSet.size === 0) {
      prosSet.add("Includes full AURA official warranty");
    }

    if (textLower.includes("bad") || textLower.includes("not good") || textLower.includes("poor") || textLower.includes("سيء")) {
      consSet.add("Customer feedback notes product quality issues");
    }
    if (consSet.size === 0) {
      consSet.add("High demand item");
    }

    return NextResponse.json({
      totalReviews,
      hasReviews: true,
      recommendationRate: recRate,
      sentimentScore: parseFloat(avgRating),
      aiVerdict:
        recRate < 70
          ? `Customer sentiment for ${product.name} shows mixed feedback with written complaints regarding product performance.`
          : `Verified customer sentiment for ${product.name} is generally positive based on review feedback.`,
      pros: Array.from(prosSet).slice(0, 3),
      cons: Array.from(consSet).slice(0, 3),
      isAIPreview: false,
    });
  } catch (err: any) {
    console.error("AI Review Summary Error:", err);
    return NextResponse.json(
      { error: "Failed to summarize reviews." },
      { status: 500 }
    );
  }
}
