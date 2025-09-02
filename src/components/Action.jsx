import { useState } from "react";

const actionLabel = {
	swap: "Swap to",
	hit: "Attack",
	use: "Use/Equip",
};

export default function Action({ keymap, action, slot, onAddBefore, onAddAfter, onDelete }) {
	const [hover, setHover] = useState(false);

	return (
		<div
			className="rounded-xl overflow-hidden border border-app-border/70 bg-app-bg shadow-sm"
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			{/* Top row: Add before + square delete */}
			<div className="grid grid-cols-[1fr_auto] items-stretch">
				<button
					type="button"
					onClick={onAddBefore}
					className="w-full px-4 py-2.5 text-left text-sm bg-app-bg hover:bg-app-hover transition-colors"
				>
					Add Before
				</button>
				<button
					type="button"
					onClick={onDelete}
					className="h-full aspect-square grid place-items-center bg-app-delete hover:bg-app-delete-hover transition-colors"
					aria-label="Delete"
				>
					✕
				</button>
			</div>

			{/* Middle row: action + slot */}
			<div className="grid grid-cols-[1fr_auto] items-center border-t border-app-border/70">
				<div className="px-4 py-4">
					<div className="text-sm uppercase tracking-widest text-app-subtext/70">Action</div>
					<div className="mt-1 text-lg font-semibold">
						{actionLabel[action] ?? action}
					</div>
				</div>
				<div className="px-4 py-4 justify-self-end">
					{slot !== -1 && (
						<span className={`inline-flex items-center rounded-md px-2 py-1 text-sm border border-app-border/70 font-mono
                              ${hover ? "bg-app-accent/10 text-app-accent" : "bg-app-panel text-app-text"}`}>
							[ {slot} ]
						</span>
					)}
				</div>
			</div>

			{/* Bottom row: Add after */}
			<button
				type="button"
				onClick={onAddAfter}
				className="w-full px-4 py-2.5 text-left text-sm border-t border-app-border/70 bg-app-bg hover:bg-app-hover transition-colors"
			>
				Add After
			</button>
		</div>
	);
}
