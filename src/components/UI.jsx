function Slot({ n, active }) {
  return (
    <div
      className={`grid place-items-center aspect-square w-full rounded-md border border-app-border font-mono leading-none
                  ${active
                    ? "bg-app-accent/15 text-app-accent border-app-accent/60"
                    : "bg-app-bg text-app-text"}`}
    >
      <span className="text-xs sm:text-sm">{n}</span>
    </div>
  );
}

export default function UI({ currentSlot, expect }) {
  return (
    <div className="space-y-6">
      {/* Hotbar: evenly spaced, fills width */}
      <div className="grid grid-cols-9 gap-2 w-full">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
          <Slot key={n} n={n} active={n === currentSlot} />
        ))}
      </div>

      {/* Left / Right click prompter */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`grid place-items-center h-14 rounded-lg border border-app-border font-semibold
                      ${expect === "hit"
                        ? "bg-app-accent/15 text-app-accent border-app-accent/60"
                        : "bg-app-bg text-app-text"}`}
        >
          L
        </div>
        <div
          className={`grid place-items-center h-14 rounded-lg border border-app-border font-semibold
                      ${expect === "use"
                        ? "bg-app-accent/15 text-app-accent border-app-accent/60"
                        : "bg-app-bg text-app-text"}`}
        >
          R
        </div>
      </div>
    </div>
  );
}
