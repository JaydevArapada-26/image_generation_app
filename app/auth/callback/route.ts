import { type NextRequest, NextResponse } from "next/server";

/**
 * Legacy redirect: old email links point to /auth/callback
 * Forward them to the actual callback handler at /callback
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  // Preserve all query params (code, next, etc.) and forward to /callback
  const newUrl = new URL("/callback", requestUrl.origin);
  newUrl.search = requestUrl.search;
  return NextResponse.redirect(newUrl, 301);
}
