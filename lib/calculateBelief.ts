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

    if (!res.ok) return { priceChange7d: 0 };

    const data: any = await res.json();
    const priceChange7d =
      data.market_data?.price_change_percentage_7d_in_currency?.usd ?? 0;

    return { priceChange7d };
  } catch {
    return { priceChange7d: 0 };
  }
}

async function fetchDexData(address: string) {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`
    );
    if (!res.ok) return { h6Change: 0 };

    const data: any = await res.json();
    const firstPair =
      data.pairs && data.pairs.length > 0 ? data.pairs[0] : null;

    return { h6Change: firstPair?.priceChange?.h6 ?? 0 };
  } catch {
    return { h6Change: 0 };
  }
}

async function fetchSolanaTvlData() {
  try {
    const res = await fetch(
      'https://api.llama.fi/v2/historicalChainTvl/Solana'
    );
    if (!res.ok) return { tvlYesterday: 0, tvl7dBase: 0 };

    const data: any[] = await res.json();
    if (!Array.isArray(data) || data.length < 8)
      return { tvlYesterday: 0, tvl7dBase: 0 };

    const sorted = data.sort((a, b) => a.date - b.date);
    const lastIndex = sorted.length - 1;

    const tvlYesterday = sorted[lastIndex - 1]?.tvl ?? 0;

    const last7 = sorted.slice(lastIndex - 7, lastIndex);
    const tvl7dBase =
      last7.reduce((sum, item) => sum + (item.tvl ?? 0), 0) / last7.length;

    return { tvlYesterday, tvl7dBase };
  } catch {
    return { tvlYesterday: 0, tvl7dBase: 0 };
  }
}

async function fetchSolanaDexVolumeData() {
  try {
    const res = await fetch(
      'https://api.llama.fi/overview/dexs/Solana?excludeTotalDataChart=false&excludeTotalDataChartBreakdown=true'
    );
    if (!res.ok) return { volumeYesterday: 0, volume7dBase: 0 };

    const data: any = await res.json();
    const dailyData = data?.totalDataChart;

    if (!Array.isArray(dailyData) || dailyData.length < 8)
      return { volumeYesterday: 0, volume7dBase: 0 };

    const sorted = dailyData.sort((a, b) => a[0] - b[0]);
    const lastIndex = sorted.length - 1;

    const volumeYesterday = sorted[lastIndex - 1]?.[1] ?? 0;

    const last7 = sorted.slice(lastIndex - 7, lastIndex);
    const volume7dBase =
      last7.reduce((sum, item) => sum + (item[1] ?? 0), 0) / last7.length;

    return { volumeYesterday, volume7dBase };
  } catch {
    return { volumeYesterday: 0, volume7dBase: 0 };
  }
}

export async function calculateBelief() {
  const solanaData = await fetchSolanaData();
  const dexData = await fetchDexData(tokenAddress);
  const solanaTvlData = await fetchSolanaTvlData();
  const solanaVolumeData = await fetchSolanaDexVolumeData();

  const priceChange7dComponent = 0.4 * solanaData.priceChange7d;
  const h6ChangeComponent = 0.3 * dexData.h6Change;

  const tvlDifference =
    solanaTvlData.tvl7dBase > 0
      ? ((solanaTvlData.tvlYesterday - solanaTvlData.tvl7dBase) /
          solanaTvlData.tvl7dBase) *
        100
      : 0;

  const tvlComponent = 0.2 * tvlDifference;

  const volumeDifference =
    solanaVolumeData.volume7dBase > 0
      ? ((solanaVolumeData.volumeYesterday -
          solanaVolumeData.volume7dBase) /
          solanaVolumeData.volume7dBase) *
        100
      : 0;

  const volumeComponent = 0.07 * volumeDifference;

  const componentSum =
    (priceChange7dComponent +
      h6ChangeComponent +
      tvlComponent +
      volumeComponent) *
    3.5;

  const beliefRaw = 50 + componentSum;
  const finalBeliefRaw = parseFloat(
    Math.max(0, Math.min(100, beliefRaw)).toFixed(1)
  );

  // smoothing
  const dailyHistoryKey = 'belief:dailyHistory';
  const lastUpdateKey = 'belief:lastUpdateTime';

  let yesterdayBelief = 50;
  let lastUpdate = 0;

  try {
    const history = await redis.lrange(dailyHistoryKey, -1, -1);
    if (history.length > 0) {
      const lastValue = parseFloat(history[0]);
      if (!isNaN(lastValue)) yesterdayBelief = lastValue;
    }

    const lastTimeStr = await redis.get(lastUpdateKey);
    lastUpdate = Number(lastTimeStr) || 0;
  } catch {}

  const now = Date.now();
  let smoothedBelief = yesterdayBelief;

  if (now - lastUpdate >= 10 * 60 * 1000) {
    smoothedBelief = parseFloat(
      (0.5 * yesterdayBelief + 0.5 * finalBeliefRaw).toFixed(1)
    );

    try {
      await redis.rpush(dailyHistoryKey, smoothedBelief.toString());
      await redis.ltrim(dailyHistoryKey, -30, -1);
      await redis.set(lastUpdateKey, now.toString());
    } catch {}
  }

  const finalBelief = parseFloat(smoothedBelief.toFixed(1));

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

  return {
    belief: finalBelief,
    phase,
    state,
    solanaData,
    dexData,
    solanaTvlData,
    solanaVolumeData,
  };
}