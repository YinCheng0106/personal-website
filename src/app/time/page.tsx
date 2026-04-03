"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";

import { Button } from "@/components/ui/button";
import { notoSerifTC } from "@/app/fonts";
import { Icon } from "@iconify-icon/react";

// ─── Sky Configuration ───────────────────────────────────────────────────────

interface SkyPhase {
  gradient: string;
  stars: boolean;
  sun: boolean;
  moon: boolean;
  clouds: boolean;
  shootingStars: boolean;
}

function getSkyPhase(hour: number, minute: number): SkyPhase {
  const t = hour + minute / 60;

  // Night: 21:00 - 4:30
  if (t >= 21 || t < 4.5) {
    return {
      gradient:
        "linear-gradient(180deg, #0a0e27 0%, #111b3d 30%, #162044 60%, #1a1a3e 100%)",
      stars: true,
      sun: false,
      moon: true,
      clouds: false,
      shootingStars: true,
    };
  }
  // Dawn: 4:30 - 6:00
  if (t >= 4.5 && t < 6) {
    const p = (t - 4.5) / 1.5;
    return {
      gradient: `linear-gradient(180deg,
        ${lerpColor("#0a0e27", "#1a1040", p)} 0%,
        ${lerpColor("#111b3d", "#4a2060", p)} 25%,
        ${lerpColor("#162044", "#c06040", p)} 55%,
        ${lerpColor("#1a1a3e", "#e8a060", p)} 80%,
        ${lerpColor("#1a1a3e", "#f0c878", p)} 100%)`,
      stars: p < 0.5,
      sun: false,
      moon: false,
      clouds: false,
      shootingStars: false,
    };
  }
  // Sunrise: 6:00 - 8:00
  if (t >= 6 && t < 8) {
    const p = (t - 6) / 2;
    return {
      gradient: `linear-gradient(180deg,
        ${lerpColor("#1a1040", "#4a90c8", p)} 0%,
        ${lerpColor("#4a2060", "#7ab8e0", p)} 25%,
        ${lerpColor("#c06040", "#f0b870", p)} 55%,
        ${lerpColor("#e8a060", "#f8d898", p)} 80%,
        ${lerpColor("#f0c878", "#ffe8b0", p)} 100%)`,
      stars: false,
      sun: true,
      moon: false,
      clouds: true,
      shootingStars: false,
    };
  }
  // Morning: 8:00 - 11:00
  if (t >= 8 && t < 11) {
    return {
      gradient:
        "linear-gradient(180deg, #3a80c0 0%, #5aa0d8 30%, #88c0e8 60%, #c8e8f8 100%)",
      stars: false,
      sun: true,
      moon: false,
      clouds: true,
      shootingStars: false,
    };
  }
  // Midday: 11:00 - 14:00
  if (t >= 11 && t < 14) {
    return {
      gradient:
        "linear-gradient(180deg, #2878b8 0%, #48a0d8 30%, #78c0e8 60%, #b0daf0 100%)",
      stars: false,
      sun: true,
      moon: false,
      clouds: true,
      shootingStars: false,
    };
  }
  // Afternoon: 14:00 - 16:30
  if (t >= 14 && t < 16.5) {
    const p = (t - 14) / 2.5;
    return {
      gradient: `linear-gradient(180deg,
        ${lerpColor("#2878b8", "#4070a0", p)} 0%,
        ${lerpColor("#48a0d8", "#7098c0", p)} 25%,
        ${lerpColor("#78c0e8", "#c8a878", p)} 55%,
        ${lerpColor("#b0daf0", "#e8c088", p)} 80%,
        ${lerpColor("#b0daf0", "#f0d0a0", p)} 100%)`,
      stars: false,
      sun: true,
      moon: false,
      clouds: true,
      shootingStars: false,
    };
  }
  // Sunset: 16:30 - 19:00 (romantic sunset!)
  if (t >= 16.5 && t < 19) {
    const p = (t - 16.5) / 2.5;
    return {
      gradient: `linear-gradient(180deg,
        ${lerpColor("#4070a0", "#1a1040", p)} 0%,
        ${lerpColor("#7098c0", "#482868", p)} 15%,
        ${lerpColor("#c8a878", "#c04080", p)} 35%,
        ${lerpColor("#e8c088", "#e06848", p)} 55%,
        ${lerpColor("#f0d0a0", "#f09030", p)} 75%,
        ${lerpColor("#f0d0a0", "#f8b848", p)} 100%)`,
      stars: p > 0.7,
      sun: p < 0.6,
      moon: false,
      clouds: true,
      shootingStars: false,
    };
  }
  // Dusk: 19:00 - 21:00
  {
    const p = (t - 19) / 2;
    return {
      gradient: `linear-gradient(180deg,
        ${lerpColor("#1a1040", "#0a0e27", p)} 0%,
        ${lerpColor("#482868", "#111b3d", p)} 30%,
        ${lerpColor("#c04080", "#162044", p)} 60%,
        ${lerpColor("#e06848", "#1a1a3e", p)} 100%)`,
      stars: true,
      sun: false,
      moon: p > 0.5,
      clouds: false,
      shootingStars: p > 0.7,
    };
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t,
  );
}

