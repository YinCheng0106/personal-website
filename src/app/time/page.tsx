'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

class Star {
  x: number; y: number; size: number; opacity: number; speed: number;
  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = Math.random() * 2;
    this.opacity = Math.random();
    this.speed = 0.005 + Math.random() * 0.01;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    this.opacity += this.speed;
    if (this.opacity > 1 || this.opacity < 0) this.speed = -this.speed;
  }
}

class Particle {
  x: number; y: number; color: string; velocity: { x: number; y: number };
  alpha: number; friction: number; gravity: number;
  constructor(x: number, y: number, color: string, velocity: { x: number; y: number }) {
    this.x = x; this.y = y; this.color = color; this.velocity = velocity;
    this.alpha = 1; this.friction = 0.95; this.gravity = 0.07;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.012;
  }
}

class Rocket {
  x: number; y: number; targetY: number; color: string; velocityY: number;
  exploded: boolean = false;
  constructor(w: number, h: number) {
    this.x = (w * 0.2) + Math.random() * (w * 0.6);
    this.y = h;
    this.targetY = (h * 0.1) + Math.random() * (h * 0.4);
    this.velocityY = -(Math.random() * 4 + 8);
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
  }
  update() {
    this.y += this.velocityY;
    this.velocityY += 0.05;
    if (this.velocityY >= 0 || this.y <= this.targetY) {
      this.exploded = true;
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + 10);
    ctx.stroke();
  }
}

export default function NewYearTimePage() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [isNewYear, setIsNewYear] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const rockets = useRef<Rocket[]>([]);
  const particles = useRef<Particle[]>([]);
  const stars = useRef<Star[]>([]);

  useEffect(() => {
    const target = new Date('2026-01-01T00:00:00').getTime();
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(timer);
        setIsNewYear(true);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);
      } else {
        setTimeLeft({
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / (1000 * 60)) % 60),
          s: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    stars.current = Array.from({ length: 150 }, () => new Star(canvas.width, canvas.height));

    const createExplosion = (x: number, y: number, color: string) => {
      const patterns = ['circle', 'random', 'double-ring'];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      
      const count = 80;
      for (let i = 0; i < count; i++) {
        let vx = 0, vy = 0;
        const angle = (Math.PI * 2 / count) * i;
        const force = Math.random() * 6 + 2;

        if (pattern === 'circle') {
          vx = Math.cos(angle) * force;
          vy = Math.sin(angle) * force;
        } else if (pattern === 'double-ring') {
          const f = i % 2 === 0 ? force : force * 0.5;
          vx = Math.cos(angle) * f;
          vy = Math.sin(angle) * f;
        } else {
          vx = (Math.random() - 0.5) * 12;
          vy = (Math.random() - 0.5) * 12;
        }
        particles.current.push(new Particle(x, y, color, { x: vx, y: vy }));
      }
    };

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.current.forEach(star => star.draw(ctx));

      if (isNewYear) {
        if (Math.random() < 0.05) rockets.current.push(new Rocket(canvas.width, canvas.height));

        rockets.current.forEach((rocket, i) => {
          rocket.update();
          rocket.draw(ctx);
          if (rocket.exploded) {
            createExplosion(rocket.x, rocket.y, rocket.color);
            rockets.current.splice(i, 1);
          }
        });

        particles.current.forEach((p, i) => {
          p.update();
          p.draw(ctx);
          if (p.alpha <= 0) particles.current.splice(i, 1);
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isNewYear]);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-black overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="z-10 text-center">
        <AnimatePresence>
          {!isNewYear ? (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -100 }}
              className="font-mono text-white"
            >
              <p className="text-xl tracking-[0.5em] text-gray-400 mb-4 uppercase">Waiting for 2026</p>
              <div className="text-7xl md:text-9xl font-bold tabular-nums">
                {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
              </div>
            </motion.div>
          ) : (
            showMessage && (
              <motion.div
                key="new-year-text"
                initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(20px)' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-white text-center"
              >
                <h1 className="text-6xl md:text-8xl font-black bg-linear-to-t from-yellow-500 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                  HAPPY NEW YEAR
                </h1>
                <p className="mt-4 text-2xl text-yellow-200 tracking-[1em]">2026</p>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}