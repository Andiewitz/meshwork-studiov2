import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Users,
  Settings,
  HelpCircle,
  Radio,
  Bell,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { MeshworkLogo } from "@/components/MeshworkLogo";

// -- Animation Variants --
const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: "System Update", desc: "Meshwork Studio Beta v0.9 is live.", time: "2h ago", unread: true },
  { id: 2, title: "New Comment", desc: "Alex left a comment on 'Project Alpha'.", time: "5h ago", unread: true },
  { id: 3, title: "Welcome", desc: "Thanks for joining the Meshwork Beta!", time: "1d ago", unread: false },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  // Route matches
  const isOverview = location === "/home";
  const isProjects = location === "/workspaces";
  const isDocs = location === "/docs" || location === "/dev";
  const isTeam = location === "/team";

  // Notification State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isNotifying, setIsNotifying] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [flyStart, setFlyStart] = useState({ x: 0, y: 0 });
  const [flyTarget, setFlyTarget] = useState({ x: 0, y: 0 });
  const [isRinging, setIsRinging] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  const hasUnread = notifications.some(n => n.unread);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const markOneRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  // Global event listener for triggered notifications from nested pages
  useEffect(() => {
    const handleFlyNotification = (e: any) => {
      if (isNotifying || hasNotified) return;
      
      // We simulate click start from center screen
      setFlyStart({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      
      if (bellRef.current) {
        const targetRect = bellRef.current.getBoundingClientRect();
        setFlyTarget({ x: targetRect.left + targetRect.width / 2, y: targetRect.top + targetRect.height / 2 });
      } else {
        setFlyTarget({ x: window.innerWidth - 100, y: 40 });
      }

      setIsNotifying(true);
      
      // Ring the bell when the flying icon arrives
      setTimeout(() => setIsRinging(true), 800);
      setTimeout(() => setIsRinging(false), 1200);
      
      // Reset notification state
      setTimeout(() => {
        setIsNotifying(false);
        setHasNotified(true);
      }, 1000);
    };

    window.addEventListener('trigger-fly-notification', handleFlyNotification);
    return () => window.removeEventListener('trigger-fly-notification', handleFlyNotification);
  }, [isNotifying, hasNotified]);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen antialiased flex cursor-figma">
      
      {/* Sidebar - Extracted exactly from redesign sample */}
      <motion.aside
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className="fixed left-0 top-0 h-full w-20 z-50 bg-[#000000] flex flex-col items-center py-8 gap-8 border-r border-[#494847]/15 font-body text-xs tracking-tight"
      >
        <motion.div variants={itemVariants} className="mb-4">
          <div className="flex items-center justify-center">
            <MeshworkLogo className="text-white w-8 h-8" />
          </div>
        </motion.div>
        
        <nav className="flex flex-col items-center gap-6 flex-1">
          <Link href="/home">
            <motion.button variants={itemVariants} className={`transition-colors duration-150 cursor-figma-pointer ${isOverview ? 'text-[#FF5500] drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]' : 'text-[#777575] hover:bg-[#131313] hover:text-white p-2 rounded'}`} title="Overview">
              <LayoutDashboard className={`w-5 h-5 ${isOverview ? 'fill-current' : ''}`} />
            </motion.button>
          </Link>
          <Link href="/workspaces">
            <motion.button variants={itemVariants} className={`transition-colors duration-150 cursor-figma-pointer ${isProjects ? 'text-[#FF5500] drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]' : 'text-[#777575] hover:bg-[#131313] hover:text-white p-2 rounded'}`} title="Projects">
              <Package className={`w-5 h-5 ${isProjects ? 'fill-current' : ''}`} />
            </motion.button>
          </Link>
          <Link href="/docs">
            <motion.button variants={itemVariants} className={`transition-colors duration-150 cursor-figma-pointer ${isDocs ? 'text-[#FF5500] drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]' : 'text-[#777575] hover:bg-[#131313] hover:text-white p-2 rounded'}`} title="Docs">
              <BookOpen className={`w-5 h-5 ${isDocs ? 'fill-current' : ''}`} />
            </motion.button>
          </Link>
          <Link href="/team">
            <motion.button variants={itemVariants} className={`transition-colors duration-150 cursor-figma-pointer ${isTeam ? 'text-[#FF5500] drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]' : 'text-[#777575] hover:bg-[#131313] hover:text-white p-2 rounded'}`} title="Team">
              <Users className={`w-5 h-5 ${isTeam ? 'fill-current' : ''}`} />
            </motion.button>
          </Link>
        </nav>
        
        <div className="flex flex-col items-center gap-6 mt-auto">
          <motion.a variants={itemVariants} href="#" className="text-[#777575] hover:text-white transition-colors cursor-figma-pointer" title="Help">
            <HelpCircle className="w-5 h-5" />
          </motion.a>
          <motion.a variants={itemVariants} href="#" className="text-[#777575] hover:text-white transition-colors cursor-figma-pointer" title="Radio">
            <Radio className="w-5 h-5" />
          </motion.a>
          
          <div className="relative group">
            <motion.div variants={itemVariants} className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/20 cursor-figma-pointer flex items-center justify-center font-headline font-bold text-xs text-white">
              {user?.profileImageUrl ? (
                <img alt="User profile" className="w-full h-full object-cover" src={user.profileImageUrl} />
              ) : (
                user?.firstName?.[0] || user?.email?.[0] || "U"
              )}
            </motion.div>
            
            {/* Simple logout flyout */}
            <div className="absolute left-full bottom-0 ml-4 px-3 py-2 bg-surface-container-highest border border-outline-variant/20 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
               <button onClick={() => logout()} className="text-sm font-body text-white flex items-center gap-2 hover:text-primary transition-colors cursor-figma-pointer">
                 <LogOut className="w-4 h-4" /> Logout
               </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Top Navigation Bar - Glass Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-0 left-20 right-0 z-40 bg-neutral-950/60 backdrop-blur-xl flex justify-between items-center px-10 py-4"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold tracking-tighter text-white font-headline">Meshwork Studio</h1>
          <span className="bg-black text-white text-[10px] font-headline font-bold px-3 py-1 rounded-full border border-white tracking-widest uppercase">Beta</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <motion.button 
                ref={bellRef}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                animate={isRinging ? { rotate: [0, -20, 20, -20, 20, 0] } : { rotate: 0 }}
                transition={{ duration: 0.4 }}
                className={`relative flex items-center justify-center w-8 h-8 transition-colors duration-300 cursor-figma-pointer ${isRinging || isNotificationsOpen ? 'text-primary' : 'text-[#E5E2E1] hover:text-white'}`}
              >
                <Bell className="w-5 h-5" />
                {hasUnread && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-black"></div>
                )}
              </motion.button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-4 w-80 bg-surface-container-high/90 backdrop-blur-xl border border-outline-variant/20 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
                  >
                    <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center">
                      <h3 className="text-white font-headline font-bold">Notifications</h3>
                      <button onClick={markAllRead} className="text-xs text-primary hover:text-white transition-colors cursor-figma-pointer">Mark all as read</button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto hide-scrollbar">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => markOneRead(notif.id)}
                          className={`p-4 border-b border-outline-variant/10 hover:bg-surface-container-highest transition-colors cursor-figma-pointer flex gap-3 ${notif.unread ? 'bg-primary/5' : ''}`}
                        >
                          <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 transition-colors duration-300 ${notif.unread ? 'bg-primary' : 'bg-transparent'}`} />
                          <div>
                            <h4 className="text-sm font-bold text-white mb-0.5">{notif.title}</h4>
                            <p className="text-xs text-outline mb-1">{notif.desc}</p>
                            <span className="text-[10px] text-outline/60 uppercase tracking-wider">{notif.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-outline-variant/20 bg-surface-container-highest/50">
                      <button className="text-xs text-outline hover:text-white transition-colors cursor-figma-pointer">View all notifications</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/settings">
              <button className="flex items-center justify-center w-8 h-8 text-[#E5E2E1] hover:text-white transition-colors duration-300 cursor-figma-pointer">
                <Settings className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Flying Notification Animation System */}
      <AnimatePresence>
        {isNotifying && (
          <motion.div
            initial={{ x: flyStart.x - 12, y: flyStart.y - 12, scale: 1, opacity: 1 }}
            animate={{ 
              x: flyTarget.x - 12, 
              y: flyTarget.y - 12,
              scale: 0.2, 
              opacity: [1, 1, 0] 
            }}
            transition={{ duration: 0.8, ease: "easeInOut", times: [0, 0.8, 1] }}
            className="fixed z-[100] pointer-events-none text-primary"
          >
            <Bell className="w-6 h-6 fill-current" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Render Context */}
      <main className="pl-20 pt-16 min-h-screen technical-gradient w-full overflow-hidden">
        <div className="w-full h-full p-12">
          {children}
        </div>
      </main>

    </div>
  );
}
