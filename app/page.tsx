export default function Home() {
  return (
    <main className="relative bg-black text-white min-h-screen px-6 py-16 overflow-hidden">
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto">

        {/* HERO */}
        <section className="mb-20">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold mb-8 tracking-[-0.02em]">
            $SOLUNA
          </h1>

          <p className="text-xl text-white/50 mt-2">
            The cultural reflection of Solana.
          </p>
        </section>

        {/* REFLECTION */}
        <section className="mb-20 space-y-6 text-[20px] leading-[1.7] text-white/70">
          <p>
            Solana is speed. Solana is chaos. Solana is trenches.
          </p>

          <p>
            It expands. It crashes. It survives.
          </p>

          <p>
            Every ecosystem eventually creates its own reflection.
          </p>
        </section>

        {/* PHASES */}
        <section className="mb-20 space-y-6 text-[20px] leading-[1.7] text-white/70">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Phases
          </h2>

          <p>
            Markets move in cycles.
          </p>

          <p>
            Structure determines outcome. Narrative explains it later.
          </p>

          <p>
            Accumulation. Expansion. Mania. Capitulation.
          </p>

          <p>
            The moon does not shine. It reflects.
          </p>
        </section>

        <section className="mt-24">
          <a
            href="/chronicle"
            className="text-xl text-white/70 hover:text-white transition tracking-wide"
          >
            Enter the Chronicle →
          </a>
        </section>

      </div>
    </main>
  );
}