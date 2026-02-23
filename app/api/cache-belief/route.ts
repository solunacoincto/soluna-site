// app/api/cache-belief/route.ts
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET() {
  try {
    // Pobranie bieżącego belief
    const res = await fetch(`${process.env.BASE_URL}/api/update-belief-v2`, {
      cache: "no-store",
    });
    const data = await res.json();
    const belief = data.result.belief;

    // Pobranie obecnej historii (tablica beliefów)
    const history: number[] = (await redis.get("belief:dailyHistory")) || [];

    // Dodanie nowego belief na koniec
    history.push(belief);

    // Opcjonalnie: ograniczenie do np. ostatnich 30 dni
    const trimmedHistory = history.slice(-30);

    // Zapis do Redis
    await redis.set("belief:dailyHistory", trimmedHistory);

    return NextResponse.json({
      status: "cached",
      today: belief,
      history: trimmedHistory,
    });
  } catch (error) {
    console.error("Failed to cache daily belief:", error);
    return NextResponse.json(
      { status: "error", message: (error as any).message },
      { status: 500 }
    );
  }
}