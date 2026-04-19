"use client"

import React, { useEffect, useRef } from 'react';

const FloatingSparks = ({ count = 50, color = "#f59e0b" }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const particles = [];
        const particleCount = count;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 200;
                this.width = Math.random() * 4.0 + 1.0;
                this.height = this.width * (Math.random() * 2.0 + 1.5); // Elongated shards
                this.speedX = (Math.random() - 0.5) * 1.5;
                this.speedY = -(Math.random() * 1.8 + 0.5);
                this.opacity = Math.random() * 0.7 + 0.3;
                this.life = Math.random() * 200 + 200;
                this.currentLife = this.life;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.05;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.rotation += this.rotationSpeed;
                this.currentLife -= 0.15;

                if (this.currentLife <= 0 || this.y < -50) {
                    this.reset();
                }
            }

            draw() {
                const alpha = (this.currentLife / this.life) * this.opacity;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                ctx.beginPath();
                // Draw a small elongated shard instead of a circle
                ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);

                ctx.fillStyle = color;
                ctx.globalAlpha = alpha;

                // Intense molten glow with asymmetric blur
                ctx.shadowBlur = 10;
                ctx.shadowColor = color;

                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [count, color]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

export default FloatingSparks;
