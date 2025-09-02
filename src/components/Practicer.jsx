import { useEffect, useMemo, useRef, useState } from "react";
import TimerStats from "./TimerStats.jsx";
import EventCapture from "./EventCapture.jsx";
import UI from "./UI.jsx";
import Prompter from "./Prompter.jsx";

const MAX_ATTEMPTS_STORE = 50;   // how many totals we keep in state
const MAX_ATTEMPTS_SHOW = 10;   // how many totals we render
const MAX_RUNS_STORE = 120;  // split-history rows kept
const MAX_RUNS_SHOW = 10;   // split-history rows rendered
const MAX_STEPS_SHOW = 9;    // split cells per row rendered

const HUE_START = 120;       // best=green; tweak if you want a different start hue

export default function Practicer({ sequence, keymap }) {
	const [active, setActive] = useState(false);
	const [idx, setIdx] = useState(0);
	const [splits, setSplits] = useState([]);         // inter-action ms for CURRENT run
	const [attempts, setAttempts] = useState([]);     // totals (vertical list)
	const [splitHistory, setSplitHistory] = useState([]); // array<array<number>> (rows = runs)

	const firstTsRef = useRef(null);
	const lastTsRef = useRef(null);

	// rAF “current time since first action” (throttled)
	const [tick, setTick] = useState(0);
	const nowRef = useRef(0);
	useEffect(() => {
		if (!active) return;
		let af = 0, last = 0;
		const loop = (t) => {
			nowRef.current = performance.now();
			if (t - last > 50) { last = t; setTick(x => x + 1); }
			af = requestAnimationFrame(loop);
		};
		af = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(af);
	}, [active]);

	const currentTimeMs =
		active && firstTsRef.current != null ? Math.max(0, nowRef.current - firstTsRef.current) : null;

	function resetRunForNext() {
		setIdx(0);
		setSplits([]);
		firstTsRef.current = null;
		lastTsRef.current = null;
	}

	function start() {
		if (!sequence?.length) return;
		resetRunForNext();
		setActive(true);
	}
	function stop() {
		setActive(false);
		resetRunForNext();
	}

	function fulfills(step, ev) {
		if (!step) return false;
		if (step.action === "swap") {
			const expected = keymap?.[step.slot];
			return ev.type === "key" && expected && (ev.key === expected || ev.code === expected);
		}
		if (step.action === "hit") return ev.type === "click";
		if (step.action === "use") return ev.type === "rclick";
		return false;
	}

	function handleInput(ev) {
		if (!active) return;
		const step = sequence?.[idx];
		if (!step) return;

		const now = ev.ts ?? performance.now();
		if (!fulfills(step, ev)) return;

		// first correct input of run
		if (firstTsRef.current == null) {
			firstTsRef.current = now;
			lastTsRef.current = now;

			const nextIdx = idx + 1;
			if (nextIdx >= sequence.length) {
				// single-step run → total 0
				setAttempts(arr => {
					const out = [...arr, 0];
					return out.length > MAX_ATTEMPTS ? out.slice(-MAX_ATTEMPTS) : out;
				});
				setSplitHistory(rows => {
					const out = [...rows, []];
					return out.length > MAX_RUNS ? out.slice(-MAX_RUNS) : out;
				});
				resetRunForNext();
				return;
			}
			setIdx(nextIdx);
			return;
		}

		// subsequent steps
		const prev = lastTsRef.current ?? firstTsRef.current;
		const delta = now - prev;
		const newSplits = [...splits, delta];
		lastTsRef.current = now;

		const nextIdx = idx + 1;
		if (nextIdx >= sequence.length) {
			// finished: total is sum of inter-action splits (no time-to-first)
			const total = newSplits.reduce((a, b) => a + b, 0);

			setAttempts(arr => {
				const out = [...arr, total];
				return out.length > MAX_ATTEMPTS_STORE ? out.slice(-MAX_ATTEMPTS_STORE) : out;
			});

			setSplitHistory(rows => {
				const out = [...rows, newSplits];
				return out.length > MAX_RUNS_STORE ? out.slice(-MAX_RUNS_STORE) : out;
			});


			// auto-loop (keep training on)
			resetRunForNext();
		} else {
			setSplits(newSplits);
			setIdx(nextIdx);
		}
	}

	const current = active ? sequence?.[idx] : null;
	const promptText = useMemo(() => {
		if (!active) return "Start training";
		if (!current) return "Done";
		if (current.action === "swap") return `Swap to [ ${current.slot} ]`;
		if (current.action === "hit") return "Attack";
		if (current.action === "use") return "Use/Equip";
		return current.action;
	}, [active, current]);

	const clearAll = () => { setAttempts([]); setSplitHistory([]); };

	const attemptsVisible = attempts.slice(-MAX_ATTEMPTS_SHOW);
	const historyVisible = splitHistory.slice(-MAX_RUNS_SHOW);

	return (
		<div className="divide-y divide-app-border text-app-text">
			<EventCapture enabled={active} onInput={handleInput} />

			{/* BLOCK 1: current breakdown (left) + vertical totals (right) */}
			<div className="p-3">
				<TimerStats
					splits={splits}
					attempts={attemptsVisible}
					currentTimeMs={currentTimeMs}
					onClear={clearAll}
					hueStartDeg={HUE_START}
					className="min-h-56 p-3"
				/>
			</div>

			{/* BLOCK 2: big 2D grid of split history (rows=runs, cols=steps) */}
			<div className="p-3">
				<SplitHistoryGrid
					history={historyVisible}
					hueStartDeg={HUE_START}
					maxCols={MAX_STEPS_SHOW}
					className="min-h-72"
				/>
			</div>

			{/* Controls / hotbar */}
			<div className="p-4">
				<Prompter active={active} prompt={promptText} onStart={start} onStop={stop} />
			</div>

			<div className="p-4">
				<UI currentSlot={current?.slot ?? -1} expect={current?.action ?? null} />
			</div>
		</div>
	);
}

