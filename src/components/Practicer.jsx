import { useEffect, useMemo, useRef, useState } from "react";
import TimerStats from "./TimerStats.jsx";
import EventCapture from "./EventCapture.jsx";
import UI from "./UI.jsx";
import Prompter from "./Prompter.jsx";

const MAX_ATTEMPTS = 10;

export default function Practicer({ sequence, keymap }) {
	const [active, setActive] = useState(false);
	const [idx, setIdx] = useState(0);
	const [splits, setSplits] = useState([]);      // inter-action times (ms)
	const [attempts, setAttempts] = useState([]);  // last N totals
	const firstTsRef = useRef(null);               // ts of first *correct* action of current run
	const lastTsRef = useRef(null);                // ts of previous finished action

	// rAF “current time since first action” (throttled)
	const [tick, setTick] = useState(0);
	const nowRef = useRef(0);
	useEffect(() => {
		if (!active) return;
		let af = 0, last = 0;
		const loop = (t) => {
			nowRef.current = performance.now();
			if (t - last > 50) { last = t; setTick((x) => x + 1); }
			af = requestAnimationFrame(loop);
		};
		af = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(af);
	}, [active]);

	const currentTimeMs =
		active && firstTsRef.current != null ? Math.max(0, nowRef.current - firstTsRef.current) : null;

	// helpers
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

		// FIRST CORRECT INPUT OF THE RUN
		if (firstTsRef.current == null) {
			firstTsRef.current = now;     // start run timer (no split recorded)
			lastTsRef.current = now;

			const nextIdx = idx + 1;
			if (nextIdx >= sequence.length) {
				// Single-step sequence: total = 0 (no inter-action time)
				setAttempts((arr) => {
					const out = [...arr, 0];
					return out.length > MAX_ATTEMPTS ? out.slice(-MAX_ATTEMPTS) : out;
				});
				// auto-loop
				resetRunForNext();
				return;
			}
			setIdx(nextIdx);              // advance on first action
			return;
		}

		// SUBSEQUENT STEPS: record delta from last finished step, then advance
		const prev = lastTsRef.current ?? firstTsRef.current;
		const delta = now - prev;
		const newSplits = [...splits, delta];
		lastTsRef.current = now;

		const nextIdx = idx + 1;
		if (nextIdx >= sequence.length) {
			// Finished: total = sum of inter-action splits (no time-to-first)
			const total = newSplits.reduce((a, b) => a + b, 0);
			setAttempts((arr) => {
				const out = [...arr, total];
				return out.length > MAX_ATTEMPTS ? out.slice(-MAX_ATTEMPTS) : out;
			});
			// auto-loop
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

	return (
		<div className="divide-y divide-app-border text-app-text">
			<EventCapture enabled={active} onInput={handleInput} />

			<div className="p-4">
				<TimerStats
					splits={splits}
					attempts={attempts}
					currentTimeMs={currentTimeMs}
					onClear={() => setAttempts([])}
					hueStartDeg={120}
				/>
			</div>

			<div className="p-4">
				<Prompter active={active} prompt={promptText} onStart={start} onStop={stop} />
			</div>

			<div className="p-4">
				<UI currentSlot={current?.slot ?? -1} expect={current?.action ?? null} />
			</div>
		</div>
	);
}