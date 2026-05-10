import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Users,
  Plus,
  Copy,
  Check,
  LogOut,
  Trash2,
  RefreshCw,
  ArrowRight,
  Crown,
  Share2,
  ExternalLink,
  Shield,
  Calendar,
  UserMinus,
  Loader2,
  Box,
  Server,
  Globe,
  Database,
  GitBranch,
  Zap,
  Cpu,
  Network,
  Cloud,
  Lock,
  BarChart3,
  Code2,
  Wifi,
  LayoutGrid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  useTeams,
  useTeam,
  useCreateTeam,
  useJoinTeam,
  useLeaveTeam,
  useDeleteTeam,
  useRegenerateInviteCode,
  useShareWorkspace,
  useTeamWorkspaces,
} from "@/hooks/use-teams";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ICON_MAP: Record<string, LucideIcon> = {
  server: Server, globe: Globe, box: Box, database: Database, shield: Shield,
  git: GitBranch, zap: Zap, cpu: Cpu, network: Network, cloud: Cloud,
  lock: Lock, chart: BarChart3, code: Code2, wifi: Wifi, grid: LayoutGrid,
};
function getWsIcon(iconId?: string | null): LucideIcon {
  return ICON_MAP[iconId || "box"] || Box;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Team() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: teams, isLoading } = useTeams();
  const { data: workspaces } = useWorkspaces();

  const createTeam = useCreateTeam();
  const joinTeam = useJoinTeam();
  const leaveTeam = useLeaveTeam();
  const deleteTeam = useDeleteTeam();
  const regenerateCode = useRegenerateInviteCode();
  const shareWorkspace = useShareWorkspace();

  const [newTeamName, setNewTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string; description: string; action: () => Promise<void>;
  } | null>(null);

  const { data: teamDetail, isLoading: isDetailLoading } = useTeam(selectedTeamId);
  const { data: teamWorkspaces } = useTeamWorkspaces(selectedTeamId);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      const team = await createTeam.mutateAsync(newTeamName.trim());
      setNewTeamName("");
      setShowCreateForm(false);
      setSelectedTeamId(team.id);
      toast({ title: "Team created", description: "Your collaborative space is ready." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) return;
    try {
      await joinTeam.mutateAsync(joinCode.trim());
      setJoinCode("");
      toast({ title: "Joined team!", description: "Welcome to the collective." });
    } catch (err: any) {
      toast({ title: "Failed to join", description: err.message, variant: "destructive" });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShareWorkspace = async (workspaceId: number) => {
    if (!selectedTeamId) return;
    try {
      await shareWorkspace.mutateAsync({ teamId: selectedTeamId, workspaceId });
      toast({ title: "Workspace shared", description: "Access granted to all team members." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <>
    <motion.div
      key="team"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-6xl mx-auto py-16 px-6"
    >
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <motion.div variants={fadeUpVariants} className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Collaboration Hub</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white font-headline leading-tight">
            Team <span className="text-primary">Ecosystem</span>
          </h2>
          <p className="text-white/40 text-base mt-2 font-medium max-w-md">
            Unify your workflow. Share workspaces and collaborate with real-time presence.
          </p>
        </div>

        <div className="flex gap-3">
           <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="group flex items-center gap-3 px-6 py-3 bg-white text-black font-headline font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-primary transition-all duration-300"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            New Team
          </button>
        </div>
      </motion.div>

      {/* ─── Create Team Overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-12"
          >
            <div className="relative glass-card rounded-[2rem] p-8 overflow-hidden border-primary/20 bg-primary/[0.02]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
              
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-6 font-headline flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Create a New Team
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
                  placeholder="Designation (e.g. Creative Ops)"
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-all font-body text-lg shadow-inner"
                  maxLength={64}
                />
                <button
                  onClick={handleCreateTeam}
                  disabled={createTeam.isPending || !newTeamName.trim()}
                  className="px-8 py-4 bg-primary text-black font-bold text-xs uppercase tracking-[0.2em] rounded-2xl disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                >
                  {createTeam.isPending ? "Syncing..." : "Confirm"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ─── Left Sidebar: Navigation ──────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Join Portal */}
          <motion.div variants={fadeUpVariants} className="glass-card rounded-[2rem] p-7 bg-white/[0.01]">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-5 font-headline">
              Join a Team
            </h3>
            <div className="relative group">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinTeam()}
                placeholder="MX-XXXX"
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-lg text-white font-mono placeholder:text-white/10 focus:outline-none focus:border-primary/30 transition-all tracking-[0.2em] text-center"
                maxLength={8}
              />
              <button
                onClick={handleJoinTeam}
                disabled={joinTeam.isPending || !joinCode.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-primary hover:text-black rounded-xl transition-all disabled:opacity-0"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Collectives List */}
          <div className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 pl-4 font-headline">
              Your Teams
            </h3>
            
            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-4 opacity-20">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-xs font-mono uppercase tracking-widest">Scanning...</span>
              </div>
            ) : !teams || teams.length === 0 ? (
              <motion.div variants={fadeUpVariants} className="glass-card rounded-[2rem] p-10 text-center border-dashed border-white/5 bg-transparent">
                <Users className="w-10 h-10 text-white/5 mx-auto mb-4" />
                <p className="text-white/20 text-sm font-medium">No teams yet.</p>
                <p className="text-white/10 text-[10px] mt-2 uppercase tracking-widest">Create or join a team to start.</p>
              </motion.div>
            ) : (
              teams.map((team) => (
                <motion.div
                  key={team.id}
                  variants={fadeUpVariants}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`glass-card glass-card-hover rounded-[2rem] p-6 cursor-pointer group transition-all duration-500 ${
                    selectedTeamId === team.id
                      ? "!border-primary/50 bg-primary/[0.03] shadow-[0_20px_50px_rgba(255,102,0,0.1)] -translate-y-1"
                      : "bg-white/[0.01]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline font-bold text-white text-lg truncate group-hover:text-primary transition-colors">
                        {team.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                          {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
                        </span>
                        {team.ownerId === user?.id && (
                          <div className="w-1 h-1 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                    {team.ownerId === user?.id && (
                      <Crown className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <code className="text-[11px] font-mono text-white/30 tracking-widest group-hover:text-white/60 transition-colors">
                      {team.inviteCode}
                    </code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCode(team.inviteCode);
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-white/20 hover:text-primary transition-all"
                    >
                      {copiedCode === team.inviteCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* ─── Right Sidebar: Detail & Assets ────────────────────────── */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedTeamId && isDetailLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[2.5rem] p-10 bg-white/[0.01] space-y-6">
                <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-5 w-24 bg-white/5 rounded-full animate-pulse" />
                  <div className="h-5 w-20 bg-white/5 rounded-full animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white/[0.02] rounded-2xl animate-pulse" />)}
                </div>
              </motion.div>
            ) : selectedTeamId && teamDetail ? (
              <motion.div
                key={selectedTeamId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                {/* ─── Team Intelligence ─── */}
                <div className="glass-card rounded-[2.5rem] p-10 bg-white/[0.01] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-3xl font-headline font-black text-white tracking-tight">
                        {teamDetail.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full">
                          <Calendar className="w-3 h-3 text-white/20" />
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            Est. {new Date(teamDetail.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full group cursor-pointer hover:border-primary/40 transition-all"
                             onClick={() => handleCopyCode(teamDetail.inviteCode)}>
                          <span className="text-[10px] font-mono text-primary tracking-[0.2em] uppercase">
                            {teamDetail.inviteCode}
                          </span>
                          {copiedCode === teamDetail.inviteCode ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {teamDetail.ownerId === user?.id && (
                        <button
                          onClick={() => regenerateCode.mutate(selectedTeamId)}
                          className="w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/5 rounded-2xl text-white/20 hover:text-white hover:border-primary/40 transition-all"
                          title="Regenerate Security Key"
                        >
                          <RefreshCw className={`w-4 h-4 ${regenerateCode.isPending ? "animate-spin" : ""}`} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          const isOwner = teamDetail.ownerId === user?.id;
                          setConfirmAction({
                            title: isOwner ? "Delete this team?" : "Leave this team?",
                            description: isOwner
                              ? "This will permanently delete the team, remove all members, and unshare all workspaces. This cannot be undone."
                              : "You will lose access to all workspaces shared with this team.",
                            action: async () => {
                              if (isOwner) await deleteTeam.mutateAsync(selectedTeamId);
                              else await leaveTeam.mutateAsync({ teamId: selectedTeamId, userId: user!.id });
                              setSelectedTeamId(null);
                            },
                          });
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/5 rounded-2xl text-red-400/30 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/30 transition-all"
                        title={teamDetail.ownerId === user?.id ? "Delete Team" : "Leave Team"}
                      >
                        {teamDetail.ownerId === user?.id ? <Trash2 className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* ─── Members Grid ─── */}
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 font-headline flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      Members
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teamDetail.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group"
                        >
                          <div className="relative">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-[3px]"
                              style={{
                                borderColor: member.color,
                                backgroundColor: `${member.color}10`,
                                color: member.color,
                              }}
                            >
                              {member.profileImageUrl ? (
                                <img src={member.profileImageUrl} className="w-full h-full rounded-[0.6rem] object-cover" />
                              ) : (
                                (member.firstName?.[0] || member.email[0]).toUpperCase()
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-[#0a0a0a]" style={{ backgroundColor: member.color }} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/90 font-bold truncate group-hover:text-white transition-colors">
                              {member.firstName || member.email.split("@")[0]}
                              {member.userId === user?.id && <span className="ml-2 text-[9px] text-white/20 font-normal uppercase">(You)</span>}
                            </p>
                            <p className="text-[10px] text-white/25 truncate font-mono uppercase tracking-wider">{member.role}</p>
                          </div>
                          
                          {member.role === "owner" ? (
                            <Crown className="w-3.5 h-3.5 text-primary/40" />
                          ) : teamDetail.ownerId === user?.id && member.userId !== user?.id ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmAction({
                                  title: `Remove ${member.firstName || member.email.split("@")[0]}?`,
                                  description: "They will lose access to all workspaces shared with this team.",
                                  action: async () => {
                                    await leaveTeam.mutateAsync({ teamId: selectedTeamId!, userId: member.userId });
                                  },
                                });
                              }}
                              className="p-1.5 rounded-lg text-white/10 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                              title="Remove member"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ─── Shared Intelligence (Workspaces) ─── */}
                <div className="glass-card rounded-[2.5rem] p-10 bg-white/[0.01] border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 font-headline flex items-center gap-2">
                      <Share2 className="w-3.5 h-3.5" />
                      Shared Workspaces
                    </h4>
                  </div>

                  {teamWorkspaces && teamWorkspaces.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                      {teamWorkspaces.map((ws) => (
                        <Link key={ws.id} href={`/workspace/${ws.id}`}>
                          <div className="flex flex-col p-6 bg-white/[0.03] border border-white/5 rounded-[1.5rem] hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink className="w-4 h-4 text-primary" />
                            </div>
                            
                            {(() => { const WsIcon = getWsIcon(ws.icon); return (
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                <WsIcon className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                              </div>
                            ); })()}
                            
                            <h5 className="text-base font-headline font-bold text-white group-hover:text-primary transition-colors truncate pr-6">
                              {ws.title}
                            </h5>
                            <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1 font-bold">
                              {ws.type} Type
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] mb-8">
                      <Share2 className="w-8 h-8 text-white/[0.03] mx-auto mb-3" />
                      <p className="text-white/10 text-xs font-bold uppercase tracking-widest">No workspaces shared yet</p>
                    </div>
                  )}

                  {/* Deploy Interface (Only for owner/admins could be restricted, currently anyone in team can share) */}
                  {workspaces && workspaces.length > 0 && (
                    <div className="pt-8 border-t border-white/5">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/15 mb-6 font-headline flex items-center gap-2">
                        <Plus className="w-3 h-3" />
                        Share a Workspace
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {workspaces
                          .filter((ws: any) => !teamWorkspaces?.some((tw) => tw.id === ws.id))
                          .map((ws: any) => (
                            <button
                              key={ws.id}
                              onClick={() => handleShareWorkspace(ws.id)}
                              className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl hover:border-primary/40 hover:bg-white/[0.03] transition-all text-left group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                <Plus className="w-3 h-3" />
                              </div>
                              <span className="text-xs text-white/40 truncate font-medium group-hover:text-white transition-colors">{ws.title}</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-[3rem] p-20 flex flex-col items-center justify-center text-center h-full min-h-[500px] border-dashed border-white/5 bg-transparent"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <Users className="w-20 h-20 text-white/[0.03] relative z-10" />
                </div>
                <h3 className="text-xl font-headline font-black text-white/30 uppercase tracking-[0.2em]">Collective Terminal</h3>
                <p className="text-white/10 text-sm mt-3 font-medium max-w-xs leading-relaxed">
                  Select a team to access shared intelligence and active personnel data.
                </p>
                
                <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-sm opacity-10">
                  <div className="h-1 bg-white/20 rounded-full" />
                  <div className="h-1 bg-white/20 rounded-full" />
                  <div className="h-1 bg-white/20 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>

    {/* ─── Destructive Action Confirm Dialog ─── */}
    <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
      <AlertDialogContent className="bg-[#0f0f12] border border-white/10 rounded-3xl shadow-2xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-lg font-headline font-bold">
            {confirmAction?.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/40 text-sm">
            {confirmAction?.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white rounded-xl">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              try {
                await confirmAction?.action();
                setConfirmAction(null);
              } catch (err) {
                toast({ title: "Error", description: err instanceof Error ? err.message : "Action failed", variant: "destructive" });
              }
            }}
            className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
