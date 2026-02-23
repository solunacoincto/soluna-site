import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET() {
  try {
    const data = await redis.get("belief:v2");

    if (!data) {
      return NextResponse.json(
        { error: "Belief v2 not initialized yet" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch belief v2" },
      { status: 500 }
    );
  }
}