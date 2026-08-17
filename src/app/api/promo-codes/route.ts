import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    const supabase = createClient();
    const { data: dbPromos, error } = await supabase
      .from("promo_codes")
      .select("*");

    if (error) {
      console.error("Supabase promo_codes fetch error:", error);
      return NextResponse.json([]);
    }

    const promosList = dbPromos || [];

    if (code) {
      const clean = code.trim().toUpperCase();
      const found = promosList.find(
        (p: any) => p.code?.toUpperCase() === clean && p.is_active !== false
      );
      if (found) {
        return NextResponse.json({ success: true, promo: found });
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid or expired promo code" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(promosList);
  } catch (err: any) {
    return NextResponse.json([]);
  }
}
