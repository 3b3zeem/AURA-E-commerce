import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { sanitizeObject } from "@/lib/security/sanitize";
import { verifyRequestOrigin } from "@/lib/security/csrfGuard";
import { isValidEgyptianPhone, isValidEmail } from "@/lib/security/validators";

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
    // Security 1: CSRF Origin Check
    const csrf = verifyRequestOrigin(request);
    if (!csrf.valid && csrf.response) return csrf.response;

    // Security 2: Rate Limiting (max 10 order requests per minute per IP)
    const clientIp = getClientIp(request);
    const rate = checkRateLimit(`order_${clientIp}`, 10, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    // Security 3: Input Sanitization
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    const {
      user_id,
      total_amount,
      points_earned = 0,
      points_redeemed = 0,
      discount_amount = 0,
      shipping_address,
      items = [],
    } = body;

    // Security 4: Phone & Email Validation
    if (shipping_address?.phone && !isValidEgyptianPhone(shipping_address.phone)) {
      return NextResponse.json(
        { error: "Invalid phone number. Must be 11 digits starting with 010, 011, 012, or 015." },
        { status: 400 }
      );
    }

    if (shipping_address?.email && !isValidEmail(shipping_address.email)) {
      return NextResponse.json(
        { error: "Invalid email address or temporary disposable email domain is rejected." },
        { status: 400 }
      );
    }

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
        product_id: item.product_id || item.productId || item.id || null,
        product_name: item.product_name || item.name || item.title || "AURA Product",
        product_image: item.product_image || item.image_url || item.image || (Array.isArray(item.images) ? item.images[0] : null),
        price: Number(item.price ?? item.unit_price ?? item.unitPrice ?? 0),
        quantity: Number(item.quantity || 1),
        variant: item.variant || item.selected_variant || item.selectedVariants || {},
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Supabase order_items insert error:", itemsError);
      }

      // Real-time Automatic Stock Deduction in Supabase
      for (const item of items) {
        const prodId = item.product_id || item.productId || item.id;
        const buyQty = Math.max(1, Number(item.quantity || 1));
        if (prodId) {
          try {
            const { data: prod } = await supabase
              .from("products")
              .select("stock, in_stock")
              .eq("id", prodId)
              .single();

            if (prod) {
              const currentStock = typeof prod.stock === "number" ? prod.stock : 10;
              const newStock = Math.max(0, currentStock - buyQty);
              const isStillInStock = newStock > 0;

              await supabase
                .from("products")
                .update({
                  stock: newStock,
                  in_stock: isStillInStock,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", prodId);
            }
          } catch (stockErr) {
            console.error(`Failed to deduct stock for product ${prodId}:`, stockErr);
          }
        }
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

    // 4. Increment coupon usage count if a coupon code was applied
    const usedCouponCode = shipping_address?.coupon_code || shipping_address?.promo_code || body.coupon_code || body.promo_code;
    if (usedCouponCode) {
      try {
        const cleanCoupon = String(usedCouponCode).trim().toUpperCase();
        const { data: promoData } = await supabase
          .from("promo_codes")
          .select("id, current_uses")
          .eq("code", cleanCoupon)
          .single();

        if (promoData) {
          const currentCount = promoData.current_uses || 0;
          await supabase
            .from("promo_codes")
            .update({ current_uses: currentCount + 1 })
            .eq("id", promoData.id);
        }
      } catch (couponErr) {
        console.error("Failed to increment coupon usage count:", couponErr);
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
    const body = await request.json();
    const { id, status, shipping_address } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updatePayload.status = status;
    if (shipping_address) updatePayload.shipping_address = shipping_address;

    const supabase = createClient();

    // Fetch existing order status before update to handle cancellation stock restoration
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("status, order_items(*)")
      .eq("id", id)
      .single();

    const { data: updated, error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If order is cancelled, restore product stock back to Supabase DB
    if (status === "cancelled" && existingOrder && existingOrder.status !== "cancelled") {
      const items = existingOrder.order_items || [];
      for (const item of items) {
        if (item.product_id && item.quantity) {
          try {
            const { data: prod } = await supabase
              .from("products")
              .select("stock")
              .eq("id", item.product_id)
              .single();

            if (prod) {
              const restoredStock = (prod.stock || 0) + Number(item.quantity);
              await supabase
                .from("products")
                .update({
                  stock: restoredStock,
                  in_stock: true,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", item.product_id);
            }
          } catch (restoreErr) {
            console.error(`Failed to restore stock for product ${item.product_id}:`, restoreErr);
          }
        }
      }
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
