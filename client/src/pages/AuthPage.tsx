import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Cloud, Lock, Users } from "lucide-react";
import { MeshworkLogo } from "@/components/MeshworkLogo";
import { Link } from "wouter";

export default function AuthPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-black technical-gradient overflow-hidden">
            {/* Left Panel - Brand Experience */}
            <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden border-r border-white/[0.05]">
                {/* Subtle Grid overlay */}
                <div className="absolute inset-0 opacity-[0.03]" 
                    style={{ backgroundImage: 'linear-gradient(rgba(255,102,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} 
                />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                        <MeshworkLogo />
                    </div>
                    <span className="text-2xl font-black font-display uppercase tracking-tighter text-white">Meshwork Studio</span>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 flex flex-col justify-center flex-1 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <h2 className="text-5xl font-headline font-black tracking-tighter text-white leading-tight">
                            Build. <br />
                            <span className="text-primary">Connect.</span> <br />
                            Secure.
                        </h2>
                        <p className="text-white/40 text-xl font-medium max-w-sm leading-relaxed">
                            The visual engine for modern cloud architecture and engineering teams.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4 max-w-md">
                        {[
                            { icon: Cloud, label: "Visual Infrastructure" },
                            { icon: Lock, label: "E2E Encryption" },
                            { icon: Users, label: "Team Collaboration" },
                            { icon: ArrowRight, label: "Auto-Discovery" }
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-3 p-4 glass-card rounded-2xl"
                            >
                                <item.icon className="w-5 h-5 text-primary" />
                                <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">{item.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/20">
                    <p>© 2026 Meshwork Studio.</p>
                    <div className="flex gap-6">
                        <span className="text-white/20 cursor-default">Privacy</span>
                        <span className="text-white/20 cursor-default">Legal</span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex items-center justify-center p-8 relative">
                <div className="w-full max-w-md space-y-12">
                    <div className="text-center space-y-3">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-3 py-1 rounded border border-primary/20 bg-primary/5 text-[10px] font-mono text-primary uppercase tracking-[0.2em] mb-4"
                        >
                            Meshwork Gateway
                        </motion.div>
                        <h1 className="text-4xl font-headline font-black tracking-tighter text-white">
                            Welcome Back
                        </h1>
                        <p className="text-white/40 font-medium">
                            Enter your credentials to access the studio.
                        </p>
                    </div>

                    <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                        <div className="space-y-8 relative z-10">
                            {/* Authentication Button */}
                            <div className="space-y-6">
                                <Button
                                    size="lg"
                                    className="w-full h-14 text-sm font-black uppercase tracking-widest bg-primary text-black hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(255,102,0,0.4)] transition-all rounded-xl"
                                    asChild
                                >
                                    <Link href="/auth/login">
                                        <span className="flex items-center justify-center gap-3">
                                            Continue to Studio
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </Link>
                                </Button>

                                <div className="relative flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-white/[0.05]" />
                                    </div>
                                    <span className="relative px-4 bg-transparent text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                                        System Access
                                    </span>
                                </div>

                                <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/[0.05] text-[11px] font-medium text-white/30 leading-relaxed">
                                    By proceeding, you authenticate your connection to the Meshwork Studio environment and agree to our protocol.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
                            Need an account? <Link href="/auth/register"><span className="text-primary hover:underline transition-all cursor-pointer">Create one</span></Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
