import { useEffect, useState } from 'react';
import './App.css';
import KeyConfig from './components/KeyConfig.jsx';
import Sequencer from './components/Sequencer.jsx';
import Practicer from './components/Practicer.jsx';

const LS_KEYMAP = "keymap.v1";
const LS_SEQUENCE = "sequence.v1";

const INITIAL_KEYMAP = {
	"1": "f",
	"2": "`",
	"3": "2",
	"4": "e",
	"5": "z",
	"6": "r",
	"7": "1",
	"8": "3",
	"9": "Tab",
};

const INITIAL_SEQUENCE = [
	{ action: "swap", slot: 6 },
	{ action: "use", slot: -1 },
	{ action: "swap", slot: 7 },
	{ action: "hit", slot: -1 },
];

// --- helpers ---
function isValidKeymap(obj) {
	if (!obj || typeof obj !== "object") return false;
	for (let i = 1; i <= 9; i++) {
		if (typeof obj[String(i)] !== "string") return false;
	}
	return true;
}

function loadFromStorage(key, fallback) {
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}

function saveToStorage(key, value) {
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// ignore quota/permissions errors
	}
}

function App() {
	// lazy init from localStorage
	const [keymap, setKeymap] = useState(() =>
		isValidKeymap(loadFromStorage(LS_KEYMAP, null))
			? loadFromStorage(LS_KEYMAP, INITIAL_KEYMAP)
			: INITIAL_KEYMAP
	);

	const [sequence, setSequence] = useState(() =>
		loadFromStorage(LS_SEQUENCE, INITIAL_SEQUENCE)
	);

	// persist on change
	useEffect(() => {
		if (isValidKeymap(keymap)) saveToStorage(LS_KEYMAP, keymap);
	}, [keymap]);

	useEffect(() => {
		saveToStorage(LS_SEQUENCE, sequence);
	}, [sequence]);

	function updateKeyMap(slot, key) {
		setKeymap(prev => ({ ...prev, [slot]: key }));
	}

	return (
		<div className="grid grid-cols-9 gap-4 h-screen bg-app-bg font-mono p-4">
			{/* Keybinds: 1/6 */}
			<section className="col-span-9 md:col-span-2 bg-app-panel rounded-2xl border border-app-border overflow-auto min-w-0">
				<KeyConfig keymap={keymap} onUpdateBinding={updateKeyMap} />
			</section>

			{/* Practicer: 3/6 */}
			<section className="col-span-9 md:col-span-5 bg-app-panel rounded-2xl border border-app-border overflow-auto min-w-0">
				<Practicer sequence={sequence} keymap={keymap} />
			</section>

			{/* Sequencer: 2/6 */}
			<section className="col-span-9 md:col-span-2 bg-app-panel rounded-2xl border border-app-border overflow-auto min-w-0">
				<Sequencer sequence={sequence} setSequence={setSequence} />
			</section>
		</div>
	);
}

export default App;
