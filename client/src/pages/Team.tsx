import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Users, Plus, Copy, Check, LogOut, Trash2, RefreshCw, ArrowRight,
  Crown, Share2, ExternalLink, Shield, Calendar, UserMinus, Loader2,
  Box, Server, Globe, Database, GitBranch, Zap, Cpu, Network, Cloud,
  Lock, BarChart3, Code2, Wifi, LayoutGrid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  useTeams, useTeam, useCreateTeam, useJoinTeam, useLeaveTeam,
  useDeleteTeam, useRegenerateInviteCode, useShareWorkspace, useTeamWorkspaces,
} from "@/hooks/use-teams";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
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
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
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
      toast({ title: "Joined!", description: "You're now part of the team." });
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
      toast({ title: "Shared", description: "All team members can now access this workspace." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <>
    <motion.div key="team" initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-6xl mx-auto py-12 px-6">
      {/* Header */}
      <motion.div variants={fadeUpVariants} className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Collaboration</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-headline)' }}>Teams</h2>
          <p className="text-white/30 text-sm mt-1 max-w-sm">Share workspaces and collaborate in real-time.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="group flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold text-[11px] uppercase tracking-[0.15em] rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
          New Team
        </button>
      </motion.div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
            <div className="glass-card rounded-2xl p-5 border-primary/20">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
                  placeholder="Team name..."
                  className="flex-1 bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-all"
                  maxLength={64}
                  autoFocus
                />
                <button onClick={handleCreateTeam} disabled={createTeam.isPending || !newTeamName.trim()} className="px-6 py-3 bg-primary text-black font-bold text-[11px] uppercase tracking-widest rounded-xl disabled:opacity-40 transition-all hover:brightness-110">
                  {createTeam.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Join */}
          <motion.div variants={fadeUpVariants} className="glass-card rounded-2xl p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-3">Join a Team</h3>
            <div className="relative">
              <input
                value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinTeam()}
                placeholder="MX-XXXX"
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/10 focus:outline-none focus:border-primary/30 transition-all tracking-[0.15em] text-center"
                maxLength={8}
              />
              <button onClick={handleJoinTeam} disabled={joinTeam.isPending || !joinCode.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-primary hover:text-black rounded-lg transition-all disabled:opacity-0">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Teams List */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 pl-1">Your Teams</h3>
            {isLoading ? (
              <div className="py-16 flex flex-col items-center gap-3 opacity-20">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[10px] font-mono uppercase tracking-widest">Loading...</span>
              </div>
            ) : !teams || teams.length === 0 ? (
              <motion.div variants={fadeUpVariants} className="glass-card rounded-2xl p-8 text-center border-dashed border-white/5 bg-transparent">
                <Users className="w-8 h-8 text-white/5 mx-auto mb-3" />
                <p className="text-white/20 text-xs font-medium">No teams yet</p>
                <p className="text-white/10 text-[10px] mt-1">Create or join one to get started.</p>
              </motion.div>
            ) : (
              teams.map((team) => (
                <motion.div
                  key={team.id} variants={fadeUpVariants}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`glass-card glass-card-hover rounded-2xl p-4 cursor-pointer group transition-all duration-300 ${selectedTeamId === team.id ? "!border-primary/40 bg-primary/[0.03] shadow-[0_8px_30px_rgba(255,102,0,0.08)]" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-headline)' }}>{team.name}</h4>
                      <span className="text-[10px] text-white/20 font-medium">{team.memberCount} member{team.memberCount !== 1 ? "s" : ""}</span>
                    </div>
                    {team.ownerId === user?.id && <Crown className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <code className="text-[10px] font-mono text-white/20 tracking-widest group-hover:text-white/40 transition-colors">{team.inviteCode}</code>
                    <button onClick={(e) => { e.stopPropagation(); handleCopyCode(team.inviteCode); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-white/15 hover:text-primary transition-all">
                      {copiedCode === team.inviteCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedTeamId && isDetailLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-6 space-y-4">
                <div className="h-6 w-40 bg-white/5 rounded-lg animate-pulse" />
                <div className="flex gap-3"><div className="h-4 w-20 bg-white/5 rounded-full animate-pulse" /><div className="h-4 w-16 bg-white/5 rounded-full animate-pulse" /></div>
                <div className="grid grid-cols-2 gap-3 mt-4">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-white/[0.02] rounded-xl animate-pulse" />)}</div>
              </motion.div>
            ) : selectedTeamId && teamDetail ? (
              <motion.div key={selectedTeamId} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
                {/* Team Header Card */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>{teamDetail.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.03] border border-white/8 rounded-full">
                          <Calendar className="w-2.5 h-2.5 text-white/20" />
                          <span className="text-[9px] font-medium text-white/25 uppercase tracking-wider">{new Date(teamDetail.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <button className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 border border-primary/10 rounded-full hover:border-primary/30 transition-all" onClick={() => handleCopyCode(teamDetail.inviteCode)}>
                          <span className="text-[9px] font-mono text-primary/70 tracking-[0.15em]">{teamDetail.inviteCode}</span>
                          {copiedCode === teamDetail.inviteCode ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-primary/30" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {teamDetail.ownerId === user?.id && (
                        <button onClick={() => regenerateCode.mutate(selectedTeamId)} className="w-8 h-8 flex items-center justify-center bg-white/[0.03] border border-white/5 rounded-xl text-white/20 hover:text-white hover:border-white/20 transition-all" title="Regenerate code">
                          <RefreshCw className={`w-3.5 h-3.5 ${regenerateCode.isPending ? "animate-spin" : ""}`} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const isOwner = teamDetail.ownerId === user?.id;
                          setConfirmAction({
                            title: isOwner ? "Delete this team?" : "Leave this team?",
                            description: isOwner ? "This permanently deletes the team, removes all members, and unshares all workspaces." : "You'll lose access to all workspaces shared with this team.",
                            action: async () => {
                              if (isOwner) await deleteTeam.mutateAsync(selectedTeamId);
                              else await leaveTeam.mutateAsync({ teamId: selectedTeamId, userId: user!.id });
                              setSelectedTeamId(null);
                            },
                          });
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-white/[0.03] border border-white/5 rounded-xl text-red-400/25 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
                      >
                        {teamDetail.ownerId === user?.id ? <Trash2 className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Members */}
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4 flex items-center gap-1.5"><Users className="w-3 h-3" /> Members</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {teamDetail.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all group">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border-2" style={{ borderColor: member.color, backgroundColor: `${member.color}10`, color: member.color }}>
                            {member.profileImageUrl ? <img src={member.profileImageUrl} className="w-full h-full rounded-[0.45rem] object-cover" /> : (member.firstName?.[0] || member.email[0]).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0a]" style={{ backgroundColor: member.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/80 font-semibold truncate">
                            {member.firstName || member.email.split("@")[0]}
                            {member.userId === user?.id && <span className="ml-1.5 text-[8px] text-white/20 font-normal uppercase">you</span>}
                          </p>
                          <p className="text-[9px] text-white/20 font-mono uppercase tracking-wider">{member.role}</p>
                        </div>
                        {member.role === "owner" ? (
                          <Crown className="w-3 h-3 text-primary/40" />
                        ) : teamDetail.ownerId === user?.id && member.userId !== user?.id ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmAction({ title: `Remove ${member.firstName || member.email.split("@")[0]}?`, description: "They'll lose access to all shared workspaces.", action: async () => { await leaveTeam.mutateAsync({ teamId: selectedTeamId!, userId: member.userId }); } }); }}
                            className="p-1 rounded-md text-white/10 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <UserMinus className="w-3 h-3" />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shared Workspaces */}
                <div className="glass-card rounded-2xl p-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-5 flex items-center gap-1.5"><Share2 className="w-3 h-3" /> Shared Workspaces</h4>
                  {teamWorkspaces && teamWorkspaces.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {teamWorkspaces.map((ws) => { const WsIcon = getWsIcon(ws.icon); return (
                        <Link key={ws.id} href={`/workspace/${ws.id}`}>
                          <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-primary/30 hover:bg-primary/[0.02] transition-all cursor-pointer group">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-all">
                              <WsIcon className="w-3.5 h-3.5 text-white/20 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">{ws.title}</h5>
                              <p className="text-[9px] text-white/15 uppercase tracking-wider">{ws.type}</p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-white/10 opacity-0 group-hover:opacity-100 group-hover:text-primary/50 transition-all" />
                          </div>
                        </Link>
                      ); })}
                    </div>
                  ) : (
                    <div className="py-8 text-center border border-dashed border-white/5 rounded-xl mb-6">
                      <Share2 className="w-6 h-6 text-white/[0.04] mx-auto mb-2" />
                      <p className="text-white/10 text-[10px] font-medium uppercase tracking-widest">No workspaces shared yet</p>
                    </div>
                  )}
                  {workspaces && workspaces.length > 0 && (
                    <div className="pt-5 border-t border-white/5">
                      <h5 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/12 mb-4 flex items-center gap-1.5"><Plus className="w-2.5 h-2.5" /> Share a Workspace</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {workspaces.filter((ws: any) => !teamWorkspaces?.some((tw) => tw.id === ws.id)).map((ws: any) => (
                          <button key={ws.id} onClick={() => handleShareWorkspace(ws.id)} className="flex items-center gap-2.5 p-2.5 bg-white/[0.01] border border-white/5 rounded-lg hover:border-primary/30 hover:bg-white/[0.03] transition-all text-left group">
                            <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 group-hover:text-primary transition-all"><Plus className="w-2.5 h-2.5" /></div>
                            <span className="text-[11px] text-white/30 truncate font-medium group-hover:text-white/70 transition-colors">{ws.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-16 flex flex-col items-center justify-center text-center h-full min-h-[400px] border-dashed border-white/5 bg-transparent">
                <Users className="w-12 h-12 text-white/[0.04] mb-4" />
                <h3 className="text-sm font-semibold text-white/20 uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-headline)' }}>Select a team</h3>
                <p className="text-white/10 text-xs mt-2 max-w-xs">Choose a team from the sidebar to view members and shared workspaces.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>

    <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
      <AlertDialogContent className="bg-[#0f0f12] border border-white/10 rounded-2xl shadow-2xl max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-sm font-semibold" style={{ fontFamily: 'var(--font-headline)' }}>{confirmAction?.title}</AlertDialogTitle>
          <AlertDialogDescription className="text-white/35 text-xs leading-relaxed">{confirmAction?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="bg-white/5 border-white/8 text-white/50 hover:bg-white/10 hover:text-white rounded-lg text-xs h-9">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => { try { await confirmAction?.action(); setConfirmAction(null); } catch (err) { toast({ title: "Error", description: err instanceof Error ? err.message : "Action failed", variant: "destructive" }); } }}
            className="bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 rounded-lg text-xs h-9"
          >Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
