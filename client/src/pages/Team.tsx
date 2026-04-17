import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
};

export default function Team() {
  const [isNotifying, setIsNotifying] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);

  const handleNotifyClick = () => {
    if (isNotifying || hasNotified) return;
    setIsNotifying(true);
    
    // Dispatch a custom event to notify the notification bell in the layout (if we implement that bridge later)
    window.dispatchEvent(new CustomEvent('trigger-fly-notification'));
    
    setTimeout(() => {
      setIsNotifying(false);
      setHasNotified(true);
    }, 1000);
  };

  return (
    <motion.div
      key="team"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center h-[calc(100vh-6rem)]"
    >
      <motion.div variants={fadeUpVariants} className="relative w-full max-w-md aspect-video mb-8">
        <div className="absolute inset-0 bg-[#FF5500]/10 blur-[80px] rounded-full pointer-events-none"></div>
        <img
          src="https://images.blush.design/b6742e11ca2a99437f098e4a931acca0?w=920&auto=compress&cs=srgb"
          alt="Team Collaboration Coming Soon"
          className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <motion.div variants={fadeUpVariants}>
        <span className="bg-primary/10 text-primary text-[10px] font-headline font-bold px-3 py-1 rounded-full border border-primary/20 tracking-widest uppercase mb-4 inline-block">Coming Soon</span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white font-headline mb-4">Multiplayer Workspaces</h2>
        <p className="text-outline text-base max-w-lg mx-auto mb-8">
          We're building the ultimate collaborative experience. Soon, you'll be able to invite your team, share blueprints, and build together in real-time.
        </p>
        <button 
          onClick={handleNotifyClick}
          disabled={hasNotified}
          className={`font-headline font-bold px-8 py-3 rounded transition-colors duration-300 border cursor-figma-pointer flex items-center gap-2 mx-auto ${
            hasNotified 
              ? "bg-primary/10 text-primary border-primary/20 cursor-default" 
              : "bg-surface-container-high hover:bg-surface-container-highest text-white border-outline-variant/20"
          }`}
        >
          {hasNotified && <Check className="w-4 h-4" />}
          {isNotifying ? "Notifying..." : hasNotified ? "Already Notified" : "Notify Me When It's Live"}
        </button>
      </motion.div>
    </motion.div>
  );
}
