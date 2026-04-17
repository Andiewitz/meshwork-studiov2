import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useWorkspaces, useDeleteWorkspace } from "@/hooks/use-workspaces";
import { useAuth } from "@/hooks/use-auth";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import { Search, LayoutGrid, List, Clock, Package, Terminal, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LineSyncLoader } from "@/components/ui/loading-screen";

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

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Settings specific to Workspaces Archive page
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

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
    result = [...result].sort((a, b) => b.id - a.id);
    return result;
  }, [workspaces, searchTerm]);

  // Derived arrays based on page config
  const displayWorkspaces = isWorkspacesPage ? filteredWorkspaces : filteredWorkspaces.slice(0, 4);

  // Time-based greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  const userName = user?.firstName || user?.email?.split('@')[0] || "Architect";

  if (isAuthLoading || isWorkspacesLoading) {
    return <LineSyncLoader message="Loading blueprints" />;
  }

  return (
    <>
      <div className="w-full max-w-[1400px] mx-auto pb-20">
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
              className="w-full"
            >
              {/* Hero Section */}
              <motion.section variants={fadeUpVariants} className="flex flex-col items-center text-center mt-16 md:mt-24 mb-32">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-headline tracking-tighter text-white mb-12">
                  {getGreeting()}, {userName}.
                </h2>
                
                {/* Command Bar */}
                <div className="w-full max-w-2xl relative group z-30">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-outline/50" />
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className={`w-full bg-surface-container-low/30 border py-4 pl-12 pr-16 text-base font-body text-on-surface placeholder:text-outline/50 focus:outline-none transition-all duration-300 backdrop-blur-md ${isSearchFocused ? 'border-[#FF5500]/50 rounded-t-xl rounded-b-none bg-surface-container-low/80' : 'border-outline-variant/20 rounded-lg'}`}
                    placeholder="Search blueprints, assets, or run a command..."
                    type="text"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-surface-container-high text-[10px] text-outline border border-outline-variant/30 rounded font-body">⌘ K</kbd>
                  </div>

                  {/* Search Dropdown - Aesthetic Mapping */}
                  <AnimatePresence>
                    {isSearchFocused && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-xl border border-t-0 border-[#FF5500]/50 rounded-b-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)] text-left"
                      >
                        {/* Dynamic Projects Suggestion */}
                        {filteredWorkspaces.length > 0 && (
                          <div className="p-2 border-b border-outline-variant/10">
                            <div className="px-3 py-2 text-[10px] font-headline font-bold text-outline tracking-widest uppercase">Projects {searchTerm ? 'Matching Search' : 'Recent'}</div>
                            {filteredWorkspaces.slice(0, 5).map(ws => (
                              <Link key={ws.id} href={`/workspace/${ws.id}`}>
                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-high cursor-figma-pointer group transition-colors">
                                  <Package className="w-4 h-4 text-outline group-hover:text-white transition-colors" />
                                  <div className="flex flex-col">
                                    <span className="text-sm text-[#E5E2E1] group-hover:text-white transition-colors leading-tight">{ws.title}</span>
                                    <span className="text-[10px] text-outline tracking-wider group-hover:text-primary transition-colors uppercase mt-0.5">ID: #{ws.id}</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 ml-auto text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}

                        <div className="p-2">
                          <div className="px-3 py-2 text-[10px] font-headline font-bold text-outline tracking-widest uppercase">Commands</div>
                          <div onClick={() => setIsCreateOpen(true)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-high cursor-figma-pointer group transition-colors">
                            <Terminal className="w-4 h-4 text-outline group-hover:text-white transition-colors" />
                            <span className="text-sm text-[#E5E2E1] group-hover:text-white transition-colors">Create new workspace</span>
                            <kbd className="ml-auto px-2 py-1 bg-surface-container-highest text-[10px] text-outline rounded font-body opacity-0 group-hover:opacity-100 transition-opacity">↵</kbd>
                          </div>
                          <Link href="/team">
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-high cursor-figma-pointer group transition-colors">
                              <Users className="w-4 h-4 text-outline group-hover:text-white transition-colors" />
                              <span className="text-sm text-[#E5E2E1] group-hover:text-white transition-colors">Invite team member</span>
                            </div>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Primary Action */}
                <div className="mt-12">
                  <motion.button
                    onClick={() => setIsCreateOpen(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#FF6B35] text-[#4A1200] font-headline font-bold px-10 py-4 rounded transition-shadow duration-300 shadow-[0_0_30px_rgba(255,107,53,0.3)] hover:shadow-[0_0_40px_rgba(255,107,53,0.5)] cursor-figma-pointer"
                  >
                    NEW WORKSPACE
                  </motion.button>
                </div>
              </motion.section>

              {/* Dashboard Content */}
              <div className="w-full max-w-5xl mx-auto">
                <motion.section variants={containerVariants} className="w-full">
                  <motion.div variants={fadeUpVariants} className="flex items-center justify-between mb-10">
                    <h3 className="text-xs font-bold font-headline tracking-[0.2em] uppercase text-outline">Recent Projects</h3>
                    <Link href="/workspaces">
                      <span className="text-[10px] font-headline tracking-widest text-primary hover:underline underline-offset-4 uppercase cursor-figma-pointer">View Archive</span>
                    </Link>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {displayWorkspaces.map(workspace => (
                      <WorkspaceCard
                        key={workspace.id}
                        workspace={workspace}
                        onDelete={handleDelete}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                  {displayWorkspaces.length === 0 && !searchTerm && (
                    <motion.div variants={fadeUpVariants} className="bg-surface-container-low border border-dashed border-outline-variant/30 rounded-xl p-16 flex flex-col items-center justify-center text-center">
                      <Package className="w-12 h-12 text-outline/30 mb-4" />
                      <p className="text-outline font-headline">No recent projects found.</p>
                      <button onClick={() => setIsCreateOpen(true)} className="text-primary hover:text-white mt-2 font-headline font-bold text-sm transition-colors cursor-figma-pointer">Create your first</button>
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
                <h2 className="text-2xl font-extrabold tracking-tighter text-white font-headline uppercase">All Projects</h2>
                <div className="flex items-center gap-4">
                  {/* Local mini search for workspace tab */}
                  <div className="relative group">
                    <Search className="absolute inset-y-0 left-2 my-auto w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      type="text"
                      placeholder="Filter..."
                      className="bg-surface-container-low border border-outline-variant/20 rounded pl-8 pr-3 py-1.5 text-sm outline-none focus:border-primary/50 text-white transition-colors cursor-figma"
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
                    {displayWorkspaces.map(workspace => (
                      <WorkspaceCard
                        key={workspace.id}
                        workspace={workspace}
                        onDelete={handleDelete}
                        viewMode="grid"
                      />
                    ))}
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
                    {displayWorkspaces.map(workspace => (
                      <WorkspaceCard
                        key={workspace.id}
                        workspace={workspace}
                        onDelete={handleDelete}
                        viewMode="list"
                      />
                    ))}
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
