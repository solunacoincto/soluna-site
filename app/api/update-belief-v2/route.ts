import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const tokenAddress = 'Cm6fNnMk7NfzStP9CZpsQA2v3jjzbcYGAxdJySmHpump';
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

async function fetchSolanaData() {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/solana?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false'
      );
      if (res.status === 429) {
        if (attempt === maxRetries) {
          // Po 3 próbach błąd 429, zwróć ostatnią wartość z Redis lub 0
          try {
            const lastValueStr = await redis.get('belief:lastSolanaPriceChange7d');
            const lastValue = (typeof lastValueStr === 'string' && !isNaN(parseFloat(lastValueStr))) ? parseFloat(lastValueStr) : 0;
            return { priceChange7d: isNaN(lastValue) ? 0 : lastValue };
          } catch (redisErr) {
            console.error('Error fetching lastSolanaPriceChange7d from Redis:', redisErr);
            return { priceChange7d: 0 };
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
      }
      if (!res.ok) {
        console.error(`Error fetching Solana data: HTTP status ${res.status}`);
        return { priceChange7d: 0 };
      }
      let data: any;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error('Error parsing Solana JSON:', jsonError);
        return { priceChange7d: 0 };
      }
      const priceChange7d = data.market_data?.price_change_percentage_7d_in_currency?.usd ?? 0;
      try {
        await redis.set('belief:lastSolanaPriceChange7d', priceChange7d.toString(), { ex: 86400 });
      } catch (redisErr) {
        console.error('Error saving lastSolanaPriceChange7d to Redis:', redisErr);
      }
      return { priceChange7d };
    } catch (error) {
      console.error('Error fetching Solana data:', error);
      return { priceChange7d: 0 };
    }
  }
  // fallback, should not reach here
  return { priceChange7d: 0 };
}

async function fetchDexData(address: string) {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    if (!res.ok) {
      console.error(`Error fetching Dex data: HTTP status ${res.status}`);
      return { h6Change: 0, token: null };
    }
    let data: any;
    try {
      data = await res.json();
    } catch (jsonError) {
      console.error('Error parsing Dex JSON:', jsonError);
      return { h6Change: 0, token: null };
    }
    const firstPair = data.pairs && data.pairs.length > 0 ? data.pairs[0] : null;
    return { h6Change: firstPair?.priceChange?.h6 ?? 0, token: firstPair };
  } catch (error) {
    console.error('Error fetching Dex data:', error);
    return { h6Change: 0, token: null };
  }
}

async function fetchSolanaTvlData() {
  try {
    const res = await fetch('https://api.llama.fi/v2/historicalChainTvl/Solana');
    if (!res.ok) {
      console.error(`Error fetching Solana TVL data: HTTP status ${res.status}`);
      return { tvlYesterday: 0, tvl7dBase: 0 };
    }

    const data: any[] = await res.json();

    if (!Array.isArray(data) || data.length < 8) {
      return { tvlYesterday: 0, tvl7dBase: 0 };
    }

    // sort by date ascending just in case
    const sorted = data.sort((a, b) => a.date - b.date);

    const lastIndex = sorted.length - 1;

    // yesterday = previous full day
    const tvlYesterday = sorted[lastIndex - 1]?.tvl ?? 0;

    // last 7 full days average (excluding today)
    const last7 = sorted.slice(lastIndex - 7, lastIndex);
    const tvl7dBase =
      last7.reduce((sum, item) => sum + (item.tvl ?? 0), 0) / last7.length;

    return { tvlYesterday, tvl7dBase };
  } catch (error) {
    console.error('Error fetching Solana TVL data:', error);
    return { tvlYesterday: 0, tvl7dBase: 0 };
  }
}

async function fetchSolanaDexVolumeData() {
  try {
    const res = await fetch(
      'https://api.llama.fi/overview/dexs/Solana?excludeTotalDataChart=false&excludeTotalDataChartBreakdown=true'
    );
    if (!res.ok) {
      console.error(`Error fetching Solana DEX volume data: HTTP status ${res.status}`);
      return { volumeYesterday: 0, volume7dBase: 0 };
    }

    const data: any = await res.json();

    const dailyData = data?.totalDataChart;

    if (!Array.isArray(dailyData) || dailyData.length < 8) {
      return { volumeYesterday: 0, volume7dBase: 0 };
    }

    // sort by timestamp ascending
    const sorted = dailyData.sort((a, b) => a[0] - b[0]);

    const lastIndex = sorted.length - 1;

    // yesterday = previous full day
    const volumeYesterday = sorted[lastIndex - 1]?.[1] ?? 0;

    // last 7 full days average (excluding today)
    const last7 = sorted.slice(lastIndex - 7, lastIndex);
    const volume7dBase =
      last7.reduce((sum, item) => sum + (item[1] ?? 0), 0) / last7.length;

    return { volumeYesterday, volume7dBase };
  } catch (error) {
    console.error('Error fetching Solana DEX volume data:', error);
    return { volumeYesterday: 0, volume7dBase: 0 };
  }
}

