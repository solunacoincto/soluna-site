import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET() {
  try {
    const CACHE_KEY = "soluna:belief";
    const TWELVE_HOURS = 60 * 60 * 12;

    // 1️⃣ Check cache first
    const cached = await redis.get(CACHE_KEY);

    if (cached) {
      return NextResponse.json(cached);
    }

    // 2️⃣ Fetch fresh data if no cache
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/solana?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"
    );

    const data = await res.json();
    const change7d = data.market_data.price_change_percentage_7d;

    let belief = 50 + change7d * 1.5;
    belief = Math.max(0, Math.min(100, belief));

    let phase = "";
    let state = "";

    if (belief <= 25) {
      phase = "New Moon";
      state = "Disorientation";
    } else if (belief <= 45) {
      phase = "Waning";
      state = "Contraction";
    } else if (belief <= 65) {
      phase = "First Quarter";
      state = "Accumulation";
    } else if (belief <= 85) {
      phase = "Gibbous";
      state = "Expansion";
    } else {
      phase = "Full Moon";
      state = "Illumination";
    }

    const result = {
      belief: Math.round(belief),
      phase,
      state,
      updatedAt: Date.now(),
    };

    // 3️⃣ Store in Redis for 12 hours
    await redis.set(CACHE_KEY, result, { ex: TWELVE_HOURS });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to calculate belief index" },
      { status: 500 }
    );
  }
}