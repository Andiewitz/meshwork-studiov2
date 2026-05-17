import { motion } from "framer-motion";
import { MeshworkLogo } from "@/components/MeshworkLogo";

export function MobileGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6 max-w-sm"
      >
        <div className="w-12 h-12">
          <MeshworkLogo />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-sans font-semibold text-white">
            Desktop only
          </h2>
          <p className="text-sm text-white/40 leading-relaxed font-sans">
            Meshwork Studio is built for designing complex infrastructure diagrams and works best on a larger screen. Open it on your desktop for the full experience.
          </p>
        </div>
        <a
          href="/"
          className="text-sm text-primary font-medium hover:text-primary/80 transition-colors mt-2"
        >
          ← Back to home
        </a>
      </motion.div>
    </div>
  );
}
