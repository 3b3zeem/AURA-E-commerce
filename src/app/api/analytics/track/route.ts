import { NextResponse } from "next/server";
import { saveAnalyticsEvent } from "@/lib/analytics/serverStore";
import { sanitizeObject } from "@/lib/security/sanitize";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    const event = await saveAnalyticsEvent({
      event_type: body.event_type,
      path: body.path,
      page_title: body.page_title,
      visitor_id: body.visitor_id,
      session_id: body.session_id,
      user_id: body.user_id,
      device_type: body.device_type,
      browser: body.browser,
      os: body.os,
      meta: body.meta || {},
      timestamp: body.timestamp || new Date().toISOString(),
    });

    const meta = body.meta || {};
    const userName =
      meta.user_name ||
      (body.visitor_id ? `Guest #${body.visitor_id.replace(/^v_/, "").slice(-4).toUpperCase()}` : "Guest");

    // Broadened notification triggers without emojis
    let notifType: "order" | "cart" | "product" | "search" | "user" | "review" | "newsletter" | "system" | null = null;
    let title = "";
    let message = "";

    if (body.event_type === "purchase") {
      notifType = "order";
      title = "New Order Completed";
      message = `${userName} completed an order worth $${meta.total_amount || 0}`;
    } else if (body.event_type === "add_to_cart") {
      notifType = "cart";
      title = "Product Added to Cart";
      message = `${userName} added "${meta.product_name || "a product"}" to cart`;
    } else if (body.event_type === "checkout_start") {
      notifType = "cart";
      title = "Checkout Process Started";
      message = `${userName} initiated the checkout process`;
    } else if (body.event_type === "product_view" && meta.product_name) {
      notifType = "product";
      title = "Product Page Viewed";
      message = `${userName} viewed "${meta.product_name}"`;
    } else if (body.event_type === "search_query" && meta.query) {
      notifType = "search";
      title = "Store Search Performed";
      message = `${userName} searched for "${meta.query}"`;
    }

    if (notifType) {
      try {
        const notifUrl = new URL("/api/admin/notifications", request.url).toString();
        await fetch(notifUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: notifType,
            title,
            message,
            userEmail: userName,
            amount: meta.price || meta.total_amount || 0,
          }),
        });
      } catch (e) {
        console.error("Failed to forward notification to admin API:", e);
      }
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
