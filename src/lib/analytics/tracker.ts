"use client";

export interface AnalyticsEventPayload {
  event_type: "page_view" | "product_view" | "add_to_cart" | "search_query" | "checkout_start" | "purchase" | "wishlist";
  path?: string;
  page_title?: string;
  visitor_id?: string;
  session_id?: string;
  user_id?: string;
  device_type?: "Mobile" | "Desktop" | "Tablet";
  browser?: string;
  os?: string;
  meta?: Record<string, any>;
  timestamp?: string;
}

// Generate persistent Visitor ID (stored in localStorage)
export function getVisitorId(): string {
  if (typeof window === "undefined") return "server-session";
  let vid = localStorage.getItem("aura_visitor_id");
  if (!vid) {
    vid = "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("aura_visitor_id", vid);
  }
  return vid;
}

// Generate Session ID (stored in sessionStorage)
export function getSessionId(): string {
  if (typeof window === "undefined") return "server-session";
  let sid = sessionStorage.getItem("aura_session_id");
  if (!sid) {
    sid = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem("aura_session_id", sid);
  }
  return sid;
}

// Detect User Device & Browser info
export function getDeviceMeta() {
  if (typeof window === "undefined") {
    return { device_type: "Desktop" as const, browser: "Unknown", os: "Unknown" };
  }

  const ua = navigator.userAgent;
  let device_type: "Mobile" | "Desktop" | "Tablet" = "Desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device_type = "Tablet";
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
    device_type = "Mobile";
  }

  let browser = "Chrome";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  let os = "Windows";
  if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  return { device_type, browser, os };
}

let lastSentEventKey = "";
let lastSentEventTime = 0;

// Send event payload to API route
export async function sendAnalyticsEvent(payload: AnalyticsEventPayload) {
  if (typeof window === "undefined") return;

  try {
    const currentPath = payload.path || window.location.pathname;
    const eventKey = `${payload.event_type}_${currentPath}_${JSON.stringify(payload.meta || {})}`;
    const now = Date.now();

    // Prevent duplicate event spamming if triggered within 2000ms
    if (eventKey === lastSentEventKey && now - lastSentEventTime < 2000) {
      return;
    }

    lastSentEventKey = eventKey;
    lastSentEventTime = now;

    const visitor_id = payload.visitor_id || getVisitorId();
    const session_id = payload.session_id || getSessionId();
    const { device_type, browser, os } = getDeviceMeta();

    // Check logged in user ID & Name from localStorage if not provided
    let user_id = payload.user_id;
    let user_name = payload.meta?.user_name;

    if (!user_id || !user_name) {
      try {
        const storedUser = localStorage.getItem("aura-user-storage");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const profile = parsed?.state?.profile;
          if (profile) {
            user_id = user_id || profile.id;
            user_name = user_name || profile.email || profile.full_name;
          }
        }
      } catch {}
    }

    if (!user_name) {
      const shortId = visitor_id.replace(/^v_/, '').slice(-4).toUpperCase();
      user_name = `Guest #${shortId}`;
    }

    const fullPayload: AnalyticsEventPayload = {
      ...payload,
      visitor_id,
      session_id,
      user_id: user_id || undefined,
      path: currentPath,
      page_title: payload.page_title || document.title,
      device_type: payload.device_type || device_type,
      browser: payload.browser || browser,
      os: payload.os || os,
      meta: {
        ...(payload.meta || {}),
        user_name,
      },
      timestamp: new Date().toISOString(),
    };

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullPayload),
      keepalive: true,
    }).catch(() => {});

    // Dispatch event locally for immediate admin analytics UI sync
    window.dispatchEvent(new CustomEvent("aura_track_analytics", { detail: fullPayload }));
  } catch (err) {
    console.error("Failed to send analytics event:", err);
  }
}

// Helper tracking functions
export function trackPageView(path?: string, title?: string) {
  sendAnalyticsEvent({
    event_type: "page_view",
    path: path || (typeof window !== "undefined" ? window.location.pathname : "/"),
    page_title: title || (typeof window !== "undefined" ? document.title : "AURA"),
  });
}

export function trackProductView(productId: string, productName: string, price: number) {
  sendAnalyticsEvent({
    event_type: "product_view",
    meta: { product_id: productId, product_name: productName, price },
  });
}

export function trackAddToCart(productId: string, productName: string, price: number) {
  sendAnalyticsEvent({
    event_type: "add_to_cart",
    meta: { product_id: productId, product_name: productName, price },
  });
}

export function trackSearchQuery(query: string) {
  if (!query || query.trim().length === 0) return;
  sendAnalyticsEvent({
    event_type: "search_query",
    meta: { query: query.trim() },
  });
}

export function trackCheckoutStart(totalAmount: number, itemCount: number) {
  sendAnalyticsEvent({
    event_type: "checkout_start",
    meta: { total_amount: totalAmount, item_count: itemCount },
  });
}

export function trackPurchaseCompleted(orderId: string, totalAmount: number, itemCount: number) {
  sendAnalyticsEvent({
    event_type: "purchase",
    meta: { order_id: orderId, total_amount: totalAmount, item_count: itemCount },
  });
}
