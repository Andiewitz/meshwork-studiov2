import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Package,
  Activity,
  Users,
  Settings,
  HelpCircle,
  Radio,
  Bell,
  Search,
  LayoutGrid,
  List,
  Clock,
  Terminal,
  FileText,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Calendar,
  Book,
  Check
} from "lucide-react";

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    }
  }
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
};

const MOCK_PROJECTS = [
  {
    id: 1,
    title: "Vertex_Engine_V4",
    status: "Live",
    updated: "12m ago",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNAQ0IJvs-cTpqW1SGHAp7GW88rhhcOGFhqdy9qwSjNId142uyR6F8yg0NgXscbBorF5jk_87Hb1z1EWpyFX9DEtmjd-8FubCRIo6iWAudXFhVVgp_xVdXw3NTHC_hTJj14b4-pAtoer8f0nkZNYQQwTo5hwf7TKGq-VdT9ZyHTuz2q-ZjeqV_ZOPncEdZDg7ZKQB1tFG5bAuaPkcz1EJAy-Ax0tjQmN3iP8NJnMRdPWX0dHHHJfVPiw1LCmvGsEqWXa3IZRqZE4yq"
  },
  {
    id: 2,
    title: "Neural_Mesh_Identity",
    status: "Idle",
    updated: "4h ago",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxKeaaD5bHyoHgNFXPTbmPyH-BByNMgUk5-OxALzML6Zq_sMmud-alsIcKCazBaTIKA0vB1PyDwHStr2QifxtO9jryhPrA7GdUDcbgOMxye8X2MON_1WwdcI-SEiIkRrMnHqY-R-fEEaZDsFkO5IBIaaLukUbGyqx3ts0PJVDoWNPvShWxorQddWLFodRGD2JEqpjEo6ymPehg54p1ZaKGt3b5NH4iRrXv6pkw8mvMVzneEvUctRXvoiZjzm2uJOfbpRMMeZpjt9n4"
  },
  {
    id: 3,
    title: "Quantum_Core_Alpha",
    status: "Review",
    updated: "1d ago",
    image: "https://picsum.photos/seed/quantum/800/600"
  },
  {
    id: 4,
    title: "Stellar_Gateway_UI",
    status: "Live",
    updated: "2d ago",
    image: "https://picsum.photos/seed/stellar/800/600"
  }
];

const MOCK_DOCS = [
  { id: 1, title: "Getting Started", desc: "Learn the basics of Meshwork Studio and set up your first workspace.", icon: <Book className="w-5 h-5" /> },
  { id: 2, title: "API Reference", desc: "Detailed documentation for our REST and GraphQL APIs.", icon: <Terminal className="w-5 h-5" /> },
  { id: 3, title: "Component Library", desc: "Explore the pre-built UI components available for your projects.", icon: <LayoutGrid className="w-5 h-5" /> },
  { id: 4, title: "Authentication", desc: "Guide to implementing user login and access control.", icon: <Users className="w-5 h-5" /> },
];

const MOCK_CHANGELOG = [
  { version: "v2.4.0", date: "Today", changes: "Added search dropdown and new docs layout." },
  { version: "v2.3.5", date: "Apr 12", changes: "Improved project grid animations." },
  { version: "v2.3.0", date: "Apr 05", changes: "Introduced Figma-style custom cursors." },
];

const MeshworkLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 6L18 6M6 6L12 18M18 6L12 18" stroke="currentColor" strokeWidth="2.5" />
    <rect x="2" y="2" width="8" height="8" fill="#FF5500" />
    <rect x="14" y="2" width="8" height="8" fill="currentColor" />
    <rect x="8" y="14" width="8" height="8" fill="currentColor" />
  </svg>
);

