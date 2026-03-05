import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-6">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="w-20 h-20 bg-foreground text-background flex items-center justify-center mb-6 border-2 border-foreground shadow-[8px_8px_0px_0px_#1a1a1a]">
        <Smartphone className="w-10 h-10" />
      </div>
      
      <h2 className="text-2xl font-black uppercase tracking-tighter text-center mb-4">
        Desktop Only
      </h2>
      
      <p className="text-center text-muted-foreground max-w-xs font-medium">
        This application is designed for desktop use. Please visit us on a larger screen for the best experience.
      </p>
      
      <button
        onClick={() => setDismissed(true)}
        className="mt-8 px-6 py-3 bg-foreground text-background font-bold uppercase text-sm tracking-wider border-2 border-foreground hover:shadow-[4px_4px_0px_0px_#1a1a1a] transition-shadow"
      >
        Continue Anyway
      </button>
    </div>
  );
}
