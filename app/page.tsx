import { headers } from "next/headers";

export default async function Home() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  if (!host) {
    throw new Error("Missing host header");
  }

  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/update-belief-v2`, {
    cache: "no-store",
  });

  const beliefData = await res.json();

  const pulseRes = await fetch(`${protocol}://${host}/api/update-pulse`, {
    cache: "no-store",
  });

  const pulseData = await pulseRes.json();

  function getIndexState(belief: number) {
    if (belief < 25) return "Capitulation";
    if (belief < 50) return "Accumulation";
    if (belief < 75) return "Expansion";
    return "Euphoria";
  }

  const indexState = getIndexState(beliefData.result.belief);

  const auraMap: Record<string, string> = {
    "New Moon": "bg-blue-500/5",
    "First Quarter": "bg-emerald-500/5",
    "Full Moon": "bg-amber-500/5",
    "Third Quarter": "bg-slate-400/5",
  };

  const auraClass = auraMap[beliefData.result.phase] || "bg-white/5";

  return (
    <main className="relative bg-black text-white min-h-[90vh] px-6 py-10 overflow-hidden">
      <div
        className={`absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] ${auraClass} rounded-full blur-3xl pointer-events-none transition-colors duration-700`}
      />

      <div className="max-w-2xl mx-auto">

        {/* HERO */}
        <section className="mb-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold mb-6 tracking-[-0.03em]">
            $SOLUNA
          </h1>

          <p className="text-lg text-white/40 mt-2 tracking-wide">
            The cultural reflection of Solana.
          </p>

          {/* CURRENT PHASE */}
          <div className="mt-12 flex items-start gap-16">
            <div className="space-y-2">
              <p className="text-xs text-white/30 tracking-[0.2em] uppercase">
                Memecoin Phase
              </p>

              <p className="text-3xl font-semibold text-white tracking-[-0.01em]">
                {beliefData.result.phase}
              </p>

              <p className="text-white/40 text-sm tracking-wide">
                Belief {beliefData.result.belief} · {indexState}
              </p>
            </div>

            <div className="space-y-2 min-w-[200px]">
              <p className="text-xs text-white/30 tracking-[0.2em] uppercase">
                Soluna Momentum
              </p>

              <p className="text-3xl font-semibold text-white tracking-[-0.01em]">
                {pulseData.state}
              </p>

              <p className="text-white/40 text-sm tracking-wide">
                Pulse {pulseData.pulse}
              </p>
            </div>
          </div>
        </section>

        {/* REFLECTION */}
        <section className="mb-12 space-y-6 text-[19px] leading-[1.75] text-white/70">
          <p>This is the current reflection of Solana.</p>

          <p>Solana is speed. Solana is chaos. Solana is trenches.</p>

          <p>It expands. It contracts. It survives.</p>

          <p>Every ecosystem eventually reveals its own emotional cycle.</p>

          <section className="mt-4">
            <a
              href="/soluna-system"
              className="text-lg text-white hover:text-white transition tracking-wide"
            >
              Enter the Soluna System →
            </a>
          </section>
        </section>

        {/* PHASES */}
        <section className="mb-8 space-y-5 text-[20px] leading-[1.7] text-white/60">
          <h2 className="text-3xl font-semibold text-white mb-4 tracking-[-0.01em]">
            Phases
          </h2>

          <p>Markets move in cycles.</p>

          <p>Structure determines outcome. Narrative explains it later.</p>

          <p>Accumulation. Expansion. Mania. Capitulation.</p>

          <p>The moon does not shine. It reflects.</p>
        </section>

        <section className="mt-6">
          <a
            href="/chronicle"
            className="text-lg text-white hover:text-white transition tracking-wide"
          >
            Enter the Chronicle →
          </a>
        </section>

      </div>
    </main>
  );
}