const MOCK_NOTIFICATIONS = [
  { id: 1, title: "System Update", desc: "Meshwork Studio Beta v0.9 is live.", time: "2h ago", unread: true },
  { id: 2, title: "New Comment", desc: "Alex left a comment on 'Project Alpha'.", time: "5h ago", unread: true },
  { id: 3, title: "Welcome", desc: "Thanks for joining the Meshwork Beta!", time: "1d ago", unread: false },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Notification animation state
  const [isNotifying, setIsNotifying] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [flyStart, setFlyStart] = useState({ x: 0, y: 0 });
  const [flyTarget, setFlyTarget] = useState({ x: 0, y: 0 });
  const [isRinging, setIsRinging] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  const handleNotifyClick = (e: React.MouseEvent) => {
    if (isNotifying || hasNotified) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setFlyStart({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    
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

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen antialiased flex cursor-figma">
      {/* Sidebar */}
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
          <motion.button variants={itemVariants} onClick={() => setActiveTab('overview')} className={`transition-colors duration-150 cursor-figma-pointer ${activeTab === 'overview' ? 'text-[#FF5500] drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]' : 'text-[#777575] hover:bg-[#131313] hover:text-white p-2 rounded'}`} title="Overview">
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'overview' ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button variants={itemVariants} onClick={() => setActiveTab('projects')} className={`transition-colors duration-150 cursor-figma-pointer ${activeTab === 'projects' ? 'text-[#FF5500] drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]' : 'text-[#777575] hover:bg-[#131313] hover:text-white p-2 rounded'}`} title="Projects">
            <Package className={`w-5 h-5 ${activeTab === 'projects' ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button variants={itemVariants} onClick={() => setActiveTab('docs')} className={`transition-colors duration-150 cursor-figma-pointer ${activeTab === 'docs' ? 'text-[#FF5500] drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]' : 'text-[#777575] hover:bg-[#131313] hover:text-white p-2 rounded'}`} title="Docs">
            <BookOpen className={`w-5 h-5 ${activeTab === 'docs' ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button variants={itemVariants} onClick={() => setActiveTab('team')} className={`transition-colors duration-150 cursor-figma-pointer ${activeTab === 'team' ? 'text-[#FF5500] drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]' : 'text-[#777575] hover:bg-[#131313] hover:text-white p-2 rounded'}`} title="Team">
            <Users className={`w-5 h-5 ${activeTab === 'team' ? 'fill-current' : ''}`} />
          </motion.button>
        </nav>
        <div className="flex flex-col items-center gap-6 mt-auto">
          <motion.a variants={itemVariants} href="#" className="text-[#777575] hover:text-white transition-colors cursor-figma-pointer">
            <HelpCircle className="w-5 h-5" />
          </motion.a>
          <motion.a variants={itemVariants} href="#" className="text-[#777575] hover:text-white transition-colors cursor-figma-pointer">
            <Radio className="w-5 h-5" />
          </motion.a>
          <motion.div variants={itemVariants} className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/20">
            <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-JTdi7K7guBlCoOvJJUVsjo1JHj0Ok51Bw9bfewYZRrdCNKm96Vq8Esf03yMGfFjz-Nx1o88diz_-CgrcFlaEuF133QGW6enP8CTOPkZJl0ySRO6ZMe-AtabFmhTdW3EhkAYHkBTt7E6x4Inv5fP6wfSJwJOdn4hFT-PbOCoTdUy5TodHgkAX8Y2V5W259KvjJ4pWnlGmcbEbhGUHJAAa1jiqDuRbbhBIC38ALVGuHswMP4FGj74VLcVH-mj5E5IbO9VuDZn8Vzhf" />
          </motion.div>
        </div>
      </motion.aside>

      {/* Top Navigation Bar */}
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
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-black"></div>
              </motion.button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-4 w-80 bg-surface-container-high/90 backdrop-blur-xl border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center">
                      <h3 className="text-white font-headline font-bold">Notifications</h3>
                      <button className="text-xs text-primary hover:text-white transition-colors cursor-figma-pointer">Mark all as read</button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {MOCK_NOTIFICATIONS.map(notif => (
                        <div key={notif.id} className={`p-4 border-b border-outline-variant/10 hover:bg-surface-container-highest transition-colors cursor-figma-pointer flex gap-3 ${notif.unread ? 'bg-primary/5' : ''}`}>
                          <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.unread ? 'bg-primary' : 'bg-transparent'}`} />
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
            <button className="flex items-center justify-center w-8 h-8 text-[#E5E2E1] hover:text-white transition-colors duration-300 cursor-figma-pointer">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Flying Notification Animation */}
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

      {/* Main Content Canvas */}
      <main className="pl-20 pt-16 min-h-screen technical-gradient w-full">
        <div className="max-w-[1400px] mx-auto px-12 py-20">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="overview"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                className="w-full"
              >
                {/* Hero Section */}
              <motion.section variants={fadeUpVariants} className="flex flex-col items-center text-center mb-32">
                <h2 className="text-6xl md:text-7xl font-extrabold font-headline tracking-tighter text-white mb-12">
                  Good Evening, Andrei.
                </h2>
                {/* Command Bar */}
                <div className="w-full max-w-2xl relative group z-30">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-outline/50" />
                  </div>
                  <input
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className={`w-full bg-surface-container-low/30 border py-4 pl-12 pr-16 text-base font-body text-on-surface placeholder:text-outline/50 focus:outline-none transition-all duration-300 backdrop-blur-md ${isSearchFocused ? 'border-[#FF5500]/50 rounded-t-xl rounded-b-none bg-surface-container-low/80' : 'border-outline-variant/20 rounded-lg'}`}
                    placeholder="Search blueprints, assets, or run a command..."
                    type="text"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-surface-container-high text-[10px] text-outline border border-outline-variant/30 rounded font-body">⌘ K</kbd>
                  </div>

                  {/* Search Dropdown */}
                  <AnimatePresence>
                    {isSearchFocused && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-xl border border-t-0 border-[#FF5500]/50 rounded-b-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)] text-left"
                      >
                        {/* Recent Searches */}
                        <div className="p-2 border-b border-outline-variant/10">
                          <div className="px-3 py-2 text-[10px] font-headline font-bold text-outline tracking-widest uppercase">Recent</div>
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-high cursor-figma-pointer group transition-colors">
                            <Clock className="w-4 h-4 text-outline group-hover:text-white transition-colors" />
                            <span className="text-sm text-[#E5E2E1] group-hover:text-white transition-colors">Dashboard Redesign</span>
                          </div>
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-high cursor-figma-pointer group transition-colors">
                            <Clock className="w-4 h-4 text-outline group-hover:text-white transition-colors" />
                            <span className="text-sm text-[#E5E2E1] group-hover:text-white transition-colors">Auth flow integration</span>
                          </div>
                        </div>

                        {/* Suggested Projects */}
                        <div className="p-2 border-b border-outline-variant/10">
                          <div className="px-3 py-2 text-[10px] font-headline font-bold text-outline tracking-widest uppercase">Projects</div>
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-high cursor-figma-pointer group transition-colors">
                            <Package className="w-4 h-4 text-outline group-hover:text-white transition-colors" />
                            <span className="text-sm text-[#E5E2E1] group-hover:text-white transition-colors">Meshwork Alpha</span>
                            <ArrowRight className="w-4 h-4 ml-auto text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-high cursor-figma-pointer group transition-colors">
                            <Package className="w-4 h-4 text-outline group-hover:text-white transition-colors" />
                            <span className="text-sm text-[#E5E2E1] group-hover:text-white transition-colors">Website V2</span>
                            <ArrowRight className="w-4 h-4 ml-auto text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>

                        {/* Commands */}
                        <div className="p-2">
                          <div className="px-3 py-2 text-[10px] font-headline font-bold text-outline tracking-widest uppercase">Commands</div>
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-high cursor-figma-pointer group transition-colors">
                            <Terminal className="w-4 h-4 text-outline group-hover:text-white transition-colors" />
                            <span className="text-sm text-[#E5E2E1] group-hover:text-white transition-colors">Create new workspace</span>
                            <kbd className="ml-auto px-2 py-1 bg-surface-container-highest text-[10px] text-outline rounded font-body opacity-0 group-hover:opacity-100 transition-opacity">↵</kbd>
                          </div>
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-high cursor-figma-pointer group transition-colors">
                            <Users className="w-4 h-4 text-outline group-hover:text-white transition-colors" />
                            <span className="text-sm text-[#E5E2E1] group-hover:text-white transition-colors">Invite team member</span>
                            <kbd className="ml-auto px-2 py-1 bg-surface-container-highest text-[10px] text-outline rounded font-body opacity-0 group-hover:opacity-100 transition-opacity">↵</kbd>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Primary Action */}
                <div className="mt-12">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#FF6B35] text-[#4A1200] font-headline font-bold px-10 py-4 rounded transition-shadow duration-300 shadow-[0_0_30px_rgba(255,107,53,0.3)] hover:shadow-[0_0_40px_rgba(255,107,53,0.5)] cursor-figma-pointer"
                  >
                    NEW WORKSPACE
                  </motion.button>
                </div>
              </motion.section>

              {/* Dashboard Content */}
              <div className="w-full max-w-5xl mx-auto">
                {/* Recent Projects Section */}
                <motion.section variants={containerVariants} className="w-full">
                  <motion.div variants={fadeUpVariants} className="flex items-center justify-between mb-10">
                    <h3 className="text-xs font-bold font-headline tracking-[0.2em] uppercase text-outline">Recent Projects</h3>
                    <button onClick={() => setActiveTab('projects')} className="text-[10px] font-headline tracking-widest text-primary hover:underline underline-offset-4 uppercase cursor-figma-pointer">View Archive</button>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {MOCK_PROJECTS.slice(0, 2).map(project => (
                      <motion.div
                        key={project.id}
                        variants={fadeUpVariants}
                        whileHover={{ y: -4 }}
                        className="group bg-surface-container-low hover:bg-surface-container-high transition-colors duration-300 p-1 rounded-lg cursor-figma-pointer flex flex-col"
                      >
                        <div className="aspect-video mb-4 overflow-hidden rounded-sm relative">
                          <img alt={project.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" src={project.image} />
                          <div className="absolute top-4 right-4">
                            <span className={`${project.status === 'Live' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container-highest/80 text-outline border-outline-variant/20'} text-[10px] font-headline font-bold px-3 py-1 rounded-full backdrop-blur-md border tracking-widest uppercase`}>{project.status}</span>
                          </div>
                        </div>
                        <div className="px-5 pb-6 flex-1 flex flex-col justify-between">
                          <h4 className="text-lg font-headline font-semibold text-white mb-4">{project.title}</h4>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-[10px] text-outline font-label tracking-tight uppercase">Last edited {project.updated}</span>
                            <div className="flex gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'Live' ? 'bg-primary/40' : 'bg-outline-variant'}`}></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              </div>
            </motion.div>
          ) : activeTab === 'projects' ? (
            <motion.div
              key="projects"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              className="w-full max-w-5xl mx-auto"
            >
              <motion.div variants={fadeUpVariants} className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-extrabold tracking-tighter text-white font-headline uppercase">All Projects</h2>
                <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/10">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded cursor-figma-pointer transition-colors ${viewMode === 'grid' ? 'bg-surface-container-high text-white' : 'text-[#777575] hover:text-white'}`}><LayoutGrid className="w-4 h-4" /></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded cursor-figma-pointer transition-colors ${viewMode === 'list' ? 'bg-surface-container-high text-white' : 'text-[#777575] hover:text-white'}`}><List className="w-4 h-4" /></button>
                </div>
              </motion.div>
              
              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10"
                  >
                    {MOCK_PROJECTS.map(project => (
                      <motion.div
                        key={project.id}
                        variants={fadeUpVariants}
                        whileHover={{ y: -4 }}
                        className="group bg-surface-container-low hover:bg-surface-container-high transition-colors duration-300 p-1 rounded-lg cursor-figma-pointer flex flex-col"
                      >
                      <div className="aspect-video mb-4 overflow-hidden rounded-sm relative">
                        <img alt={project.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" src={project.image} />
                        <div className="absolute top-4 right-4">
                          <span className={`${project.status === 'Live' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container-highest/80 text-outline border-outline-variant/20'} text-[10px] font-headline font-bold px-3 py-1 rounded-full backdrop-blur-md border tracking-widest uppercase`}>{project.status}</span>
                        </div>
                      </div>
                      <div className="px-5 pb-6 flex-1 flex flex-col justify-between">
                        <h4 className="text-lg font-headline font-semibold text-white mb-4">{project.title}</h4>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[10px] text-outline font-label tracking-tight uppercase">Last edited {project.updated}</span>
                          <div className="flex gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'Live' ? 'bg-primary/40' : 'bg-outline-variant'}`}></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={containerVariants}
                  className="flex flex-col gap-4"
                >
                  {MOCK_PROJECTS.map(project => (
                    <motion.div
                      key={project.id}
                      variants={fadeUpVariants}
                      whileHover={{ x: 4 }}
                      className="group bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 p-3 rounded-lg cursor-figma-pointer flex items-center gap-6 border border-transparent hover:border-outline-variant/10"
                    >
                      <div className="w-32 aspect-video overflow-hidden rounded-sm relative shrink-0">
                        <img alt={project.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={project.image} />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-headline font-semibold text-white mb-1">{project.title}</h4>
                          <span className="text-[10px] text-outline font-label tracking-tight uppercase">Last edited {project.updated}</span>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className={`${project.status === 'Live' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container-highest/80 text-outline border-outline-variant/20'} text-[10px] font-headline font-bold px-3 py-1 rounded-full border tracking-widest uppercase`}>{project.status}</span>
                          <div className="flex gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'Live' ? 'bg-primary/40' : 'bg-outline-variant'}`}></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          ) : activeTab === 'docs' ? (
            <motion.div
              key="docs"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              className="w-full max-w-5xl mx-auto"
            >
              <motion.div variants={fadeUpVariants} className="mb-10">
                <h2 className="text-2xl font-extrabold tracking-tighter text-white font-headline uppercase">Docs & Blogs</h2>
                <p className="text-outline text-sm mt-2">Everything you need to build with Meshwork Studio.</p>
              </motion.div>

              {/* Featured Blog */}
              <motion.div variants={fadeUpVariants} className="mb-10 group relative overflow-hidden rounded-2xl bg-surface-container-low border border-outline-variant/10 p-8 cursor-figma-pointer hover:border-[#FF5500]/30 transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5500]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity group-hover:bg-[#FF5500]/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary/10 text-primary text-[10px] font-headline font-bold px-3 py-1 rounded-full border border-primary/20 tracking-widest uppercase">Dev Blog</span>
                    <span className="text-xs text-outline flex items-center gap-1"><Calendar className="w-3 h-3" /> Apr 15, 2026</span>
                  </div>
                  <h3 className="text-3xl font-headline font-bold text-white mb-3 group-hover:text-primary transition-colors">The Future of Spatial Interfaces</h3>
                  <p className="text-outline max-w-2xl mb-6">We're rethinking how users interact with 3D space on the web. Dive into our latest experiments with WebGL and React Three Fiber to build immersive dashboards.</p>
                  <div className="flex items-center text-sm font-bold text-white gap-2 group-hover:gap-3 transition-all">
                    Read Article <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Docs Categories */}
                <motion.div variants={fadeUpVariants} className="lg:col-span-2">
                  <h3 className="text-xs font-bold font-headline tracking-[0.2em] uppercase text-outline mb-6">Documentation</h3>
                  <div className="flex flex-col gap-3">
                    {MOCK_DOCS.map(doc => (
                      <div key={doc.id} className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-high border border-transparent hover:border-outline-variant/20 transition-all cursor-figma-pointer group">
                        <div className="p-3 rounded-lg bg-surface-container-high text-outline group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          {doc.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-headline font-semibold text-white mb-1 group-hover:text-primary transition-colors">{doc.title}</h4>
                          <p className="text-sm text-outline">{doc.desc}</p>
                        </div>
                        <div className="self-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                          <ChevronRight className="w-5 h-5 text-outline" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Changelog */}
                <motion.div variants={fadeUpVariants} className="lg:col-span-1">
                  <h3 className="text-xs font-bold font-headline tracking-[0.2em] uppercase text-outline mb-6">Latest Updates</h3>
                  <div className="relative border-l border-outline-variant/20 ml-3 space-y-8 pb-4">
                    {MOCK_CHANGELOG.map((log, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute w-2.5 h-2.5 bg-surface-container-highest border-2 border-outline-variant/50 rounded-full -left-[5px] top-1.5"></div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm font-headline font-bold text-white">{log.version}</span>
                          <span className="text-[10px] text-outline uppercase tracking-wider">{log.date}</span>
                        </div>
                        <p className="text-sm text-outline">{log.changes}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : activeTab === 'team' ? (
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
          ) : null}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
