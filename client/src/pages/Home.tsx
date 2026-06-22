import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useWorkspaces, useDeleteWorkspace, useCreateWorkspace } from "@/hooks/use-workspaces";
import { useAuth } from "@/hooks/use-auth";
import { secureFetch } from "@/lib/secure-fetch";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import { Search, LayoutGrid, List, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LineSyncLoader } from "@/components/ui/loading-screen";
import { SearchBar } from "@/components/ui/search-bar";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Skeleton } from "@/components/ui/skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
};

export default function Home() {
  const [location, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  const deleteWorkspace = useDeleteWorkspace();
  const createWorkspace = useCreateWorkspace();

  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);

  useEffect(() => {
    const pendingTemplateStr = localStorage.getItem('meshwork_pending_template');
    if (pendingTemplateStr && user && !isGeneratingBlueprint) {
      setIsGeneratingBlueprint(true);
      
      const executeTemplateCreation = async () => {
        try {
          const template = JSON.parse(pendingTemplateStr);
          // 1. Create Workspace
          const ws = await createWorkspace.mutateAsync({
            title: template.title,
            description: template.description,
            type: "architecture",
            groups: [],
            tags: [template.category]
          } as any);
          
          const normalizedEdges = template.edges.map((edge: any) => ({
            ...edge,
            animated: edge.animated ? 1 : 0
          }));

          // 2. Sync nodes and edges
          await secureFetch(`/api/workspaces/${ws.id}/canvas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nodes: template.nodes, edges: normalizedEdges })
          });
          
          // 3. Clean up and redirect
          localStorage.removeItem('meshwork_pending_template');
          setLocation(`/workspace/${ws.id}`);
        } catch (e) {
          console.error("Failed to generate blueprint:", e);
          setIsGeneratingBlueprint(false);
          localStorage.removeItem('meshwork_pending_template');
        }
      };
      
      executeTemplateCreation();
    }
  }, [user, createWorkspace, setLocation, isGeneratingBlueprint]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Settings specific to Workspaces Archive page
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // ⌘K shortcut is now handled inside SearchBar component

  const isWorkspacesPage = location === "/workspaces";

  const handleDelete = (id: number) => {
    deleteWorkspace.mutate(id);
    if (selectedIds.has(id)) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const filteredWorkspaces = useMemo(() => {
    if (!workspaces) return [];
    let result = workspaces.filter(ws =>
      ws.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort logic: Favorites first, then by descending creation date/ID
    result = [...result].sort((a, b) => {
      // Primary sort: isFavorite
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      
      // Secondary sort: updated date / creation date (descending)
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    return result;
  }, [workspaces, searchTerm]);

  // Derived arrays based on page config
  const displayWorkspaces = isWorkspacesPage ? filteredWorkspaces : filteredWorkspaces.slice(0, 3);

  // Time-based greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };
  const userName = user?.firstName || user?.email?.split('@')[0] || "Architect";

  if (isAuthLoading || isGeneratingBlueprint) {
    return <LineSyncLoader message={isGeneratingBlueprint ? "Generating Blueprint..." : "Loading blueprints"} />;
  }

  const renderGridSkeleton = () => (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass-card p-1 rounded-xl flex flex-col h-[280px]">
          <Skeleton className="aspect-video mb-4 w-full rounded-sm opacity-20" />
          <div className="px-5 pb-5 flex-1 flex flex-col justify-between">
            <div>
              <Skeleton className="h-6 w-3/4 mb-3 opacity-20" />
            </div>
            <div className="flex items-center justify-between mt-auto">
              <Skeleton className="h-3 w-1/2 opacity-20" />
              <Skeleton className="h-7 w-7 rounded-md opacity-20" />
            </div>
          </div>
        </div>
      ))}
    </>
  );

  const renderListSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass-card p-3 rounded-xl flex flex-row items-center gap-6">
          <Skeleton className="w-32 aspect-video rounded-sm opacity-20 shrink-0" />
          <div className="flex-1 flex items-center justify-between pr-4">
            <div className="flex flex-col gap-2 w-full max-w-[200px]">
              <Skeleton className="h-6 w-full opacity-20" />
              <Skeleton className="h-3 w-2/3 opacity-20" />
            </div>
            <Skeleton className="h-7 w-7 rounded-md opacity-20" />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <>
      <div className="w-full max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">
          {!isWorkspacesPage ? (
            // ==========================================
            // OVERVIEW PAGE (HERO + RECENT)
            // ==========================================
            <motion.div
              key="overview"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              className="w-full min-h-[calc(100vh-10rem)] flex flex-col justify-center pb-12"
            >
              {/* Hero Section */}
              <motion.section variants={fadeUpVariants} className="flex flex-col items-center text-center mb-16 shrink-0">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-sans tracking-tighter text-white mb-10">
                  {getGreeting()}, {userName}.
                </h2>
                
                {/* Command Bar — SearchBar component */}
                <SearchBar
                  data={filteredWorkspaces}
                  onCreateNew={() => setIsCreateOpen(true)}
                  commandMode
                />

                {/* Primary Action */}
                <div className="mt-10">
                  <AnimatedButton
                    label="New Workspace"
                    onClick={() => setIsCreateOpen(true)}
                  />
                </div>
              </motion.section>

              {/* Dashboard Content */}
              <div className="w-full max-w-5xl mx-auto shrink-0">
                <motion.section variants={containerVariants} className="w-full">
                  <motion.div variants={fadeUpVariants} className="flex items-center justify-between mb-10">
                    <h3 className="text-xs font-bold font-sans tracking-[0.2em] uppercase text-outline">Recent Projects</h3>
                    <Link href="/workspaces">
                      <span className="text-[10px] font-sans tracking-widest text-primary hover:underline underline-offset-4 uppercase cursor-figma-pointer">View Archive</span>
                    </Link>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {isWorkspacesLoading ? renderGridSkeleton() : (
                      displayWorkspaces.slice(0, 3).map(workspace => (
                        <WorkspaceCard
                          key={workspace.id}
                          workspace={workspace}
                          onDelete={handleDelete}
                          viewMode="grid"
                        />
                      ))
                    )}
                  </div>
                  {!isWorkspacesLoading && displayWorkspaces.length === 0 && !searchTerm && (
                    <motion.div variants={fadeUpVariants} className="bg-white/[0.02] backdrop-blur-xl border border-dashed border-white/10 rounded-xl p-16 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                      <Package className="w-12 h-12 text-outline/30 mb-4" />
                      <p className="text-outline font-sans">No recent projects found.</p>
                      <button onClick={() => setIsCreateOpen(true)} className="text-primary hover:text-white mt-2 font-sans font-bold text-sm transition-colors cursor-figma-pointer">Create your first</button>
                    </motion.div>
                  )}
                </motion.section>
              </div>
            </motion.div>
          ) : (
            // ==========================================
            // WORKSPACES PAGE (ARCHIVE)
            // ==========================================
            <motion.div
              key="projects"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              className="w-full max-w-5xl mx-auto"
            >
              <motion.div variants={fadeUpVariants} className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-extrabold tracking-tighter text-white font-sans uppercase">All Projects</h2>
                <div className="flex items-center gap-4">
                  {/* Local mini search for workspace tab */}
                  <div className="relative group">
                    <Search className="absolute inset-y-0 left-2 my-auto w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      type="text"
                      placeholder="Filter..."
                      className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded pl-8 pr-3 py-1.5 text-sm outline-none focus:border-primary/50 text-white transition-colors cursor-figma"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/10">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded cursor-figma-pointer transition-colors ${viewMode === 'grid' ? 'bg-surface-container-high text-white shadow-sm' : 'text-[#777575] hover:text-white'}`}><LayoutGrid className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded cursor-figma-pointer transition-colors ${viewMode === 'list' ? 'bg-surface-container-high text-white shadow-sm' : 'text-[#777575] hover:text-white'}`}><List className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
              
              <AnimatePresence mode="popLayout">
                {viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                  >
                    {isWorkspacesLoading ? renderGridSkeleton() : (
                      displayWorkspaces.map(workspace => (
                        <WorkspaceCard
                          key={workspace.id}
                          workspace={workspace}
                          onDelete={handleDelete}
                          viewMode="grid"
                        />
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    className="flex flex-col gap-4"
                  >
                    {isWorkspacesLoading ? renderListSkeleton() : (
                      displayWorkspaces.map(workspace => (
                        <WorkspaceCard
                          key={workspace.id}
                          workspace={workspace}
                          onDelete={handleDelete}
                          viewMode="list"
                        />
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateWorkspaceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </>
  );
}
