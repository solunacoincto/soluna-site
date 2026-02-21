export default function ChroniclePage() {
  return (
    <main className="bg-black text-white min-h-screen px-6 py-24">
      <div className="max-w-2xl mx-auto">

        <div className="mb-16">
          <h1 className="text-5xl font-semibold tracking-tight">
            Chronicle of Phases
          </h1>

          <p className="text-white/30 text-sm mt-4 tracking-wide">
            An ongoing structural archive.
          </p>
        </div>

        <div className="space-y-20">

          {/* Genesis */}
          <div className="space-y-4">
            <p className="text-white/40 text-sm tracking-wide">
              Foundational Document
            </p>

            <a href="/chronicle/genesis" className="block group">
              <h2 className="text-3xl font-semibold group-hover:text-white transition">
                Genesis
              </h2>

              <p className="text-white/50 mt-2">
                The emergence of reflection within chaos.
              </p>
            </a>
          </div>

          <div className="border-t border-white/10 my-16" />

          {/* Lunation 001 - Forming */}
          <div className="space-y-4 opacity-70">
            <p className="text-white/40 text-sm tracking-wide">
              Lunation 001
            </p>

            <div>
              <h2 className="text-3xl font-semibold">
                Forming
              </h2>

              <p className="text-white/50 mt-2">
                Observations accumulating under the current cycle.
              </p>

              <div className="mt-6 text-xs text-white/40 tracking-wide space-y-2">
                <p>17 Feb 2026 → 19 Mar 2026</p>
                <p className="text-white/30">
                  Illumination: 3 Mar 2026
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}