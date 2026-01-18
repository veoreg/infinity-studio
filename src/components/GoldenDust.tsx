import React, { useEffect, useRef } from 'react';

const GoldenDust: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let frameId: number;

        let mouse = { x: width / 2, y: height / 2 };
        let targetMouse = { x: width / 2, y: height / 2 };

        // Configuration
        const MOTE_COUNT = 150; // Increased from 80 for richer ambient dust
        const NEBULA_COUNT = 6; // Increased from 4 for more golden glow depth

        // Orbs (Nebula) - Brighter and more visible
        const orbs = Array.from({ length: NEBULA_COUNT }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 300 + 300,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            color: Math.random() > 0.5 ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255, 215, 0, 0.06)', // Brighter gold
            phase: Math.random() * Math.PI * 2
        }));

        // Dust Motes
        const motes = Array.from({ length: MOTE_COUNT }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5, // Larger
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2 - 0.2,
            alpha: Math.random() * 0.6 + 0.3,
            phase: Math.random() * Math.PI * 2
        }));

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const drawNebula = (ctx: CanvasRenderingContext2D) => {
            ctx.globalCompositeOperation = 'screen';

            orbs.forEach(orb => {
                orb.x += orb.vx;
                orb.y += orb.vy;
                orb.phase += 0.005;

                const currentRadius = orb.radius + Math.sin(orb.phase) * 30;

                if (orb.x < -currentRadius) orb.x = width + currentRadius;
                if (orb.x > width + currentRadius) orb.x = -currentRadius;
                if (orb.y < -currentRadius) orb.y = height + currentRadius;
                if (orb.y > height + currentRadius) orb.y = -currentRadius;

                const displaceX = (mouse.x - width / 2) * 0.02;
                const displaceY = (mouse.y - height / 2) * 0.02;

                const gradient = ctx.createRadialGradient(
                    orb.x - displaceX, orb.y - displaceY, 0,
                    orb.x - displaceX, orb.y - displaceY, currentRadius
                );
                gradient.addColorStop(0, orb.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(orb.x - displaceX, orb.y - displaceY, currentRadius, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.globalCompositeOperation = 'source-over';
        };

        const drawMotes = (ctx: CanvasRenderingContext2D) => {
            motes.forEach(mote => {
                mote.x += mote.vx;
                mote.y += mote.vy;
                mote.phase += 0.02;

                if (mote.x < 0) mote.x = width;
                if (mote.x > width) mote.x = 0;
                if (mote.y < 0) mote.y = height;
                if (mote.y > height) mote.y = 0;

                const alpha = mote.alpha + Math.sin(mote.phase) * 0.2;

                const displaceX = (mouse.x - width / 2) * 0.05;
                const displaceY = (mouse.y - height / 2) * 0.05;

                ctx.fillStyle = `rgba(255, 236, 179, ${alpha})`; // Gold dust
                ctx.beginPath();
                ctx.arc(mote.x - displaceX, mote.y - displaceY, mote.size, 0, Math.PI * 2);
                ctx.fill();

                // Glow for motes
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
            });
            ctx.shadowBlur = 0;
        };

        const animate = () => {
            mouse.x += (targetMouse.x - mouse.x) * 0.05;
            mouse.y += (targetMouse.y - mouse.y) * 0.05;

            // Slight trail effect by not fully clearing? No, clean clear looks more premium.
            ctx.clearRect(0, 0, width, height);

            drawNebula(ctx);
            drawMotes(ctx);

            frameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            targetMouse.x = e.clientX;
            targetMouse.y = e.clientY;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 bg-black"
        />
    );
};

export default GoldenDust;
