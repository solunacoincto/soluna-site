import { NextResponse } from "next/server";

// --- CONFIG ---
// Replace with your actual Google Sheet ID and sheet name
const SHEET_ID = process.env.SOLUNA_SHEET_ID || "YOUR_SPREADSHEET_ID";
const SHEET_NAME = process.env.SOLUNA_SHEET_NAME || "data";

// Pulse state helper
function getPulseState(pulse: number) {
  if (pulse < 0.3) return "Dormant";
  if (pulse < 0.6) return "Quiet";
  if (pulse < 1.0) return "Active";
  if (pulse < 1.5) return "Expansion";
  return "Mania";
}

export async function GET() {
  try {
    const url = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(
      SHEET_NAME
    )}`;

    const res = await fetch(url, {
      cache: "no-store",
    });

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No data returned from sheet" }, { status: 500 });
    }

    // Find last row that actually has SOLUNA PULSE filled
let pulseRaw: any = null;

for (let i = data.length - 1; i >= 0; i--) {
  const row = data[i];

  const value =
    row["SOLUNA PULSE"] ??
    row["Soluna Pulse"] ??
    row["SOLUNA_PULSE"] ??
    row["pulse"];

  if (value !== undefined && value !== null && value !== "") {
    pulseRaw = value;
    break;
  }
}

    const normalized = typeof pulseRaw === "string" ? pulseRaw.replace(",", ".") : pulseRaw;
    const pulseValue = Number(normalized);

    const pulse = Number.isFinite(pulseValue) ? pulseValue : null;

    const state = pulse !== null ? getPulseState(pulse) : null;

    return NextResponse.json({
      pulse,
      state,
      updated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Pulse update error:", err);

    return NextResponse.json(
      { error: "Failed to fetch pulse" },
      { status: 500 }
    );
  }
}
