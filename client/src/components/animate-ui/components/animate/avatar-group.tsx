'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

// ── Context ────────────────────────────────────────────────────────────────────
const AvatarGroupContext = React.createContext<{
  hoveredIndex: number | null;
  setHoveredIndex: (i: number | null) => void;
  total: number;
}>({ hoveredIndex: null, setHoveredIndex: () => {}, total: 0 });

// ── AvatarGroupTooltip ─────────────────────────────────────────────────────────
// Rendered inside <Avatar> — uses a fixed-position portal to escape overflow:hidden
interface AvatarGroupTooltipProps {
  children: React.ReactNode;
}

function AvatarGroupTooltip({ children }: AvatarGroupTooltipProps) {
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const [hovered, setHovered] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  const updateRect = () => {
    const el = ref.current?.closest('[data-avatar-item]');
    if (el) setRect(el.getBoundingClientRect());
  };

  const handleMouseEnter = () => { updateRect(); setHovered(true); };
  const handleMouseLeave = () => setHovered(false);

  React.useEffect(() => {
    const el = ref.current?.closest('[data-avatar-item]');
    if (!el) return;
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const tooltip = rect && (
    <AnimatePresence>
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.9 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            left: rect.left + rect.width / 2,
            top: rect.top - 8,
            transform: 'translate(-50%, -100%)',
            zIndex: 99999,
          }}
          className="px-2 py-1 rounded-md bg-[#1a1a1e]/95 backdrop-blur-sm border border-white/[0.08] text-[10px] font-medium text-white/80 whitespace-nowrap shadow-xl pointer-events-none"
        >
          {children}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[4px] border-x-transparent border-t-[4px] border-t-[#1a1a1e]" />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <span ref={ref} style={{ display: 'none' }} />
      {typeof document !== 'undefined' && rect && createPortal(tooltip, document.body)}
    </>
  );
}

// ── AvatarGroup ────────────────────────────────────────────────────────────────
interface AvatarGroupProps {
  children: React.ReactNode;
  className?: string;
}

function AvatarGroup({ children, className = '' }: AvatarGroupProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const childArray = React.Children.toArray(children);
  const total = childArray.length;

  return (
    <AvatarGroupContext.Provider value={{ hoveredIndex, setHoveredIndex, total }}>
      <div className={`flex items-center flex-row-reverse ${className}`}>
        {childArray.map((child, i) => (
          <AvatarGroupItemWrapper key={i} index={i} total={total}>
            {child}
          </AvatarGroupItemWrapper>
        ))}
      </div>
    </AvatarGroupContext.Provider>
  );
}

// ── AvatarGroupItemWrapper ─────────────────────────────────────────────────────
function AvatarGroupItemWrapper({
  children,
  index,
  total,
}: {
  children: React.ReactNode;
  index: number;
  total: number;
}) {
  const { hoveredIndex, setHoveredIndex } = React.useContext(AvatarGroupContext);

  const isHovered = hoveredIndex === index;
  const spread =
    hoveredIndex !== null
      ? Math.max(0, 6 - Math.abs(index - hoveredIndex) * 2) *
        Math.sign(index - hoveredIndex)
      : 0;

  return (
    <motion.div
      data-avatar-item
      className="relative -ml-2 first:ml-0 cursor-pointer"
      style={{ zIndex: isHovered ? total + 10 : total - index }}
      animate={{ x: spread, scale: isHovered ? 1.12 : 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {children}
    </motion.div>
  );
}

export { AvatarGroup, AvatarGroupTooltip };
