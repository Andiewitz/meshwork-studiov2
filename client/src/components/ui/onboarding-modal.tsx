import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MeshworkLogo } from "@/components/MeshworkLogo";
import { X } from "lucide-react";

const ONBOARDING_KEY = "meshwork_onboarding_complete";

const steps = [
  {
    title: "Welcome to Meshwork Studio",
    body: "Design and visualize your cloud infrastructure in a drag-and-drop canvas. Map microservices, databases, load balancers — everything in one place.",
  },
  {
    title: "Workspaces",
    body: "Each workspace is a separate canvas. Create one for each project or environment. You can share workspaces with your team for real-time collaboration.",
  },
  {
    title: "Nested Canvases",
    body: "Double-click any container node (VPC, Docker, Kubernetes) to zoom into its internal architecture. Navigate back with the breadcrumb trail.",
  },
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setIsOpen(true);
  }, []);

  const complete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      complete();
    }
  };

  if (!isOpen) return null;

  const current = steps[step];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-6"
          >
            <div className="w-full max-w-md bg-[#111] border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-0">
                <div className="w-8 h-8">
                  <MeshworkLogo />
                </div>
                <button
                  onClick={complete}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pt-5 pb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2
                      className="text-lg font-semibold text-white mb-2"
                      style={{ fontFamily: "var(--font-headline)" }}
                    >
                      {current.title}
                    </h2>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {current.body}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.05]">
                {/* Step dots */}
                <div className="flex items-center gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === step ? "bg-primary" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {step < steps.length - 1 && (
                    <button
                      onClick={complete}
                      className="text-xs text-white/30 hover:text-white/50 transition-colors"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    onClick={next}
                    className="px-4 py-2 text-xs font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {step === steps.length - 1 ? "Get started" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
