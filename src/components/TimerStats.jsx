// HSV→HSL-ish via CSS hsl(): we just vary hue; keep s/l fixed.
// hueStartDeg = where "best" (shortest) maps on wheel (e.g., 120 = green).
// We normalize split times against maxSplit for current run.
function hueFor(ms, minMs, maxMs, hueStartDeg) {
    if (maxMs <= minMs) return hueStartDeg;
    const t = Math.min(1, Math.max(0, (ms - minMs) / (maxMs - minMs))); // 0..1
    // Best (t=0) -> hueStartDeg; worst (t=1) -> hueStartDeg - 120deg (toward red by default)
    const hue = (hueStartDeg - 120 * t + 360) % 360;
    return `hsl(${hue} 90% 60%)`;
}

function msFmt(x) { return `${Math.round(x)}ms`; }

export default function TimerStats({ splits, attempts, currentTimeMs, onClear, hueStartDeg = 120 }) {
    const minSplit = splits.length ? Math.min(...splits) : 0;
    const maxSplit = splits.length ? Math.max(...splits) : 1;

    return (
        <div className="px-4 py-4">
            <div className="grid grid-cols-[1fr_auto] gap-4 rounded-xl border border-app-border bg-app-bg p-4">
                {/* Left: current sequence breakdown */}
                <div>
                    <div className="text-sm font-semibold mb-2">Sequence</div>
                    {splits.length === 0 ? (
                        <div className="text-sm text-app-subtext">No steps completed yet.</div>
                    ) : (
                        <ul className="space-y-1">
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

                {/* Right: timers + attempts */}
                <div className="text-right">
                    <div className="text-sm font-semibold">time log</div>
                    <ul className="mt-1 text-sm">
                        {attempts.slice().reverse().map((t, i) => (
                            <li key={i} className="font-mono">{msFmt(t)}</li>
                        ))}
                    </ul>

                    <div className="mt-4 text-sm font-semibold">current time:</div>
                    <div className="text-lg font-bold font-mono">
                        {currentTimeMs == null ? "—" : msFmt(currentTimeMs)}
                    </div>

                    <button
                        type="button"
                        onClick={onClear}
                        className="mt-4 px-3 py-1.5 rounded-md bg-app-bg hover:bg-app-hover text-sm"
                    >
                        Clear history
                    </button>
                </div>
            </div>
        </div>
    );
}