// ─── Sun Position ────────────────────────────────────────────────────────────

function getSunPosition(hour: number, minute: number) {
  const t = hour + minute / 60;
  // Sun arc from 6:00 (left horizon) to 19:00 (right horizon)
  const progress = Math.max(0, Math.min(1, (t - 5.5) / 13.5));
  const x = 10 + progress * 80; // 10% to 90%
  const y = 85 - Math.sin(progress * Math.PI) * 75; // arc: low → high → low
  return { x, y, progress };
}

function getMoonPosition(hour: number, minute: number) {
  const t = hour + minute / 60;
  // Moon arc from 19:00 to 5:00 (next day)
  let progress: number;
  if (t >= 19) {
    progress = (t - 19) / 10;
  } else {
    progress = (t + 5) / 10;
  }
  progress = Math.max(0, Math.min(1, progress));
  const x = 15 + progress * 70;
  const y = 80 - Math.sin(progress * Math.PI) * 65;
  return { x, y };
}

// ─── Canvas Classes ──────────────────────────────────────────────────────────

class Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  baseOpacity: number;
  speed: number;
  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = Math.random() * 2.5 + 0.5;
    this.baseOpacity = 0.3 + Math.random() * 0.7;
    this.opacity = this.baseOpacity;
    this.speed = 0.003 + Math.random() * 0.015;
  }
  draw(ctx: CanvasRenderingContext2D, globalAlpha: number) {
    const a = this.opacity * globalAlpha;
    if (a <= 0) return;

    ctx.save();
    ctx.globalAlpha = a;

    // Glow
    const glow = this.size * 3;
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      glow,
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(0.3, "rgba(200, 220, 255, 0.3)");
    gradient.addColorStop(1, "rgba(200, 220, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x - glow, this.y - glow, glow * 2, glow * 2);

    // Core
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    this.opacity =
      this.baseOpacity + Math.sin(Date.now() * this.speed) * 0.3;
  }
}

class ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h * 0.4;
    const angle = Math.PI / 6 + Math.random() * (Math.PI / 4);
    const speed = 8 + Math.random() * 12;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 0;
    this.maxLife = 30 + Math.random() * 30;
    this.length = 40 + Math.random() * 60;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const progress = this.life / this.maxLife;
    const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;

    ctx.save();
    ctx.globalAlpha = alpha * 0.9;

    const tailX = this.x - (this.vx / Math.sqrt(this.vx * this.vx + this.vy * this.vy)) * this.length;
    const tailY = this.y - (this.vy / Math.sqrt(this.vx * this.vx + this.vy * this.vy)) * this.length;

    const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.8, "rgba(200, 220, 255, 0.6)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 1)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();

    // Head glow
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  isDead() {
    return this.life >= this.maxLife;
  }
}

