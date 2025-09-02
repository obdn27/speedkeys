import Action from './Action.jsx';
import HotbarAction from './HotbarAction.jsx';
import ActionModal from './ActionModal.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

export default function Sequencer({ sequence, setSequence }) {
    const [insertIndex, setInsertIndex] = useState(-1);

    const openDialogAt = (i) => setInsertIndex(i);
    const closeDialog = () => setInsertIndex(-1);

    function onAddAction(payload) {
        setSequence(prev => {
            const next = [...prev];
            const i = insertIndex < 0 ? next.length : insertIndex;
            next.splice(i, 0, { ...payload, slot: Number(payload.slot) });
            return next;
        });
        closeDialog();
    }

    function onDeleteAction(i) {
        setSequence(prev => prev.filter((_, idx) => idx !== i));
    }

    const handleEdit = useCallback((newAction, index) => {
        setSequence(prev =>
            prev.map((item, i) => (i === index ? { ...item, ...newAction } : item))
        );
    }, [setSequence]);

    return (
        <div className="divide-y divide-app-border text-app-text">
            {/* Header */}
            <div className="px-4 py-3 flex items-center">
                <h2 className="text-sm font-semibold tracking-wide text-app-subtext">Sequence</h2>
                <span className="ml-auto text-xs text-app-subtext/80">{sequence.length} items</span>
            </div>

            {/* List / empty state */}
            <div className="p-3">
                <AnimatePresence initial={false}>
                    {sequence.length === 0 ? (
                        <button
                            type="button"
                            onClick={() => openDialogAt(0)}
                            className="w-full rounded-lg bg-app-bg hover:bg-app-hover transition-colors px-4 py-3 text-left"
                        >
                            + Add first action
                        </button>
                    ) : (
                        <ul className="space-y-3">
                            {sequence.map((e, i) => (
                                <motion.li
                                    key={i}                               // if you have stable ids, use them here
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <HotbarAction
                                        {...e}
                                        index={i}
                                        onAddBefore={() => openDialogAt(i)}
                                        onAddAfter={() => openDialogAt(i + 1)}
                                        onDelete={() => onDeleteAction(i)}
                                        onEdit={(newAction) => handleEdit(newAction, i)}
                                    />
                                </motion.li>
                            ))}
                            <li>
                                <button
                                    type="button"
                                    onClick={() => openDialogAt(sequence.length)}
                                    className="w-full rounded-lg bg-app-bg hover:bg-app-hover transition-colors px-4 py-3 text-left"
                                >
                                    + Add at end
                                </button>
                            </li>
                        </ul>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal */}
            {insertIndex > -1 && (
                <ActionModal
                    open
                    index={insertIndex}
                    onClose={closeDialog}
                    onSubmit={onAddAction}
                />
            )}
        </div>
    );
}
