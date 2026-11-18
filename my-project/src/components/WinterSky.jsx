import React, { useEffect, useRef } from 'react';

/*
 * Winter Arc night sky on one <canvas>: drifting snow in three depths, an
 * occasional shooting star, and icy sparkle bursts. All procedural, so it adds
 * no image or video download on a phone.
 *
 * variant "page"  fills the screen behind a page; tapping makes a sparkle.
 * variant "strip" fills its positioned parent, for a banner.
 * celebrate       bump this number for a big burst (after a purchase).
 *
 * Stops drawing when off screen or in a background tab, and draws nothing for
 * visitors who asked their device to reduce motion.
 */

const SPARKLE = ['#e0f2fe', '#7dd3fc', '#a5b4fc', '#ffffff', '#67e8f9', '#c4b5fd'];
const between = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

const WinterSky = ({ variant = 'page', celebrate = 0, className = '' }) => {
    const canvasRef = useRef(null);
    const celebrateRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const isStrip = variant === 'strip';
        const isPhone = window.innerWidth < 768;
        const flakeCount = isStrip ? 40 : isPhone ? 70 : 130;
        const maxSparks = isStrip ? 80 : 260;

        let width = 0;
        let height = 0;
        let frame = 0;
        let running = false;
        let onScreen = true;
        let nextStarAt = performance.now() + 2500;

        const flakes = [];
        const sparks = [];
        let star = null;

        const resize = () => {
            const box = canvas.getBoundingClientRect();
            const scale = Math.min(window.devicePixelRatio || 1, 1.5);
            width = box.width;
            height = box.height;
            canvas.width = Math.round(width * scale);
            canvas.height = Math.round(height * scale);
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
        };

        // depth 0 is far (small, slow, faint), 2 is near (big, fast, bright).
        const resetFlake = (flake, anywhere) => {
            flake.depth = Math.floor(Math.random() * 3);
            flake.x = Math.random() * width;
            flake.y = anywhere ? Math.random() * height : -6;
            flake.size = [0.8, 1.6, 2.6][flake.depth] * between(0.8, 1.2);
            flake.speed = [0.25, 0.55, 1][flake.depth] * between(0.8, 1.25) * (isStrip ? 0.6 : 1);
            flake.alpha = [0.35, 0.6, 0.9][flake.depth];
            flake.phase = Math.random() * Math.PI * 2;
        };

        const burst = (x, y, count) => {
            const room = Math.max(0, maxSparks - sparks.length);
            for (let i = 0, n = Math.min(count, room); i < n; i += 1) {
                const angle = (i / n) * Math.PI * 2 + between(-0.1, 0.1);
                const speed = between(0.6, isStrip ? 1.8 : 3);
                sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, fade: between(0.012, 0.024), color: pick(SPARKLE), size: between(1, 2.4) });
            }
        };

        const drawFlake = (f) => {
            ctx.globalAlpha = f.alpha;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            ctx.fill();
            // Near flakes get a soft cross so they read as crystals, not dust.
            if (f.depth === 2) {
                ctx.globalAlpha = f.alpha * 0.45;
                ctx.fillRect(f.x - f.size * 2, f.y - 0.4, f.size * 4, 0.8);
                ctx.fillRect(f.x - 0.4, f.y - f.size * 2, 0.8, f.size * 4);
            }
        };

        const draw = (now) => {
            frame = 0;
            if (!running) return;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#ffffff';

            for (const f of flakes) {
                f.y += f.speed;
                f.x += Math.sin(now / 1400 + f.phase) * 0.3 * (f.depth + 1) * 0.5;
                if (f.y > height + 6) resetFlake(f, false);
                drawFlake(f);
            }

            if (!star && now >= nextStarAt) {
                star = { x: between(width * 0.2, width * 0.95), y: between(0, height * 0.3), life: 1 };
                nextStarAt = now + between(4000, 9000);
            }
            if (star) {
                star.x -= 7;
                star.y += 3.2;
                star.life -= 0.025;
                const grad = ctx.createLinearGradient(star.x, star.y, star.x + 70, star.y - 32);
                grad.addColorStop(0, `rgba(224, 242, 254, ${star.life})`);
                grad.addColorStop(1, 'rgba(224, 242, 254, 0)');
                ctx.globalAlpha = 1;
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.x + 70, star.y - 32);
                ctx.stroke();
                if (star.life <= 0) star = null;
            }

            ctx.globalCompositeOperation = 'lighter';
            for (let i = sparks.length - 1; i >= 0; i -= 1) {
                const s = sparks[i];
                s.vx *= 0.97;
                s.vy = s.vy * 0.97 + 0.015;
                s.x += s.vx;
                s.y += s.vy;
                s.life -= s.fade;
                if (s.life <= 0) {
                    sparks.splice(i, 1);
                } else {
                    ctx.globalAlpha = s.life;
                    ctx.fillStyle = s.color;
                    ctx.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
                }
            }
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            frame = requestAnimationFrame(draw);
        };

        const sync = () => {
            const shouldRun = onScreen && !document.hidden;
            if (shouldRun === running) return;
            running = shouldRun;
            if (running && !frame) frame = requestAnimationFrame(draw);
        };

        resize();
        for (let i = 0; i < flakeCount; i += 1) {
            const flake = {};
            resetFlake(flake, true);
            flakes.push(flake);
        }

        celebrateRef.current = () => {
            for (let i = 0; i < 6; i += 1) {
                setTimeout(() => burst(between(width * 0.15, width * 0.85), between(height * 0.15, height * 0.55), isPhone ? 40 : 60), i * 200);
            }
        };

        const onTap = (event) => burst(event.clientX, event.clientY, isPhone ? 22 : 32);
        const resizeWatcher = new ResizeObserver(resize);
        const screenWatcher = new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            sync();
        });

        resizeWatcher.observe(canvas);
        screenWatcher.observe(canvas);
        document.addEventListener('visibilitychange', sync);
        if (!isStrip) window.addEventListener('pointerdown', onTap);
        sync();

        return () => {
            running = false;
            cancelAnimationFrame(frame);
            resizeWatcher.disconnect();
            screenWatcher.disconnect();
            document.removeEventListener('visibilitychange', sync);
            window.removeEventListener('pointerdown', onTap);
            celebrateRef.current = null;
        };
    }, [variant]);

    useEffect(() => {
        if (celebrate) celebrateRef.current?.();
    }, [celebrate]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`${variant === 'strip' ? 'absolute' : 'fixed'} inset-0 w-full h-full pointer-events-none ${className}`}
        />
    );
};

export default WinterSky;
