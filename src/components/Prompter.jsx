export default function Prompter({ active, prompt, onStart, onStop }) {
    if (!active) {
        return (
            <button
                type="button"
                onClick={onStart}
                className="w-full rounded-xl bg-app-add hover:bg-app-hover text-app-text font-semibold py-3 transition-colors"
            >
                Start training
            </button>
        );
    }
    return (
        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="rounded-xl border border-app-border bg-app-bg px-4 py-3">
                <div className="text-sm text-app-subtext">Next</div>
                <div className="text-lg font-semibold">{prompt}</div>
            </div>
            <button
                type="button"
                onClick={onStop}
                className="rounded-lg bg-app-delete hover:bg-app-delete-hover text-app-text font-semibold px-4 py-3 transition-colors"
            >
                Stop
            </button>
        </div>
    );
}
