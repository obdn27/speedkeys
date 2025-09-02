import { useEffect, useState } from "react";

const ACTIONS = [
    { id: "hit", label: "Attack" },
    { id: "use", label: "Use/Equip" },
    { id: "swap", label: "Swap" },
];

export default function ActionModal({ open, index, onClose, onSubmit }) {
    const [action, setAction] = useState("hit");
    const [slot, setSlot] = useState(-1);

    useEffect(() => {
        if (!open) return;
        // reset each time it opens
        setAction("hit");
        setSlot(-1);
    }, [open]);

    if (!open) return null;

    const needsSlot = action === "swap";
    const canAdd = action && (!needsSlot || slot !== -1);

    const header = typeof index === "number" ? `New action @ [${index + 1}]` : "New action";

    function handleAdd() {
        if (!canAdd) return;
        onSubmit({ action, slot: needsSlot ? slot : -1 });
        onClose?.();
    }

    return (
        <div className="fixed inset-0 z-50 grid place-items-center">
            {/* backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* modal */}
            <div className="relative w-full max-w-lg rounded-2xl border border-app-border bg-app-panel text-app-text shadow-xl">
                <div className="px-5 py-4 border-b border-app-border">
                    <h2 className="text-sm font-semibold">{header}</h2>
                </div>

                <div className="p-5 space-y-6">
                    {/* Action selector */}
                    <div>
                        <div className="mb-2 text-sm text-app-subtext">Action</div>
                        <div className="flex flex-wrap gap-2">
                            {ACTIONS.map(a => {
                                const selected = action === a.id;
                                return (
                                    <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => setAction(a.id)}
                                        className={`px-4 py-2 rounded-full border transition-colors text-sm
                      ${selected
                                                ? "bg-app-accent/15 text-app-accent border-app-accent/60"
                                                : "bg-app-bg text-app-text border-app-border hover:bg-app-hover"}`}
                                    >
                                        {a.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Slot selector (hotbar) */}
                    <div>
                        <div className="mb-2 text-sm text-app-subtext">Slot</div>
                        <div
                            className={`grid grid-cols-9 gap-2 w-full
                         ${needsSlot ? "" : "opacity-50 pointer-events-none"}`}
                        >
                            {Array.from({ length: 9 }, (_, i) => i + 1).map(n => {
                                const active = slot === n;
                                return (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setSlot(n)}
                                        className={`aspect-square w-full rounded-md border font-mono text-sm grid place-items-center transition-colors
                      ${active
                                                ? "bg-app-accent/15 text-app-accent border-app-accent/60"
                                                : "bg-app-bg text-app-text border-app-border hover:bg-app-hover"}`}
                                    >
                                        {n}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* footer */}
                <div className="px-5 py-4 border-t border-app-border flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-2 rounded-md bg-app-bg hover:bg-app-hover transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={!canAdd}
                        onClick={handleAdd}
                        className={`px-3 py-2 rounded-md text-sm transition-colors
              ${canAdd
                                ? "bg-app-add hover:bg-app-hover"
                                : "bg-app-bg opacity-50 cursor-not-allowed"}`}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
