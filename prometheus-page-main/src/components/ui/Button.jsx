import React from 'react';
import { cn } from '../../lib/utils'; // Adjusted path for typical component structure

const Button = React.forwardRef(({ className, variant = "primary", size = "default", children, ...props }, ref) => {
    const variants = {
        primary: "bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] border-0",
        secondary: "bg-[#121417] border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-[#1c1f26]",
        ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white"
    };

    const sizes = {
        default: "h-12 px-8 py-2 text-base font-semibold rounded-lg",
        sm: "h-9 px-3 text-sm rounded-md",
        lg: "h-14 px-10 text-lg rounded-xl",
        icon: "h-10 w-10 p-2 flex items-center justify-center rounded-lg"
    };

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none transform active:scale-[0.98]",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});

export default Button;
