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
                className="h-full flex flex-col items-center py-4 bg-[#141414] border-r border-white/[0.06]"
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
            className="h-full flex flex-col bg-[#141414] border-r border-white/[0.06] overflow-hidden"
            style={{ width: 260 }}
        >
            {/* Header */}
            <div className="px-3 pt-4 pb-2 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-white/25" />
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/25">Components</span>
                    </div>
                    <button
                        onClick={() => setCollapsed(true)}
                        className="w-6 h-6 flex items-center justify-center rounded text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all"
                    >
                        <PanelLeftClose className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-[12px] bg-white/[0.04] border border-white/[0.06] rounded-lg text-white/80 placeholder:text-white/15 outline-none focus:border-white/[0.12] focus:bg-white/[0.06] transition-all"
                    />
                </div>
            </div>

            {/* Recent / Favorites */}
            {!isSearching && (
                <div className="px-3 pt-2 pb-1 flex-shrink-0">
                    <div className="text-[9px] uppercase font-bold tracking-[0.15em] text-white/20 mb-2 px-0.5">Recent</div>
                    <div className="grid grid-cols-3 gap-1.5">
                        {favorites.map((node) => (
                            <div
                                key={node.type}
                                draggable
                                onDragStart={(e) => onDragStart(e, node.type, node.label)}
                                className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.07] hover:border-white/[0.1] transition-all cursor-grab active:cursor-grabbing group"
                            >
                                <node.icon className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
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
