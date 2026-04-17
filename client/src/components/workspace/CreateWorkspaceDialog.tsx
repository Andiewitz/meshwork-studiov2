import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertWorkspaceSchema } from "@shared/schema";
import { useCreateWorkspace } from "@/hooks/use-workspaces";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Loader2, X,
  Server, Globe, Box, Database, Shield, GitBranch, Zap,
  ShoppingCart, Activity, CreditCard, Layers, Cpu, Network,
  LayoutGrid, Code2, Cloud, Lock, BarChart3, Wifi,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = insertWorkspaceSchema.pick({
  title: true,
  type: true,
  icon: true,
}).extend({
  title: z.string().min(1, "Project name is required").default("Untitled Project"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Project icon options ────────────────────────────────────────────────────
const PROJECT_ICONS = [
  { id: "server", Icon: Server },
  { id: "globe", Icon: Globe },
  { id: "box", Icon: Box },
  { id: "database", Icon: Database },
  { id: "shield", Icon: Shield },
  { id: "git", Icon: GitBranch },
  { id: "zap", Icon: Zap },
  { id: "cpu", Icon: Cpu },
  { id: "network", Icon: Network },
  { id: "cloud", Icon: Cloud },
  { id: "lock", Icon: Lock },
  { id: "chart", Icon: BarChart3 },
  { id: "code", Icon: Code2 },
  { id: "wifi", Icon: Wifi },
  { id: "grid", Icon: LayoutGrid },
];

// ── Template options (mirrors Workspace.tsx templates) ──────────────────────
const TEMPLATES = [
  {
    id: "blank",
    label: "Start Blank",
    icon: LayoutGrid,
    description: "Empty canvas, build from scratch",
    tag: "BLANK",
    accent: "bg-foreground",
    type: "system",
  },
  {
    id: "template:ecommerce",
    label: "E-Commerce",
    icon: ShoppingCart,
    description: "Microservices, payments, inventory",
    tag: "RETAIL",
    accent: "bg-orange-500",
    type: "template:ecommerce",
  },
  {
    id: "template:ai-platform",
    label: "AI / ML Platform",
    icon: Activity,
    description: "Data ingestion, training, inference",
    tag: "AI",
    accent: "bg-violet-600",
    type: "template:ai-platform",
  },
  {
    id: "template:enterprise-k8s",
    label: "Enterprise K8s",
    icon: Layers,
    description: "Clusters, namespaces, deployments",
    tag: "K8S",
    accent: "bg-sky-500",
    type: "template:enterprise-k8s",
  },
  {
    id: "template:fintech-saas",
    label: "FinTech SaaS",
    icon: CreditCard,
    description: "Payments, compliance, multi-tenant",
    tag: "FINTECH",
    accent: "bg-emerald-600",
    type: "template:fintech-saas",
  },
  {
    id: "template:realtime",
    label: "Realtime System",
    icon: Wifi,
    description: "WebSockets, pub/sub, event streams",
    tag: "LIVE",
    accent: "bg-rose-500",
    type: "realtime",
  },
];

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const createWorkspace = useCreateWorkspace();

  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [selectedIcon, setSelectedIcon] = useState("server");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "Untitled Project", type: "system" },
  });

  const handleClose = () => {
    form.reset();
    setSelectedTemplate("blank");
    setSelectedIcon("server");
    onOpenChange(false);
  };

  const onSubmit = (values: FormValues) => {
    if (!user) return;
    const template = TEMPLATES.find(t => t.id === selectedTemplate);

    createWorkspace.mutate(
      { 
        ...values, 
        type: template?.type ?? "system", 
        userId: user.id,
        icon: selectedIcon,
      },
      {
        onSuccess: (newWorkspace) => {
          toast({
            title: "Workspace created",
            description: `"${values.title}" is ready.`,
          });
          handleClose();
          setLocation(`/workspace/${newWorkspace.id}`);
        },
        onError: () => {
          toast({
            title: "Failed to create",
            description: "Something went wrong. Try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Selected icon component
  const SelectedIconComp = PROJECT_ICONS.find(i => i.id === selectedIcon)?.Icon ?? Server;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="p-0 gap-0 max-w-2xl w-full overflow-hidden bg-surface-container-lowest border border-[#494847]/30 shadow-[0_40px_60px_rgba(0,0,0,0.8)] rounded-xl tracking-tight text-white font-body"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* ── Dark Header ─────────────────────────────────────────────────── */}
        <div className="bg-surface-container-low text-white px-8 py-5 flex items-center justify-between border-b border-[#494847]/30 relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex items-center justify-center bg-primary/10 rounded-lg p-2 border border-primary/20">
              <Box className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg leading-tight uppercase tracking-wide">Initialize Workspace</h2>
              <p className="text-xs text-outline tracking-wider uppercase font-headline font-semibold">Meshwork Engine</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="relative z-10 w-8 h-8 flex items-center justify-center text-outline hover:text-white rounded bg-surface-container-low hover:bg-[#494847]/20 border border-transparent hover:border-[#494847]/40 transition-all cursor-figma-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 flex flex-col gap-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-container-low/20 via-surface-container-lowest to-surface-container-lowest">

          {/* ── Project name + icon picker ───────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-outline flex items-center justify-between">
              Project Registry Name
              {form.formState.errors.title && (
                <span className="text-primary tracking-wider">{form.formState.errors.title.message}</span>
              )}
            </label>
            <div className="flex gap-4">
              {/* Icon preview / picker trigger */}
              <div className="w-16 h-16 rounded-xl bg-surface-container-high border-2 border-[#494847]/30 flex items-center justify-center shrink-0 text-white shadow-inner">
                <SelectedIconComp className="w-7 h-7" />
              </div>

              <input
                {...form.register("title")}
                placeholder="e.g. Navigation Prototype"
                autoFocus
                className={cn(
                  "flex-1 h-16 px-5 rounded-xl bg-surface-container-low/50 border border-[#494847]/30 font-headline font-bold text-lg text-white",
                  "placeholder:text-outline/40 placeholder:font-body placeholder:font-normal placeholder:tracking-normal",
                  "focus:outline-none focus:border-primary/50 focus:bg-surface-container-low transition-all duration-300 shadow-inner",
                  form.formState.errors.title && "border-primary/50 text-white"
                )}
              />
            </div>

            {/* Icon picker row */}
            <div className="flex flex-wrap gap-2 pt-2">
              {PROJECT_ICONS.map(({ id, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedIcon(id)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded transition-all duration-300 cursor-figma-pointer",
                    selectedIcon === id
                      ? "bg-primary text-[#0A0A0A] shadow-[0_0_15px_rgba(255,85,0,0.3)]"
                      : "bg-surface-container text-outline hover:bg-surface-container-high hover:text-white border border-[#494847]/15"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Template selection ───────────────────────────────────────── */}
          <div className="flex flex-col gap-3 pt-2">
            <label className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-outline">
              Base Architecture
            </label>
            <div className="grid grid-cols-2 gap-4">
              {TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={cn(
                      "relative flex flex-col items-start gap-4 p-5 rounded-xl text-left transition-all duration-300 cursor-figma-pointer overflow-hidden group",
                      isSelected
                        ? "bg-surface-container-high border-2 border-primary/50 shadow-[0_0_20px_rgba(255,85,0,0.1)]"
                        : "bg-surface-container-low border-2 border-transparent hover:border-[#494847]/30 hover:bg-surface-container"
                    )}
                  >
                    <div className="flex items-center gap-3 relative z-10 w-full">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors duration-300",
                        isSelected ? "bg-primary text-[#0A0A0A]" : "bg-surface-container-high text-outline group-hover:text-white"
                      )}>
                        <Icon className="w-5 h-5 shrink-0" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-headline font-bold text-sm tracking-wide text-white truncate w-full">
                          {tpl.label}
                        </span>
                        <span className={cn(
                          "text-[10px] font-label font-bold uppercase tracking-widest mt-1",
                          isSelected ? "text-primary" : "text-outline group-hover:text-outline"
                        )}>
                          {tpl.tag}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-6 mt-2 border-t border-[#494847]/20">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-headline font-bold tracking-widest uppercase text-outline hover:text-white transition-colors cursor-figma-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={createWorkspace.isPending}
              className={cn(
                "bg-[#FF6B35] text-[#4A1200] font-headline font-bold px-8 py-3.5 rounded transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] shadow-[0_0_10px_rgba(255,107,53,0.15)] flex items-center gap-3 cursor-figma-pointer",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              )}
            >
              {createWorkspace.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  INITIALIZING...
                </>
              ) : (
                "LAUNCH WORKSPACE"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
