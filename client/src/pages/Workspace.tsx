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
    useViewport,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useCanvas, saveCanvasToLocalCache, getCanvasFromLocalCache } from '@/hooks/use-canvas';
import { useWorkspace, useDeleteWorkspace, useWorkspaceRole, type WorkspaceRole } from '@/hooks/use-workspaces';
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
    Hand,
    Undo2,
    Redo2,
    Menu,
    LogOut,
    ShieldCheck,
    Eye,
    Pen,
    Crown,
    Users,
    ChevronUp,
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
import { usePresence } from "@/hooks/use-presence";
import { CollaboratorCursors, PresenceIndicator } from "@/components/canvas/CollaboratorCursors";

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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // ── Role-based access control ──
    const { data: roleData } = useWorkspaceRole(workspaceId);
    const userRole: WorkspaceRole = roleData?.role || 'none';
    const canEdit = userRole === 'workspace-owner' || userRole === 'owner' || userRole === 'admin' || userRole === 'editor';
    const canManage = userRole === 'workspace-owner' || userRole === 'owner' || userRole === 'admin';
    const canDelete = userRole === 'workspace-owner' || userRole === 'owner' || userRole === 'admin';

    // ── Real-time collaboration (cursors & presence) ──
    const isRemoteUpdate = useRef(false);

    const handleRemoteNodeMove = useCallback((nodeId: string, x: number, y: number, parentId?: string | null) => {
        isRemoteUpdate.current = true;
        setNodes((nds) => nds.map((n) => {
            if (n.id === nodeId) {
                return { ...n, position: { x, y }, ...(parentId !== undefined ? { parentId: parentId || undefined } : {}) };
            }
            return n;
        }));
        // Reset after React processes the batch
        requestAnimationFrame(() => { isRemoteUpdate.current = false; });
    }, [setNodes]);

    const handleRemoteCanvasSync = useCallback((nodes: any[], edges: any[]) => {
        isRemoteUpdate.current = true;
        setNodes(nodes || []);
        setEdges(edges || []);
        // Reset after React processes the batch
        requestAnimationFrame(() => { isRemoteUpdate.current = false; });
    }, [setNodes, setEdges]);

    const { collaborators, isConnected: isPresenceConnected, sendCursor, sendNodeMove, sendCanvasSync } = usePresence(workspaceId, handleRemoteNodeMove, handleRemoteCanvasSync);
    const lastCursorSent = useRef(0);
    const lastNodeMoveSent = useRef(0);
    const canvasWrapperRef = useRef<HTMLDivElement>(null);

    // Throttled cursor broadcast on mouse move (uses React Flow's native event)
    const handlePaneMouseMove = useCallback((event: React.MouseEvent) => {
        const now = Date.now();
        if (now - lastCursorSent.current < 50) return; // Throttle to ~20fps
        lastCursorSent.current = now;
        try {
            const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            sendCursor(pos.x, pos.y);
        } catch {
            // screenToFlowPosition may throw if ReactFlow isn't ready
        }
    }, [screenToFlowPosition, sendCursor]);

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

    // ── Fast WS broadcast (500ms) — syncs to peers immediately ──
    const syncBroadcastRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (isInitialLoad.current) return;
        if (isRemoteUpdate.current) return;

        // Fast broadcast to peers via WS (500ms debounce)
        if (syncBroadcastRef.current) clearTimeout(syncBroadcastRef.current);
        syncBroadcastRef.current = setTimeout(() => {
            sendCanvasSync(nodes, edges);
        }, 500);

        // Slow persist to DB (3s debounce)
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
            if (syncBroadcastRef.current) clearTimeout(syncBroadcastRef.current);
        };
    }, [nodes, edges, workspaceId, sync, toast, sendCanvasSync]);

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

    const onNodeDrag = useCallback((_: any, node: Node) => {
        const now = Date.now();
        if (now - lastNodeMoveSent.current < 50) return; // Throttle to ~20fps
        lastNodeMoveSent.current = now;
        sendNodeMove(node.id, node.position.x, node.position.y, node.parentId);
    }, [sendNodeMove]);

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
            sendNodeMove(node.id, localPosition!.x, localPosition!.y, parentId);
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
                    sendNodeMove(node.id, globalPos.x, globalPos.y, null);
                }
            } else {
                // Send final position even if no containment change
                sendNodeMove(node.id, node.position.x, node.position.y, node.parentId);
            }
        }
    }, [nodes, setNodes, sendNodeMove]);

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
        <div className="h-screen w-screen overflow-hidden font-sans text-sm selection:bg-white/10 technical-gradient text-white relative">
            {canEdit && <NodeLibrarySidebar onDragStart={onDragStart} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />}


                <motion.main
                    ref={canvasWrapperRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 h-full relative bg-[#0A0A0A]"
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
                                onNodeDrag={onNodeDrag}
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
                                className={drawingMode === 'select' ? '[&_.react-flow__pane]:!cursor-default' : ''}
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
                                selectionOnDrag={drawingMode === 'select' || drawingMode === 'infrastructure' || drawingMode === 'annotation'}
                                selectionMode={SelectionMode.Partial}
                                nodesDraggable={canEdit && drawingMode === 'pan'}
                                elementsSelectable={canEdit}
                                onMouseMove={handlePaneMouseMove}
                            >
                                <Controls position="bottom-left" className="!bg-[#161616]/90 !backdrop-blur-2xl !border-white/[0.06] !text-white/50 !shadow-[0_8px_40px_rgba(0,0,0,0.7)] !rounded-2xl overflow-hidden !m-6 [&_button]:!bg-transparent [&_button]:!border-white/[0.05] [&_button]:hover:!bg-white/10 [&_button_svg]:!fill-white/70" />
                                <MiniMap position="bottom-right" className="!bg-[#161616]/90 !backdrop-blur-2xl !border-white/[0.06] !shadow-[0_8px_40px_rgba(0,0,0,0.7)] !rounded-2xl !mr-6 !mb-6 overflow-hidden [&_.react-flow__minimap-mask]:!fill-white/80" />
                                <Background variant={'dots' as any} gap={20} size={1.2} color="#ffffff22" />

                                {/* Collaborator cursors — inside ReactFlow so they follow the viewport like nodes */}
                                <CollaboratorCursors collaborators={collaborators} />

                                {/* ── Top-left panel — inside ReactFlow so it tracks canvas not root ── */}
                                <Panel position="top-left" className={`transition-all duration-300 my-5 ${sidebarCollapsed ? 'ml-[76px]' : 'ml-[280px]'}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: -16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-xl bg-[#121214]/80 backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.5)]"
                                    >
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.07] transition-all" title="Menu">
                                                    <Menu className="w-4 h-4" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48 p-1.5 bg-[#161616]/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.7)] z-[200]" side="bottom" align="start" sideOffset={8}>
                                                <Link href="/">
                                                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-white/60 hover:text-white hover:bg-white/[0.07] transition-all">
                                                        <ChevronLeft className="w-3.5 h-3.5" />
                                                        Back to Library
                                                    </button>
                                                </Link>
                                                <div className="h-px bg-white/[0.06] my-1" />
                                                {canDelete && (
                                                    <button
                                                        onClick={() => { if (confirm('Delete this project?')) deleteWorkspace.mutate(workspaceId, { onSuccess: () => { toast({ title: 'Deleted' }); setLocation('/'); } }); }}
                                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete Project
                                                    </button>
                                                )}
                                            </PopoverContent>
                                        </Popover>
                                        <div className="w-px h-4 bg-white/[0.08]" />
                                        {isNested ? (
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => exitToLevel(0)} className="px-2 py-1 rounded-md text-[12px] text-white/40 hover:text-white hover:bg-white/[0.07] transition-all">{workspace?.title || 'Main'}</button>
                                                {canvasStack.map((level, i) => (
                                                    <React.Fragment key={level.nodeId}>
                                                        <ChevronRight className="w-3 h-3 text-white/15" />
                                                        {i === canvasStack.length - 1
                                                            ? <span className="px-2 py-1 rounded-md text-[12px] font-semibold text-white/80 bg-white/[0.07]">{level.label}</span>
                                                            : <button onClick={() => exitToLevel(i + 1)} className="px-2 py-1 rounded-md text-[12px] text-white/40 hover:text-white hover:bg-white/[0.07] transition-all">{level.label}</button>}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="px-1.5 text-[13px] font-semibold text-white/80 pr-2">{workspace?.title || 'Untitled'}</span>
                                        )}
                                        <div className="flex items-center pr-1">
                                            {saveStatus === 'saved' && <span className="text-[10px] text-white/25">Saved</span>}
                                            {saveStatus === 'saving' && <span className="text-[10px] text-blue-400/70 animate-pulse">Saving…</span>}
                                            {saveStatus === 'unsaved' && <span className="w-2 h-2 rounded-full bg-amber-400/70 cursor-pointer block" onClick={handleSave} title="Unsaved changes" />}
                                        </div>
                                    </motion.div>
                                </Panel>

                                {/* ── Top-right panel ── */}
                                <Panel position="top-right" className="m-5">
                                    <motion.div
                                        initial={{ opacity: 0, y: -16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                                        className="flex items-center gap-2"
                                    >
                                        {/* Members & Presence dropdown */}
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#121214]/80 backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.5)] hover:bg-white/[0.06] transition-all">
                                                    {/* Connection dot */}
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isPresenceConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-red-400'}`} />
                                                    {/* Collaborator avatars */}
                                                    <div className="flex -space-x-1.5">
                                                        {collaborators.slice(0, 4).map((u) => (
                                                            <div key={u.userId} className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold" style={{ borderColor: u.color, backgroundColor: `${u.color}20`, color: u.color }}>
                                                                {u.name[0]?.toUpperCase()}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {collaborators.length > 0 && <span className="text-[10px] text-white/30 font-bold">{collaborators.length + 1}</span>}
                                                    <Users className="w-3 h-3 text-white/30" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-0 bg-[#121214]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.8)] z-[200]" side="bottom" align="end" sideOffset={8}>
                                                <div className="px-3 py-2.5 border-b border-white/[0.06]">
                                                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Team Members</span>
                                                </div>
                                                {/* Current user */}
                                                <div className="px-3 py-2 flex items-center gap-2.5 border-b border-white/[0.04]">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-[9px] font-bold text-white/80 border border-white/10">
                                                        {user?.firstName?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[11px] font-semibold text-white/80 truncate">{user?.firstName || 'You'} <span className="text-white/30">(you)</span></div>
                                                    </div>
                                                    {(() => {
                                                        const roleIcon = userRole === 'workspace-owner' || userRole === 'owner'
                                                            ? <Crown className="w-3 h-3 text-amber-400" />
                                                            : userRole === 'admin'
                                                            ? <ShieldCheck className="w-3 h-3 text-blue-400" />
                                                            : userRole === 'editor'
                                                            ? <Pen className="w-3 h-3 text-emerald-400" />
                                                            : <Eye className="w-3 h-3 text-white/30" />;
                                                        const roleLabel = userRole === 'workspace-owner' ? 'Owner' : userRole === 'owner' ? 'Owner' : userRole === 'admin' ? 'Admin' : userRole === 'editor' ? 'Editor' : 'Viewer';
                                                        const roleColor = userRole === 'workspace-owner' || userRole === 'owner' ? 'text-amber-400/80' : userRole === 'admin' ? 'text-blue-400/80' : userRole === 'editor' ? 'text-emerald-400/80' : 'text-white/30';
                                                        return (
                                                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.04] ${roleColor}`}>
                                                                {roleIcon}
                                                                <span className="text-[9px] font-bold uppercase tracking-wider">{roleLabel}</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                {/* Other collaborators */}
                                                <div className="max-h-[200px] overflow-y-auto">
                                                    {collaborators.length === 0 ? (
                                                        <div className="px-3 py-4 text-center text-[11px] text-white/20">No other members online</div>
                                                    ) : (
                                                        collaborators.map((collab) => (
                                                            <div key={collab.userId} className="px-3 py-2 flex items-center gap-2.5 hover:bg-white/[0.03] transition-colors">
                                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2" style={{ borderColor: collab.color, backgroundColor: `${collab.color}15`, color: collab.color }}>
                                                                    {collab.name[0]?.toUpperCase()}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-[11px] font-medium text-white/70 truncate">{collab.name}</div>
                                                                </div>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" title="Online" />
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        {/* Undo/Redo/Simulate — editors+ only */}
                                        {canEdit && (
                                            <div className="flex items-center gap-0.5 px-1 py-1 rounded-xl bg-[#121214]/80 backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.5)]">
                                                <button onClick={undo} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/35 hover:text-white/80 hover:bg-white/[0.07] transition-all" title="Undo"><Undo2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={redo} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/35 hover:text-white/80 hover:bg-white/[0.07] transition-all" title="Redo"><Redo2 className="w-3.5 h-3.5" /></button>
                                                <div className="w-px h-4 bg-white/[0.08] mx-0.5" />
                                                <button
                                                    onClick={() => setIsSimulating(!isSimulating)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isSimulating ? 'bg-green-500/20 text-green-400' : 'text-white/35 hover:text-white/80 hover:bg-white/[0.07]'}`}
                                                    title={isSimulating ? 'Stop' : 'Simulate'}
                                                >
                                                    <Play className={`w-3.5 h-3.5 ${isSimulating ? 'fill-green-400' : ''}`} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Save — editors+ only */}
                                        {canEdit && (
                                            <button
                                                onClick={handleSave}
                                                className="h-9 px-4 flex items-center gap-1.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-[12px] font-semibold transition-all shadow-[0_2px_12px_rgba(22,163,74,0.35)] active:scale-[0.97]"
                                            >
                                                {saveStatus === 'saving' ? <CloudUpload className="w-3.5 h-3.5 animate-pulse" /> : saveStatus === 'saved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                                                {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Save'}
                                            </button>
                                        )}

                                        {/* Viewer badge */}
                                        {!canEdit && (
                                            <div className="h-9 px-4 flex items-center gap-1.5 rounded-xl bg-[#121214]/80 backdrop-blur-xl border border-white/[0.08] text-white/40 text-[12px] font-semibold">
                                                <Eye className="w-3.5 h-3.5" />
                                                View Only
                                            </div>
                                        )}
                                    </motion.div>
                                </Panel>
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



                                {/* ── Bottom-center horizontal toolbar ── */}
                                <Panel position="bottom-center" className="mb-6 z-50">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                        className="flex items-center rounded-2xl p-1.5 gap-0.5 bg-[#121214]/80 backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)]"
                                    >
                                        {[
                                            { mode: 'select' as const, icon: MousePointer2, title: 'Select' },
                                            { mode: 'pan' as const, icon: Hand, title: 'Pan' },
                                        ].map(tool => (
                                            <motion.button
                                                key={tool.mode}
                                                onClick={() => setDrawingMode(tool.mode)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${drawingMode === tool.mode ? 'bg-[#FF5500] text-white shadow-[0_0_20px_rgba(255,85,0,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}
                                                title={tool.title}
                                                whileTap={{ scale: 0.92 }}
                                            >
                                                <tool.icon className="w-4 h-4" />
                                            </motion.button>
                                        ))}

                                        <div className="w-px h-5 bg-white/[0.08] mx-1" />

                                        <motion.button
                                            onClick={() => setDrawingMode(drawingMode === 'infrastructure' ? 'select' : 'infrastructure')}
                                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${drawingMode === 'infrastructure' ? 'bg-[#FF5500] text-white shadow-[0_0_20px_rgba(255,85,0,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}
                                            title="Infrastructure Zone"
                                            whileTap={{ scale: 0.92 }}
                                        >
                                            <Square className="w-4 h-4" />
                                        </motion.button>

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <motion.button
                                                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all text-white/40 hover:text-white hover:bg-white/[0.06]`}
                                                    title="Connection Settings"
                                                    whileTap={{ scale: 0.92 }}
                                                >
                                                    <Spline className="w-4 h-4" />
                                                </motion.button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-3 bg-[#161616]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] z-[150] space-y-4" side="top" align="center" sideOffset={16}>
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

                                        <motion.button
                                            onClick={() => setDrawingMode(drawingMode === 'annotation' ? 'select' : 'annotation')}
                                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${drawingMode === 'annotation' ? 'bg-[#FF5500] text-white shadow-[0_0_20px_rgba(255,85,0,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}
                                            title="Annotation"
                                            whileTap={{ scale: 0.92 }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </motion.button>

                                        <motion.button
                                            onClick={() => fitView({ duration: 800 })}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all text-white/40 hover:text-white hover:bg-white/[0.06]"
                                            title="Fit View"
                                            whileTap={{ scale: 0.92 }}
                                        >
                                            <Maximize className="w-4 h-4" />
                                        </motion.button>
                                    </motion.div>
                                </Panel>
                            </ReactFlow>
                        <MoshZoneOverlay />
                        <AiChatDrawer />
                    </motion.main>

                    {/* ── Right properties panel ── overlays canvas, z-40 above sidebar ── */}
                    <AnimatePresence>
                        {selectedNode && (
                            <motion.aside
                                initial={{ x: 280, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 280, opacity: 0 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute right-0 top-0 h-full w-[280px] bg-[#121214]/80 backdrop-blur-xl border-l border-white/[0.08] shadow-[inset_1px_0_0_rgba(255,255,255,0.05),-4px_0_24px_rgba(0,0,0,0.5)] overflow-hidden z-40"
                            >
                                <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
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

function MoshZoneOverlay() {
    const [zone, setZone] = useState<{ active: boolean, x: number, y: number }>({ active: false, x: 0, y: 0 });
    const { x, y, zoom } = useViewport();

    useEffect(() => {
        const handleDesigning = (e: any) => {
            if (e.detail?.active) {
                setZone({ active: true, x: e.detail.x, y: e.detail.y });
            } else {
                setZone(prev => ({ ...prev, active: false }));
            }
        };
        window.addEventListener('mosh:designing', handleDesigning);
        return () => window.removeEventListener('mosh:designing', handleDesigning);
    }, []);

    if (!zone.active) return null;

    // Fixed size for the fake node
    const width = 800;
    const height = 600;
    
    // Project canvas coordinates to screen coordinates
    const screenX = zone.x * zoom + x;
    const screenY = zone.y * zoom + y;

    return (
        <div 
            className="absolute top-0 left-0 pointer-events-none z-[10]"
            style={{ 
                transform: `translate(${screenX - (width * zoom) / 2}px, ${screenY - (height * zoom) / 2}px) scale(${zoom})`,
                transformOrigin: 'top left',
                width: `${width}px`,
                height: `${height}px`
            }}
        >
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0 border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
                        {/* Scanning Laser */}
                        <motion.div 
                            className="absolute left-0 right-0 h-[1px] bg-white shadow-[0_0_16px_2px_rgba(255,255,255,0.6)]"
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
