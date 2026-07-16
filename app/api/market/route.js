import { unstable_cache } from "next/cache";
import { FALLBACK_MARKET_SNAPSHOT, TGJU_SOURCES, fetchTgjuSnapshot } from "@/lib/tgju";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const getHourlySnapshot = unstable_cache(
  fetchTgjuSnapshot,
  ["talanama-tgju-hourly-v1"],
  { revalidate: 3600 }
);

function fallbackPayload() {
  return {
    status: "fallback",
    updatedAt: FALLBACK_MARKET_SNAPSHOT.updatedAt,
    cacheSeconds: 300,
    data: FALLBACK_MARKET_SNAPSHOT.data,
    sources: Object.fromEntries(
      Object.values(TGJU_SOURCES).map((source) => [source.id, { url: source.url, available: false }])
    )
  };
}

export async function GET() {
  try {
    const snapshot = await getHourlySnapshot();
    return Response.json(snapshot, {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        "X-Talanama-Source": "tgju"
      }
    });
  } catch {
    return Response.json(fallbackPayload(), {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
        "X-Talanama-Source": "fallback"
      }
    });
  }
}
