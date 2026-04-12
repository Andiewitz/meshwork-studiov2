/**
 * Global Meshwork Studio logo — the core network marks only.
 * No outer square, no border. Just the three connected nodes
 * and the connecting lines that form the mesh.
 */
export function MeshworkLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={className}>
      {/* Connecting lines (the mesh) */}
      <line x1="8" y1="8" x2="24" y2="8" stroke="white" strokeWidth="2" strokeLinecap="square" />
      <line x1="8" y1="8" x2="16" y2="24" stroke="white" strokeWidth="2" strokeLinecap="square" />
      <line x1="24" y1="8" x2="16" y2="24" stroke="white" strokeWidth="2" strokeLinecap="square" />
      {/* Node dots */}
      <rect x="4" y="4" width="8" height="8" fill="#FF3D00" />
      <rect x="20" y="4" width="8" height="8" fill="white" />
      <rect x="12" y="20" width="8" height="8" fill="white" />
    </svg>
  );
}
