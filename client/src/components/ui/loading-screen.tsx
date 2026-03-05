import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

// Standard loading with spinner and animated dots
export function LoadingScreen({ message = "Loading", subMessage }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-medium text-foreground">
            {message}
            <span className="inline-flex">
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              >
                .
              </motion.span>
            </span>
          </p>
          {subMessage && (
            <p className="text-sm text-muted-foreground">{subMessage}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Line syncing animation loader - for normal loading states
export function LineSyncLoader({ message = "Syncing" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Line syncing animation */}
        <div className="relative w-32 h-8 flex items-center justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary rounded-full"
              initial={{ height: 8 }}
              animate={{ height: [8, 32, 8] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-medium text-foreground">
            {message}
            <span className="inline-flex">
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              >
                .
              </motion.span>
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Redirecting loader - only for auth pages
export function RedirectingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <motion.div
            className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 w-12 h-12"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-3 h-3 bg-primary/40 rounded-full absolute -top-1 left-1/2 -translate-x-1/2" />
          </motion.div>
        </div>
        <p className="text-lg font-medium text-foreground">Redirecting</p>
        <p className="text-sm text-muted-foreground">Please wait...</p>
      </motion.div>
    </div>
  );
}
