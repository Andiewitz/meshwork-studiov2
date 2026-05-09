import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
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

  const { data: teamDetail } = useTeam(selectedTeamId);
  const { data: teamWorkspaces } = useTeamWorkspaces(selectedTeamId);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      await createTeam.mutateAsync(newTeamName.trim());
      setNewTeamName("");
      setShowCreateForm(false);
      toast({ title: "Team created", description: "Share the invite code with your team." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) return;
    try {
      await joinTeam.mutateAsync(joinCode.trim());
      setJoinCode("");
      toast({ title: "Joined team!", description: "You're now a member." });
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
      toast({ title: "Workspace shared", description: "Team members can now access this workspace." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <motion.div
      key="team"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-5xl mx-auto py-12"
    >
      {/* Header */}
      <motion.div variants={fadeUpVariants} className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white font-headline">
            Teams
          </h2>
          <p className="text-white/30 text-sm mt-1 font-medium">
            Collaborate in real-time with color-coded cursors.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(255,102,0,0.4)] transition-all"
        >
          <Plus className="w-4 h-4" />
          New Team
        </button>
      </motion.div>

      {/* Create Team Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4 font-headline">
                Create New Team
              </h3>
              <div className="flex gap-3">
                <input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
                  placeholder="Team name..."
                  className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors font-body"
                  maxLength={64}
                />
                <button
                  onClick={handleCreateTeam}
                  disabled={createTeam.isPending || !newTeamName.trim()}
                  className="px-6 py-3 bg-primary text-black font-bold text-xs uppercase tracking-widest rounded-xl disabled:opacity-50 transition-all hover:shadow-[0_0_20px_rgba(255,102,0,0.3)]"
                >
                  {createTeam.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — Team List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Join Team Card */}
          <motion.div variants={fadeUpVariants} className="glass-card rounded-2xl p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4 font-headline">
              Join a Team
            </h3>
            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinTeam()}
                placeholder="MX-XXXX"
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder:text-white/15 focus:outline-none focus:border-primary/50 transition-colors tracking-widest text-center"
                maxLength={8}
              />
              <button
                onClick={handleJoinTeam}
                disabled={joinTeam.isPending || !joinCode.trim()}
                className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:border-white/20 font-bold text-xs uppercase tracking-widest rounded-lg disabled:opacity-50 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Team Cards */}
          {isLoading ? (
            <div className="text-white/20 text-center py-8 text-sm">Loading teams...</div>
          ) : !teams || teams.length === 0 ? (
            <motion.div variants={fadeUpVariants} className="glass-card rounded-2xl p-8 text-center">
              <Users className="w-8 h-8 text-white/10 mx-auto mb-3" />
              <p className="text-white/20 text-sm">No teams yet.</p>
              <p className="text-white/10 text-xs mt-1">Create or join one to start collaborating.</p>
            </motion.div>
          ) : (
            teams.map((team) => (
              <motion.div
                key={team.id}
                variants={fadeUpVariants}
                onClick={() => setSelectedTeamId(team.id)}
                className={`glass-card glass-card-hover rounded-2xl p-5 cursor-pointer transition-all ${
                  selectedTeamId === team.id
                    ? "!border-primary/40 shadow-[0_0_20px_rgba(255,102,0,0.15)]"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-headline font-bold text-white text-base truncate">
                    {team.name}
                  </h4>
                  {team.ownerId === user?.id && (
                    <Crown className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(team.inviteCode);
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-mono text-white/25 hover:text-primary transition-colors"
                  >
                    {copiedCode === team.inviteCode ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {team.inviteCode}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Right Column — Team Detail */}
        <div className="lg:col-span-2">
          {selectedTeamId && teamDetail ? (
            <motion.div
              key={selectedTeamId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Team Header */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-white">
                      {teamDetail.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleCopyCode(teamDetail.inviteCode)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg hover:border-primary/30 transition-all"
                      >
                        <span className="text-xs font-mono text-primary tracking-widest">
                          {teamDetail.inviteCode}
                        </span>
                        {copiedCode === teamDetail.inviteCode ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-white/30" />
                        )}
                      </button>

                      {teamDetail.ownerId === user?.id && (
                        <button
                          onClick={() => regenerateCode.mutate(selectedTeamId)}
                          className="p-1.5 text-white/20 hover:text-white/60 transition-colors"
                          title="Regenerate invite code"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${regenerateCode.isPending ? "animate-spin" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Team Actions */}
                  <div className="flex gap-2">
                    {teamDetail.ownerId === user?.id ? (
                      <button
                        onClick={() => {
                          if (confirm("Delete this team? This cannot be undone.")) {
                            deleteTeam.mutate(selectedTeamId);
                            setSelectedTeamId(null);
                          }
                        }}
                        className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        title="Delete team"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm("Leave this team?")) {
                            leaveTeam.mutate({ teamId: selectedTeamId, userId: user!.id });
                            setSelectedTeamId(null);
                          }
                        }}
                        className="p-2 text-white/20 hover:text-white/60 hover:bg-white/[0.05] rounded-lg transition-all"
                        title="Leave team"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Members */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-3 font-headline">
                    Members
                  </h4>
                  <div className="space-y-2">
                    {teamDetail.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                          style={{
                            borderColor: member.color,
                            backgroundColor: `${member.color}15`,
                            color: member.color,
                          }}
                        >
                          {member.profileImageUrl ? (
                            <img src={member.profileImageUrl} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            (member.firstName?.[0] || member.email[0]).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/80 font-medium truncate">
                            {member.firstName || member.email.split("@")[0]}
                          </p>
                          <p className="text-[10px] text-white/20 truncate">{member.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: member.color }}
                            title={`Cursor: ${member.color}`}
                          />
                          {member.role === "owner" && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">
                              Owner
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shared Workspaces */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 font-headline">
                    Shared Workspaces
                  </h4>
                </div>

                {teamWorkspaces && teamWorkspaces.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {teamWorkspaces.map((ws) => (
                      <div
                        key={ws.id}
                        className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl"
                      >
                        <span className="text-sm text-white/70 font-medium">{ws.title}</span>
                        <span className="text-[10px] text-white/20 uppercase tracking-widest">{ws.type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/15 text-sm mb-4">No workspaces shared yet.</p>
                )}

                {/* Share Workspace Dropdown */}
                {workspaces && workspaces.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/15 mb-2 font-headline">
                      Share a workspace
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {workspaces
                        .filter((ws: any) => !teamWorkspaces?.some((tw) => tw.id === ws.id))
                        .slice(0, 6)
                        .map((ws: any) => (
                          <button
                            key={ws.id}
                            onClick={() => handleShareWorkspace(ws.id)}
                            className="flex items-center gap-2 p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-lg hover:border-primary/30 hover:bg-white/[0.04] transition-all text-left"
                          >
                            <Share2 className="w-3 h-3 text-white/20" />
                            <span className="text-xs text-white/40 truncate">{ws.title}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={fadeUpVariants}
              className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
            >
              <Users className="w-12 h-12 text-white/[0.05] mb-4" />
              <p className="text-white/15 text-sm font-medium">Select a team to view details</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
