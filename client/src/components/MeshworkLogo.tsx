/**
 * Global Meshwork Studio logo
 */
export function MeshworkLogo({ className = "w-full h-full object-contain" }: { className?: string }) {
  return (
    <img 
      src="/logos/meshwork-logo.png" 
      alt="Meshwork Studio" 
      className={className} 
    />
  );
}
