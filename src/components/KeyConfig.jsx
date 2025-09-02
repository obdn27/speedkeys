import KeyBinder from "./KeyBinder.jsx";

export default function KeyConfig({ keymap, onUpdateBinding }) {
  const slots = Object.keys(keymap);

  return (
    <section className="bg-app-panel text-app-text rounded-2xl border border-app-border shadow-lg overflow-hidden">
      <header className="px-4 py-3 border-b border-app-border flex items-center">
        <h2 className="text-sm font-semibold tracking-wide text-app-subtext">Keybinds</h2>
        <span className="ml-auto text-xs text-app-subtext/80">{slots.length} slots</span>
      </header>

      {slots.length === 0 ? (
        <div className="p-6 text-sm text-app-subtext">No keybinds yet.</div>
      ) : (
        <ul className="divide-y divide-app-border">
          {slots.map((slot) => (
            <li key={slot}>
              <KeyBinder
                slotInfo={{ slot, key: keymap?.[slot] }}
                onUpdateBinding={onUpdateBinding}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