export async function GET() {
  try {
    const solanaData = await fetchSolanaData();
    const dexData = await fetchDexData(tokenAddress);
    const solanaTvlData = await fetchSolanaTvlData();
    const solanaVolumeData = await fetchSolanaDexVolumeData();

    console.log('--- belief debug ---');
    console.log('priceChange7d:', solanaData.priceChange7d);
    console.log('h6Change:', dexData.h6Change);

    // komponenty belief
    const priceChange7dComponent = 0.4 * solanaData.priceChange7d;
    const h6ChangeComponent = 0.2 * dexData.h6Change;

    const tvlDifference =
      solanaTvlData.tvl7dBase > 0
        ? ((solanaTvlData.tvlYesterday - solanaTvlData.tvl7dBase) /
            solanaTvlData.tvl7dBase) *
          100
        : 0;

    const tvlComponent = 0.2 * tvlDifference;

    console.log('priceChange7dComponent:', priceChange7dComponent);
    console.log('h6ChangeComponent:', h6ChangeComponent);
    console.log('tvlDifference %:', tvlDifference);
    console.log('tvlComponent:', tvlComponent);

    console.log('volumeDifference %:', solanaVolumeData.volume7dBase > 0
      ? ((solanaVolumeData.volumeYesterday - solanaVolumeData.volume7dBase) /
          solanaVolumeData.volume7dBase) *
        100
      : 0);
    const volumeDifference =
      solanaVolumeData.volume7dBase > 0
        ? ((solanaVolumeData.volumeYesterday - solanaVolumeData.volume7dBase) /
            solanaVolumeData.volume7dBase) *
          100
        : 0;

    const volumeComponent = 0.07 * volumeDifference;

    console.log('volumeComponent:', volumeComponent);

    // suma komponentów mnożona x3.5 przed dodaniem bazowego 50
    const componentSum =
      (priceChange7dComponent + h6ChangeComponent + tvlComponent + volumeComponent) * 3.5;

    const belief = 50 + componentSum;

    const finalBeliefRaw = parseFloat(Math.max(0, Math.min(100, belief)).toFixed(1));

    // Redis smoothing with rate limiting
    const dailyHistoryKey = 'belief:dailyHistory';
    const lastUpdateKey = 'belief:lastUpdateTime';
    let yesterdayBelief = 50;
    let lastUpdate = 0;

    try {
      // Pobierz ostatni zapisany belief
      const history = await redis.lrange(dailyHistoryKey, -1, -1);
      if (history.length > 0) {
        const lastValue = parseFloat(history[0]);
        if (!isNaN(lastValue)) yesterdayBelief = lastValue;
      }

      // Pobierz czas ostatniego smoothingu
      const lastTimeStr = await redis.get(lastUpdateKey);
      lastUpdate = Number(lastTimeStr) || 0;
    } catch (err) {
      console.error('Error fetching belief history or last update time from Redis:', err);
    }

    // aktualny timestamp
    const now = Date.now();

    // smoothing rate-limited to 10 minutes
    let smoothedBelief = yesterdayBelief;
    if (now - lastUpdate >= 10 * 60 * 1000) {
      smoothedBelief = parseFloat((0.5 * yesterdayBelief + 0.5 * finalBeliefRaw).toFixed(1));
      try {
        // zapis do Redis
        await redis.rpush(dailyHistoryKey, smoothedBelief.toString());
        await redis.ltrim(dailyHistoryKey, -30, -1);
        await redis.set(lastUpdateKey, now.toString());
      } catch (err) {
        console.error('Error saving belief or last update time to Redis:', err);
      }
    }

    // finalBelief recalculated on every refresh
    let finalBelief = smoothedBelief;
    finalBelief = parseFloat(finalBelief.toFixed(1));

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
        solanaTvlData,
        solanaVolumeData,
      },
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: (error as any).message });
  }
}