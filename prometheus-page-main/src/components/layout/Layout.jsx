import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Flame, ChevronDown, Menu, X } from 'lucide-react';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { label: 'Solutions', to: '/solutions' },
        { label: 'Developers', to: '/developers' },
        { label: 'Pricing', to: '/pricing' },
        { label: 'Company', to: '/company' },
    ];

    return (
        <div className="min-h-screen font-sans text-gray-100 selection:bg-[#f59e0b] selection:text-black">
            {/* Navbar */}
            <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#08090a]/90 backdrop-blur-md">
                <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 text-lg md:text-xl font-bold tracking-tight text-white group" onClick={() => setMobileMenuOpen(false)}>
                        <div className="h-8 w-8 md:h-9 md:w-9 bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all bg-gradient-to-br from-white to-orange-100">
                            <Flame size={18} className="text-black fill-black" />
                        </div>
                        Hefestus
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
                        <div className="relative group/nav">
                            <button className="flex items-center gap-1 hover:text-white transition-colors">Products <ChevronDown size={14} /></button>
                        </div>
                        {navLinks.map(link => (
                            <Link key={link.to} to={link.to} className="hover:text-white transition-colors">{link.label}</Link>
                        ))}
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">Log in</Link>
                        <Button size="sm" className="h-10 px-6">Start Free Trial</Button>
                    </div>

                    {/* Mobile Right Side */}
                    <div className="flex md:hidden items-center gap-3">
                        <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">Log in</Link>
                        <button
                            onClick={() => setMobileMenuOpen(prev => !prev)}
                            className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden border-t border-white/5 bg-[#08090a]/95 backdrop-blur-md md:hidden"
                        >
                            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
                                <Link
                                    to="/products"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Products
                                </Link>
                                {navLinks.map(link => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-3 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="pt-3 mt-2 border-t border-white/5">
                                    <Button size="sm" className="w-full h-11">Start Free Trial</Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="relative">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#050607] py-14 md:py-20">
                <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-sm">
                    <div className="col-span-2 md:col-span-1 mb-2 md:mb-0">
                        <div className="flex items-center gap-2 font-bold text-white mb-4">
                            <Flame size={16} className="text-primary" /> Hefestus
                        </div>
                        <p className="text-gray-500 leading-relaxed text-xs md:text-sm">
                            The Business Operating System for the modern world.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4 md:mb-6">System</h4>
                        <ul className="space-y-3 md:space-y-4 text-gray-500">
                            <li><Link to="/products" className="hover:text-primary transition-colors">Suite Overview</Link></li>
                            <li><Link to="/pricing" className="hover:text-primary transition-colors">Plans</Link></li>
                            <li><Link to="/pos" className="hover:text-primary transition-colors">Checkout</Link></li>
                            <li><Link to="/inventory" className="hover:text-primary transition-colors">Inventory</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4 md:mb-6">Support</h4>
                        <ul className="space-y-3 md:space-y-4 text-gray-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Guides</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4 md:mb-6">Company</h4>
                        <ul className="space-y-3 md:space-y-4 text-gray-500">
                            <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                            <li><Link to="/legal" className="hover:text-primary transition-colors">Legal</Link></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
