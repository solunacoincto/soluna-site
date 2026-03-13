export default function BeliefSystemPage() {
  return (
    <main className="bg-black text-white min-h-screen px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-semibold tracking-wide mb-8">Explore the Soluna System</h1>

        <p className="text-white/30 mb-6 leading-relaxed">
          The Soluna System is a dual‑signal framework designed to help interpret the current state of the memecoin market. It combines two complementary indicators: the Belief Index and Soluna Momentum.
        </p>

        <p className="text-white/30 mb-12 leading-relaxed">
          Belief reflects the emotional cycle of the memecoin market as a whole, while Momentum measures real on‑chain participation around the Soluna trading pair on Solana. Belief helps interpret the broader market environment, while Momentum shows the current activity specifically around the Soluna coin.
        </p>

        <div className="grid md:grid-cols-2 gap-12 mb-10">
          <div>
            <h2 className="text-3xl font-semibold tracking-wide mb-4">Soluna Momentum</h2>

            <ul className="list-disc list-inside text-white/30 space-y-2 leading-relaxed">
              <li>24‑hour trading volume</li>
              <li>Buy vs sell pressure</li>
              <li>Unique wallet activity</li>
              <li>Liquidity dynamics of the trading pair</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-semibold tracking-wide mb-4">Pulse Scale</h2>
            <ul className="list-disc list-inside text-white/30 space-y-2 leading-relaxed">
              <li>0.0 – 0.3 · Dormant</li>
              <li>0.3 – 0.6 · Quiet</li>
              <li>0.6 – 1.0 · Active</li>
              <li>1.0 – 1.5 · Expansion</li>
              <li>1.5+ · Mania</li>
            </ul>
          </div>
        </div>


        <div className="grid md:grid-cols-2 gap-12 mt-4 mb-10">
          <div>
            <h2 className="text-3xl font-semibold tracking-wide mb-4">Belief Index</h2>

            <ul className="list-disc list-inside text-white/30 space-y-2 leading-relaxed">
              <li>SOL price change over the past 7 days</li>
              <li>Buttcoin short-term momentum (last 6 hours)</li>
              <li>Normalized DEX 24-hour liquidity (TVL)</li>
              <li>Normalized DEX 24-hour trading volume</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-semibold tracking-wide mb-4">Index Scale</h2>

            <ul className="list-disc list-inside text-white/30 space-y-2 leading-relaxed">
              <li>0 – 25 · Capitulation</li>
              <li>25 – 50 · Accumulation</li>
              <li>50 – 75 · Expansion</li>
              <li>75 – 100 · Euphoria</li>
            </ul>
          </div>
        </div>

        <h3 className="text-2xl font-semibold tracking-wide mb-4">Mechanics by Phase and Belief</h3>
        <p className="text-white/30 mb-6 leading-relaxed">
          The Soluna protocol reacts to market conditions through predefined mechanics. Depending on the current lunar phase and the level of the Belief Index, specific actions such as buybacks, burns, treasury accumulation, or visibility boosts may be triggered.
        </p>
        <div className="overflow-x-auto mb-10">
          <table className="w-full border-collapse border border-white/20 text-sm">
            <thead>
              <tr>
                <th className="border border-white/20 px-4 py-2 text-left text-white/50">Phase</th>
                <th className="border border-white/20 px-4 py-2 text-left text-white/50">Belief</th>
                <th className="border border-white/20 px-4 py-2 text-left text-white/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-white/20 px-4 py-2">Full Moon</td>
                <td className="border border-white/20 px-4 py-2">Any</td>
                <td className="border border-white/20 px-4 py-2">
                  Lock all Strategic Treasury reserves for 365 days
                </td>
              </tr>
              <tr>
                <td className="border border-white/20 px-4 py-2">First / Third Quarter</td>
                <td className="border border-white/20 px-4 py-2">Any</td>
                <td className="border border-white/20 px-4 py-2">
                  Buyback 0.2% of supply → 0.1% Burn + 0.1% Strategic Treasury Reserve
                </td>
              </tr>
              <tr>
                <td className="border border-white/20 px-4 py-2">Any Day</td>
                <td className="border border-white/20 px-4 py-2">Belief &lt; 25</td>
                <td className="border border-white/20 px-4 py-2">
                  Buyback 0.1% of supply → Strategic Treasury Reserve (max once per 24 hours)
                </td>
              </tr>
              <tr>
                <td className="border border-white/20 px-4 py-2">Any Day</td>
                <td className="border border-white/20 px-4 py-2">Belief &gt; 75</td>
                <td className="border border-white/20 px-4 py-2">
                  Deploy Dexscreener boost using wallet fees (max once per 24 hours)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-white/30 mb-10 leading-relaxed">
          Strategic Treasury reserves accumulate through structural buybacks during First and Third Quarter phases and opportunistic accumulation when Belief falls below 25. All accumulated reserves are locked for 365 days during each Full Moon. Belief‑triggered actions are limited to one execution per 24 hours within the Soluna market cycle.
        </p>
      </div>
    </main>
  );
}