class Particle {
  x: number;
  y: number;
  hue: number;
  saturation: number;
  lightness: number;
  velocity: { x: number; y: number };
  alpha: number;
  friction: number;
  gravity: number;
  decay: number;
  size: number;
  flicker: boolean;
  trail: { x: number; y: number; alpha: number }[];

  constructor(
    x: number,
    y: number,
    hue: number,
    saturation: number,
    lightness: number,
    velocity: { x: number; y: number },
    config: {
      friction?: number;
      gravity?: number;
      decay?: number;
      size?: number;
      flicker?: boolean;
      hasTrail?: boolean;
    } = {},
  ) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.saturation = saturation;
    this.lightness = lightness;
    this.velocity = velocity;
    this.alpha = 1;
    this.friction = config.friction ?? 0.95;
    this.gravity = config.gravity ?? 0.03;
    this.decay = config.decay ?? 0.005 + Math.random() * 0.005;
    this.size = config.size ?? 2;
    this.flicker = config.flicker ?? false;
    this.trail = [];
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw trail
    for (const t of this.trail) {
      ctx.save();
      ctx.globalAlpha = t.alpha * 0.4;
      ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = this.alpha;
    if (this.flicker && Math.random() > 0.8) {
      ctx.globalAlpha = this.alpha * 0.5;
    }

    // Glow effect
    const glow = this.size * 2.5;
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      glow,
    );
    gradient.addColorStop(
      0,
      `hsla(${this.hue}, ${this.saturation}%, ${Math.min(100, this.lightness + 20)}%, ${this.alpha})`,
    );
    gradient.addColorStop(
      1,
      `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0)`,
    );
    ctx.fillStyle = gradient;
    ctx.fillRect(
      this.x - glow,
      this.y - glow,
      glow * 2,
      glow * 2,
    );

    // Core
    ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  update() {
    // Add to trail
    this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
    if (this.trail.length > 5) this.trail.shift();
    this.trail.forEach((t) => (t.alpha *= 0.7));

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.decay;
    if (this.flicker) this.lightness = Math.min(100, this.lightness + 2);
  }
}

class Rocket {
  x: number;
  y: number;
  targetY: number;
  hue: number;
  velocityY: number;
  exploded: boolean = false;
  trail: { x: number; y: number; alpha: number }[] = [];

  constructor(w: number, h: number) {
    this.x = w * 0.15 + Math.random() * (w * 0.7);
    this.y = h;
    this.targetY = h * 0.08 + Math.random() * (h * 0.35);
    this.velocityY = -(Math.random() * 4 + 9);
    this.hue = Math.random() * 360;
  }

