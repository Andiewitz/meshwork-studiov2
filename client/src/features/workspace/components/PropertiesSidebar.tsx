import React from 'react';
import { Node } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Box, X, RotateCcw } from 'lucide-react';
import { nodeTypesList } from '@/features/workspace/utils/nodeTypes';

interface PropertiesSidebarProps {
    selectedNode: Node | null;
    updateNodeData: (id: string, data: any) => void;
    updateNodeStyle: (id: string, style: any) => void;
    deleteNode: (id: string) => void;
    onClose?: () => void;
}

// Curated accent colors — harmonious, not garish
const ACCENT_COLORS = [
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#64748B', // Slate
];

export const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({
    selectedNode,
    updateNodeData,
    updateNodeStyle,
    deleteNode,
    onClose
}) => {
    if (!selectedNode) {
        return null;
    }

    const nodeInfo = nodeTypesList.find(n => n.type === selectedNode.type);
    const NodeIcon = nodeInfo?.icon || Box;
    const currentAccent = selectedNode.data?.accentColor as string | undefined;

    return (
        <div className="p-4 space-y-5">
            {/* ── Node Type Header ── */}
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: currentAccent ? `${currentAccent}20` : 'rgba(255,255,255,0.06)' }}
                >
                    <NodeIcon className="w-4 h-4" style={{ color: currentAccent || 'rgba(255,255,255,0.6)' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white/90 truncate">{(selectedNode.data?.label as string) || 'Untitled'}</div>
                    <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-white/25">{nodeInfo?.category || 'Node'}</div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <div className="h-px bg-white/[0.04]" />

            {/* ── Name & Description ── */}
            <section className="space-y-4">
                {selectedNode.type === 'note' ? (
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Note</Label>
                        <Textarea
                            data-property-input="true"
                            value={(selectedNode.data?.label as string) || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                            className="min-h-[200px] rounded-md focus:ring-0 bg-white/5 border-white/10 text-white focus:border-white/20 text-[12px] resize-none"
                            placeholder="Type your note here..."
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Display Name</Label>
                            <Input
                                data-property-input="true"
                                value={(selectedNode.data?.label as string) || ''}
                                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                                className="h-8 rounded-md focus:ring-0 bg-white/5 border-white/10 text-white focus:border-white/20 text-[12px]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Description</Label>
                            <Textarea
                                value={(selectedNode.data?.description as string) || ''}
                                onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                                className="min-h-[60px] rounded-md focus:ring-0 bg-white/5 border-white/10 text-white focus:border-white/20 text-[11px] resize-none"
                                placeholder="Add notes about this component..."
                            />
                        </div>
                    </div>
                )}
            </section>

            <div className="h-px bg-white/[0.04]" />

            {/* ── Dimensions ── */}
            <section className="space-y-3">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Size</Label>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <div className="text-[9px] text-white/20 uppercase font-bold">W</div>
                        <Input
                            type="number"
                            min={24}
                            value={Math.round(Number(selectedNode.style?.width ?? (selectedNode as any).measured?.width ?? 0))}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                    updateNodeStyle(selectedNode.id, { width: val });
                                }
                            }}
                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="text-[9px] text-white/20 uppercase font-bold">H</div>
                        <Input
                            type="number"
                            min={24}
                            value={Math.round(Number(selectedNode.style?.height ?? (selectedNode as any).measured?.height ?? 0))}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                    updateNodeStyle(selectedNode.id, { height: val });
                                }
                            }}
                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                        />
                    </div>
                </div>
            </section>

            <div className="h-px bg-white/[0.04]" />

            {/* ── Accent Color ── */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Accent Color</Label>
                    {currentAccent && (
                        <button
                            onClick={() => updateNodeData(selectedNode.id, { accentColor: undefined })}
                            className="text-[9px] text-white/20 hover:text-white/50 transition-colors flex items-center gap-1 uppercase font-bold tracking-wider"
                            title="Reset to default brand color"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {ACCENT_COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => updateNodeData(selectedNode.id, { accentColor: color })}
                            className="w-full aspect-square rounded-lg border relative transition-all hover:scale-110"
                            style={{
                                backgroundColor: color,
                                borderColor: currentAccent === color ? 'white' : 'transparent',
                                boxShadow: currentAccent === color ? `0 0 12px ${color}60` : 'none'
                            }}
                        >
                            {currentAccent === color && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Database Collections (the one useful technical field) ── */}
            {selectedNode.type === 'database' && (
                <>
                    <div className="h-px bg-white/[0.04]" />
                    <section className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Collections / Tables</Label>
                        <Textarea
                            placeholder={"users\norders\nproducts"}
                            value={(selectedNode.data?.collections as string[] || []).join('\n')}
                            onChange={(e) => {
                                const colls = e.target.value.split('\n').filter(s => s.trim() !== '');
                                updateNodeData(selectedNode.id, { collections: colls });
                            }}
                            className="min-h-[80px] rounded-md focus:ring-0 bg-white/5 border-white/10 text-white focus:border-white/20 resize-none text-[11px] font-mono"
                        />
                    </section>
                </>
            )}

            {/* ── K8s Status (only for k8s nodes) ── */}
            {selectedNode.type?.startsWith('k8s-') && (
                <>
                    <div className="h-px bg-white/[0.04]" />
                    <section className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Status</Label>
                        <select
                            value={(selectedNode.data?.status as string) || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { status: e.target.value || undefined })}
                            className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                        >
                            <option value="" className="bg-[#1a1a1a]">Default</option>
                            <option value="healthy" className="bg-[#1a1a1a]">✅ Healthy</option>
                            <option value="error" className="bg-[#1a1a1a]">❌ Error</option>
                            <option value="pending" className="bg-[#1a1a1a]">⏳ Pending</option>
                        </select>
                    </section>
                </>
            )}

            <div className="h-px bg-white/[0.04]" />

            {/* ── Delete ── */}
            <section className="pb-4">
                <button
                    onClick={() => deleteNode(selectedNode.id)}
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all font-bold text-[10px] uppercase tracking-widest"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Component
                </button>
            </section>
        </div>
    );
};
