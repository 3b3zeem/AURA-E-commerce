"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView, sendAnalyticsEvent } from "@/lib/analytics/tracker";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string | null>(null);

  // Track page view on route change
  useEffect(() => {
    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (lastPathRef.current !== fullUrl) {
      lastPathRef.current = fullUrl;
      // Slight delay to allow document.title to update
      const timer = setTimeout(() => {
        trackPageView(pathname, document.title);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Heartbeat ping every 60 seconds to keep live visitor count accurate
  useEffect(() => {
    const sendHeartbeat = () => {
      sendAnalyticsEvent({
        event_type: "page_view",
        path: window.location.pathname,
        page_title: document.title,
        meta: { is_heartbeat: true },
      });
    };

    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
