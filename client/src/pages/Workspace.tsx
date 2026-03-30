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
import { useCanvas } from '@/hooks/use-canvas';
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
    ArrowRight
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
        if (canvasData) {
            setNodes(canvasData.nodes || []);
            setEdges(canvasData.edges || []);
        }
    }, [canvasData, setNodes, setEdges]);

    useEffect(() => {
        setEdges((eds) =>
            eds.map((edge) => {
                const currentStyle = (edge.style as any) || {};
                const newStyle = {
                    ...currentStyle,
                    stroke: isSimulating ? '#FFFFFF' : '#444'
                };

                let newMarkerEnd = edge.markerEnd as any;
                if (newMarkerEnd && typeof newMarkerEnd === 'object') {
                    newMarkerEnd = {
                        ...newMarkerEnd,
                        color: isSimulating ? '#FFFFFF' : '#444'
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
            const style: any = { stroke: '#444', strokeWidth: 2 };
            if (edgeStyle === 'dashed') style.strokeDasharray = '5 5';
            if (edgeStyle === 'dotted') style.strokeDasharray = '2 2';

            setEdges((eds) => addEdge({
                ...params,
                type: edgeType,
                style,
                animated: isSimulating,
                markerEnd: hasArrow ? { type: 'arrowclosed' as any, color: '#444' } : undefined
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
        sync({ nodes, edges }, {
            onSuccess: () => {
                toast({
                    title: "Workspace changes saved",
                    description: "",
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
        <div className="h-screen w-screen overflow-hidden flex flex-col font-sans text-sm selection:bg-black/10 bg-[#FDFCF8] text-black">
            <header className="h-12 border-b flex items-center justify-between px-3 shrink-0 z-50 border-white/5 bg-[#121212] text-white">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-1.5 rounded-md transition-colors text-white/50 hover:text-white hover:bg-white/5">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-4 w-px mx-1 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-white" />
                        <span className="font-sans font-black text-lg uppercase tracking-widest text-white/90">{workspace?.title || 'Untitled Project'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleSave} disabled={isSyncing} className="flex items-center justify-center w-8 h-8 rounded-md border transition-all border-white/10 hover:bg-white/5 hover:border-[#FF5A36]/50 text-white/80 hover:text-[#FF5A36]" title="Save Project (Ctrl+S)">
                        {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>

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
                        className="flex items-center justify-center w-8 h-8 rounded-md border transition-all border-red-500/20 hover:bg-red-500/10 text-red-400"
                        title="Delete Project"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px mx-1 bg-white/10" />
                    <Avatar className="w-7 h-7 ring-1 ring-white/10">
                        <AvatarImage src={user?.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-white/5 text-white/50 text-[10px] font-bold">{user?.firstName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={20} minSize={20} maxSize={30}>
                        <aside className="h-full border-r flex flex-col z-40 border-black/5 bg-[#121212] text-white">
                            <div className="h-10 border-b flex items-center px-4 gap-2 border-white/5 bg-white/5">
                                <span className="font-bold text-[10px] uppercase tracking-widest text-white/30">Library</span>
                            </div>

                            <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                    <input
                                        type="text"
                                        placeholder="Search components..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-[12px] placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-px scrollbar-hide">
                                {(() => {
                                    const categories = ['Templates', 'Kubernetes', 'Infrastructure', 'Compute', 'Networking', 'Data', 'CI/CD', 'Security', 'Monitoring', 'Analytics', 'External', 'Documentation', 'Utilities'];
                                    let hasAnyResults = false;

                                    const content = categories.map(category => {
                                        const searchKeywords = searchTerm.toLowerCase().split(' ').filter(k => k.length > 0);

                                        const categoryItems = nodeTypesList.filter(item => {
                                            const matchesCategory = item.category.toLowerCase() === category.toLowerCase();
                                            if (!matchesCategory) return false;

                                            if (searchKeywords.length === 0) return true;

                                            const targetText = `${item.label} ${item.type} ${item.category}`.toLowerCase();
                                            return searchKeywords.every(keyword => targetText.includes(keyword));
                                        }).sort((a, b) => a.label.localeCompare(b.label));

                                        if (categoryItems.length === 0) return null;
                                        hasAnyResults = true;

                                        // Auto-expand if searching, otherwise use state
                                        const isExpanded = searchTerm !== '' ? true : (expandedCategories[category] === true);

                                        return (
                                            <section key={category} className="border-b border-white/[0.03]">
                                                <button
                                                    onClick={() => toggleCategory(category)}
                                                    className="w-full h-10 flex items-center px-4 gap-2 transition-colors hover:bg-white/5 group"
                                                >
                                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? '' : '-rotate-90'} text-white/20`} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{category}</span>
                                                    <span className="ml-auto text-[9px] font-bold text-white/10">{categoryItems.length}</span>
                                                </button>

                                                {isExpanded && (
                                                    <div className="p-2 grid grid-cols-1 gap-1">
                                                        {categoryItems.map((item) => (
                                                            <button
                                                                key={item.type}
                                                                onClick={() => {
                                                                    const pos = { x: 100, y: 100 };
                                                                    if (item.type.startsWith('template:')) {
                                                                        applyTemplate(item.type, pos);
                                                                    } else {
                                                                        addNode(item.type, item.label, pos);
                                                                    }
                                                                }}
                                                                onDragStart={(e) => onDragStart(e, item.type, item.label)}
                                                                draggable
                                                                className="flex items-center gap-3 p-2 rounded-lg border border-transparent transition-all text-left group hover:bg-white/5 cursor-grab active:cursor-grabbing"
                                                            >
                                                                <div className="p-1.5 rounded-md transition-colors bg-white/5 text-white/60 group-hover:text-white group-hover:bg-white/10">
                                                                    <item.icon className="w-4 h-4" />
                                                                </div>
                                                                <span className="text-[12px] font-medium text-white/70 group-hover:text-white">{item.label}</span>
                                                                <Plus className="w-3 h-3 ml-auto text-white/0 group-hover:text-white/20" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </section>
                                        );
                                    });

                                    if (!hasAnyResults && searchTerm !== '') {
                                        return (
                                            <div className="flex flex-col items-center justify-center h-40 px-6 text-center">
                                                <Search className="w-8 h-8 text-white/5 mb-3" />
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-white/20">No components found</p>
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="mt-4 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
                                                >
                                                    Clear Search
                                                </button>
                                            </div>
                                        );
                                    }

                                    return content;
                                })()
                                }
                            </div>
                        </aside>
                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-black/5" />

                    <ResizablePanel defaultSize={60}>
                        <main
                            className="h-full relative transition-colors duration-300 bg-[#FDFCF8]"
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
                                    style: { stroke: '#444', strokeWidth: 2 },
                                }}
                                snapToGrid={snapToGrid}
                                snapGrid={[12, 12]}
                                colorMode="light"
                                connectionMode={ConnectionMode.Loose}
                            >
                                <Controls position="bottom-right" className="!bg-white !border-black/10 !text-black/50 !shadow-2xl !rounded-lg overflow-hidden !m-6" />
                                <MiniMap position="bottom-left" className="!bg-white !border-black/5 !shadow-2xl !rounded-xl !m-6 overflow-hidden [&_.react-flow__minimap-mask]:!fill-black/80" />
                                <Background variant={'lines' as any} gap={24} size={1} color="#DDD" />



                                {menu && (
                                    <div
                                        ref={menuRef}
                                        style={{ top: menu.top, left: menu.left }}
                                        className="fixed border rounded-lg shadow-2xl py-1 z-[100] min-w-[160px] bg-white border-black/10"
                                        onClick={() => setMenu(null)}
                                    >
                                        {menu.type === 'node' ? (
                                            <>
                                                <button
                                                    onClick={() => duplicateNode(menu.id)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                    Duplicate
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedNodeId(menu.id);
                                                        setActiveTab('properties');
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    Edit Properties
                                                </button>
                                                <div className="h-px my-1 bg-black/5" />
                                                <div className="px-3 py-1 text-[9px] uppercase font-bold text-black/20 tracking-widest">Layout</div>
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
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
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
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
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
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
                                                >
                                                    <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
                                                    Align Centers (Horizontal)
                                                </button>
                                                <div className="h-px my-1 bg-black/5" />
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
                                                            <div className="px-3 py-1 text-[9px] uppercase font-bold text-black/20 tracking-widest bg-black/[0.02]">
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
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5 text-black/70 hover:text-black"
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
                                        className="fixed border rounded-lg shadow-2xl py-1 z-[200] min-w-[180px] bg-[#1a1a1a] border-white/10"
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

                                <Panel position="bottom-center" className="mb-8 flex items-center border rounded-2xl shadow-2xl p-1.5 gap-1.5 z-50 bg-white border-black/10">
                                    <button
                                        onClick={() => {
                                            setDrawingMode('select');
                                            fitView({ duration: 800 });
                                        }}
                                        className={`p-2.5 rounded-xl transition-all ${drawingMode === 'select' ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
                                        title="Selection Tool"
                                    >
                                        <MousePointer2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDrawingMode(drawingMode === 'infrastructure' ? 'select' : 'infrastructure')}
                                        className={`p-2.5 rounded-xl transition-all ${drawingMode === 'infrastructure' ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
                                        title="Infrastructure Tool (Click map to place VPC)"
                                    >
                                        <Square className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDrawingMode(drawingMode === 'annotation' ? 'select' : 'annotation')}
                                        className={`p-2.5 rounded-xl transition-all ${drawingMode === 'annotation' ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
                                        title="Annotation Tool (Click map to place)"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className={`p-2.5 rounded-xl transition-all ${edgeType ? 'bg-black/5 text-black' : 'text-black/40 hover:text-black hover:bg-black/5'}`} title="Line Type">
                                                {edgeType === 'step' && <Milestone className="w-4 h-4" />}
                                                {edgeType === 'smoothstep' && <Spline className="w-4 h-4" />}
                                                {edgeType === 'straight' && <Minus className="w-4 h-4 rotate-45" />}
                                                {edgeType === 'default' && <ArrowUpRight className="w-4 h-4" />}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-1 bg-white border border-black/10 rounded-xl shadow-2xl z-[150]" side="top" align="center" sideOffset={12}>
                                            <div className="flex gap-1 p-1">
                                                {[
                                                    { id: 'step', icon: Milestone },
                                                    { id: 'smoothstep', icon: Spline },
                                                    { id: 'straight', icon: Minus, rotate: true },
                                                    { id: 'default', icon: ArrowUpRight }
                                                ].map((tool) => (
                                                    <button
                                                        key={tool.id}
                                                        onClick={() => {
                                                            setEdgeType(tool.id as any);
                                                            // Apply to selected edges
                                                            setEdges(eds => eds.map(e => e.selected ? { ...e, type: tool.id } : e));
                                                        }}
                                                        className={`p-2 rounded-lg transition-all ${edgeType === tool.id ? 'bg-black text-white' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
                                                    >
                                                        <tool.icon className={`w-4 h-4 ${tool.rotate ? 'rotate-45' : ''}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <div className="h-5 w-px mx-1 bg-black/10" />
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className={`p-2.5 rounded-xl transition-all ${edgeStyle !== 'solid' || hasArrow ? 'bg-black/5 text-black' : 'text-black/40 hover:text-black hover:bg-black/5'}`} title="Line Style">
                                                <div className="relative">
                                                    <Minus className="w-4 h-4" />
                                                    {hasArrow && <ArrowRight className="w-2.5 h-2.5 absolute -right-1 -top-1 bg-white rounded-full p-0.5 border border-black/10" />}
                                                </div>
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-1 bg-white border border-black/10 rounded-xl shadow-2xl z-[150]" side="top" align="center" sideOffset={12}>
                                            <div className="flex gap-1 p-1 items-center">
                                                {[
                                                    { id: 'solid', label: 'Solid', icon: Minus },
                                                    { id: 'dashed', label: 'Dashed', icon: Minus, className: 'border-b-2 border-dashed border-black/20 w-4 h-0 block mx-auto my-2' },
                                                    { id: 'dotted', label: 'Dotted', icon: Minus, className: 'border-b-2 border-dotted border-black/20 w-4 h-0 block mx-auto my-2' }
                                                ].map((style) => (
                                                    <button
                                                        key={style.id}
                                                        onClick={() => {
                                                            setEdgeStyle(style.id as any);
                                                            // Apply to selected edges
                                                            setEdges(eds => eds.map(e => {
                                                                if (!e.selected) return e;
                                                                const s: any = { ...e.style, strokeDasharray: undefined };
                                                                if (style.id === 'dashed') s.strokeDasharray = '5 5';
                                                                if (style.id === 'dotted') s.strokeDasharray = '2 2';
                                                                return { ...e, style: s };
                                                            }));
                                                        }}
                                                        className={`flex items-center justify-between px-3 py-2 text-[12px] transition-colors rounded-lg ${edgeStyle === style.id ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5 hover:text-black'}`}
                                                    >
                                                        {style.id === 'solid' ? <Minus className="w-4 h-4" /> : <div className={`w-4 h-0.5 ${style.id === 'dashed' ? 'border-b-2 border-dashed' : 'border-b-2 border-dotted'} ${edgeStyle === style.id ? 'border-white' : 'border-black/40'}`} />}
                                                    </button>
                                                ))}
                                                <div className="h-4 w-px bg-black/10 mx-1" />
                                                <button
                                                    onClick={() => setHasArrow(!hasArrow)}
                                                    className={`p-2.5 rounded-lg transition-all ${hasArrow ? 'bg-amber-500 text-white shadow-lg' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
                                                    title="Toggle Arrow"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <div className="h-5 w-px mx-1 bg-black/10" />
                                    <button
                                        onClick={() => fitView({ duration: 800 })}
                                        className="p-2.5 rounded-xl transition-all text-black/40 hover:text-black hover:bg-black/5"
                                        title="Fit View"
                                    >
                                        <Maximize className="w-4 h-4" />
                                    </button>
                                    <div className="h-5 w-px mx-1 bg-black/10" />
                                    <button
                                        onClick={() => setIsSimulating(!isSimulating)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-xs ${isSimulating ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-black text-white hover:bg-black/90'}`}
                                    >
                                        <Play className={`w-4 h-4 ${isSimulating ? 'fill-white' : 'fill-current'}`} />
                                        <span>{isSimulating ? 'Stop Simulation' : 'Simulate'}</span>
                                    </button>
                                </Panel>
                            </ReactFlow>
                        </main>
                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-white/5" />

                    <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="hidden lg:block">
                        <aside className="h-full border-l flex flex-col z-40 border-black/10 bg-[#121212] text-white">
                            <div className="flex border-b border-white/5 bg-white/5">
                                <button
                                    onClick={() => setActiveTab('layers')}
                                    className={`flex-1 h-10 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'layers' ? 'text-white border-b-2 border-white' : 'text-white/20 hover:text-white/40'}`}
                                >
                                    Components
                                </button>
                                <button
                                    onClick={() => setActiveTab('properties')}
                                    className={`flex-1 h-10 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'properties' ? 'text-white border-b-2 border-white' : 'text-white/20 hover:text-white/40'}`}
                                >
                                    Properties
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2">
                                {activeTab === 'layers' ? (
                                    <div className="space-y-0.5">
                                        {nodes.length > 0 ? nodes.map(node => (
                                            <div
                                                key={node.id}
                                                onClick={() => {
                                                    setSelectedNodeId(node.id);
                                                    setActiveTab('properties');
                                                }}
                                                onContextMenu={(e) => onLayerContextMenu(e as any, node.id)}
                                                className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all border border-transparent ${selectedNodeId === node.id ? 'bg-white/10 text-white border-white/5' : 'text-white/50 hover:text-white hover:bg-white/5 hover:border-white/5'}`}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                                <span className="flex-1 truncate text-[11px] font-medium tracking-tight">{(node.data?.label as string) || node.type}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/10 group-hover:text-white/20">{node.data?.category as string}</span>
                                            </div>
                                        )) : (
                                            <div className="py-20 text-center">
                                                <p className="text-[10px] uppercase tracking-widest text-white/10 font-bold">No Components Yet</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <PropertiesSidebar
                                        selectedNode={selectedNode}
                                        updateNodeData={updateNodeData}
                                        updateNodeStyle={updateNodeStyle}
                                        deleteNode={deleteNode}
                                    />
                                )}
                            </div>

                            <div className="p-4 border-t flex items-center justify-between border-white/5 text-white/20 bg-[#0A0A0A]">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Ready</span>
                                </div>
                                <Settings className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" />
                            </div>
                        </aside>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
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