  update() {
    this.y += this.velocityY;
    this.velocityY += 0.04;
    if (this.velocityY >= -1 || this.y <= this.targetY) {
      this.exploded = true;
    }
    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    this.trail = this.trail.filter((t) => t.alpha > 0);
    this.trail.forEach((t) => (t.alpha -= 0.06));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.trail.forEach((t) => {
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = `hsl(${this.hue}, 100%, 80%)`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Rocket head with glow
    ctx.save();
    const glow = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      8,
    );
    glow.addColorStop(0, `hsla(${this.hue}, 100%, 90%, 1)`);
    glow.addColorStop(1, `hsla(${this.hue}, 100%, 80%, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(this.x - 8, this.y - 8, 16, 16);

    ctx.fillStyle = `hsl(${this.hue}, 100%, 90%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─── Cloud Component ─────────────────────────────────────────────────────────

const Cloud = ({
  style,
  isDark,
}: {
  style: React.CSSProperties;
  isDark: boolean;
}) => (
  <div
    className="pointer-events-none absolute"
    style={{
      ...style,
      filter: "blur(1px)",
    }}
  >
    <div
      className="relative"
      style={{
        width: "120px",
        height: "40px",
      }}
    >
      {[
        { w: 50, h: 40, x: 35, y: 0 },
        { w: 60, h: 35, x: 10, y: 8 },
        { w: 55, h: 30, x: 55, y: 10 },
        { w: 90, h: 25, x: 15, y: 18 },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: c.w,
            height: c.h,
            left: c.x,
            top: c.y,
            background: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(255,255,255,0.6)",
          }}
        />
      ))}
    </div>
  </div>
);

// ─── Countdown Display ───────────────────────────────────────────────────────

const CountdownDisplay = ({
  timeLeft,
  isDark,
}: {
  timeLeft: { d: number; h: number; m: number; s: number };
  isDark: boolean;
}) => (
  <motion.div
    key="countdown"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, y: -100, transition: { duration: 0.2 } }}
    className="font-mono"
  >
    <p
      className="mb-6 text-xl tracking-[0.5em] uppercase"
      style={{
        color: isDark ? "rgba(200,210,255,0.6)" : "rgba(255,255,255,0.8)",
        textShadow: isDark
          ? "0 0 20px rgba(100,150,255,0.3)"
          : "0 2px 10px rgba(0,0,0,0.2)",
      }}
    >
      Waiting for 2027
    </p>
    <NumberFlowGroup>
      <div
        className="text-7xl font-bold tabular-nums md:text-9xl"
        style={{
          color: isDark ? "#e8ecff" : "#ffffff",
          textShadow: isDark
            ? "0 0 40px rgba(100,150,255,0.4), 0 0 80px rgba(100,150,255,0.2)"
            : "0 4px 20px rgba(0,0,0,0.15), 0 0 40px rgba(255,200,100,0.2)",
        }}
      >
        {timeLeft.d > 0 && <NumberFlow trend={-1} value={timeLeft.d} />}
        <NumberFlow
          prefix=":"
          trend={-1}
          value={timeLeft.h}
          format={{ minimumIntegerDigits: 2 }}
        />
        <NumberFlow
          prefix=":"
          trend={-1}
          value={timeLeft.m}
          digits={{ 1: { max: 5 } }}
          format={{ minimumIntegerDigits: 2 }}
        />
        <NumberFlow
          prefix=":"
          trend={-1}
          value={timeLeft.s}
          digits={{ 1: { max: 5 } }}
          format={{ minimumIntegerDigits: 2 }}
        />
      </div>
    </NumberFlowGroup>
  </motion.div>
);

// ─── Final Countdown ─────────────────────────────────────────────────────────

