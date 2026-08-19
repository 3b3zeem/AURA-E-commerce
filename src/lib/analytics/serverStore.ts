import { createClient } from "@/lib/supabase/client";

export interface AnalyticsEvent {
  id: string;
  event_type: "page_view" | "product_view" | "add_to_cart" | "search_query" | "checkout_start" | "purchase" | "wishlist";
  path: string;
  page_title: string;
  visitor_id: string;
  session_id: string;
  user_id?: string;
  device_type: "Mobile" | "Desktop" | "Tablet";
  browser: string;
  os: string;
  meta: Record<string, any>;
  timestamp: string;
}

// In-Memory store for fast analytics query
const globalForAnalytics = global as unknown as { analyticsEventsCache?: AnalyticsEvent[] };

if (!globalForAnalytics.analyticsEventsCache) {
  globalForAnalytics.analyticsEventsCache = [];
}

const analyticsEvents = globalForAnalytics.analyticsEventsCache;

export async function saveAnalyticsEvent(eventData: Partial<AnalyticsEvent>): Promise<AnalyticsEvent> {
  const newEvent: AnalyticsEvent = {
    id: "ev_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7),
    event_type: eventData.event_type || "page_view",
    path: eventData.path || "/",
    page_title: eventData.page_title || "AURA Store",
    visitor_id: eventData.visitor_id || "v_unknown",
    session_id: eventData.session_id || "s_unknown",
    user_id: eventData.user_id || undefined,
    device_type: eventData.device_type || "Desktop",
    browser: eventData.browser || "Chrome",
    os: eventData.os || "Windows",
    meta: eventData.meta || {},
    timestamp: eventData.timestamp || new Date().toISOString(),
  };

  // Add to memory cache
  analyticsEvents.unshift(newEvent);
  if (analyticsEvents.length > 5000) {
    analyticsEvents.length = 5000;
  }

  // Try storing in Supabase table `analytics_events`
  try {
    const supabase = createClient();
    await supabase.from("analytics_events").insert([newEvent]);
  } catch (err) {
    // Ignore error if table doesn't exist yet
  }

  return newEvent;
}

export interface AggregatedAnalytics {
  timeframe: "today" | "7d" | "30d" | "all";
  totalVisitors: number;
  totalPageViews: number;
  activeVisitorsCount: number;
  totalOrdersCount: number;
  totalRevenue: number;
  conversionRate: number;
  avgOrderValue: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
    mobilePct: number;
    desktopPct: number;
    tabletPct: number;
  };
  topPages: Array<{ path: string; page_title: string; views: number; pct: number }>;
  topProductsViewed: Array<{ product_id: string; product_name: string; views: number; price: number }>;
  topSearchQueries: Array<{ query: string; count: number }>;
  hourlyTraffic: Array<{ label: string; views: number; visitors: number }>;
  dailyRevenue: Array<{ label: string; amount: number }>;
  recentActivity: AnalyticsEvent[];
}