/* ===== SplitHistoryGrid (compact 2D grid) ===== */
function hueFor(ms, minMs, maxMs, hueStartDeg) {
	if (maxMs <= minMs) return `hsl(${hueStartDeg} 90% 60%)`;
	const t = Math.min(1, Math.max(0, (ms - minMs) / (maxMs - minMs)));
	const hue = (hueStartDeg - 120 * t + 360) % 360;
	return `hsl(${hue} 90% 60%)`;
}
function msFmt(x) { return `${Math.round(x)}ms`; }

function SplitHistoryGrid({ history, hueStartDeg = 120, maxCols = 9, className = "" }) {
	// history is already sliced to the last N rows by the parent
	const rows = history;
	const colsCount = Math.min(
		maxCols,
		rows.length ? Math.max(...rows.map(r => r.length)) : 0
	);

	return (
		<div className={`rounded-xl border border-app-border bg-app-panel/40 ${className}`}>
			<div className="px-3 py-2 border-b border-app-border text-sm font-semibold">Split history</div>

			{rows.length === 0 ? (
				<div className="p-3 text-sm text-app-subtext">No runs yet.</div>
			) : (
				<div className="p-3">
					<div
						className="grid gap-1"
						style={{ gridTemplateColumns: `repeat(${colsCount}, minmax(36px, 1fr))` }}
					>
						{rows.map((row, rIdx) => {
							// show only last `colsCount` splits for each row
							const slice = row.slice(-colsCount);
							const min = slice.length ? Math.min(...slice) : 0;
							const max = slice.length ? Math.max(...slice) : 1;
							return slice.map((ms, i) => (
								<div
									key={`${rIdx}-${i}`}
									className="h-7 px-1 rounded-md border border-app-border/60 grid place-items-center text-[10px] font-mono"
									style={{ color: hueFor(ms, min, max, hueStartDeg) }}
									title={`Δ${i + 1}: ${msFmt(ms)}`}
								>
									{Math.round(ms)}
								</div>
							));
						})}
					</div>
				</div>
			)}
		</div>
	);
}


function Row({ row, min, max, hueStartDeg }) {
	// render row cells; fill missing columns with dashes if rows vary in length
	const cols = row.length;
	return (
		<>
			{Array.from({ length: cols }).map((_, i) => {
				const ms = row[i];
				return (
					<div
						key={i}
						className="h-7 px-1 rounded-md border border-app-border/60 grid place-items-center text-[10px] font-mono"
						style={{ color: hueFor(ms, min, max, hueStartDeg), background: "transparent" }}
						title={`Δ${i + 1}: ${msFmt(ms)}`}
					>
						{Math.round(ms)}
					</div>
				);
			})}
		</>
	);
}
