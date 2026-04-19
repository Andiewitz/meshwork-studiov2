"use client"

import { useEffect } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({ children }) {
    useEffect(() => {
        // Disable smooth scroll on touch/mobile devices — native momentum is better
        const isMobile = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
        if (isMobile) return;

        const lenis = new Lenis({
            duration: 0.8,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            smoothWheel: true,
            wheelMultiplier: 1.2,
            smoothTouch: false,
        })

        let rafId;
        function raf(time) {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }

        rafId = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(rafId)
            lenis.destroy()
        }
    }, [])

    return <>{children}</>
}
