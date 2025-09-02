import { useState, useEffect } from "react";

export default function KeyBinder({ slotInfo, onUpdateBinding }) {
	const [listening, setListening] = useState(false);
	const [binding, setBinding] = useState(slotInfo.key);

	useEffect(() => {
		if (!listening) return;
		const onKeyDown = (e) => {
			if (e.isComposing || e.repeat) return;
			setBinding(e.key);
			onUpdateBinding?.(slotInfo.slot, e.key);
			setListening(false);
			e.preventDefault();
			e.stopPropagation();
		};
		document.addEventListener("keydown", onKeyDown, true);
		return () => document.removeEventListener("keydown", onKeyDown, true);
	}, [listening, onUpdateBinding, slotInfo.slot]);

	return (
		<div
			className={`grid grid-cols-[auto_1fr_auto] items-center px-4 py-3
                  transition-colors duration-200
                  ${listening ? "bg-app-hover" : "bg-app-panel"}`}
		>
			{/* Slot label */}
			<div className="text-xs font-semibold uppercase tracking-wider text-app-subtext/80">
				Slot
				<span className="ml-2 text-app-text font-medium">{slotInfo.slot}</span>
			</div>

			{/* Binding pill */}
			<div className="justify-self-start ml-6">   {/* added left margin */}
			<span
				className={`inline-flex items-center rounded-md px-2 py-1 text-sm
							border border-app-border/70 font-mono
							${listening
							? "bg-app-accent/10 text-app-accent"
							: "bg-app-bg text-app-text"}`}
			>
				[ {binding ? binding : "Unbound"} ]
			</span>
			</div>

			{/* Rebind button */}
			<button
				type="button"
				onMouseDown={(e) => e.preventDefault()}        // don’t steal focus
				onClick={() => setListening((s) => !s)}
				className={`ml-3 px-3 py-1.5 rounded-md text-sm transition-colors
                    outline-none ring-0
                    ${listening
						? "bg-app-accent text-app-text hover:bg-app-accent/90"
						: "bg-app-bg hover:bg-app-hover text-app-subtext"}`}
			>
				{listening ? "Press a key…" : "Rebind"}
			</button>
		</div>
	);
}
