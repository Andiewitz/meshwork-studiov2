import React, { useState, useEffect, memo } from 'react';
import { Cloud, HardDrive, Layers, MousePointer2, GitCommitHorizontal, Workflow, ShieldCheck, Database, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Animated Cursor Component
const Cursor = ({ isClicking, label }: any) => (
    <motion.div
        className="fixed pointer-events-none z-50 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <MousePointer2
            size={28}
            className="fill-black stroke-white"
            style={{
                transform: isClicking ? "scale(0.9) rotate(-10deg)" : "scale(1) rotate(0deg)",
                transition: "transform 0.1s ease-out"
            }}
        />
        <div className={cn(
            "ml-6 mt-1 px-2.5 py-1 text-black text-[10px] font-bold rounded-full opacity-0 transition-opacity whitespace-nowrap",
            label && "opacity-100",
            label?.includes('Error') ? 'bg-red-500 text-white' : 'bg-primary'
        )}>
            {label}
        </div>
    </motion.div>
);

const Node = ({ icon: Icon, title, id, top, left, color, isHovered, isDragging, offsetCoordinates }: any) => (
    <motion.div
        className="absolute z-10"
        style={{ left, top }}
        animate={isDragging ? {
            x: offsetCoordinates.x,
            y: offsetCoordinates.y,
            scale: 1.05,
            zIndex: 30,
        } : isHovered ? {
            scale: 1.05,
            zIndex: 20,
        } : {
            scale: 1,
            zIndex: 10,
        }}
        transition={isDragging ? { type: "tween", duration: 0.1 } : { type: "spring" }}
    >
        <div 
            className={cn(
                "px-4 py-3 glass-card flex items-center gap-4 transition-all duration-500",
                isHovered && "bg-white/[0.04] border-white/[0.2] scale-[1.02]"
            )}
        >
            <div className={cn("w-10 h-10 flex items-center justify-center border", color.bg, color.border)}>
                <Icon className={cn("w-5 h-5", color.text)} />
            </div>
            <div>
                <div className="font-bold uppercase tracking-widest text-[12px] text-white leading-tight">{title}</div>
                <div className={cn("text-[10px] font-mono font-bold tracking-tight mt-1", color.text)}>{id}</div>
            </div>
        </div>
    </motion.div>
);


const CanvasPreview = () => {
    // Cursor Animation State
    const [cursorPos, setCursorPos] = useState({ x: '80%', y: '80%' });
    const [isClicking, setIsClicking] = useState(false);
    const [cursorLabel, setCursorLabel] = useState<string | null>(null);

    // Node States
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);
    const [draggedNode, setDraggedNode] = useState<number | null>(null);
    const [nodeDragOffset, setNodeDragOffset] = useState({ x: 0, y: 0 });
    
    // Line States
    const [drawingLine, setDrawingLine] = useState<{from: string, toX: string, toY: string} | null>(null);
    const [connections, setConnections] = useState<{id: string, d: string, stroke: string}[]>([
        { id: "1", d: "M 25% 35% L 50% 35%", stroke: "#FF3D00" }
    ]);

    useEffect(() => {
        // Automated Viewport Sequence
        const sequence = async () => {
            const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

            while (true) {
                // Initialize clean slate
                setCursorLabel(null);
                setHoveredNode(null);
                setDraggedNode(null);
                setNodeDragOffset({ x: 0, y: 0 });
                setDrawingLine(null);
                
                // 1. Move to DB Node (Id: 2) to hover
                setCursorPos({ x: '45%', y: '50%' });
                await wait(1000);
                setHoveredNode(2);
                await wait(600);
                
                // 2. Click and grab DB Node
                setIsClicking(true);
                setCursorLabel("Grabbing Node");
                setDraggedNode(2);
                await wait(300);

                // 3. Drag DB Node
                setCursorPos({ x: '58%', y: '58%' });
                setNodeDragOffset({ x: 130, y: 80 }); // rough visually sync
                await wait(800);
                setCursorPos({ x: '60%', y: '50%' });
                setNodeDragOffset({ x: 150, y: 0 });
                await wait(500);

                // 4. Release Node
                setIsClicking(false);
                setCursorLabel("Deployed to Cloud");
                setDraggedNode(null);
                // Update final connection line for DB
                setConnections(prev => [
                    ...prev,
                    { id: "2", d: "M 50% 35% C 60% 35%, 60% 50%, 65% 50%", stroke: "#3b82f6" }
                ]);
                await wait(1000);
                setHoveredNode(null);
                setCursorLabel(null);

                // 5. Move to Edge Connector of API Gateway (Id: 1)
                setCursorPos({ x: '53%', y: '35%' });
                await wait(800);
                setCursorLabel("Draw Connection");
                
                // 6. Click and Pull Edge to Cache Node
                setIsClicking(true);
                setDrawingLine({ from: "52% 35%", toX: "53%", toY: "35%" });
                await wait(300);
                
                setCursorPos({ x: '53%', y: '75%' });
                setDrawingLine({ from: "52% 35%", toX: "53%", toY: "75%" });
                await wait(400);

                setCursorPos({ x: '25%', y: '75%' });
                setDrawingLine({ from: "52% 35%", toX: "25%", toY: "75%" });
                await wait(500);

                // 7. Snap to Cache Node
                setCursorLabel("Linked");
                setIsClicking(false);
                setDrawingLine(null);
                setConnections(prev => [
                    ...prev,
                    { id: "3", d: "M 50% 35% C 50% 75%, 35% 75%, 28% 75%", stroke: "#10b981" }
                ]);
                await wait(800);

                // 8. Pan across canvas
                setCursorLabel(null);
                setCursorPos({ x: '80%', y: '20%' });
                await wait(1000);
                setIsClicking(true);
                setCursorLabel("Panning Canvas");
                await wait(800);
                setIsClicking(false);

                // Wait before loop resets
                await wait(3000);
                
                // Reset architecture state
                setConnections([
                    { id: "1", d: "M 25% 35% L 50% 35%", stroke: "#FF3D00" }
                ]);
            }
        };

        sequence();
    }, []);

    const nodes = [
        { id: 0, title: "Load Balancer", label: "k8s-ingress-public", icon: Server, color: { bg: "bg-white/5", border: "border-white/20", text: "text-white/80" }, left: "10%", top: "35%", initialOffset: {x:0, y:0} },
        { id: 1, title: "API Gateway", label: "core-router-01", icon: Cloud, color: { bg: "bg-primary/10", border: "border-primary/40", text: "text-primary" }, left: "38%", top: "35%", initialOffset: {x:0, y:0} },
        { id: 2, title: "Postgres DB", label: "rds-prod-main", icon: Database, color: { bg: "bg-blue-500/10", border: "border-blue-500/40", text: "text-blue-500" }, left: "45%", top: "50%", initialOffset: {x:0, y:0} },
        { id: 3, title: "Redis Cache", label: "elasticache-01", icon: Layers, color: { bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-500" }, left: "15%", top: "75%", initialOffset: {x:0, y:0} },
    ];

    return (
        <div className="relative w-full max-w-6xl mx-auto mt-16 perspective-1000 group">
            <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-xl">
                <motion.div
                    className="absolute top-0 left-0 w-full h-full"
                    animate={{ x: cursorPos.x, y: cursorPos.y }}
                    transition={{ type: "spring", stiffness: 70, damping: 20, mass: 0.5 }}
                >
                    <Cursor isClicking={isClicking} label={cursorLabel} />
                </motion.div>
            </div>

            <div className="relative rounded-t-xl border border-white/[0.05] bg-black/40 backdrop-blur-3xl shadow-2xl overflow-hidden transform transition-all duration-700">
                {/* Visualizer Top Chrome */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>

                    <div className="flex bg-black/40 px-3 border border-white/[0.05] rounded-lg items-center divide-x divide-white/[0.05] h-8">
                        <div className="text-[10px] uppercase font-mono tracking-widest text-primary/70 pr-3 font-bold">Meshwork Environment</div>
                        <div className="text-[10px] uppercase font-mono tracking-widest text-white/30 pl-3">production-cluster-us-east</div>
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="bg-white/10 w-24 h-6 border border-white/5 rounded"></div>
                        <div className="bg-primary/20 border border-primary/30 w-16 h-6 rounded flex items-center justify-center">
                            <span className="text-[9px] font-bold uppercase text-primary tracking-widest">Deploy</span>
                        </div>
                    </div>
                </div>

                {/* Main Canvas Area */}
                <div className="h-[500px] md:h-[600px] bg-black relative overflow-hidden bg-[radial-gradient(rgba(255,85,0,0.06)_1px,transparent_1px)] [background-size:32px_32px]">
                    
                    {/* SVG Connector Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                        {connections.map((conn) => (
                            <motion.path 
                                key={conn.id}
                                d={conn.d}
                                fill="none" 
                                stroke={conn.stroke} 
                                strokeWidth="2.5" 
                                strokeDasharray="8 6" 
                                opacity="0.6"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        ))}
                        {drawingLine && (
                            <line 
                                x1={drawingLine.from} 
                                y1="0" // Hack: use exact path rendering via custom or simplified rendering
                                x2={drawingLine.toX} 
                                y2={drawingLine.toY} 
                                stroke="#10b981" 
                                strokeWidth="2.5" 
                                strokeDasharray="8 6" 
                                opacity="0.8" 
                            />
                        )}
                        {/* Dynamic drawing line logic */}
                        {drawingLine && (
                            <path
                              d={`M ${drawingLine.from} Q ${drawingLine.toX} ${drawingLine.from.split(' ')[1]}, ${drawingLine.toX} ${drawingLine.toY}`}
                              fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.9"
                            />
                        )}
                    </svg>

                    {/* Architectural Nodes */}
                    {nodes.map(node => (
                        <Node 
                            key={node.id}
                            icon={node.icon}
                            title={node.title}
                            id={node.label}
                            top={node.top}
                            left={node.left}
                            color={node.color}
                            isHovered={hoveredNode === node.id}
                            isDragging={draggedNode === node.id}
                            offsetCoordinates={nodeDragOffset}
                        />
                    ))}

                    {/* Properties Panel Simulator */}
                    <div className="absolute top-4 right-4 bottom-4 w-60 glass-card rounded-xl p-5 flex flex-col z-40 shadow-2xl">
                        <div className="flex items-center gap-2 mb-6 opacity-30">
                            <Workflow className="w-4 h-4 text-white" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white">Properties</span>
                        </div>
                        
                        <div className="space-y-4 flex-1">
                            {hoveredNode !== null || draggedNode !== null ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    <div className="text-[10px] font-mono text-primary/70 uppercase">Node Profile</div>
                                    <div className="h-8 border border-white/10 bg-white/5 flex items-center px-3 rounded-md">
                                        <span className="text-xs text-white/90">rds-prod-main</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <div className="h-16 border border-white/5 bg-white/5 rounded-md p-2 flex flex-col justify-between">
                                            <span className="text-[9px] text-white/30 uppercase">CPU</span>
                                            <span className="text-sm font-mono text-white/80">45%</span>
                                        </div>
                                        <div className="h-16 border border-white/5 bg-white/5 rounded-md p-2 flex flex-col justify-between">
                                            <span className="text-[9px] text-white/30 uppercase">RAM</span>
                                            <span className="text-sm font-mono text-white/80">12GB</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex items-center justify-center h-40 border border-white/5 border-dashed rounded-lg bg-white/[0.02]">
                                    <span className="text-xs text-white/20">Select a node</span>
                                </div>
                            )}
                        </div>

                        <div className="h-10 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center gap-2 mt-auto">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-green-500">System Healthy</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(CanvasPreview);
