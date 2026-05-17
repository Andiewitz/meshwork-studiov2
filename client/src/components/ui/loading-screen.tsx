import { motion } from "framer-motion";
import { MeshworkLogo } from "@/components/MeshworkLogo";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

// Shared animated dots component
function AnimatedDots() {
  return (
    <span className="inline-flex ml-0.5">
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay }}
          className="text-white/40"
        >
          .
        </motion.span>
      ))}
    </span>
  );
}

// Shared ghost skeleton bar
function GhostBar({ width, delay = 0 }: { width: string; delay?: number }) {
  return (
    <motion.div
      className="h-2.5 rounded-full bg-white/[0.04]"
      style={{ width }}
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.08, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

// Standard loading with branded logo + ghost skeletons
export function LoadingScreen({ message = "Loading", subMessage }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-8"
      >
        {/* Logo with pulse glow */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.15, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-12 h-12"
          >
            <MeshworkLogo />
          </motion.div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-sm font-sans font-medium text-white/60">
            {message}<AnimatedDots />
          </p>
          {subMessage && (
            <p className="text-xs text-white/30 font-sans">{subMessage}</p>
          )}
        </div>

        {/* Ghost skeleton block */}
        <div className="flex flex-col gap-2.5 w-56">
          <GhostBar width="100%" delay={0} />
          <GhostBar width="75%" delay={0.15} />
          <GhostBar width="60%" delay={0.3} />
        </div>
      </motion.div>
    </div>
  );
}

// Ghost skeleton loader — for dashboard/workspace loading states
export function LineSyncLoader({ message = "Syncing" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-10 w-full max-w-md px-6"
      >
        {/* Logo */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-10 h-10"
        >
          <MeshworkLogo />
        </motion.div>

        {/* Ghost card skeletons */}
        <div className="w-full space-y-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-8 h-8 rounded-lg bg-white/[0.04]"
                  animate={{ opacity: [0.3, 0.08, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
                <div className="flex-1 space-y-2">
                  <GhostBar width="55%" delay={i * 0.2} />
                  <GhostBar width="35%" delay={i * 0.2 + 0.1} />
                </div>
              </div>
              <div className="space-y-2">
                <GhostBar width="100%" delay={i * 0.2 + 0.2} />
                <GhostBar width="80%" delay={i * 0.2 + 0.3} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Text */}
        <p className="text-sm font-sans font-medium text-white/40">
          {message}<AnimatedDots />
        </p>
      </motion.div>
    </div>
  );
}

// Redirecting loader — for auth transitions and Suspense fallback
export function RedirectingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo with orbiting dot */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border border-white/[0.06]"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
          </motion.div>
          <div className="w-8 h-8">
            <MeshworkLogo />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-sans font-medium text-white/60">
            Redirecting<AnimatedDots />
          </p>
          <p className="text-xs text-white/25 font-sans">Please wait</p>
        </div>
      </motion.div>
    </div>
  );
}
