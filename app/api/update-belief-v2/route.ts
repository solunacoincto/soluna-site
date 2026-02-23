import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const tokenAddress = 'Cm6fNnMk7NfzStP9CZpsQA2v3jjzbcYGAxdJySmHpump';
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

async function fetchSolanaData() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/solana?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false'
    );
    const data: any = await res.json();
    return { priceChange7d: data.market_data?.price_change_percentage_7d_in_currency?.usd ?? 0 };
  } catch {
    return { priceChange7d: 0 };
  }
}

async function fetchDexData(address: string) {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    const data: any = await res.json();
    const firstPair = data.pairs && data.pairs.length > 0 ? data.pairs[0] : null;
    return { h6Change: firstPair?.priceChange?.h6 ?? 0, token: firstPair };
  } catch {
    return { h6Change: 0, token: null };
  }
}

async function fetchRaydiumData() {
  try {
    const res = await fetch('https://api-v3.raydium.io/main/info');
    const data: any = await res.json();
    return { tvl: data.data?.tvl ?? 0, volume24: data.data?.volume24 ?? 0 };
  } catch {
    return { tvl: 0, volume24: 0 };
  }
}

export async function GET() {
  try {
    const solanaData = await fetchSolanaData();
    const dexData = await fetchDexData(tokenAddress);
    const raydiumData = await fetchRaydiumData();

    const tvlBase = 1377004559.162567;
    const volumeBase = 318668084.57249504;

    const normalizedTvl = raydiumData.tvl / tvlBase;
    const normalizedVolume = raydiumData.volume24 / volumeBase;

    console.log('--- belief debug ---');
    console.log('priceChange7d:', solanaData.priceChange7d);
    console.log('h6Change:', dexData.h6Change);
    console.log('normalizedTvl:', normalizedTvl);
    console.log('normalizedVolume:', normalizedVolume);

    // komponenty belief
    const priceChange7dComponent = 0.4 * solanaData.priceChange7d;
    const h6ChangeComponent = 0.2 * dexData.h6Change;
    const volumeComponent = 0.025 * normalizedVolume * 5;
    const tvlComponent = 0.025 * normalizedTvl * 5;

    console.log('priceChange7dComponent:', priceChange7dComponent);
    console.log('h6ChangeComponent:', h6ChangeComponent);
    console.log('volumeComponent (5x):', volumeComponent);
    console.log('tvlComponent (5x):', tvlComponent);

    // suma komponentów mnożona x10 przed dodaniem bazowego 50
    const componentSum = (priceChange7dComponent + h6ChangeComponent + volumeComponent + tvlComponent) * 5;

    const belief = 50 + componentSum;

    const finalBeliefRaw = parseFloat(Math.max(0, Math.min(100, belief)).toFixed(1));

    // Redis smoothing
    const dailyHistoryKey = 'belief:dailyHistory';
    let yesterdayBelief = 50;

    try {
      const history = await redis.lrange(dailyHistoryKey, -1, -1);
      if (history.length > 0) {
        const lastValue = parseFloat(history[0]);
        if (!isNaN(lastValue)) yesterdayBelief = lastValue;
      }
    } catch (err) {
      console.error('Error fetching belief history from Redis:', err);
    }

    const finalBelief = parseFloat((0.5 * yesterdayBelief + 0.5 * finalBeliefRaw).toFixed(1));

    // zapis do Redis
    try {
      await redis.rpush(dailyHistoryKey, finalBelief.toString());
      await redis.ltrim(dailyHistoryKey, -30, -1);
    } catch (err) {
      console.error('Error saving belief to Redis:', err);
    }

    let phase = '';
    let state = '';
    if (finalBelief <= 25) {
      phase = 'New Moon';
      state = 'Disorientation';
    } else if (finalBelief <= 45) {
      phase = 'Waning Crescent';
      state = 'Contraction';
    } else if (finalBelief <= 75) {
      phase = 'Full Moon';
      state = 'Illumination';
    } else {
      phase = 'Waxing Gibbous';
      state = 'Expansion';
    }

    return NextResponse.json({
      status: 'updated',
      result: {
        belief: finalBelief,
        phase,
        state,
        updatedAt: Date.now(),
        solanaData,
        dexData,
        raydiumData,
      },
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: (error as any).message });
  }
}