export async function getAggregatedAnalytics(
  timeframe: "today" | "7d" | "30d" | "all" = "7d",
  dbOrders: any[] = [],
  dbProducts: any[] = []
): Promise<AggregatedAnalytics> {
  const now = Date.now();
  let timeCutoff = 0;

  if (timeframe === "today") {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    timeCutoff = startOfToday.getTime();
  } else if (timeframe === "7d") {
    timeCutoff = now - 7 * 24 * 60 * 60 * 1000;
  } else if (timeframe === "30d") {
    timeCutoff = now - 30 * 24 * 60 * 60 * 1000;
  }

  // Combine DB events + memory events
  let events = [...analyticsEvents];
  try {
    const supabase = createClient();
    const { data: dbEvents } = await supabase
      .from("analytics_events")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1000);

    if (dbEvents && dbEvents.length > 0) {
      const existingIds = new Set(events.map((e) => e.id));
      for (const dbe of dbEvents) {
        if (!existingIds.has(dbe.id)) {
          events.push(dbe);
        }
      }
    }
  } catch {}

  // Filter events by timeframe
  const filteredEvents = events.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return timeCutoff === 0 || t >= timeCutoff;
  });

  // Calculate Realtime Active Visitors (events in the last 5 minutes)
  const fiveMinsAgo = now - 5 * 60 * 1000;
  const activeVisitorsSet = new Set<string>();
  events.forEach((e) => {
    if (new Date(e.timestamp).getTime() >= fiveMinsAgo) {
      activeVisitorsSet.add(e.visitor_id);
    }
  });

  // Unique Visitors & Pageviews
  const visitorSet = new Set<string>();
  let pageViewsCount = 0;
  const pageMap: Record<string, { title: string; count: number }> = {};
  const productViewsMap: Record<string, { name: string; price: number; count: number }> = {};
  const searchMap: Record<string, number> = {};
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;

  filteredEvents.forEach((ev) => {
    if (ev.visitor_id) visitorSet.add(ev.visitor_id);
    if (ev.event_type === "page_view") pageViewsCount++;

    // Device count
    if (ev.device_type === "Mobile") mobileCount++;
    else if (ev.device_type === "Tablet") tabletCount++;
    else desktopCount++;

    // Page view map
    if (ev.path) {
      const title = ev.page_title || ev.path;
      if (!pageMap[ev.path]) pageMap[ev.path] = { title, count: 0 };
      pageMap[ev.path].count++;
    }

    // Product view map
    if (ev.event_type === "product_view" && ev.meta?.product_name) {
      const pid = ev.meta.product_id || ev.meta.product_name;
      if (!productViewsMap[pid]) {
        productViewsMap[pid] = {
          name: ev.meta.product_name,
          price: Number(ev.meta.price || 0),
          count: 0,
        };
      }
      productViewsMap[pid].count++;
    }

    // Search queries map
    if (ev.event_type === "search_query" && ev.meta?.query) {
      const q = String(ev.meta.query).trim().toLowerCase();
      if (q) searchMap[q] = (searchMap[q] || 0) + 1;
    }
  });

  const totalVisitors = visitorSet.size;
  const totalPageViews = pageViewsCount;

  // Orders & Revenue (Purely from DB Orders)
  const filteredOrders = dbOrders.filter((o) => {
    if (!o.created_at) return true;
    const t = new Date(o.created_at).getTime();
    return timeCutoff === 0 || t >= timeCutoff;
  });

  const totalOrdersCount = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const conversionRate = totalVisitors > 0 ? (totalOrdersCount / totalVisitors) * 100 : 0;

  // Device Breakdown Pct (Purely from recorded events)
  const totalDeviceEvents = mobileCount + desktopCount + tabletCount;
  const mobilePct = totalDeviceEvents > 0 ? Math.round((mobileCount / totalDeviceEvents) * 100) : 0;
  const desktopPct = totalDeviceEvents > 0 ? Math.round((desktopCount / totalDeviceEvents) * 100) : 0;
  const tabletPct = totalDeviceEvents > 0 ? Math.max(0, 100 - (mobilePct + desktopPct)) : 0;

  // Top Pages (Purely from recorded events)
  const topPages = Object.entries(pageMap)
    .map(([path, data]) => ({
      path,
      page_title: data.title,
      views: data.count,
      pct: Math.round((data.count / Math.max(totalPageViews, 1)) * 100),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Top Products Viewed (Purely from recorded events)
  const topProductsViewed = Object.entries(productViewsMap)
    .map(([pid, data]) => ({
      product_id: pid,
      product_name: data.name,
      views: data.count,
      price: data.price,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Top Search Queries (Purely from recorded events)
  const topSearchQueries = Object.entries(searchMap)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Hourly / Daily Traffic Breakdown (Purely from recorded events)
  const hourlyTraffic: Array<{ label: string; views: number; visitors: number }> = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const label = i === 0 ? "Today" : days[d.getDay()];
    const dayStart = new Date(d).setHours(0, 0, 0, 0);
    const dayEnd = new Date(d).setHours(23, 59, 59, 999);

    const dayEvents = events.filter((e) => {
      const t = new Date(e.timestamp).getTime();
      return t >= dayStart && t <= dayEnd;
    });

    const dayVisitors = new Set(dayEvents.map((e) => e.visitor_id)).size;
    hourlyTraffic.push({
      label,
      views: dayEvents.length,
      visitors: dayVisitors,
    });
  }

  // Daily Revenue (Purely from DB Orders)
  const dailyRevenue: Array<{ label: string; amount: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const label = i === 0 ? "Today" : days[d.getDay()];
    const dayStart = new Date(d).setHours(0, 0, 0, 0);
    const dayEnd = new Date(d).setHours(23, 59, 59, 999);

    const dayOrds = dbOrders.filter((o) => {
      if (!o.created_at) return false;
      const t = new Date(o.created_at).getTime();
      return t >= dayStart && t <= dayEnd;
    });

    const dayRev = dayOrds.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    dailyRevenue.push({
      label,
      amount: dayRev,
    });
  }

  return {
    timeframe,
    totalVisitors,
    totalPageViews,
    activeVisitorsCount: activeVisitorsSet.size,
    totalOrdersCount,
    totalRevenue,
    conversionRate: Number(conversionRate.toFixed(1)),
    avgOrderValue: Number(avgOrderValue.toFixed(2)),
    deviceBreakdown: {
      mobile: mobileCount,
      desktop: desktopCount,
      tablet: tabletCount,
      mobilePct,
      desktopPct,
      tabletPct,
    },
    topPages,
    topProductsViewed,
    topSearchQueries,
    hourlyTraffic,
    dailyRevenue,
    recentActivity: filteredEvents.slice(0, 10),
  };
}