const FinalCountdown = ({ seconds }: { seconds: number }) => (
  <motion.div
    exit={{
      opacity: 0,
      scale: 1.5,
      filter: "blur(20px)",
      transition: { duration: 0.5 },
    }}
    className="relative flex items-center justify-center"
  >
    <motion.div
      key="countdown-pulse"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute inset-0 rounded-full bg-red-500/20 blur-3xl"
    />
    <motion.h1
      key={seconds}
      initial={{ opacity: 0, scale: 2, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
      transition={{
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className="relative z-10 bg-linear-to-t from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-[12rem] font-black text-transparent drop-shadow-[0_0_50px_rgba(255,100,0,0.6)] md:text-[16rem]"
    >
      {seconds}
    </motion.h1>
  </motion.div>
);

// ─── Messages ────────────────────────────────────────────────────────────────

const messages = ["5paw55qE5LiA5bm0", "56Wd5aSn5a625bmz5a6J6aCG5Yip"];

const decodeMessage = (base64: string) => {
  try {
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    return new TextDecoder().decode(bytes);
  } catch {
    return base64;
  }
};

const NewYearMessage = ({ showWishes }: { showWishes: boolean }) => {
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => setIndex(0), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (index >= 0 && index < messages.length) {
      const timer = setTimeout(() => setIndex((prev) => prev + 1), 4000);
      return () => clearTimeout(timer);
    }
  }, [index]);

  return (
    <AnimatePresence mode="wait">
      {index === -1 ? (
        <motion.div
          key="new-year-text"
          initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.5 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center text-white"
        >
          <h1
            className="text-6xl font-black md:text-8xl"
            style={{
              background:
                "linear-gradient(to top, #f59e0b, #fbbf24, #ffffff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 30px rgba(255,255,255,0.5))",
            }}
          >
            HAPPY NEW YEAR
          </h1>
          <p className="mt-4 text-2xl tracking-wide text-yellow-200 md:tracking-[1em]">
            2027
          </p>
        </motion.div>
      ) : index < messages.length && showWishes ? (
        <motion.div
          key={`msg-${index}`}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          transition={{ duration: 0.8 }}
          className="px-4 text-center text-white"
        >
          <h2
            className={`${notoSerifTC.className} text-3xl leading-relaxed font-bold text-yellow-100 drop-shadow-lg md:text-5xl`}
          >
            {decodeMessage(messages[index])}
          </h2>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function NewYearTimePage() {
  const target = new Date("2027-01-01T00:00:00").getTime();

  const computeTimeLeft = (targetTime: number) => {
    const now = Date.now();
    const diff = Math.max(0, targetTime - now);
    const totalSeconds = Math.ceil(diff / 1000);
    return {
      d: Math.floor(totalSeconds / 86400),
      h: Math.floor((totalSeconds / 3600) % 24),
      m: Math.floor((totalSeconds / 60) % 60),
      s: totalSeconds % 60,
    };
  };

  const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(target));
  const [isNewYear, setIsNewYear] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showWishes, setShowWishes] = useState(true);
  const [fireworksActive, setFireworksActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rockets = useRef<Rocket[]>([]);
  const particles = useRef<Particle[]>([]);
  const stars = useRef<Star[]>([]);
  const shootingStars = useRef<ShootingStar[]>([]);
  const fireworksTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const skyPhase = useMemo(
    () => getSkyPhase(currentTime.getHours(), currentTime.getMinutes()),
    [currentTime],
  );

  const isDark = useMemo(() => {
    const h = currentTime.getHours() + currentTime.getMinutes() / 60;
    return h >= 19 || h < 6;
  }, [currentTime]);

  const sunPos = useMemo(
    () => getSunPosition(currentTime.getHours(), currentTime.getMinutes()),
    [currentTime],
  );

  const moonPos = useMemo(
    () => getMoonPosition(currentTime.getHours(), currentTime.getMinutes()),
    [currentTime],
  );

  const startFireworks = useCallback(() => {
    setFireworksActive(true);
    if (fireworksTimeoutRef.current) clearTimeout(fireworksTimeoutRef.current);
    fireworksTimeoutRef.current = setTimeout(() => {
      setFireworksActive(false);
    }, 459000);
  }, []);

  // Update local time every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        if (!isNewYear) {
          setIsNewYear(true);
          setShowMessage(true);
          startFireworks();
          setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
          setTimeout(() => setShowMessage(false), 459000);
        }
      } else {
        const totalSeconds = Math.ceil(diff / 1000);
        setTimeLeft({
          d: Math.floor(totalSeconds / 86400),
          h: Math.floor((totalSeconds / 3600) % 24),
          m: Math.floor((totalSeconds / 60) % 60),
          s: totalSeconds % 60,
        });
      }
    };

    const timer = setInterval(updateTime, 100);
    return () => clearInterval(timer);
  }, [isNewYear, startFireworks, target]);

  // Initial load
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsLoaded(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars.current = Array.from(
        { length: 200 },
        () => new Star(canvas.width, canvas.height),
      );
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createExplosion = (x: number, y: number, hue: number) => {
      const patterns = [
        "sphere",
        "heart",
        "star",
        "ring",
        "willow",
        "strobe",
        "double",
        "chrysanthemum",
        "palm",
      ];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];

      const palettes = [
        [hue],
        [hue, (hue + 30) % 360],
        [hue, (hue + 180) % 360],
        [0, 30, 60],
        [200, 240, 280],
        [40, 50, 60], // gold
        [Math.random() * 360, Math.random() * 360, Math.random() * 360],
      ];
      const palette = palettes[Math.floor(Math.random() * palettes.length)];
      const getColor = () =>
        palette[Math.floor(Math.random() * palette.length)];

      const addParticle = (
        vx: number,
        vy: number,
        config: {
          friction?: number;
          gravity?: number;
          decay?: number;
          size?: number;
          flicker?: boolean;
        } = {},
        h = getColor(),
      ) => {
        particles.current.push(
          new Particle(x, y, h, 100, 65, { x: vx, y: vy }, config),
        );
      };

      if (pattern === "chrysanthemum") {
        const count = 200;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 7;
          addParticle(Math.cos(angle) * speed, Math.sin(angle) * speed, {
            friction: 0.97,
            gravity: 0.02,
            decay: 0.004,
            size: 1.8,
          });
        }
      } else if (pattern === "palm") {
        const branches = 6 + Math.floor(Math.random() * 4);
        for (let b = 0; b < branches; b++) {
          const baseAngle = ((Math.PI * 2) / branches) * b;
          for (let i = 0; i < 25; i++) {
            const angle = baseAngle + (Math.random() - 0.5) * 0.3;
            const speed = 2 + i * 0.25;
            addParticle(Math.cos(angle) * speed, Math.sin(angle) * speed, {
              friction: 0.96,
              gravity: 0.04,
              decay: 0.006,
              size: 2,
            });
          }
        }
      } else if (pattern === "willow") {
        const count = 150;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 1;
          addParticle(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            { friction: 0.98, gravity: 0.05, decay: 0.004, size: 1.5 },
            45,
          );
        }
      } else if (pattern === "strobe") {
        const count = 100;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 2;
          addParticle(Math.cos(angle) * speed, Math.sin(angle) * speed, {
            flicker: true,
            decay: 0.012,
            size: 2.5,
            friction: 0.96,
          });
        }
      } else if (pattern === "heart") {
        const count = 180;
        for (let i = 0; i < count; i++) {
          const angle = ((Math.PI * 2) / count) * i;
          const t = angle;
          const s = 0.15 + Math.random() * 0.02;
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy = -(
            13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t)
          );
          addParticle(hx * s, hy * s, { decay: 0.006, size: 2.2 });
        }
      } else if (pattern === "star") {
        const count = 150;
        for (let i = 0; i < count; i++) {
          const angle = ((Math.PI * 2) / count) * i;
          const val = Math.cos(5 * angle);
          const r = 2 + 2.5 * Math.pow((val + 1) / 2, 2);
          const s = r * (0.8 + Math.random() * 0.2);
          addParticle(Math.cos(angle) * s, Math.sin(angle) * s, {
            decay: 0.008,
            size: 2,
          });
        }
      } else if (pattern === "ring") {
        const count = 120;
        for (let i = 0; i < count; i++) {
          const angle = ((Math.PI * 2) / count) * i;
          const s = 5.5 + Math.random() * 0.5;
          addParticle(Math.cos(angle) * s, Math.sin(angle) * s, {
            decay: 0.007,
            size: 2,
          });
        }
      } else if (pattern === "double") {
        const count = 180;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const isInner = i % 2 === 0;
          const s = isInner ? Math.random() * 3 : Math.random() * 6 + 4;
          addParticle(
            Math.cos(angle) * s,
            Math.sin(angle) * s,
            { decay: 0.008, size: isInner ? 2 : 1.5 },
            isInner ? hue : (hue + 180) % 360,
          );
        }
      } else {
        // sphere
        const count = 180;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6.5;
          addParticle(Math.cos(angle) * speed, Math.sin(angle) * speed, {
            decay: 0.005,
            size: Math.random() * 2 + 1,
          });
        }
      }
    };

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      const now = new Date();
      const h = now.getHours() + now.getMinutes() / 60;
      let starAlpha = 0;
      if (h >= 21 || h < 4.5) {
        starAlpha = 1;
      } else if (h >= 19 && h < 21) {
        starAlpha = (h - 19) / 2;
      } else if (h >= 4.5 && h < 6) {
        starAlpha = 1 - (h - 4.5) / 1.5;
      }

      if (starAlpha > 0) {
        stars.current.forEach((star) => star.draw(ctx, starAlpha));
      }

      // Shooting stars
      if (starAlpha > 0.5 && Math.random() < 0.005) {
        shootingStars.current.push(
          new ShootingStar(canvas.width, canvas.height),
        );
      }
      for (let i = shootingStars.current.length - 1; i >= 0; i--) {
        const ss = shootingStars.current[i];
        ss.update();
        ctx.globalAlpha = starAlpha;
        ss.draw(ctx);
        ctx.globalAlpha = 1;
        if (ss.isDead()) shootingStars.current.splice(i, 1);
      }

      // Fireworks
      ctx.globalCompositeOperation = "lighter";

      if (fireworksActive) {
        if (Math.random() < 0.08) {
          rockets.current.push(new Rocket(canvas.width, canvas.height));
        }
      }

      for (let i = rockets.current.length - 1; i >= 0; i--) {
        const rocket = rockets.current[i];
        rocket.update();
        rocket.draw(ctx);
        if (rocket.exploded) {
          createExplosion(rocket.x, rocket.y, rocket.hue);
          rockets.current.splice(i, 1);
        }
      }

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) particles.current.splice(i, 1);
      }

      ctx.globalCompositeOperation = "source-over";

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [fireworksActive]);

  // Cloud positions (fixed set for consistent layout)
  const clouds = useMemo(
    () => [
      { top: "12%", left: "-5%", scale: 1.2, duration: 80, delay: 0 },
      { top: "20%", left: "10%", scale: 0.8, duration: 100, delay: -30 },
      { top: "8%", left: "40%", scale: 1, duration: 90, delay: -50 },
      { top: "25%", left: "60%", scale: 0.7, duration: 110, delay: -20 },
      { top: "15%", left: "80%", scale: 0.9, duration: 85, delay: -60 },
    ],
    [],
  );

  const totalSeconds =
    timeLeft.d * 86400 + timeLeft.h * 3600 + timeLeft.m * 60 + timeLeft.s;
  const isFinalCountdown =
    !isNewYear && totalSeconds <= 10 && totalSeconds > 0;

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden select-none"
      style={{
        background: fireworksActive
          ? "linear-gradient(180deg, #050510 0%, #0a0a20 50%, #0f0f25 100%)"
          : skyPhase.gradient,
        transition: fireworksActive ? "background 2s ease" : "background 60s ease",
      }}
    >
      {/* Canvas for stars, shooting stars, and fireworks */}
      <canvas ref={canvasRef} className="absolute inset-0 z-[1]" />

      {/* Sun */}
      {skyPhase.sun && !fireworksActive && (
        <div
          className="pointer-events-none absolute z-[2] transition-all duration-[60s]"
          style={{
            left: `${sunPos.x}%`,
            top: `${sunPos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Sun glow */}
          <div
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              left: -100 + 35,
              top: -100 + 35,
              background:
                "radial-gradient(circle, rgba(255,200,50,0.3) 0%, rgba(255,150,50,0.1) 40%, transparent 70%)",
            }}
          />
          {/* Sun body */}
          <div
            className="rounded-full"
            style={{
              width: 70,
              height: 70,
              background:
                sunPos.progress > 0.7 || sunPos.progress < 0.15
                  ? "radial-gradient(circle, #ff8844 0%, #ff6622 50%, #ee4400 100%)"
                  : "radial-gradient(circle, #fff8e0 0%, #ffe066 50%, #ffcc33 100%)",
              boxShadow:
                sunPos.progress > 0.7 || sunPos.progress < 0.15
                  ? "0 0 60px rgba(255,100,0,0.6), 0 0 120px rgba(255,80,0,0.3)"
                  : "0 0 60px rgba(255,220,100,0.6), 0 0 120px rgba(255,200,50,0.3)",
            }}
          />
        </div>
      )}

      {/* Moon */}
      {skyPhase.moon && !fireworksActive && (
        <div
          className="pointer-events-none absolute z-[2] transition-all duration-[60s]"
          style={{
            left: `${moonPos.x}%`,
            top: `${moonPos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Moon glow */}
          <div
            className="absolute rounded-full"
            style={{
              width: 150,
              height: 150,
              left: -75 + 25,
              top: -75 + 25,
              background:
                "radial-gradient(circle, rgba(200,220,255,0.2) 0%, rgba(150,180,255,0.05) 50%, transparent 70%)",
            }}
          />
          {/* Moon body */}
          <div
            className="relative rounded-full"
            style={{
              width: 50,
              height: 50,
              background:
                "radial-gradient(circle at 35% 35%, #f0f0ff 0%, #d0d8e8 50%, #b0b8c8 100%)",
              boxShadow:
                "0 0 40px rgba(200,220,255,0.4), 0 0 80px rgba(180,200,255,0.15)",
            }}
          >
            {/* Craters */}
            <div
              className="absolute rounded-full"
              style={{
                width: 10,
                height: 10,
                top: 12,
                left: 15,
                background: "rgba(180,188,200,0.6)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 7,
                height: 7,
                top: 28,
                left: 28,
                background: "rgba(180,188,200,0.4)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 5,
                height: 5,
                top: 8,
                left: 32,
                background: "rgba(180,188,200,0.3)",
              }}
            />
          </div>
        </div>
      )}

      {/* Clouds */}
      {skyPhase.clouds &&
        !fireworksActive &&
        clouds.map((cloud, i) => (
          <div
            key={i}
            className="pointer-events-none absolute z-[3]"
            style={{
              top: cloud.top,
              animation: `cloudDrift ${cloud.duration}s linear infinite`,
              animationDelay: `${cloud.delay}s`,
              transform: `scale(${cloud.scale})`,
            }}
          >
            <Cloud style={{}} isDark={isDark} />
          </div>
        ))}

      {/* Horizon glow for sunset */}
      {!fireworksActive && (
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 z-[2]"
          style={{
            height: "30%",
            background: isDark
              ? "linear-gradient(to top, rgba(10,15,40,0.3) 0%, transparent 100%)"
              : "linear-gradient(to top, rgba(255,200,100,0.15) 0%, transparent 100%)",
            transition: "background 60s ease",
          }}
        />
      )}

      {/* Content */}
      <div className="z-10 text-center">
        {isLoaded && (
          <>
            <AnimatePresence mode="wait">
              {!isNewYear ? (
                isFinalCountdown ? (
                  <FinalCountdown key="final-countdown" seconds={timeLeft.s} />
                ) : (
                  <CountdownDisplay
                    key="main-countdown"
                    timeLeft={timeLeft}
                    isDark={isDark}
                  />
                )
              ) : (
                showMessage && (
                  <NewYearMessage key="message" showWishes={showWishes} />
                )
              )}
            </AnimatePresence>

            {isNewYear && (
              <div className="absolute right-4 bottom-4 z-50">
                <Button
                  variant="ghost"
                  className="text-white/50 hover:bg-white/10 hover:text-white"
                  onClick={() => setShowWishes(!showWishes)}
                >
                  {showWishes ? (
                    <Icon icon="mdi:eye-off" />
                  ) : (
                    <Icon icon="mdi:eye" />
                  )}
                </Button>
              </div>
            )}

            <AnimatePresence>
              {isNewYear && !fireworksActive && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-8 flex flex-col items-center justify-center gap-2"
                >
                  <Button
                    onClick={startFireworks}
                    variant="outline"
                    className="rounded-full border-white/20 bg-white/10 px-8 py-6 text-lg font-bold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20"
                  >
                    重新施放
                  </Button>
                  <span className="text-sm text-gray-400">459秒</span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Cloud animation keyframes */}
      <style jsx global>{`
        @keyframes cloudDrift {
          0% {
            left: -15%;
          }
          100% {
            left: 110%;
          }
        }
      `}</style>
    </main>
  );
}
