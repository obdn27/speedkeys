export default function NextAction({ action }) {
    if (!action) return null;
    const label =
        action.action === "swap"
            ? `Swap to [ ${action.slot} ]`
            : action.action === "hit"
                ? "Attack"
                : action.action === "use"
                    ? "Use/Equip"
                    : action.action;
    return (
        <div className="mt-3 rounded-lg bg-app-panel border border-app-border p-3">
            <div className="text-sm text-app-subtext">Next</div>
            <div className="text-lg font-semibold">{label}</div>
        </div>
    );
}