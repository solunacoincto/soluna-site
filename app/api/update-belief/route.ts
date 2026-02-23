// app/api/update-belief/route.ts
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET() {
  try {
    const belief = 50;

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

    const result = { belief, phase, state, updatedAt: Date.now() };
    await redis.set("belief:v2", result);

    return NextResponse.json({ status: "updated", result });
  } catch (error) {
    console.error("Failed to update belief:", error);
    return NextResponse.json({ error: "Failed to update belief" }, { status: 500 });
  }
}