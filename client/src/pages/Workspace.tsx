import React, { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Node,
    type Edge,
    type Connection,
    Panel,
    useReactFlow,
    ConnectionMode,
    SelectionMode,
    ReactFlowProvider,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useCanvas, saveCanvasToLocalCache, getCanvasFromLocalCache } from '@/hooks/use-canvas';
import { useWorkspace, useDeleteWorkspace } from '@/hooks/use-workspaces';
import { useParams, Link, useLocation } from 'wouter';
import {
    Download,
    Save,
    Loader2,
    Play,
    ChevronLeft,
    Layers as LayersIcon,
    MousePointer2,
    Square,
    Type,
    Pencil,
    Share2,
    Settings,
    HelpCircle,
    Server,
    Database,
    Cpu,
    Globe,
    MessageSquare,
    HardDrive,
    Zap,
    Plus,
    Box,
    Trash2,
    Copy,
    Edit2,
    Grid,
    Monitor,
    Cloud,
    GitBranch,
    Shield,
    Lock,
    Key,
    Activity,
    BarChart3,
    PieChart,
    CreditCard,
    MessageCircle,
    ShoppingCart,
    PlayCircle,
    Terminal,
    Layers,
    Layout,
    Briefcase,
    Search,
    User as UserIcon,
    Maximize,
    ChevronDown,
    ChevronRight,
    Minus,
    Circle,
    AlignVerticalJustifyCenter,
    AlignHorizontalJustifyCenter,
    RotateCw,
    Spline,
    ArrowUpRight,
    Milestone,
    ArrowRight,
    CheckCircle2,
    CloudUpload,
    AlertCircle,
    Package,
    GripVertical,
    Hand
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SystemNode } from '@/components/canvas/nodes/SystemNode';

import { nodeTypes, nodeTypesList, DEFAULT_FAVORITES as favoriteNodes, trackNodeUsage, EXPANDABLE_TYPES } from '@/features/workspace/utils/nodeTypes';
import { registerEnterNodeHandler, unregisterEnterNodeHandler } from '@/features/workspace/utils/canvasEvents';
import { nodeDimensions } from "@/features/workspace/utils/dimensions";
import { generateTemplate } from "@/features/workspace/utils/templates";
import { PropertiesSidebar } from "@/features/workspace/components/PropertiesSidebar";
import { AiChatDrawer } from "@/features/workspace/components/AiChatDrawer";
import { NodeLibrarySidebar } from "@/features/workspace/components/NodeLibrarySidebar";
import { calculateContainment, calculateGlobalPosition } from "@/features/workspace/utils/containment";

