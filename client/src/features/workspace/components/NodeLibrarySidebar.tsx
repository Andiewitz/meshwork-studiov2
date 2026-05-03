import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GripVertical, PanelLeftOpen, Plus, X } from 'lucide-react';
import { nodeTypesList, getDynamicFavorites, DEFAULT_FAVORITES } from '@/features/workspace/utils/nodeTypes';

interface NodeLibrarySidebarProps {
    onDragStart: (event: React.DragEvent, nodeType: string, label: string) => void;
}

const CATEGORY_ORDER = ['Core', 'More', 'Kubernetes', 'Templates'];

const CATEGORY_DISPLAY: Record<string, string> = {
    'Core': 'COMPUTE',
    'More': 'VENDOR',
    'Kubernetes': 'KUBERNETES',
    'Templates': 'TEMPLATES',
};

const CATEGORY_COLORS: Record<string, string> = {
    'Core': '#F97316',
    'More': '#64748B',
    'Kubernetes': '#326CE5',
    'Templates': '#A855F7',
};

const FILTER_TABS = ['All', 'Core', 'More', 'Kubernetes', 'Templates'];
const FILTER_LABELS: Record<string, string> = {
    'All': 'All',
    'Core': 'Compute',
    'More': 'Vendor',
    'Kubernetes': 'K8s',
    'Templates': 'Templates',
};

export const NodeLibrarySidebar: React.FC<NodeLibrarySidebarProps> = ({ onDragStart }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [collapsed, setCollapsed] = useState(false);

    const filteredByCategory = useMemo(() => {
        const result: Record<string, typeof nodeTypesList> = {};
        const categories = activeFilter === 'All' ? CATEGORY_ORDER : [activeFilter];
        for (const cat of categories) {
            const items = nodeTypesList.filter(n =>
                n.category === cat &&
                (searchTerm === '' ||
                    n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    n.type.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            if (items.length > 0) result[cat] = items;
        }
        return result;
    }, [searchTerm, activeFilter]);

    if (collapsed) {
        return (
            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 44, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full flex flex-col items-center pt-4 gap-2 bg-[#111111] border-r border-white/[0.06] flex-shrink-0"
            >
                <button
                    onClick={() => setCollapsed(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                    title="Open sidebar"
                >
                    <PanelLeftOpen className="w-4 h-4" />
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="h-full flex flex-col bg-[#111111] border-r border-white/[0.06] overflow-hidden flex-shrink-0"
            style={{ width: 220 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
                <span className="text-[13px] font-semibold text-white/80">Add Component</span>
                <button
                    onClick={() => setCollapsed(true)}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                    title="Close sidebar"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-3 flex-shrink-0">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-10 py-1.5 text-[12px] bg-white/[0.05] border border-white/[0.06] rounded-lg text-white/80 placeholder:text-white/20 outline-none focus:border-white/[0.15] transition-all"
                    />
                    <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white/20 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.06]">⌘K</kbd>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-px px-3 pb-3 flex-shrink-0">
                {FILTER_TABS.slice(0, 4).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all flex-1 ${
                            activeFilter === tab
                                ? 'bg-white/[0.1] text-white/90'
                                : 'text-white/30 hover:text-white/60 hover:bg-white/[0.05]'
                        }`}
                    >
                        {FILTER_LABELS[tab]}
                    </button>
                ))}
            </div>

            {/* Node list */}
            <div className="flex-1 overflow-y-auto px-2 pb-2" style={{ scrollbarWidth: 'none' }}>
                {Object.entries(filteredByCategory).map(([category, items]) => (
                    <div key={category} className="mb-3">
                        {/* Section header */}
                        <div className="flex items-center justify-between px-2 mb-1">
                            <span className="text-[9px] font-bold tracking-[0.12em] text-white/25">
                                {CATEGORY_DISPLAY[category] || category.toUpperCase()}
                            </span>
                            <span className="text-[9px] text-white/20">{items.length}</span>
                        </div>

                        {/* Items */}
                        <div className="space-y-px">
                            {items.map((node) => (
                                <div
                                    key={node.type}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, node.type, node.label)}
                                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.05] transition-all cursor-grab active:cursor-grabbing group"
                                >
                                    <div
                                        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `${CATEGORY_COLORS[category]}20` }}
                                    >
                                        <node.icon
                                            className="w-3 h-3"
                                            style={{ color: CATEGORY_COLORS[category] }}
                                        />
                                    </div>
                                    <span className="text-[12px] text-white/60 group-hover:text-white/90 transition-colors flex-1 truncate font-medium">
                                        {node.label}
                                    </span>
                                    <GripVertical className="w-3 h-3 text-white/0 group-hover:text-white/20 transition-colors flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {Object.keys(filteredByCategory).length === 0 && (
                    <div className="px-2 py-8 text-center text-[12px] text-white/20">
                        No components found
                    </div>
                )}
            </div>

            {/* New Component button */}
            <div className="px-3 py-3 border-t border-white/[0.05] flex-shrink-0">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all text-[12px] font-medium">
                    <Plus className="w-3.5 h-3.5" />
                    New Component
                </button>
            </div>
        </motion.div>
    );
};
