import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch fresh data from CoinGecko
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/solana?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"
    );

    const data = await res.json();
    const change7d =
      data.market_data.price_change_percentage_7d_in_currency?.usd ?? 0;

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

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to calculate belief index" },
      { status: 500 }
    );
  }
}