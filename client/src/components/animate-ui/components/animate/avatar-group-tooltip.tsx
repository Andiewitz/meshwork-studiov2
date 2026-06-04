'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AvatarGroupTooltipProps {
  children: React.ReactNode;
}

function AvatarGroupTooltip({ children }: AvatarGroupTooltipProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.92 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-[#1a1a1e] border border-white/10 text-[10px] font-medium text-white/80 whitespace-nowrap shadow-lg pointer-events-none z-[9999]"
          >
            {children}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[4px] border-x-transparent border-t-[4px] border-t-[#1a1a1e]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// This component is used as a child of Avatar to inject tooltip behaviour.
// It renders nothing by itself — the parent AvatarGroupItem handles hover via context.
// We export this so the consumer API matches animate-ui's demo code exactly.
export { AvatarGroupTooltip };
