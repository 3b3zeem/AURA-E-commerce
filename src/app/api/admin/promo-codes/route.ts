import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { verifyAdmin } from "@/lib/auth/adminGuard";

export async function GET(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const supabase = createClient();
    const { data: dbPromos, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET promo_codes error:", error);
      return NextResponse.json([]);
    }

    return NextResponse.json(dbPromos || []);
  } catch (err: any) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { code, discount_percent, is_active } = await request.json();
    if (!code || typeof discount_percent !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const supabase = createClient();

    const { data, error } = await supabase
      .from("promo_codes")
      .insert([
        {
          code: cleanCode,
          discount_percent,
          is_active: is_active ?? true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase POST promo_codes error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { id, code, discount_percent, is_active } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing promo code ID" }, { status: 400 });
    }

    const supabase = createClient();
    const updates: any = {};
    if (code) updates.code = code.trim().toUpperCase();
    if (typeof discount_percent === "number") updates.discount_percent = discount_percent;
    if (typeof is_active === "boolean") updates.is_active = is_active;

    const { data, error } = await supabase
      .from("promo_codes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase PUT promo_codes error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing promo code ID" }, { status: 400 });
    }

    const supabase = createClient();
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);

    if (error) {
      console.error("Supabase DELETE promo_codes error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
