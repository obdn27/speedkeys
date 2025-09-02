// same helpers as before
function hueFor(ms, minMs, maxMs, hueStartDeg) {
    if (maxMs <= minMs) return `hsl(${hueStartDeg} 90% 60%)`;
    const t = Math.min(1, Math.max(0, (ms - minMs) / (maxMs - minMs)));
    const hue = (hueStartDeg - 120 * t + 360) % 360;
    return `hsl(${hue} 90% 60%)`;
}
function msFmt(x) { return `${Math.round(x)}ms`; }

// totals chip colors
function colorForTotal(ms) {
    if (ms <= 200) return "bg-[#9be7ff] text-black";
    if (ms <= 350) return "bg-[#7fdca5] text-black";
    if (ms <= 500) return "bg-[#ffd98e] text-black";
    if (ms <= 700) return "bg-[#ffb3a1] text-black";
    return "bg-[#ff8da3] text-black";
}

export default function TimerStats({
    splits,
    attempts,
    currentTimeMs,
    onClear,
    hueStartDeg = 120,
    className = "",
}) {
    const minSplit = splits.length ? Math.min(...splits) : 0;
    const maxSplit = splits.length ? Math.max(...splits) : 1;

    return (
        <div className={`rounded-xl border border-app-border bg-app-bg ${className}`}>
            <div className="grid grid-cols-[1fr_auto] gap-3 p-3">
                {/* LEFT: current breakdown */}
                <div className="rounded-lg border border-app-border/70 p-3">
                    <div className="flex items-baseline justify-between">
                        <div className="text-sm font-semibold">Current sequence</div>
                        <div className="text-xs text-app-subtext">
                            time:&nbsp;
                            <span className="font-mono font-semibold text-app-text">
                                {currentTimeMs == null ? "—" : msFmt(currentTimeMs)}
                            </span>
                        </div>
                    </div>

                    {splits.length === 0 ? (
                        <div className="mt-2 text-sm text-app-subtext">No steps completed yet.</div>
                    ) : (
                        <ul className="mt-2 space-y-1">
                            {splits.map((ms, i) => (
                                <li key={i} className="flex items-baseline gap-3">
                                    <div className="text-sm font-semibold">[{i + 1}]</div>
                                    <div className="text-sm text-app-subtext">Δ</div>
                                    <div
                                        className="text-sm font-mono"
                                        style={{ color: hueFor(ms, minSplit, maxSplit, hueStartDeg) }}
                                    >
                                        {msFmt(ms)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* RIGHT: vertical totals list + Clear */}
                <div className="flex flex-col items-end">
                    <div className="text-sm font-semibold mb-2">Totals</div>
                    <div className="flex flex-col gap-2 items-end">
                        {attempts.length === 0 ? (
                            <span className="text-xs text-app-subtext">No runs yet.</span>
                        ) : (
                            attempts.slice().reverse().map((t, i) => (
                                <span key={i} className={`px-2 py-1 rounded-md text-xs font-mono ${colorForTotal(t)}`}>
                                    {msFmt(t)}
                                </span>
                            ))
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClear}
                        className="mt-3 px-3 py-1.5 rounded-md bg-app-panel hover:bg-app-hover text-sm border border-app-border"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}
