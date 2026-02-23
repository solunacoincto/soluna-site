import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET() {
  try {
    // Na razie testowy belief
    const belief = 50;

    const result = {
      belief,
      phase: "Test Phase",
      state: "Initialization",
      updatedAt: Date.now(),
    };

    await redis.set("belief:v2", result);

    return NextResponse.json({
      status: "updated",
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update belief" },
      { status: 500 }
    );
  }
}