import { Workspace } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  ExternalLink,
  Copy,
  Box,
  LayoutGrid,
  Server,
  Globe,
  Database,
  Shield,
  GitBranch,
  Zap,
  Cpu,
  Network,
  Cloud,
  Lock,
  BarChart3,
  Code2,
  Wifi,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useUpdateWorkspace, useDuplicateWorkspace } from "@/hooks/use-workspaces";
import { useToast } from "@/hooks/use-toast";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  server: Server,
  globe: Globe,
  box: Box,
  database: Database,
  shield: Shield,
  git: GitBranch,
  zap: Zap,
  cpu: Cpu,
  network: Network,
  cloud: Cloud,
  lock: Lock,
  chart: BarChart3,
  code: Code2,
  wifi: Wifi,
  grid: LayoutGrid,
};

function getWorkspaceIcon(iconId?: string): LucideIcon {
  return ICON_MAP[iconId || "box"] || Box;
}

interface WorkspaceCardProps {
  workspace: Workspace;
  onDelete?: (id: number) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
  isMultiSelectMode?: boolean;
  isDeleting?: boolean;
  viewMode?: "grid" | "list";
}

export function WorkspaceCard({ 
  workspace, 
  onDelete, 
  isSelected, 
  onToggleSelect, 
  isMultiSelectMode, 
  isDeleting,
  viewMode = "grid" 
}: WorkspaceCardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const updateWorkspace = useUpdateWorkspace();
  const duplicateWorkspace = useDuplicateWorkspace();

  const [isRenaming, setIsRenaming] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [title, setTitle] = useState(workspace.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isRenaming]);

  const handleRename = async () => {
    if (!title.trim() || title === workspace.title) {
      setIsRenaming(false);
      setTitle(workspace.title);
      return;
    }
    try {
      await updateWorkspace.mutateAsync({ id: workspace.id, title: title.trim() });
      setIsRenaming(false);
    } catch {
      toast({ title: "Error", description: "Failed to rename workspace.", variant: "destructive" });
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateWorkspace.mutateAsync({ id: workspace.id, title: `${workspace.title} (Copy)` });
    } catch {
      toast({ title: "Error", description: "Failed to duplicate workspace.", variant: "destructive" });
    }
  };

  const Icon = getWorkspaceIcon(workspace.icon || undefined);
  const updatedText = formatDistanceToNow(new Date(workspace.createdAt || new Date()), { addSuffix: true });
  
  // Dummy status for aesthetic mapping representing local type
  const status = workspace.type === "canvas" ? "Live" : "Idle";

  const MenuItems = () => (
    <>
      <DropdownMenuItem onClick={() => setLocation(`/workspace/${workspace.id}`)} className="cursor-figma-pointer focus:bg-surface-container-high focus:text-primary">
        <ExternalLink className="w-4 h-4 mr-2" /> Open
      </DropdownMenuItem>
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }} className="cursor-figma-pointer focus:bg-surface-container-high focus:text-white">
        <Pencil className="w-4 h-4 mr-2" /> Rename
      </DropdownMenuItem>
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(); }} className="cursor-figma-pointer focus:bg-surface-container-high focus:text-white">
        <Copy className="w-4 h-4 mr-2" /> Duplicate
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-outline-variant/20" />
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(workspace.id); }} className="text-error focus:bg-error/10 focus:text-error cursor-figma-pointer">
        <Trash className="w-4 h-4 mr-2" /> Delete
      </DropdownMenuItem>
    </>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
           layout
           whileHover={viewMode === 'grid' ? { y: -4 } : { x: 4 }}
           className={cn(
             "group transition-all duration-300 cursor-figma-pointer relative",
             viewMode === "grid" 
               ? "bg-surface-container-low hover:bg-surface-container-high p-1 rounded-lg flex flex-col" 
               : "bg-surface-container-low hover:bg-surface-container-high p-3 rounded-lg flex flex-row items-center gap-6 border border-transparent hover:border-outline-variant/10",
             isSelected && "border-primary/50 shadow-[0_0_15px_rgba(255,85,0,0.2)]",
             isDeleting && "opacity-50 pointer-events-none grayscale"
           )}
           onClick={() => isMultiSelectMode ? onToggleSelect?.(workspace.id) : setLocation(`/workspace/${workspace.id}`)}
        >
          {isSelected && (
            <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none z-10 border border-primary/30" />
          )}

          {/* Thumbnail Image Placeholder */}
          <div className={cn(
            "overflow-hidden rounded-sm relative shrink-0 technical-gradient",
            viewMode === "grid" ? "aspect-video mb-4 w-full" : "w-32 aspect-video"
          )}>
            {/* Minimalist Grid Pattern Fallback */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--color-outline-variant)_1px,transparent_0)] [background-size:20px_20px] opacity-20" />
             <div className="absolute inset-0 flex items-center justify-center">
               <Icon className="w-10 h-10 text-outline group-hover:text-primary transition-colors duration-500 group-hover:scale-110" />
             </div>

             <div className="absolute top-4 right-4">
               <span className={cn(
                 "text-[10px] font-headline font-bold px-3 py-1 rounded-full backdrop-blur-md border tracking-widest uppercase",
                 status === 'Live' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container-highest/80 text-outline border-outline-variant/20'
               )}>
                 {status}
               </span>
             </div>
          </div>

          <div className={cn(
            "flex-1 flex",
            viewMode === "grid" ? "px-5 pb-6 flex-col justify-between" : "items-center justify-between pr-4"
          )}>
            <div>
              {isRenaming ? (
                 <input
                   ref={inputRef}
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   onBlur={handleRename}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleRename();
                     if (e.key === 'Escape') { setIsRenaming(false); setTitle(workspace.title); }
                   }}
                   onClick={(e) => e.stopPropagation()}
                   className="bg-transparent font-headline font-semibold text-white border-b border-primary outline-none py-0 w-full mb-4"
                 />
               ) : (
                 <h4 className={cn(
                   "font-headline font-semibold text-white group-hover:text-primary transition-colors",
                   viewMode === "grid" ? "text-lg mb-4" : "text-lg mb-1"
                 )}>
                   {workspace.title || "Untitled"}
                 </h4>
               )}
               {viewMode === "list" && (
                 <span className="text-[10px] text-outline font-label tracking-tight uppercase">Last edited {updatedText}</span>
               )}
            </div>

            <div className={cn(
              "flex items-center",
              viewMode === "grid" ? "justify-between mt-auto" : "gap-8"
            )}>
              {viewMode === "grid" && (
                <span className="text-[10px] text-outline font-label tracking-tight uppercase truncate mr-4">Last edited {updatedText}</span>
              )}
              
              <div className="flex gap-2 items-center">
                 <span className={`w-1.5 h-1.5 rounded-full ${status === 'Live' ? 'bg-primary/40' : 'bg-outline-variant'}`}></span>
                 
                 {/* Kebab menu wrapper to intercept click properly without triggering navigation */}
                 <div onClick={e => e.stopPropagation()}>
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <button className="w-6 h-6 rounded flex items-center justify-center text-outline hover:text-white hover:bg-surface-container-high transition-colors -mr-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-outline-variant group-hover:bg-outline" /> {/* Dummy third dot */}
                       </button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="bg-surface-container-highest border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden p-1 min-w-[160px] z-50">
                       <MenuItems />
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="bg-surface-container-highest border border-outline-variant/20 rounded-xl shadow-2xl p-1 min-w-[160px]">
        <DropdownMenuItem asChild /> {/* Just to silence TS if using custom ContextMenuItems, but using standard wrapper is fine */}
        <MenuItems />
      </ContextMenuContent>
    </ContextMenu>
  );
}
