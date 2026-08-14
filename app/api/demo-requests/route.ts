import { NextRequest, NextResponse } from "next/server";
import { validateDemoRequest } from "@/lib/demo-request";
import { appendDemoRequest } from "@/lib/google-sheets";

export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function clientAddress(request: NextRequest) {
  return request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || entry.resetAt <= now) {
    rateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Content type must be application/json." }, { status: 415 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 12_000) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  }

  if (isRateLimited(clientAddress(request))) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, {
      status: 429,
      headers: { "Retry-After": "900" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = validateDemoRequest(body);
  if (!result.data) {
    return NextResponse.json({ error: result.error || "Please check your answers." }, { status: 400 });
  }

  if (result.data.formStartedAt && Date.now() - result.data.formStartedAt < 2_000) {
    return NextResponse.json({ error: "Unable to submit this request." }, { status: 400 });
  }

  try {
    await appendDemoRequest(result.data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Demo request submission failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We could not save your request. Please try again." }, { status: 503 });
  }
}
