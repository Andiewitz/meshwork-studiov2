import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, GripVertical, Package, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { nodeTypesList, getDynamicFavorites, DEFAULT_FAVORITES } from '@/features/workspace/utils/nodeTypes';

interface NodeLibrarySidebarProps {
    onDragStart: (event: React.DragEvent, nodeType: string, label: string) => void;
}

const CATEGORY_ORDER = ['Core', 'More', 'Kubernetes', 'Templates'];

const CATEGORY_COLORS: Record<string, string> = {
    'Core': '#3B82F6',
    'More': '#64748B',
    'Kubernetes': '#326CE5',
    'Templates': '#F97316',
};

const CATEGORY_HINTS: Record<string, string> = {
    'More': 'vendor-specific',
};

export const NodeLibrarySidebar: React.FC<NodeLibrarySidebarProps> = ({ onDragStart }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        'Core': true,
        'More': false,
        'Kubernetes': false,
        'Templates': false,
    });
    const [collapsed, setCollapsed] = useState(false);

    const favorites = useMemo(() => {
        try {
            return getDynamicFavorites();
        } catch {
            return DEFAULT_FAVORITES;
        }
    }, []);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };

    const filteredByCategory = useMemo(() => {
        const result: Record<string, typeof nodeTypesList> = {};
        for (const cat of CATEGORY_ORDER) {
            const items = nodeTypesList.filter(n =>
                n.category === cat &&
                (searchTerm === '' ||
                    n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    n.type.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            if (items.length > 0) result[cat] = items;
        }
        return result;
    }, [searchTerm]);

    const isSearching = searchTerm.length > 0;

    if (collapsed) {
        return (
            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 48, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full flex flex-col items-center py-4 bg-[#0E0E0E]/85 backdrop-blur-2xl border-r border-white/[0.04]"
            >
                <button
                    onClick={() => setCollapsed(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                    title="Expand Library"
                >
                    <PanelLeftOpen className="w-4 h-4" />
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-full flex flex-col bg-[#0E0E0E]/85 backdrop-blur-2xl border-r border-white/[0.04] overflow-hidden"
            style={{ width: 260 }}
        >
            <div className="px-3 pt-4 pb-2 flex-shrink-0">
                <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search components..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-14 py-2 text-[12px] bg-white/[0.04] border border-white/[0.06] rounded-lg text-white/80 placeholder:text-white/15 outline-none focus:border-[#FF5500]/30 focus:bg-white/[0.06] transition-all"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <kbd className="text-[9px] font-mono text-white/20 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.06]">⌘K</kbd>
                    </div>
                </div>

                {!isSearching && (
                    <div className="flex items-center gap-1 mb-2">
                        {['All', ...CATEGORY_ORDER].map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    if (tab === 'All') {
                                        setExpandedCategories(Object.fromEntries(CATEGORY_ORDER.map(c => [c, true])));
                                    } else {
                                        setExpandedCategories(Object.fromEntries(CATEGORY_ORDER.map(c => [c, c === tab])));
                                    }
                                }}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                                    (tab === 'All' && Object.values(expandedCategories).every(v => v))
                                        ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/20'
                                        : (tab !== 'All' && expandedCategories[tab] && !Object.values(expandedCategories).every(v => v))
                                            ? 'bg-white/[0.08] text-white/80 border border-white/[0.08]'
                                            : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04] border border-transparent'
                                }`}
                            >
                                {tab === 'Kubernetes' ? 'K8s' : tab}
                            </button>
                        ))}
                        <div className="flex-1" />
                        <button
                            onClick={() => setCollapsed(true)}
                            className="w-6 h-6 flex items-center justify-center rounded text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all"
                        >
                            <PanelLeftClose className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {!isSearching && (
                <div className="px-3 pt-1 pb-1 flex-shrink-0">
                    <div className="grid grid-cols-3 gap-1.5">
                        {favorites.map((node) => (
                            <div
                                key={node.type}
                                draggable
                                onDragStart={(e) => onDragStart(e, node.type, node.label)}
                                className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.07] hover:border-[#FF5500]/20 transition-all cursor-grab active:cursor-grabbing group"
                            >
                                <node.icon className="w-4 h-4 text-white/40 group-hover:text-[#FF5500]/70 transition-colors" />
                                <span className="text-[9px] font-medium text-white/35 group-hover:text-white/60 transition-colors leading-tight text-center">{node.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="h-px bg-white/[0.04] mx-3 my-2 flex-shrink-0" />

            {/* Categories */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
                {CATEGORY_ORDER.map(category => {
                    const items = filteredByCategory[category];
                    if (!items) return null;

                    const isExpanded = isSearching || expandedCategories[category] !== false;
                    const accentColor = CATEGORY_COLORS[category] || '#888';
                    const hint = CATEGORY_HINTS[category];

                    return (
                        <div key={category} className="mb-0.5">
                            <button
                                onClick={() => !isSearching && toggleCategory(category)}
                                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-white/30 hover:text-white/50 hover:bg-white/[0.03] transition-all group"
                            >
                                <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
                                <span className="text-[10px] uppercase font-bold tracking-[0.12em] flex-1 text-left">{category}</span>
                                {hint && <span className="text-[8px] text-white/10 italic">{hint}</span>}
                                <span className="text-[9px] text-white/15 font-medium">{items.length}</span>
                            </button>

                            <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-px pl-2 pr-1 pb-1">
                                            {items.map((node) => (
                                                <div
                                                    key={node.type}
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, node.type, node.label)}
                                                    className="flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[12px] text-white/50 hover:text-white/90 hover:bg-white/[0.05] transition-all cursor-grab active:cursor-grabbing group"
                                                >
                                                    <node.icon className="w-3.5 h-3.5 text-white/25 group-hover:text-white/50 transition-colors flex-shrink-0" />
                                                    <span className="truncate flex-1 font-medium">{node.label}</span>
                                                    <GripVertical className="w-3 h-3 text-white/0 group-hover:text-white/20 transition-colors flex-shrink-0" />
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};
