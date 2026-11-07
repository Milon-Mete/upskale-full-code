import React, { useEffect, useRef } from 'react';

/*
 * Diwali night sky drawn on one <canvas>: rising embers, rockets and firework
 * bursts. All procedural, so it adds no image or video download on a phone.
 *
 * variant "page"  fills the screen behind a page; tapping sets off a burst.
 * variant "strip" fills its positioned parent, for a banner.
 * celebrate       bump this number to fire a big finale (after a purchase).
 *
 * Stops drawing when off screen or in a background tab, and draws nothing for
 * visitors who asked their device to reduce motion.
 */

const COLORS = ['#fde047', '#fbbf24', '#f97316', '#ef4444', '#fff7d6', '#00d26a'];
const GRAVITY = 0.035;

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const between = (min, max) => min + Math.random() * (max - min);

const DiwaliSky = ({ variant = 'page', celebrate = 0, className = '' }) => {
    const canvasRef = useRef(null);
    const launchRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const isStrip = variant === 'strip';
        const isPhone = window.innerWidth < 768;
        const maxSparks = isStrip ? 90 : isPhone ? 220 : 420;
        const emberCount = isStrip ? 14 : isPhone ? 22 : 40;

        let width = 0;
        let height = 0;
        let frame = 0;
        let running = false;
        let onScreen = true;
        let nextRocketAt = 0;

        const sparks = [];
        const rockets = [];
        const embers = [];

        const resize = () => {
            const box = canvas.getBoundingClientRect();
            const scale = Math.min(window.devicePixelRatio || 1, 1.5);
            width = box.width;
            height = box.height;
            canvas.width = Math.round(width * scale);
            canvas.height = Math.round(height * scale);
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
        };

        const resetEmber = (ember, anywhere) => {
            ember.x = Math.random() * width;
            ember.y = anywhere ? Math.random() * height : height + 8;
            ember.speed = between(0.2, 0.7);
            ember.size = between(0.7, 2);
            ember.phase = Math.random() * Math.PI * 2;
            ember.color = pick(COLORS);
        };

        const burst = (x, y, count) => {
            const color = pick(COLORS);
            const accent = pick(COLORS);
            const room = Math.max(0, maxSparks - sparks.length);
            for (let i = 0, n = Math.min(count, room); i < n; i += 1) {
                const angle = (i / n) * Math.PI * 2 + between(-0.06, 0.06);
                const speed = between(0.8, isStrip ? 2 : 3.4);
                sparks.push({
                    x,
                    y,
                    px: x,
                    py: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    fade: between(0.012, 0.022),
                    color: i % 3 === 0 ? accent : color
                });
            }
        };

        const launch = (x = between(width * 0.12, width * 0.88)) => {
            const top = isStrip ? height * 0.15 : height * 0.12;
            const bottom = isStrip ? height * 0.6 : height * 0.5;
            rockets.push({
                x,
                y: height + 6,
                vx: between(-0.35, 0.35),
                vy: isStrip ? -3 : -between(5, 6.5),
                stopAt: between(top, bottom),
                color: pick(COLORS)
            });
        };

        const draw = (now) => {
            frame = 0;
            if (!running) return;
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'lighter';

            for (const ember of embers) {
                ember.y -= ember.speed;
                ember.x += Math.sin(now / 900 + ember.phase) * 0.25;
                if (ember.y < -8) resetEmber(ember, false);
                ctx.globalAlpha = 0.35 + 0.35 * Math.sin(now / 400 + ember.phase) ** 2;
                ctx.fillStyle = ember.color;
                ctx.beginPath();
                ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
                ctx.fill();
            }

            if (now >= nextRocketAt) {
                launch();
                nextRocketAt = now + between(isStrip ? 1400 : 900, isStrip ? 3000 : 2200);
            }

            ctx.lineCap = 'round';
            for (let i = rockets.length - 1; i >= 0; i -= 1) {
                const rocket = rockets[i];
                const fromX = rocket.x;
                const fromY = rocket.y;
                rocket.x += rocket.vx;
                rocket.y += rocket.vy;
                ctx.globalAlpha = 0.9;
                ctx.strokeStyle = rocket.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(fromX, fromY + 7);
                ctx.lineTo(rocket.x, rocket.y);
                ctx.stroke();
                if (rocket.y <= rocket.stopAt) {
                    burst(rocket.x, rocket.y, isStrip ? 26 : isPhone ? 46 : 70);
                    rockets.splice(i, 1);
                }
            }

            for (let i = sparks.length - 1; i >= 0; i -= 1) {
                const spark = sparks[i];
                spark.px = spark.x;
                spark.py = spark.y;
                spark.vx *= 0.985;
                spark.vy = spark.vy * 0.985 + GRAVITY;
                spark.x += spark.vx;
                spark.y += spark.vy;
                spark.life -= spark.fade;
                if (spark.life <= 0) {
                    sparks.splice(i, 1);
                } else {
                    ctx.globalAlpha = spark.life;
                    ctx.strokeStyle = spark.color;
                    ctx.lineWidth = 1.6;
                    ctx.beginPath();
                    ctx.moveTo(spark.px, spark.py);
                    ctx.lineTo(spark.x, spark.y);
                    ctx.stroke();
                }
            }

            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            frame = requestAnimationFrame(draw);
        };

        const sync = () => {
            const shouldRun = onScreen && !document.hidden;
            if (shouldRun === running) return;
            running = shouldRun;
            if (running && !frame) frame = requestAnimationFrame(draw);
        };

        resize();
        for (let i = 0; i < emberCount; i += 1) {
            const ember = {};
            resetEmber(ember, true);
            embers.push(ember);
        }

        launchRef.current = () => {
            for (let i = 0; i < 6; i += 1) {
                setTimeout(() => launch(between(width * 0.1, width * 0.9)), i * 220);
            }
        };

        const onTap = (event) => burst(event.clientX, event.clientY, isPhone ? 30 : 44);
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
            launchRef.current = null;
        };
    }, [variant]);

    useEffect(() => {
        if (celebrate) launchRef.current?.();
    }, [celebrate]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`${variant === 'strip' ? 'absolute' : 'fixed'} inset-0 w-full h-full pointer-events-none ${className}`}
        />
    );
};

export default DiwaliSky;
