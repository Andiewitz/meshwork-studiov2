import { motion } from "framer-motion";
import { MeshworkLogo } from "@/components/MeshworkLogo";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

// Standard loading — centered logo + thin progress bar
export function LoadingScreen({ message, subMessage }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="w-10 h-10">
          <MeshworkLogo />
        </div>
        <div className="w-32 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}

// Dashboard/workspace loading — same style
export function LineSyncLoader({ message }: { message?: string }) {
  return <LoadingScreen message={message} />;
}

// Auth redirecting — same style
export function RedirectingScreen() {
  return <LoadingScreen />;
}
