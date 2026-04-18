import { useCallback, useEffect, useState, useRef } from 'react';
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
    AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SystemNode } from '@/components/canvas/nodes/SystemNode';
import {
    K8sPodIcon, K8sDeployIcon, K8sReplicaSetIcon, K8sStatefulIcon, K8sDaemonIcon,
    K8sServiceIcon, K8sIngressIcon, K8sConfigMapIcon, K8sSecretIcon, K8sPVCIcon,
    K8sJobIcon, K8sCronJobIcon, K8sHPAIcon, K8sNamespaceIcon
} from '@/components/canvas/icons/KubernetesIcons';

import { nodeTypes, nodeTypesList } from '@/features/workspace/utils/nodeTypes';
import { nodeDimensions } from "@/features/workspace/utils/dimensions";
import { generateTemplate } from "@/features/workspace/utils/templates";
import { PropertiesSidebar } from "@/features/workspace/components/PropertiesSidebar";
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
    const { screenToFlowPosition } = useReactFlow();
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
    const [drawingMode, setDrawingMode] = useState<'select' | 'annotation' | 'infrastructure'>('select');
    const { fitView } = useReactFlow();
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

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
    const [layerMenu, setLayerMenu] = useState<{ id: string; top: number; left: number } | null>(null);
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

    const onLayerContextMenu = useCallback((event: React.MouseEvent, nodeId: string) => {
        event.preventDefault();
        setLayerMenu({
            id: nodeId,
            top: event.clientY,
            left: event.clientX,
        });
    }, []);

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
            setLayerMenu(null);
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
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
                if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                    deleteNode(selectedNodeId);
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (!isSyncing) {
                    handleSave();
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
        if (node.id) {
            setSelectedNodeId(node.id);
            setActiveTab('properties');
            setTimeout(() => {
                const input = document.querySelector('[data-property-input="true"]') as HTMLTextAreaElement | HTMLInputElement;
                input?.focus();
                if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
                    input.select();
                }
            }, 50);
        }
    }, []);



    const onNodeDragStart = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

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
        <div className="h-screen w-screen overflow-hidden font-sans text-sm selection:bg-white/10 bg-[#0A0A0A] text-white">
                <main
                    className="h-full w-full relative transition-colors duration-300 bg-[#0A0A0A]"
                            data-cursor={drawingMode}
                        >
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
                                panOnScrollSpeed={2}
                            >
                                <Controls position="bottom-left" className="!bg-white/[0.1] !backdrop-blur-md !backdrop-saturate-150 !border-white/[0.2] !text-white/50 !shadow-2xl !rounded-lg overflow-hidden !m-6 [&_button]:!bg-transparent [&_button]:!border-white/[0.1] [&_button]:hover:!bg-white/20 [&_button_svg]:!fill-white/70" />
                                <MiniMap position="bottom-left" className="!bg-white/[0.1] !backdrop-blur-md !backdrop-saturate-150 !border-white/[0.2] !shadow-2xl !rounded-xl !ml-6 !mb-20 overflow-hidden [&_.react-flow__minimap-mask]:!fill-white/80" />
                                <Background variant={'lines' as any} gap={24} size={1} color="#1A1A1A" />



                                {menu && (
                                    <div
                                        ref={menuRef}
                                        style={{ top: menu.top, left: menu.left }}
                                        className="fixed rounded-xl py-1 z-[100] min-w-[160px] bg-white/[0.1] backdrop-blur-md backdrop-saturate-150 border border-white/[0.2] shadow-2xl"
                                        onClick={() => setMenu(null)}
                                    >
                                        {menu.type === 'node' ? (
                                            <>
                                                <button
                                                    onClick={() => duplicateNode(menu.id)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/5 text-white/70 hover:text-white"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                    Duplicate
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedNodeId(menu.id);
                                                        setActiveTab('properties');
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/5 text-white/70 hover:text-white"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    Edit Properties
                                                </button>
                                                <div className="h-px my-1 bg-white/5" />
                                                <div className="px-3 py-1 text-[9px] uppercase font-bold text-white/20 tracking-widest">Layout</div>
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
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/5 text-white/70 hover:text-white"
                                                >
                                                    <Grid className="w-3.5 h-3.5" />
                                                    Straighten (Center & Snap)
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const selectedNodes = nodes.filter(n => n.selected || n.id === menu.id);
                                                        if (selectedNodes.length < 2) return;
                                                        takeSnapshot();

                                                        // Use first node as anchor
                                                        const anchor = selectedNodes[0];
                                                        const anchorW = (anchor.style?.width as number) || anchor.measured?.width || 0;
                                                        const targetCenterX = anchor.position.x + anchorW / 2;

                                                        setNodes(nds => nds.map(n => {
                                                            if (n.selected || n.id === menu.id) {
                                                                const w = (n.style?.width as number) || n.measured?.width || 0;
                                                                return {
                                                                    ...n,
                                                                    position: {
                                                                        ...n.position,
                                                                        x: Math.round((targetCenterX - w / 2) / 12) * 12
                                                                    }
                                                                };
                                                            }
                                                            return n;
                                                        }));
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/5 text-white/70 hover:text-white"
                                                >
                                                    <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
                                                    Align Centers (Vertical)
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const selectedNodes = nodes.filter(n => n.selected || n.id === menu.id);
                                                        if (selectedNodes.length < 2) return;
                                                        takeSnapshot();

                                                        const anchor = selectedNodes[0];
                                                        const anchorH = (anchor.style?.height as number) || anchor.measured?.height || 0;
                                                        const targetCenterY = anchor.position.y + anchorH / 2;

                                                        setNodes(nds => nds.map(n => {
                                                            if (n.selected || n.id === menu.id) {
                                                                const h = (n.style?.height as number) || n.measured?.height || 0;
                                                                return {
                                                                    ...n,
                                                                    position: {
                                                                        ...n.position,
                                                                        y: Math.round((targetCenterY - h / 2) / 12) * 12
                                                                    }
                                                                };
                                                            }
                                                            return n;
                                                        }));
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/5 text-white/70 hover:text-white"
                                                >
                                                    <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
                                                    Align Centers (Horizontal)
                                                </button>
                                                <div className="h-px my-1 bg-white/5" />
                                                <button
                                                    onClick={() => {
                                                        const selectedIds = nodes.filter(n => n.selected).map(n => n.id);
                                                        if (!selectedIds.includes(menu.id)) selectedIds.push(menu.id);
                                                        deleteNodes(selectedIds);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Delete {nodes.filter(n => n.selected).length > 1 ? `(${nodes.filter(n => n.selected).length})` : ''}
                                                </button>
                                            </>
                                        ) : (
                                            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                                {['Templates', 'Kubernetes', 'Infrastructure', 'Compute', 'Networking', 'Data', 'CI/CD', 'Security', 'Monitoring', 'Analytics', 'External', 'Documentation', 'Utilities'].map(category => {
                                                    const categoryItems = nodeTypesList.filter(n => n.category.toLowerCase() === category.toLowerCase());
                                                    if (categoryItems.length === 0) return null;

                                                    return (
                                                        <div key={category} className="py-1">
                                                            <div className="px-3 py-1 text-[9px] uppercase font-bold text-white/20 tracking-widest bg-white/[0.02]">
                                                                {category}
                                                            </div>
                                                            {categoryItems.map((node) => (
                                                                <button
                                                                    key={node.type}
                                                                    onClick={() => {
                                                                        const pos = screenToFlowPosition({ x: menu.left, y: menu.top });
                                                                        const snappedPos = {
                                                                            x: Math.round(pos.x / 12) * 12,
                                                                            y: Math.round(pos.y / 12) * 12
                                                                        };
                                                                        addNode(node.type, node.label, snappedPos);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/5 text-white/70 hover:text-white"
                                                                >
                                                                    <node.icon className="w-3.5 h-3.5" />
                                                                    {node.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {layerMenu && (
                                    <div
                                        style={{ top: layerMenu.top, left: layerMenu.left }}
                                        className="fixed rounded-xl py-1 z-[200] min-w-[180px] bg-white/[0.1] backdrop-blur-md backdrop-saturate-150 border border-white/[0.2] shadow-2xl"
                                        onClick={() => setLayerMenu(null)}
                                    >
                                        <button
                                            onClick={() => focusNode(layerMenu.id)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/5 text-white/70 hover:text-white"
                                        >
                                            <Maximize className="w-3.5 h-3.5" />
                                            Focus on Canvas
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedNodeId(layerMenu.id);
                                                setActiveTab('properties');
                                                setTimeout(() => {
                                                    const input = document.querySelector('[data-property-input="true"]') as HTMLInputElement;
                                                    input?.focus();
                                                }, 50);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/5 text-white/70 hover:text-white"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Rename Component
                                        </button>
                                        <button
                                            onClick={() => duplicateNode(layerMenu.id)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/5 text-white/70 hover:text-white"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            Duplicate
                                        </button>
                                        <div className="h-px my-1 bg-white/5" />
                                        <button
                                            onClick={() => deleteNode(layerMenu.id)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete Component
                                        </button>
                                    </div>
                                )}

                                {/* ── Floating top-left: back + title + save ── */}
                                <Panel position="top-left" className="ml-6 mt-6 flex items-center gap-3 z-50">
                                    <Link href="/" className="p-2.5 rounded-xl bg-white/[0.1] backdrop-blur-md backdrop-saturate-150 border border-white/[0.2] shadow-2xl text-white/50 hover:text-white hover:bg-white/[0.15] transition-all">
                                        <ChevronLeft className="w-4 h-4" />
                                    </Link>
                                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.1] backdrop-blur-md backdrop-saturate-150 border border-white/[0.2] shadow-2xl">
                                        <Box className="w-4 h-4 text-white/50" />
                                        <span className="font-sans font-bold text-[13px] uppercase tracking-widest text-white/70">{workspace?.title || 'Untitled'}</span>
                                        <div className="w-px h-3.5 bg-white/10 mx-1" />
                                        {saveStatus === 'saved' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500/60" />}
                                        {saveStatus === 'saving' && <CloudUpload className="w-3.5 h-3.5 text-blue-400 animate-pulse" />}
                                        {saveStatus === 'unsaved' && <Circle className="w-3.5 h-3.5 text-white/20 cursor-pointer hover:text-white/50 transition-colors" onClick={handleSave} />}
                                        {saveStatus === 'offline_saved' && <AlertCircle className="w-3.5 h-3.5 text-yellow-500/70 cursor-pointer" onClick={handleSave} />}
                                    </div>
                                </Panel>

                                {/* ── Floating top-right: delete + avatar ── */}
                                <Panel position="top-right" className="mr-6 mt-6 flex items-center gap-3 z-50">
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
                                        className="p-2.5 rounded-xl bg-white/[0.1] backdrop-blur-md backdrop-saturate-150 border border-white/[0.2] shadow-2xl text-red-400/80 hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer pointer-events-auto"
                                        title="Delete Project"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <Avatar className="w-9 h-9 ring-1 ring-white/[0.2] shadow-2xl pointer-events-auto cursor-pointer">
                                        <AvatarImage src={user?.profileImageUrl || undefined} />
                                        <AvatarFallback className="bg-white/10 backdrop-blur-md text-white/70 text-[11px] font-bold">{user?.firstName?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                </Panel>

                                {/* ── Right-side vertical toolbar (Stitch-style) ── */}
                                <Panel position="top-right" className="mr-6 mt-40 flex flex-col items-center rounded-2xl p-2 gap-1.5 z-50 bg-white/[0.1] backdrop-blur-md backdrop-saturate-150 border border-white/[0.2] shadow-2xl">
                                    <button
                                        onClick={() => {
                                            setDrawingMode('select');
                                            fitView({ duration: 800 });
                                        }}
                                        className={`p-2.5 rounded-xl transition-all ${drawingMode === 'select' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                        title="Selection Tool"
                                    >
                                        <MousePointer2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDrawingMode(drawingMode === 'infrastructure' ? 'select' : 'infrastructure')}
                                        className={`p-2.5 rounded-xl transition-all ${drawingMode === 'infrastructure' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                        title="Infrastructure Tool (Click map to place VPC)"
                                    >
                                        <Square className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDrawingMode(drawingMode === 'annotation' ? 'select' : 'annotation')}
                                        className={`p-2.5 rounded-xl transition-all ${drawingMode === 'annotation' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                        title="Annotation Tool (Click map to place)"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <div className="w-5 h-px my-0.5 bg-white/10" />
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="p-2.5 rounded-xl transition-all text-white/40 hover:text-white hover:bg-white/5" title="Connection Settings">
                                                <Spline className="w-4 h-4" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 p-3 bg-white/[0.1] backdrop-blur-md backdrop-saturate-150 border border-white/[0.2] rounded-xl shadow-2xl z-[150] space-y-4" side="left" align="start" sideOffset={16}>
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
                                                                className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-lg border transition-all ${isSelected ? 'bg-white text-black border-white shadow-md' : 'bg-transparent text-white/60 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                                                            >
                                                                {style.id === 'dashed' ? (
                                                                    <div className="w-4 h-0 border-b-2 border-dashed border-current my-2" />
                                                                ) : (
                                                                    <style.icon className="w-4 h-4" />
                                                                )}
                                                                <span className="text-[10px] font-bold">{style.label}</span>
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
                                </Panel>
                            </ReactFlow>
                </main>
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
