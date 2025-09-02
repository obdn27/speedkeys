import { useEffect, useState } from "react";

const actionLabel = {
    hit: "Attack",
    use: "Use/Equip",
    swap: "Swap",
};

function Slot({ n, active, disabled, onClick }) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onClick?.(n)}
            className={`grid place-items-center aspect-square w-full rounded-[6px] border text-xs font-mono
        ${disabled ? "opacity-50 pointer-events-none" : ""}
        ${active
                    ? "bg-app-accent/15 text-app-accent border-app-accent/60"
                    : "bg-app-bg text-app-text border-app-border hover:bg-app-hover"}`}
            aria-label={`Slot ${n}`}
        >
            {n}
        </button>
    );
}

export default function HotbarAction({
    keymap,
    action,
    slot,
    onAddBefore,
    onAddAfter,
    onDelete,
    onEdit, // optional: (next:{action,slot}) => void
}) {
    const [kind, setKind] = useState(action);
    const [selSlot, setSelSlot] = useState(slot);

    // keep local state in sync when parent changes this row
    useEffect(() => { setKind(action); }, [action]);
    useEffect(() => { setSelSlot(slot); }, [slot]);

    const needsSlot = kind === "swap";

    return (
        <div className="rounded-xl border border-app-border/70 bg-app-bg text-app-text shadow-sm overflow-hidden">
            {/* Header: Insert + Delete */}
            <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2 px-3 py-2">
                <div className="text-xs font-semibold text-app-subtext">Insert:</div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onAddBefore}
                        className="px-2 py-1 rounded-md border border-app-border bg-app-panel hover:bg-app-hover text-xs"
                        title="Insert above"
                    >
                        ↑
                    </button>
                    <button
                        type="button"
                        onClick={onAddAfter}
                        className="px-2 py-1 rounded-md border border-app-border bg-app-panel hover:bg-app-hover text-xs"
                        title="Insert below"
                    >
                        ↓
                    </button>
                </div>

                <div className="h-0" /> {/* spacer */}

                <button
                    type="button"
                    onClick={onDelete}
                    className="h-7 aspect-square grid place-items-center rounded-md bg-app-delete hover:bg-app-delete-hover"
                    aria-label="Delete"
                >
                    ✕
                </button>
            </div>

            {/* Body: Action pills + Hotbar */}
            <div className="grid gap-3 px-3 pb-3">
                {/* Action */}
                <div>
                    <div className="text-xs mb-1 text-app-subtext">Action</div>
                    <div className="flex flex-wrap gap-2">
                        {(["hit", "use", "swap"]).map((a) => {
                            const selected = kind === a;
                            return (
                                <button
                                    key={a}
                                    type="button"
                                    onClick={() => {
                                        setKind(a);
                                        if (a === "swap") {
                                            const next = (selSlot && selSlot >= 1 && selSlot <= 9) ? selSlot : 5; // default 5
                                            setSelSlot(next);
                                            onEdit?.({ action: "swap", slot: next });
                                        } else {
                                            onEdit?.({ action: a, slot: -1 });
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-full border text-xs transition-colors
        ${selected
                                            ? "bg-app-accent/15 text-app-accent border-app-accent/60"
                                            : "bg-app-panel text-app-text border-app-border hover:bg-app-hover"}`}
                                >
                                    {actionLabel[a]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Slot (mini hotbar) */}
                <div>
                    <div className="text-xs mb-1 text-app-subtext">Slot</div>
                    <div className={`grid grid-cols-9 gap-1 ${needsSlot ? "" : "opacity-50"}`}>
                        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                            <Slot
                                key={n}
                                n={n}
                                active={needsSlot && selSlot === n}
                                disabled={!needsSlot}
                                onClick={(val) => {
                                    setSelSlot(val);
                                    onEdit?.({ action: kind, slot: val });   // <- propagate change
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}