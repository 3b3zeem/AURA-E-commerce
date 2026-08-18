// Lightweight In-Memory Sliding Window Rate Limiter
interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const ipTrackers = new Map<string, RateLimitTracker>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, tracker] of ipTrackers.entries()) {
    if (now > tracker.resetTime) {
      ipTrackers.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const key = `${identifier}`;
  const tracker = ipTrackers.get(key);

  if (!tracker || now > tracker.resetTime) {
    ipTrackers.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (tracker.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, tracker.resetTime - now),
    };
  }

  tracker.count += 1;
  return {
    allowed: true,
    remaining: limit - tracker.count,
    resetMs: Math.max(0, tracker.resetTime - now),
  };
}

export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }
  return "127.0.0.1";
}
