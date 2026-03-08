export default function BeliefSystemPage() {
  return (
    <main className="bg-black text-white min-h-screen px-6 py-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-semibold tracking-wide mb-8">Explore the Belief System</h1>

        <p className="text-white/30 mb-6 leading-relaxed">
          The Belief Index reflects the sentiment within the Soluna ecosystem by analyzing price fluctuations, liquidity, volume, and other key market indicators. It captures both the emotional and structural dynamics of the market, guiding our strategic decisions.
        </p>

        <p className="text-white/30 mb-12 leading-relaxed">
          Each lunar phase influences behavior and decision-making within the ecosystem, while the Belief Index quantifies sentiment on a scale from 0 to 100. This score drives actions such as buybacks, burns, locks, and boosts.
        </p>

        <h2 className="text-3xl font-semibold tracking-wide mb-4">Components of the Belief Index</h2>
        <ul className="list-disc list-inside text-white/30 mb-12 space-y-2 leading-relaxed">
          <li>SOL price change over the past 7 days</li>
          <li>Buttcoin short-term momentum (last 6 hours)</li>
          <li>Normalized DEX 24-hour liquidity (TVL)</li>
          <li>Normalized DEX 24-hour trading volume</li>
        </ul>

        <h2 className="text-3xl font-semibold tracking-wide mb-6">Mechanics by Phase and Belief</h2>
        <div className="overflow-x-auto mb-12">
          <table className="w-full border-collapse border border-white/20">
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

        <p className="text-white/30 mb-12 leading-relaxed">
          Strategic Treasury reserves accumulate through structural buybacks during First and Third Quarter phases and opportunistic accumulation when Belief falls below 25. All accumulated reserves are locked for 365 days during each Full Moon. Belief-triggered actions are limited to one execution per 24 hours.
        </p>
      </div>
    </main>
  );
}