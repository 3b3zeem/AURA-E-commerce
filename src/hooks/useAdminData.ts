"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminAnalytics,
  getNewsletterSubscribers,
  getSecurityLogsFromDb,
  getLoyaltyLogsFromDb,
} from "@/lib/services/adminService";

// ==========================================
// 1. ADMIN ANALYTICS QUERY
// ==========================================
export function useAdminAnalytics(
  timeframe: "today" | "7d" | "30d" | "all" = "7d",
) {
  const query = useQuery({
    queryKey: ["admin_analytics", timeframe],
    queryFn: () => getAdminAnalytics(timeframe),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || null };
}

// ==========================================
// 2. NEWSLETTER SUBSCRIBERS QUERY
// ==========================================
export function useNewsletterSubscribers() {
  const query = useQuery({
    queryKey: ["newsletter_subscribers"],
    queryFn: () => getNewsletterSubscribers(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

// ==========================================
// 3. SECURITY LOGS QUERY
// ==========================================
export function useSecurityLogs() {
  const query = useQuery({
    queryKey: ["security_logs"],
    queryFn: () => getSecurityLogsFromDb(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

// ==========================================
// 4. LOYALTY LOGS QUERY
// ==========================================
export function useLoyaltyLogs() {
  const query = useQuery({
    queryKey: ["loyalty_logs"],
    queryFn: () => getLoyaltyLogsFromDb(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}
