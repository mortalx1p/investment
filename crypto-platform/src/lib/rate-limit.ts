// src/lib/rate-limit.ts
import { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(
  request: NextRequest,
  { limit = 10, windowMs = 60000 }: { limit?: number; windowMs?: number } = {}
): { success: boolean; remaining: number } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const entry = rateLimitMap.get(ip);
  
  if (!entry || entry.lastReset < windowStart) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return { success: true, remaining: limit - 1 };
  }
  
  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }
  
  entry.count++;
  return { success: true, remaining: limit - entry.count };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitMap.forEach((value, key) => {
    if (value.lastReset < now - 60000) keysToDelete.push(key);
  });
  keysToDelete.forEach(k => rateLimitMap.delete(k));
}, 60000);
