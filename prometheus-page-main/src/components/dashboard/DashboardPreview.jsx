import React, { useState, useEffect, memo } from 'react';
import { Store, ShoppingCart, CreditCard, TrendingUp, Users, Package, Search, Plus, MoreHorizontal, MousePointer2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// --- Tab Views (Read-Only Styles for Automation) ---

const PosView = ({ cart, activeItem }) => {
    const products = [
        { id: 1, name: "Nitro Cold Brew", price: 5.50, color: "bg-amber-900/40" },
        { id: 2, name: "Oat Latte", price: 4.75, color: "bg-orange-100/10" },
        { id: 3, name: "Matcha", price: 5.00, color: "bg-green-900/40" },
        { id: 4, name: "Croissant", price: 3.50, color: "bg-yellow-600/20" },
        { id: 5, name: "Avocado Toast", price: 8.50, color: "bg-green-800/20" },
        { id: 6, name: "Acai Bowl", price: 10.00, color: "bg-purple-900/30" },
    ];

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="flex h-full">
            {/* Product Grid */}
            <div className="flex-1 p-6 grid grid-cols-3 gap-4 overflow-y-auto content-start">
                <div className="col-span-3 mb-2 flex gap-2">
                    <div className="flex-1 bg-[#161b22] border border-white/10 rounded-lg flex items-center px-3 h-10">
                        <Search size={16} className="text-gray-500 mr-2" />
                        <input type="text" placeholder="Search menu..." className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-600" />
                    </div>
                </div>
                {products.map(product => (
                    <motion.div
                        key={product.id}
                        animate={activeItem === product.id ? { scale: 0.95, borderColor: 'rgba(245, 158, 11, 0.5)' } : { scale: 1 }}
                        className={`${product.color} border border-white/5 rounded-xl p-4 flex flex-col items-start justify-between h-32 transition-colors relative group`}
                    >
                        <span className="font-semibold text-white/90 group-hover:text-white">{product.name}</span>
                        <span className="text-primary font-mono">${product.price.toFixed(2)}</span>
                        {activeItem === product.id && <div className="absolute inset-0 bg-white/10 rounded-xl" />}
                    </motion.div>
                ))}
            </div>

            {/* Cart Sidebar */}
            <div className="w-80 border-l border-white/5 bg-[#08090a]/50 p-6 flex flex-col">
                <h3 className="text-white font-medium mb-4 flex justify-between items-center">
                    Current Order <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400">#{cart.length > 0 ? '2050' : '--'}</span>
                </h3>

                <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
                    <AnimatePresence>
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 text-sm">
                                <ShoppingCart size={32} className="mb-2 opacity-20" />
                                No items yet
                            </div>
                        ) : (
                            cart.map((item) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={item.uniqueId}
                                    className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-lg border border-white/5"
                                >
                                    <span className="text-gray-200">{item.name}</span>
                                    <span className="font-mono text-gray-400">${item.price.toFixed(2)}</span>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-4">
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg">
                        <span>Total</span>
                        <span>${(total * 1.08).toFixed(2)}</span>
                    </div>
                    <button className="w-full bg-primary text-black font-bold py-3 rounded-lg shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2">
                        <CreditCard size={18} /> Charge ${(total * 1.08).toFixed(2)}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AnalyticsView = () => (
    <div className="p-8 h-full overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">Overview</h2>
        <div className="grid grid-cols-3 gap-6 mb-8">
            {[
                { label: 'Total Revenue', value: '$12,450.20', change: '+12.5%', icon: TrendingUp, color: 'text-green-500' },
                { label: 'Transactions', value: '1,240', change: '+8.2%', icon: CreditCard, color: 'text-blue-500' },
                { label: 'Active Users', value: '450', change: '+2.4%', icon: Users, color: 'text-purple-500' },
            ].map((stat, i) => (
                <div key={i} className="bg-[#161b22] border border-white/5 p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded">{stat.change}</span>
                    </div>
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{stat.label}</div>
                    <div className="text-2xl text-white font-mono font-bold">{stat.value}</div>
                </div>
            ))}
        </div>
        <div className="grid grid-cols-2 gap-6 h-64">
            {/* Mock Chart Areas */}
            <div className="bg-[#161b22] border border-white/5 p-5 rounded-xl flex flex-col relative overflow-hidden group">
                <span className="text-sm text-gray-500 mb-4 z-10">Sales Volume</span>
                <div className="flex items-end justify-between h-full gap-2 relative z-10">
                    {[40, 65, 50, 80, 60, 90, 70, 85, 95, 60].map((h, i) => (
                        <div key={i} className="w-full bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                </div>
            </div>
            <div className="bg-[#161b22] border border-white/5 p-5 rounded-xl flex flex-col">
                <span className="text-sm text-gray-500 mb-4">Store Activity</span>
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-xs font-bold">JD</div>
                            <div className="flex-1">
                                <div className="text-white text-sm">New order #204{i}</div>
                                <div className="text-gray-500 text-xs">2 minutes ago</div>
                            </div>
                            <div className="text-green-500 text-sm">+$45.00</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const InventoryView = () => (
    <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Inventory</h2>
            <button className="flex items-center gap-2 bg-white/5 text-white px-3 py-1.5 rounded-lg text-sm border border-white/10">
                <Plus size={16} /> Add Item
            </button>
        </div>
        <div className="border border-white/5 rounded-xl overflow-hidden flex-1 bg-[#161b22]">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-white/5 text-gray-200">
                    <tr>
                        <th className="p-4 font-medium">Item Name</th>
                        <th className="p-4 font-medium">SKU</th>
                        <th className="p-4 font-medium">Stock</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {[
                        { name: "Coffee Beans (Dark)", sku: "CF-DK-01", stock: 45, status: "In Stock" },
                        { name: "Oat Milk", sku: "MK-OT-02", stock: 12, status: "Low Stock" },
                        { name: "Paper Cups (12oz)", sku: "CP-12-03", stock: 850, status: "In Stock" },
                        { name: "Syrup (Vanilla)", sku: "SY-VN-04", stock: 0, status: "Out of Stock" },
                        { name: "Matcha Powder", sku: "MT-JP-05", stock: 24, status: "In Stock" },
                    ].map((item, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-white font-medium">{item.name}</td>
                            <td className="p-4 font-mono text-xs">{item.sku}</td>
                            <td className="p-4">{item.stock}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'In Stock' ? 'bg-green-500/10 text-green-500' :
                                    item.status === 'Low Stock' ? 'bg-yellow-500/10 text-yellow-500' :
                                        'bg-red-500/10 text-red-500'
                                    }`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <button className="p-1 hover:text-white"><MoreHorizontal size={16} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// Animated Cursor Component
const Cursor = ({ isClicking }) => (
    <motion.div
        className="fixed pointer-events-none z-50 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <MousePointer2
            size={24}
            className="fill-black stroke-white"
            style={{
                transform: isClicking ? "scale(0.9) rotate(-10deg)" : "scale(1) rotate(0deg)",
                transition: "transform 0.1s ease-out"
            }}
        />
        <div className={`ml-6 mt-1 px-2 py-0.5 bg-primary text-black text-xs font-bold rounded-full opacity-0 ${isClicking ? 'opacity-100' : ''} transition-opacity`}>
            Click
        </div>
    </motion.div>
);

const DashboardPreview = () => {
    const [activeTab, setActiveTab] = useState('pos');
    const [cart, setCart] = useState([]);
    const [activeItem, setActiveItem] = useState(null);

    // Cursor Animation State
    const [cursorPos, setCursorPos] = useState({ x: '80%', y: '80%' });
    const [isClicking, setIsClicking] = useState(false);

    useEffect(() => {
        // Automated Sequence
        const sequence = async () => {
            const wait = (ms) => new Promise(res => setTimeout(res, ms));

            while (true) {
                // 1. Start at POS (default)
                setActiveTab('pos');
                setCart([]);

                // 2. Move to Nitro Cold Brew (Row 1, Col 1)
                setCursorPos({ x: '16%', y: '32%' });
                await wait(1000);

                // 3. Click Item
                setIsClicking(true);
                setActiveItem(1);
                await wait(150);
                setCart(c => [...c, { id: 1, name: "Nitro Cold Brew", price: 5.50, uniqueId: Date.now() }]);
                setIsClicking(false);
                await wait(200);
                setActiveItem(null);

                // 4. Move to Matcha (Row 1, Col 3)
                setCursorPos({ x: '58%', y: '32%' });
                await wait(800);

                // 5. Click Item
                setIsClicking(true);
                setActiveItem(3);
                await wait(150);
                setCart(c => [...c, { id: 3, name: "Matcha", price: 5.00, uniqueId: Date.now() }]);
                setIsClicking(false);
                await wait(200);
                setActiveItem(null);

                // 6. Move to Inventory Tab (Center of Top Bar)
                setCursorPos({ x: '49%', y: '6%' });
                await wait(1000);

                // 7. Click Inventory
                setIsClicking(true);
                await wait(150);
                setActiveTab('inventory');
                setIsClicking(false);
                await wait(2000); // Admire view

                // 8. Move to Analytics Tab (Right of Tabs)
                setCursorPos({ x: '57%', y: '6%' });
                await wait(800);

                // 9. Click Analytics
                setIsClicking(true);
                await wait(150);
                setActiveTab('analytics');
                setIsClicking(false);
                await wait(2500); // Admire view

                // 10. Move back to POS Tab (Left of Tabs)
                setCursorPos({ x: '41%', y: '6%' });
                await wait(1000);

                // 11. Click POS
                setIsClicking(true);
                await wait(150);
                // Loop restarts
                setIsClicking(false);
            }
        };

        sequence();
    }, []); // Run once on mount

    return (
        <div className="relative w-full max-w-6xl mx-auto mt-20 perspective-1000 group">
            {/* Animated Cursor Overlay */}
            <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-xl">
                <motion.div
                    className="absolute top-0 left-0 w-full h-full"
                    animate={{
                        x: cursorPos.x, // Simplified handling: relying on percentage container
                        y: cursorPos.y
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 70,
                        damping: 20,
                        mass: 0.5
                    }}
                >
                    <Cursor isClicking={isClicking} />
                </motion.div>
            </div>

            <div className="relative rounded-t-xl border border-white/10 bg-[#0c0e12]/95 backdrop-blur-xl shadow-2xl overflow-hidden transform transition-all duration-700 hover:shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#121417]">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>

                    <div className="flex gap-2 bg-[#08090a] p-1 rounded-lg border border-white/5">
                        {[
                            { id: 'pos', icon: Store, label: 'Hefestus POS' },
                            { id: 'inventory', icon: Package, label: 'Inventory Manager' },
                            { id: 'analytics', icon: TrendingUp, label: 'Live Analytics' }
                        ].map(tab => (
                            <div
                                key={tab.id}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-default",
                                    activeTab === tab.id
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "text-gray-500"
                                )}
                            >
                                <tab.icon size={12} /> {tab.label}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border border-primary/30">
                            JD
                        </div>
                    </div>
                </div>

                {/* Main Area */}
                <div className="h-[600px] bg-[#0c0e12] relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {activeTab === 'pos' && <PosView cart={cart} activeItem={activeItem} />}
                            {activeTab === 'inventory' && <InventoryView />}
                            {activeTab === 'analytics' && <AnalyticsView />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default memo(DashboardPreview);