function WorkspaceView() {
    const { id } = useParams();
    const workspaceId = Number(id);
    const { data: canvasData, isLoading: isCanvasLoading, sync, isSyncing, isError: isCanvasError } = useCanvas(workspaceId);
    const { data: workspace, isLoading: isWorkspaceLoading, isError: isWorkspaceError } = useWorkspace(workspaceId);

    const isLoading = isCanvasLoading || isWorkspaceLoading;
    const isError = isCanvasError || isWorkspaceError;
    const { user } = useAuth();
    const { toast } = useToast();
    const { screenToFlowPosition, fitView, zoomIn, zoomOut, getViewport, setViewport } = useReactFlow();
    const [, setLocation] = useLocation();
    const deleteWorkspace = useDeleteWorkspace();

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'layers' | 'properties'>('layers');
    const [isSimulating, setIsSimulating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [edgeType, setEdgeType] = useState<'step' | 'straight' | 'smoothstep' | 'default'>('step');
    const [edgeStyle, setEdgeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
    const [hasArrow, setHasArrow] = useState(false);
    const [drawingMode, setDrawingMode] = useState<'select' | 'pan' | 'annotation' | 'infrastructure'>('select');

    // ── Nested canvas navigation stack ──
    interface CanvasLevel {
        nodeId: string;
        label: string;
        nodes: Node[];
        edges: Edge[];
        viewport: { x: number; y: number; zoom: number };
    }
    const [canvasStack, setCanvasStack] = useState<CanvasLevel[]>([]);
    const isNested = canvasStack.length > 0;
    const [canvasTransition, setCanvasTransition] = useState<'idle' | 'entering' | 'exiting'>('idle');

    // Smooth enter: zoom into node → fade → swap → fade back
    const enterNode = useCallback((node: Node) => {
        if (canvasTransition !== 'idle') return;
        setCanvasTransition('entering');

        const viewport = getViewport();
        // Save current state
        setCanvasStack(prev => [...prev, {
            nodeId: node.id,
            label: (node.data?.label as string) || 'Untitled',
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges)),
            viewport,
        }]);

        // Phase 1: zoom into the node (200ms)
        const nodeW = (node.style?.width as number) || node.measured?.width || 200;
        const nodeH = (node.style?.height as number) || node.measured?.height || 100;
        const targetZoom = Math.min(4, window.innerWidth / nodeW, window.innerHeight / nodeH) * 0.6;
        setViewport({
            x: -(node.position.x + nodeW / 2) * targetZoom + window.innerWidth / 2,
            y: -(node.position.y + nodeH / 2) * targetZoom + window.innerHeight / 2,
            zoom: targetZoom
        }, { duration: 250 });

        // Phase 2: after zoom, swap content and fade in
        setTimeout(() => {
            const subCanvas = (node.data as any)?.subCanvas || { nodes: [], edges: [] };
            setNodes(subCanvas.nodes || []);
            setEdges(subCanvas.edges || []);
            setSelectedNodeId(null);
            setTimeout(() => {
                fitView({ duration: 300, padding: 0.2 });
                setCanvasTransition('idle');
            }, 50);
        }, 250);
    }, [canvasTransition, nodes, edges, setNodes, setEdges, getViewport, setViewport, fitView]);

    // Smooth exit: fade → swap → restore viewport
    const exitToLevel = useCallback((targetIndex: number) => {
        if (canvasStack.length === 0 || canvasTransition !== 'idle') return;
        setCanvasTransition('exiting');

        // Save current sub-canvas into the parent node's data
        const currentLevel = canvasStack[canvasStack.length - 1];
        let parentNodes = currentLevel.nodes.map(n => {
            if (n.id === currentLevel.nodeId) {
                return { ...n, data: { ...n.data, subCanvas: { nodes, edges } } };
            }
            return n;
        });

        // Cascade save if jumping multiple levels
        let restoredNodes = parentNodes;
        let restoredEdges = currentLevel.edges;
        let restoredViewport = currentLevel.viewport;

        if (targetIndex < canvasStack.length - 1) {
            for (let i = canvasStack.length - 2; i >= targetIndex; i--) {
                const level = canvasStack[i];
                restoredNodes = level.nodes.map(n => {
                    if (n.id === level.nodeId) {
                        return { ...n, data: { ...n.data, subCanvas: { nodes: restoredNodes, edges: restoredEdges } } };
                    }
                    return n;
                });
                restoredEdges = level.edges;
                restoredViewport = level.viewport;
            }
        }

        // Phase 1: fade out (200ms via CSS), then swap
        setTimeout(() => {
            setNodes(restoredNodes);
            setEdges(restoredEdges);
            setCanvasStack(prev => prev.slice(0, targetIndex));
            setSelectedNodeId(null);
            setTimeout(() => {
                setViewport(restoredViewport, { duration: 300 });
                setCanvasTransition('idle');
            }, 50);
        }, 200);
    }, [canvasStack, canvasTransition, nodes, edges, setNodes, setEdges, setViewport]);

    useEffect(() => {
        const updateMousePosition = (ev: PointerEvent) => {
            document.documentElement.style.setProperty('--mouse-x', `${ev.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${ev.clientY}px`);
        };
        window.addEventListener('pointermove', updateMousePosition);
        return () => window.removeEventListener('pointermove', updateMousePosition);
    }, []);

    // Register enter-node event bus handler (arrow badge in SystemNode fires this)
    useEffect(() => {
        registerEnterNodeHandler((nodeId: string) => {
            const node = nodes.find(n => n.id === nodeId);
            if (node) enterNode(node);
        });
        return () => unregisterEnterNodeHandler();
    }, [nodes, enterNode]);

    const history = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
    const redoStack = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
    const lastLoadedId = useRef<number | null>(null);

    type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'offline_saved';
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialLoad = useRef(true);

    const takeSnapshot = useCallback(() => {
        history.current.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
        if (history.current.length > 50) history.current.shift();
        redoStack.current = [];
    }, [nodes, edges]);

    const undo = useCallback(() => {
        if (history.current.length === 0) return;
        const prevState = history.current.pop();
        if (prevState) {
            redoStack.current.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
            setNodes(prevState.nodes);
            setEdges(prevState.edges);
        }
    }, [nodes, edges, setNodes, setEdges]);

    const redo = useCallback(() => {
        if (redoStack.current.length === 0) return;
        const nextState = redoStack.current.pop();
        if (nextState) {
            history.current.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
        }
    }, [nodes, edges, setNodes, setEdges]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    undo();
                } else if (e.key === 'y' || (e.key === 'Z' && e.shiftKey)) {
                    e.preventDefault();
                    redo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const [menu, setMenu] = useState<{ id: string; top: number; left: number; type: 'node' | 'pane' } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const focusNode = useCallback((nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            fitView({
                nodes: [node],
                duration: 800,
                padding: 1.2
            });
            setSelectedNodeId(nodeId);
        }
    }, [nodes, fitView]);



    useEffect(() => {
        if (canvasData && lastLoadedId.current !== workspaceId) {
            const localCache = getCanvasFromLocalCache(workspaceId);
            
            if (localCache && localCache.nodes && localCache.edges) {
                setNodes(localCache.nodes);
                setEdges(localCache.edges);
                setSaveStatus('offline_saved');
                toast({
                    title: "Restored Unsaved Changes",
                    description: "We found unsaved changes locally and restored them. They will sync automatically soon."
                });
            } else {
                setNodes(canvasData.nodes || []);
                setEdges(canvasData.edges || []);
            }
            lastLoadedId.current = workspaceId;
            
            setTimeout(() => {
                isInitialLoad.current = false;
            }, 500);
        }
    }, [canvasData, workspaceId, setNodes, setEdges, toast]);

    useEffect(() => {
        if (isInitialLoad.current) return;
        
        saveCanvasToLocalCache(workspaceId, nodes, edges);
        setSaveStatus('unsaved');

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            setSaveStatus('saving');
            sync({ nodes, edges }, {
                onSuccess: () => {
                    setSaveStatus('saved');
                },
                onError: (err: any) => {
                    setSaveStatus('offline_saved');
                    toast({
                        title: "Offline Save",
                        description: "Could not reach the server. Changes saved locally.",
                        variant: "destructive",
                    });
                }
            });
        }, 3000);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [nodes, edges, workspaceId, sync, toast]);

    useEffect(() => {
        setEdges((eds) =>
            eds.map((edge) => {
                const currentStyle = (edge.style as any) || {};
                const newStyle = {
                    ...currentStyle,
                    stroke: isSimulating ? '#FFFFFF' : '#555'
                };

                let newMarkerEnd = edge.markerEnd as any;
                if (newMarkerEnd && typeof newMarkerEnd === 'object') {
                    newMarkerEnd = {
                        ...newMarkerEnd,
                        color: isSimulating ? '#FFFFFF' : '#555'
                    };
                }

                return {
                    ...edge,
                    animated: isSimulating,
                    style: newStyle,
                    markerEnd: newMarkerEnd
                };
            })
        );
    }, [isSimulating, setEdges]);

    useEffect(() => {
        const handleClickOutside = () => {
            setMenu(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const addNode = useCallback((type: string, label: string, position = { x: 100, y: 100 }) => {
        takeSnapshot();
        const nodeTypeInfo = nodeTypesList.find(n => n.type === type);
        const dim = nodeDimensions[type] || { w: 168, h: 96 };

        const newNode: Node = {
            id: `${type}-${Date.now()}`,
            type,
            position,
            style: { width: dim.w, height: dim.h },
            data: {
                label: label,
                category: nodeTypeInfo?.category || 'Compute'
            },
        };
        setNodes((nds) => nds.concat(newNode));
        trackNodeUsage(type);
        return newNode;
    }, [takeSnapshot, setNodes]);

    const deleteNodes = useCallback((ids: string[]) => {
        takeSnapshot();
        setNodes((nds) => nds.filter((node) => !ids.includes(node.id)));
        setEdges((eds) => eds.filter((edge) => !ids.includes(edge.source) && !ids.includes(edge.target)));
        if (selectedNodeId && ids.includes(selectedNodeId)) setSelectedNodeId(null);
    }, [takeSnapshot, setNodes, setEdges, selectedNodeId]);

    const deleteNode = useCallback((id: string) => deleteNodes([id]), [deleteNodes]);

    const updateNodeData = useCallback((id: string, newData: any) => {
        takeSnapshot();
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
    }, [takeSnapshot, setNodes]);

    const updateNodeStyle = useCallback((id: string, style: any) => {
        takeSnapshot();
        const snappedStyle = typeof style === 'object' ? { ...style } : { border: style };

        if (typeof snappedStyle.width === 'number') snappedStyle.width = Math.round(snappedStyle.width / 24) * 24;
        if (typeof snappedStyle.height === 'number') snappedStyle.height = Math.round(snappedStyle.height / 24) * 24;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, style: { ...node.style, ...snappedStyle } };
                }
                return node;
            })
        );
    }, [takeSnapshot, setNodes]);

    const onConnect = useCallback(
        (params: Connection) => {
            takeSnapshot();
            const style: any = { stroke: '#555', strokeWidth: 2 };
            if (edgeStyle === 'dashed') style.strokeDasharray = '5 5';
            if (edgeStyle === 'dotted') style.strokeDasharray = '2 2';

            setEdges((eds) => addEdge({
                ...params,
                type: edgeType,
                style,
                animated: isSimulating,
                markerEnd: hasArrow ? { type: 'arrowclosed' as any, color: '#555' } : undefined
            }, eds));
        },
        [setEdges, isSimulating, takeSnapshot, edgeType, edgeStyle, hasArrow],
    );

    const onPaneClick = useCallback((event: React.MouseEvent) => {
        setSelectedNodeId(null);
        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        if (drawingMode === 'annotation') {
            addNode('annotation', 'Click to edit...', position);
        } else if (drawingMode === 'infrastructure') {
            addNode('vpc', 'New VPC', position);
        }
    }, [drawingMode, screenToFlowPosition, addNode]);

    const handleSave = () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setSaveStatus('saving');
        sync({ nodes, edges }, {
            onSuccess: () => {
                setSaveStatus('saved');
                toast({
                    title: "Workspace changes saved",
                    description: "Your architecture has been successfully synchronized.",
                });
            },
            onError: (err: any) => {
                setSaveStatus('offline_saved');
                toast({
                    title: "Failed to save changes",
                    description: err.message || "An error occurred while saving. Please try again.",
                    variant: "destructive",
                });
            }
        });
    };



    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: Node) => {
            event.preventDefault();
            setMenu({
                id: node.id,
                top: event.clientY,
                left: event.clientX,
                type: 'node',
            });
        },
        [setMenu]
    );

    const onSelectionContextMenu = useCallback(
        (event: React.MouseEvent, nodesList: Node[]) => {
            event.preventDefault();
            if (nodesList.length === 0) return;
            setMenu({
                id: 'selection',
                top: event.clientY,
                left: event.clientX,
                type: 'node', // Reuses the node menu but enables multi-select features organically
            });
        },
        [setMenu]
    );

    const onEdgeContextMenu = useCallback(
        (event: React.MouseEvent, edge: Edge) => {
            event.preventDefault();
            setMenu({
                id: edge.id,
                top: event.clientY,
                left: event.clientX,
                type: 'pane', // reuse pane menu style or handle separately
            });
        },
        [setMenu]
    );

    const onPaneContextMenu = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            setMenu({
                id: 'pane',
                top: event.clientY,
                left: event.clientX,
                type: 'pane',
            });
        },
        [setMenu]
    );

    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const applyTemplate = (templateType: string, position: { x: number, y: number }) => {
        takeSnapshot();
        const { nodes: newNodes, edges: newEdges } = generateTemplate(templateType, position);

        setNodes((nds) => nds.concat(newNodes));
        setEdges((eds) => eds.concat(newEdges));
    };

    const onDelete = (id: string) => {
        deleteNode(id);
    };

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const dataJSON = event.dataTransfer.getData('application/reactflow');
            if (!dataJSON) return;
            const data = JSON.parse(dataJSON);
            if (!data.type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const snappedPosition = {
                x: Math.round(position.x / 12) * 12,
                y: Math.round(position.y / 12) * 12
            };

            if (data.type.startsWith('template:')) {
                applyTemplate(data.type, snappedPosition);
            } else {
                addNode(data.type, data.label, snappedPosition);
            }
        },
        [screenToFlowPosition, addNode, takeSnapshot, setNodes, setEdges]
    );



    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isEditing = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

            // Escape — exit nested canvas or deselect
            if (e.key === 'Escape') {
                if (isEditing) return;
                if (canvasStack.length > 0) {
                    exitToLevel(canvasStack.length - 1);
                    return;
                }
                setSelectedNodeId(null);
                return;
            }

            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
                if (!isEditing) {
                    deleteNode(selectedNodeId);
                }
            }
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    if (!isSyncing) {
                        handleSave();
                    }
                } else if (e.key === '=' || e.key === '+') {
                    e.preventDefault();
                    zoomIn();
                } else if (e.key === '-') {
                    e.preventDefault();
                    zoomOut();
                } else if (e.key === '0') {
                    e.preventDefault();
                    fitView({ duration: 400 });
                } else if (e.key === 'd' && selectedNodeId) {
                    e.preventDefault();
                    duplicateNode(selectedNodeId);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeId, deleteNode, isSyncing, nodes, edges]);

    const duplicateNode = useCallback(
        (id: string) => {
            takeSnapshot();
            const node = nodes.find((n) => n.id === id);
            if (node) {
                const newNode = {
                    ...node,
                    id: `${node.id}-copy-${Date.now()}`,
                    position: { x: node.position.x + 20, y: node.position.y + 20 },
                    selected: false,
                };
                setNodes((nds) => nds.concat(newNode));
            }
        },
        [nodes, setNodes, takeSnapshot]
    );

    const onNodeClick = useCallback((_: any, node: Node) => {
        setSelectedNodeId(node.id);
        setActiveTab('properties');
    }, []);

    const onNodeDoubleClick = useCallback((_: any, node: Node) => {
        // Double-click always opens properties for inline editing
        setSelectedNodeId(node.id);
        setActiveTab('properties');
        setTimeout(() => {
            const input = document.querySelector('[data-property-input="true"]') as HTMLTextAreaElement | HTMLInputElement;
            input?.focus();
            if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) input.select();
        }, 50);
    }, []);



    const onNodeDragStart = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    const duplicateSelection = useCallback(
        (ids: string[]) => {
            if (ids.length === 0) return;
            takeSnapshot();
            const newNodes: Node[] = [];
            ids.forEach(id => {
                const node = nodes.find(n => n.id === id);
                if (node) {
                    newNodes.push({
                        ...node,
                        id: `${node.id}-copy-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        position: { x: node.position.x + 20, y: node.position.y + 20 },
                        selected: true,
                    });
                }
            });
            setNodes((nds) => [
                ...nds.map(n => ({ ...n, selected: false })),
                ...newNodes
            ]);
        },
        [nodes, setNodes, takeSnapshot]
    );

    const onNodeDragStop = useCallback((_: any, node: Node) => {
        const { parentId, localPosition } = calculateContainment(node, nodes);

        if (parentId) {
            setNodes((nds) => nds.map((n) => {
                if (n.id === node.id) {
                    return { ...n, parentId, position: localPosition! };
                }
                return n;
            }));
        } else {
            // Check if we dragged out of a parent
            const containers = nodes.filter(n => ['vpc', 'region', 'k8s-namespace'].includes(n.type!) && n.id !== node.id);
            const w = node.measured?.width || (node.style?.width as number) || 120;
            const h = node.measured?.height || (node.style?.height as number) || 80;
            const centerX = node.position.x + w / 2;
            const centerY = node.position.y + h / 2;

            const isStillInParent = containers.some(c => {
                const cw = (c.style?.width as number) || 0;
                const ch = (c.style?.height as number) || 0;
                return centerX >= c.position.x && centerX <= c.position.x + cw &&
                       centerY >= c.position.y && centerY <= c.position.y + ch;
            });

            if (!isStillInParent && node.parentId) {
                const globalPos = calculateGlobalPosition(node, nodes);
                if (globalPos) {
                    setNodes((nds) => nds.map((n) => {
                        if (n.id === node.id) {
                            return { ...n, parentId: undefined, extent: undefined, position: globalPos };
                        }
                        return n;
                    }));
                }
            }
        }
    }, [nodes, setNodes]);

    const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#000000]">
                <Loader2 className="w-8 h-8 animate-spin text-white/10" />
            </div>
        );
    }

    if (isError || (!isLoading && !workspace)) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#000000] text-white font-sans">
                <Box className="w-16 h-16 text-white/10 mb-6" />
                <h1 className="text-2xl font-black uppercase tracking-widest mb-3">Project Not Found</h1>
                <p className="text-white/40 mb-8 max-w-md text-center text-sm leading-relaxed">
                    The architecture project you are looking for does not exist, has been deleted, or you do not have permission to access it.
                </p>
                <Link href="/">
                    <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors text-[11px] font-bold tracking-[0.2em] uppercase text-white/80 hover:text-white">
                        Return to Library
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden font-sans text-sm selection:bg-white/10 bg-[#0A0A0A] text-white flex">
                <NodeLibrarySidebar onDragStart={onDragStart} />
                <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full flex-1 relative transition-colors duration-300 bg-[#0A0A0A]"
                            data-cursor={drawingMode}
                            style={{ cursor: drawingMode === 'pan' ? 'grab' : undefined }}
                        >
                            {/* ── Canvas transition overlay ── */}
                            <AnimatePresence>
                                {canvasTransition !== 'idle' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                                        className="absolute inset-0 z-[999] bg-[#0A0A0A] pointer-events-none"
                                    />
                                )}
                            </AnimatePresence>
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                onNodeClick={onNodeClick}
                                onNodeDoubleClick={onNodeDoubleClick}
                                onNodeDragStart={onNodeDragStart}
                                onNodeDragStop={onNodeDragStop}
                                onNodeContextMenu={onNodeContextMenu}
                                onSelectionContextMenu={onSelectionContextMenu}
                                onEdgeContextMenu={onEdgeContextMenu}
                                onPaneContextMenu={onPaneContextMenu as any}
                                onNodesDelete={() => takeSnapshot()}
                                onEdgesDelete={() => takeSnapshot()}
                                onPaneClick={onPaneClick}
                                onDragOver={onDragOver}
                                onDrop={onDrop}
                                nodeTypes={nodeTypes}
                                fitView
                                style={{ cursor: 'inherit' }}
                                defaultEdgeOptions={{
                                    type: 'step',
                                    style: { stroke: '#555', strokeWidth: 2 },
                                }}
                                snapToGrid={snapToGrid}
                                snapGrid={[12, 12]}
                                colorMode="dark"
                                connectionMode={ConnectionMode.Loose}
                                panOnScroll={true}
                                panOnDrag={drawingMode === 'pan' ? true : [1, 2]}
                                selectionOnDrag={drawingMode === 'select'}
                                selectionMode={SelectionMode.Partial}
                            >
                                <Controls position="bottom-left" className="!bg-[#1E1E1E]/95 !backdrop-blur-xl !border-white/[0.05] !text-white/50 !shadow-2xl !rounded-full overflow-hidden !m-6 [&_button]:!bg-transparent [&_button]:!border-white/[0.05] [&_button]:hover:!bg-white/10 [&_button_svg]:!fill-white/70" />
                                <MiniMap position="bottom-right" className="!bg-[#1E1E1E]/95 !backdrop-blur-xl !border-white/[0.05] !shadow-2xl !rounded-2xl !mr-6 !mb-6 overflow-hidden [&_.react-flow__minimap-mask]:!fill-white/80" />
                                <Background variant={'dots' as any} gap={20} size={1.5} color="#333333" />
                                <div 
                                    className="absolute inset-0 pointer-events-none z-[0]"
                                    style={{
                                        WebkitMaskImage: 'radial-gradient(circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 0px, transparent 350px)',
                                        maskImage: 'radial-gradient(circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 0px, transparent 350px)',
                                    } as any}
                                >
                                    <Background 
                                        variant={'dots' as any} 
                                        gap={20} 
                                        size={1.5} 
                                        color="#FFFFFF" 
                                        className="opacity-50"
                                    />
                                </div>



                                {menu && (
                                    <motion.div
                                        ref={menuRef}
                                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                        style={{ top: menu.top, left: menu.left }}
                                        className="fixed rounded-2xl py-1.5 z-[100] min-w-[200px] bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
                                        onClick={() => setMenu(null)}
                                    >
                                        {menu.type === 'node' ? (() => {
                                            const selectedNodes = nodes.filter(n => n.selected || n.id === menu.id);
                                            const isMultiSelect = selectedNodes.length > 1;

                                            return (
                                              <>
                                                {!isMultiSelect && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedNodeId(menu.id);
                                                            setActiveTab('properties');
                                                        }}
                                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] transition-colors hover:bg-white/[0.06] text-white/70 hover:text-white"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                        <span className="flex-1 text-left">Edit Properties</span>
                                                        <span className="text-[10px] text-white/20 font-mono">Dbl-click</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => isMultiSelect ? duplicateSelection(selectedNodes.map(n => n.id)) : duplicateNode(menu.id)}
                                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] transition-colors hover:bg-white/[0.06] text-white/70 hover:text-white"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span className="flex-1 text-left">Duplicate{isMultiSelect ? ' All' : ''}</span>
                                                    <span className="text-[10px] text-white/20 font-mono">⌘D</span>
                                                </button>
                                                <div className="h-px my-1 mx-2 bg-white/[0.04]" />
                                                <button
                                                    onClick={() => {
                                                        takeSnapshot();
                                                        setNodes(nds => nds.map(n => {
                                                            if (n.selected || n.id === menu.id) {
                                                                const currentW = (n.style?.width as number) || n.measured?.width || 120;
                                                                const currentH = (n.style?.height as number) || n.measured?.height || 80;
                                                                return {
                                                                    ...n,
                                                                    position: {
                                                                        x: Math.round(n.position.x / 12) * 12,
                                                                        y: Math.round(n.position.y / 12) * 12
                                                                    },
                                                                    style: {
                                                                        ...n.style,
                                                                        width: Math.round(currentW / 24) * 24,
                                                                        height: Math.round(currentH / 24) * 24
                                                                    }
                                                                };
                                                            }
                                                            return n;
                                                        }));
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] transition-colors hover:bg-white/[0.06] text-white/70 hover:text-white"
                                                >
                                                    <Grid className="w-3.5 h-3.5" />
                                                    <span className="flex-1 text-left">Snap to Grid</span>
                                                </button>
                                                {selectedNodes.length >= 2 && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                if (selectedNodes.length < 2) return;
                                                                takeSnapshot();
                                                                const anchor = selectedNodes[0];
                                                                const anchorW = (anchor.style?.width as number) || anchor.measured?.width || 0;
                                                                const targetCenterX = anchor.position.x + anchorW / 2;
                                                                setNodes(nds => nds.map(n => {
                                                                    if (n.selected || n.id === menu.id) {
                                                                        const w = (n.style?.width as number) || n.measured?.width || 0;
                                                                        return { ...n, position: { ...n.position, x: Math.round((targetCenterX - w / 2) / 12) * 12 } };
                                                                    }
                                                                    return n;
                                                                }));
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] transition-colors hover:bg-white/[0.06] text-white/70 hover:text-white"
                                                        >
                                                            <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
                                                            <span className="flex-1 text-left">Align Vertical</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (selectedNodes.length < 2) return;
                                                                takeSnapshot();
                                                                const anchor = selectedNodes[0];
                                                                const anchorH = (anchor.style?.height as number) || anchor.measured?.height || 0;
                                                                const targetCenterY = anchor.position.y + anchorH / 2;
                                                                setNodes(nds => nds.map(n => {
                                                                    if (n.selected || n.id === menu.id) {
                                                                        const h = (n.style?.height as number) || n.measured?.height || 0;
                                                                        return { ...n, position: { ...n.position, y: Math.round((targetCenterY - h / 2) / 12) * 12 } };
                                                                    }
                                                                    return n;
                                                                }));
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] transition-colors hover:bg-white/[0.06] text-white/70 hover:text-white"
                                                        >
                                                            <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
                                                            <span className="flex-1 text-left">Align Horizontal</span>
                                                        </button>
                                                    </>
                                                )}
                                                <div className="h-px my-1 mx-2 bg-white/[0.04]" />
                                                <button
                                                    onClick={() => {
                                                        const selectedIds = nodes.filter(n => n.selected).map(n => n.id);
                                                        if (menu.id !== 'selection' && !selectedIds.includes(menu.id)) selectedIds.push(menu.id);
                                                        deleteNodes(selectedIds);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] hover:bg-red-500/10 transition-colors text-red-400/80 hover:text-red-300"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span className="flex-1 text-left">Delete{selectedNodes.length > 1 ? ` (${selectedNodes.length})` : ''}</span>
                                                    <span className="text-[10px] text-red-400/30 font-mono">⌫</span>
                                                </button>
                                            </>
                                            );
                                        })() : (
                                            /* ── Pane context menu: quick-add favorites ── */
                                            <>
                                                <div className="px-3.5 py-1.5 text-[9px] uppercase font-bold text-white/20 tracking-[0.15em]">Quick Add</div>
                                                {favoriteNodes.map((node) => (
                                                    <button
                                                        key={node.type}
                                                        onClick={() => {
                                                            const pos = screenToFlowPosition({ x: menu.left, y: menu.top });
                                                            addNode(node.type, node.label, { x: Math.round(pos.x / 12) * 12, y: Math.round(pos.y / 12) * 12 });
                                                        }}
                                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] transition-colors hover:bg-white/[0.06] text-white/70 hover:text-white"
                                                    >
                                                        <node.icon className="w-3.5 h-3.5 text-white/40" />
                                                        {node.label}
                                                    </button>
                                                ))}
                                                <div className="h-px my-1 mx-2 bg-white/[0.04]" />
                                                <button
                                                    onClick={() => {
                                                        const pos = screenToFlowPosition({ x: menu.left, y: menu.top });
                                                        addNode('note', 'Note...', { x: Math.round(pos.x / 12) * 12, y: Math.round(pos.y / 12) * 12 });
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] transition-colors hover:bg-white/[0.06] text-white/70 hover:text-white"
                                                >
                                                    <Type className="w-3.5 h-3.5 text-white/40" />
                                                    Sticky Note
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const pos = screenToFlowPosition({ x: menu.left, y: menu.top });
                                                        addNode('junction', 'Junction', { x: Math.round(pos.x / 12) * 12, y: Math.round(pos.y / 12) * 12 });
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] transition-colors hover:bg-white/[0.06] text-white/70 hover:text-white"
                                                >
                                                    <Circle className="w-3.5 h-3.5 text-white/40" />
                                                    Junction
                                                </button>
                                            </>
                                        )}
                                    </motion.div>
                                )}



                                {/* ── Floating top-left: back + title + breadcrumbs ── */}
                                <Panel position="top-left" className="ml-6 mt-6 z-50">
                                    <motion.div 
                                        initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                                        className="flex items-center gap-2"
                                    >
                                        {isNested ? (
                                            /* ── Breadcrumb navigation when inside a nested canvas ── */
                                            <div className="flex items-center gap-1 px-2 py-1.5 h-10 rounded-full bg-[#1E1E1E]/95 backdrop-blur-xl border border-white/[0.05] shadow-2xl">
                                                <button
                                                    onClick={() => exitToLevel(0)}
                                                    className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                                                >
                                                    {workspace?.title || 'Main'}
                                                </button>
                                                {canvasStack.map((level, i) => (
                                                    <React.Fragment key={level.nodeId}>
                                                        <ChevronRight className="w-3 h-3 text-white/15 flex-shrink-0" />
                                                        {i === canvasStack.length - 1 ? (
                                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white/80 bg-white/[0.06]">
                                                                {level.label}
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => exitToLevel(i + 1)}
                                                                className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                                                            >
                                                                {level.label}
                                                            </button>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                                <div className="w-px h-3.5 bg-white/10 mx-1" />
                                                {saveStatus === 'saved' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500/60" />}
                                                {saveStatus === 'saving' && <CloudUpload className="w-3.5 h-3.5 text-blue-400 animate-pulse" />}
                                                {saveStatus === 'unsaved' && <Circle className="w-3.5 h-3.5 text-white/20 cursor-pointer hover:text-white/50 transition-colors" onClick={handleSave} />}
                                            </div>
                                        ) : (
                                            /* ── Normal: back + title ── */
                                            <>
                                                <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E1E1E]/95 backdrop-blur-xl border border-white/[0.05] shadow-2xl text-white/50 hover:text-white hover:bg-[#2A2A2A] transition-all">
                                                    <ChevronLeft className="w-4 h-4 ml-[-2px]" />
                                                </Link>
                                                <div className="flex items-center gap-3 px-4 py-2.5 h-10 rounded-full bg-[#1E1E1E]/95 backdrop-blur-xl border border-white/[0.05] shadow-2xl">
                                                    <Box className="w-4 h-4 text-white/50" />
                                                    <span className="font-sans font-bold text-[13px] uppercase tracking-widest text-white/70">{workspace?.title || 'Untitled'}</span>
                                                    <div className="w-px h-3.5 bg-white/10 mx-1" />
                                                    {saveStatus === 'saved' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500/60" />}
                                                    {saveStatus === 'saving' && <CloudUpload className="w-3.5 h-3.5 text-blue-400 animate-pulse" />}
                                                    {saveStatus === 'unsaved' && <Circle className="w-3.5 h-3.5 text-white/20 cursor-pointer hover:text-white/50 transition-colors" onClick={handleSave} />}
                                                    {saveStatus === 'offline_saved' && <AlertCircle className="w-3.5 h-3.5 text-yellow-500/70 cursor-pointer" onClick={handleSave} />}
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                </Panel>

                                {/* ── Floating top-right: delete + avatar ── */}
                                <Panel position="top-right" className="mr-6 mt-6 z-50">
                                    <motion.div 
                                        initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                                        className="flex items-center gap-2"
                                    >
                                        <button
                                            onClick={() => {
                                                if (confirm("Are you sure you want to delete this entire project? This action cannot be undone.")) {
                                                    deleteWorkspace.mutate(workspaceId, {
                                                        onSuccess: () => {
                                                            toast({ title: "Project Deleted", description: "Architecture removed from catalog." });
                                                            setLocation("/");
                                                        }
                                                    });
                                                }
                                            }}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E1E1E]/95 backdrop-blur-xl border border-white/[0.05] shadow-2xl text-red-400/80 hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer pointer-events-auto"
                                            title="Delete Project"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <Avatar className="w-10 h-10 ring-1 ring-white/5 shadow-2xl pointer-events-auto cursor-pointer">
                                            <AvatarImage src={user?.profileImageUrl || undefined} />
                                            <AvatarFallback className="bg-[#1E1E1E]/95 backdrop-blur-xl text-white/70 text-[11px] font-bold">{user?.firstName?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                    </motion.div>
                                </Panel>

                                {/* ── Right-side vertical toolbar (Stitch-style) ── */}
                                <Panel position="top-right" className="mr-6 mt-40 z-50">
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                        className="flex flex-col items-center rounded-full p-1.5 gap-1.5 bg-[#1E1E1E]/95 backdrop-blur-xl border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                                    >
                                        <button
                                            onClick={() => {
                                                setDrawingMode('select');
                                            }}
                                            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${drawingMode === 'select' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/40 hover:text-white hover:bg-[#2A2A2A]'}`}
                                            title="Selection Tool"
                                        >
                                            <MousePointer2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDrawingMode('pan');
                                            }}
                                            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${drawingMode === 'pan' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/40 hover:text-white hover:bg-[#2A2A2A]'}`}
                                            title="Hand / Pan Tool"
                                        >
                                            <Hand className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDrawingMode(drawingMode === 'infrastructure' ? 'select' : 'infrastructure')}
                                            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${drawingMode === 'infrastructure' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/40 hover:text-white hover:bg-[#2A2A2A]'}`}
                                            title="Infrastructure Tool (Click map to place VPC)"
                                        >
                                            <Square className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDrawingMode(drawingMode === 'annotation' ? 'select' : 'annotation')}
                                            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${drawingMode === 'annotation' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/40 hover:text-white hover:bg-[#2A2A2A]'}`}
                                            title="Annotation Tool (Click map to place)"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>

                                        <div className="w-6 h-[1px] my-0.5 bg-white/10" />
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="w-9 h-9 flex items-center justify-center rounded-full transition-all text-white/40 hover:text-white hover:bg-[#2A2A2A]" title="Connection Settings">
                                                    <Spline className="w-4 h-4" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-3 bg-[#1E1E1E]/95 backdrop-blur-xl border border-white/[0.05] rounded-2xl shadow-2xl z-[150] space-y-4" side="left" align="start" sideOffset={16}>
                                                {/* Style & Arrow */}
                                                <div className="space-y-2">
                                                    <div className="text-[10px] uppercase font-bold tracking-widest text-white/40 px-1">Line Style</div>
                                                    <div className="grid grid-cols-3 gap-1">
                                                        {[
                                                            { id: 'solid', label: 'Normal', icon: Minus, hasArrow: false },
                                                            { id: 'dashed', label: 'Broken', icon: Minus, hasArrow: false },
                                                            { id: 'arrow', label: 'Arrow', icon: ArrowRight, hasArrow: true }
                                                        ].map(style => {
                                                            const isSelected = (edgeStyle === (style.id === 'dashed' ? 'dashed' : 'solid')) && (hasArrow === style.hasArrow);
                                                            return (
                                                                <button
                                                                    key={style.id}
                                                                    onClick={() => {
                                                                        const newStyle = style.id === 'dashed' ? 'dashed' : 'solid';
                                                                        const newArrow = style.hasArrow;
                                                                        setEdgeStyle(newStyle as any);
                                                                        setHasArrow(newArrow);
                                                                        setEdges(eds => eds.map(e => {
                                                                            if (!e.selected) return e;
                                                                            const s: any = { ...e.style, strokeDasharray: undefined };
                                                                            if (newStyle === 'dashed') s.strokeDasharray = '5 5';
                                                                            let m: any = undefined;
                                                                            if (newArrow) m = { type: 'arrowclosed' as const, color: '#555' };
                                                                            return { ...e, style: s, markerEnd: m };
                                                                        }));
                                                                    }}
                                                                    className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${isSelected ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white/80'}`}
                                                                >
                                                                    <style.icon className="w-4 h-4" />
                                                                    <span className="text-[10px]">{style.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                {/* Shape */}
                                                <div className="space-y-2">
                                                    <div className="text-[10px] uppercase font-bold tracking-widest text-white/40 px-1">Line Shape</div>
                                                    <div className="grid grid-cols-3 gap-1">
                                                        {[
                                                            { id: 'straight', label: 'Diagonal', icon: Minus, rotate: true },
                                                            { id: 'default', label: 'Curved', icon: Spline },
                                                            { id: 'step', label: 'Orthogonal', icon: Milestone }
                                                        ].map((tool) => (
                                                            <button
                                                                key={tool.id}
                                                                onClick={() => {
                                                                    setEdgeType(tool.id as any);
                                                                    setEdges(eds => eds.map(e => e.selected ? { ...e, type: tool.id } : e));
                                                                }}
                                                                className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-lg border transition-all ${edgeType === tool.id ? 'bg-white text-black border-white shadow-md' : 'bg-transparent text-white/60 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                                                            >
                                                                <tool.icon className={`w-4 h-4 ${tool.rotate ? 'rotate-45' : ''}`} />
                                                                <span className="text-[10px] font-bold">{tool.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        <button
                                            onClick={() => fitView({ duration: 800 })}
                                            className="p-2.5 rounded-xl transition-all text-white/40 hover:text-white hover:bg-white/5"
                                            title="Fit View"
                                        >
                                            <Maximize className="w-4 h-4" />
                                        </button>
                                        <div className="w-5 h-px my-0.5 bg-white/10" />
                                        <button
                                            onClick={() => setIsSimulating(!isSimulating)}
                                            className={`p-2.5 rounded-xl transition-all ${isSimulating ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                            title={isSimulating ? 'Stop Simulation' : 'Simulate'}
                                        >
                                            <Play className={`w-4 h-4 ${isSimulating ? 'fill-white' : ''}`} />
                                        </button>
                                    </motion.div>
                                </Panel>
                            </ReactFlow>
                            
                            <AiChatDrawer />
                        </motion.main>

                        {/* ── Right-side Properties Panel ── */}
                        <AnimatePresence>
                            {selectedNode && (
                                <motion.aside
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 280, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                    className="h-full bg-[#0E0E0E]/85 backdrop-blur-2xl border-l border-white/[0.04] overflow-hidden flex-shrink-0"
                                >
                                    <div className="h-full overflow-y-auto scrollbar-hide" style={{ width: 280 }}>
                                        <PropertiesSidebar
                                            selectedNode={selectedNode}
                                            updateNodeData={updateNodeData}
                                            updateNodeStyle={updateNodeStyle}
                                            deleteNode={onDelete}
                                            onClose={() => setSelectedNodeId(null)}
                                        />
                                    </div>
                                </motion.aside>
                            )}
                        </AnimatePresence>
        </div>
    );
}

export default function Workspace() {
    return (
        <ReactFlowProvider>
            <WorkspaceView />
        </ReactFlowProvider>
    );
}
