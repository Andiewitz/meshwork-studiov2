import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { getShortcutsByCategory, SHORTCUT_CATEGORIES } from '../utils/shortcuts';

interface KeyboardShortcutsModalProps {
    open: boolean;
    onClose: () => void;
}

const categoryColors: Record<string, string> = {
    Navigation: 'text-blue-400',
    Editing: 'text-emerald-400',
    Canvas: 'text-amber-400',
    View: 'text-purple-400',
};

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
    const grouped = getShortcutsByCategory();

    // Close on Escape
    React.useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400]"
                        onClick={onClose}
                    />
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[401] w-[480px] max-h-[80vh] overflow-hidden rounded-2xl bg-[#121214]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2.5">
                                <Keyboard className="w-4 h-4 text-white/40" />
                                <h2 className="text-[14px] font-semibold text-white/90">Keyboard Shortcuts</h2>
                            </div>
                            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[calc(80vh-72px)] py-3">
                            {SHORTCUT_CATEGORIES.map((category) => (
                                <div key={category} className="mb-3 last:mb-0">
                                    <div className="px-5 py-1.5">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${categoryColors[category] || 'text-white/40'}`}>
                                            {category}
                                        </span>
                                    </div>
                                    {grouped[category].map((shortcut) => (
                                        <div key={shortcut.key} className="flex items-center justify-between px-5 py-1.5 hover:bg-white/[0.02] transition-colors">
                                            <span className="text-[12px] text-white/60">{shortcut.label}</span>
                                            <div className="flex items-center gap-1">
                                                {shortcut.key.split('+').map((k, i) => (
                                                    <React.Fragment key={i}>
                                                        {i > 0 && <span className="text-[10px] text-white/15">+</span>}
                                                        <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-white/50 min-w-[24px] text-center">
                                                            {k}
                                                        </kbd>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-center">
                            <span className="text-[10px] text-white/20">Press <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9px] font-mono text-white/30">?</kbd> to toggle</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
