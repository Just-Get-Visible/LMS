import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    const supabase = await createClient();
    // Minimal connectivity check. Doesn't expose any data — `head: true`
    // sends no rows back, just confirms the request succeeded.
    const { error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "degraded",
          db: "error",
          error: error.message,
          latency_ms: Date.now() - startedAt,
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      status: "ok",
      db: "ok",
      latency_ms: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        status: "down",
        error: e instanceof Error ? e.message : "unknown",
        latency_ms: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
