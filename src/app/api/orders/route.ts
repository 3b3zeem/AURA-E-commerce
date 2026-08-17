import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const supabase = createClient();
    let query = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Supabase GET orders error:", error);
      return NextResponse.json([]);
    }
    return NextResponse.json(orders || []);
  } catch (err: any) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      user_id,
      total_amount,
      points_earned = 0,
      points_redeemed = 0,
      discount_amount = 0,
      shipping_address,
      items = [],
    } = body;

    const supabase = createClient();

    // 1. Create order record
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user_id || null,
          status: "pending",
          total_amount,
          points_earned,
          points_redeemed,
          discount_amount,
          shipping_address,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("Supabase POST order error:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 2. Insert order items if present
    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: newOrder.id,
        product_id: item.product_id || null,
        product_name: item.product_name || "Product",
        product_image: item.product_image || null,
        price: item.price || 0,
        quantity: item.quantity || 1,
        variant: item.variant || {},
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Supabase order_items insert error:", itemsError);
      }
    }

    // 3. Update user loyalty points in profiles table
    if (user_id) {
      const netPointsChange = points_earned - points_redeemed;
      if (netPointsChange !== 0) {
        try {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("loyalty_points")
            .eq("id", user_id)
            .single();

          const currentPts = userProfile?.loyalty_points || 0;
          const updatedPts = Math.max(0, currentPts + netPointsChange);

          await supabase
            .from("profiles")
            .update({ loyalty_points: updatedPts })
            .eq("id", user_id);
        } catch (ptsErr) {
          console.error("Failed to update user loyalty points:", ptsErr);
        }
      }
    }

    return NextResponse.json(newOrder);
  } catch (err: any) {
    console.error("POST order exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
