import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";

export async function GET(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rate = checkRateLimit(`coupon_${clientIp}`, 15, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many coupon attempts. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const userId = searchParams.get("userId");

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
        (p: any) => p.code?.toUpperCase() === clean
      );

      if (!found) {
        return NextResponse.json(
          { success: false, message: "Invalid coupon code" },
          { status: 404 }
        );
      }

      if (found.is_active === false) {
        return NextResponse.json(
          { success: false, message: "Coupon is currently inactive or already redeemed" },
          { status: 400 }
        );
      }

      // Check User Specific Restriction
      if (found.user_id && userId && String(found.user_id) !== String(userId)) {
        return NextResponse.json(
          { success: false, message: "This single-use VIP coupon belongs to another user account" },
          { status: 403 }
        );
      }

      const now = new Date();

      // Check Start Date
      if (found.start_date && new Date(found.start_date) > now) {
        const formattedStart = new Date(found.start_date).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
        return NextResponse.json(
          {
            success: false,
            message: `Coupon is not valid yet (Valid starting: ${formattedStart})`,
          },
          { status: 400 }
        );
      }

      // Check End Date
      if (found.end_date && new Date(found.end_date) < now) {
        const formattedEnd = new Date(found.end_date).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
        return NextResponse.json(
          {
            success: false,
            message: `Coupon expired on ${formattedEnd}`,
          },
          { status: 400 }
        );
      }

      // Check Total Max Uses
      if (
        found.max_uses !== null &&
        found.max_uses !== undefined &&
        (found.current_uses || 0) >= Number(found.max_uses)
      ) {
        return NextResponse.json(
          { success: false, message: "This single-use coupon has already been used" },
          { status: 400 }
        );
      }

      // Check Per-User Limit in orders table
      if (
        userId &&
        found.max_uses_per_user !== null &&
        found.max_uses_per_user !== undefined
      ) {
        const { data: userOrders } = await supabase
          .from("orders")
          .select("id, shipping_address")
          .eq("user_id", userId);

        if (Array.isArray(userOrders)) {
          const userUses = userOrders.filter(
            (o: any) =>
              (o.shipping_address?.coupon_code || o.shipping_address?.promo_code)?.toUpperCase() === clean
          ).length;

          if (userUses >= Number(found.max_uses_per_user)) {
            return NextResponse.json(
              {
                success: false,
                message: `You have reached the maximum allowed uses for this coupon (${found.max_uses_per_user} time(s))`,
              },
              { status: 400 }
            );
          }
        }
      }

      return NextResponse.json({ success: true, promo: found });
    }

    return NextResponse.json(promosList);
  } catch (err: any) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { code, discount_percent, max_uses, max_uses_per_user, user_id } = await request.json();
    if (!code || typeof discount_percent !== "number") {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    const supabase = createClient();
    const insertData: Record<string, any> = {
      code: code.trim().toUpperCase(),
      discount_percent,
      max_uses: max_uses || 1,
      max_uses_per_user: max_uses_per_user || 1,
      current_uses: 0,
      is_active: true,
    };
    if (user_id) insertData.user_id = user_id;

    const { data, error } = await supabase
      .from("promo_codes")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Supabase redemption coupon creation error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, promo: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
