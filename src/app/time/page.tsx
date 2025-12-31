"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";

import { Button } from "@/components/ui/button";
import { notoSerifTC } from "@/app/fonts";
import { Icon } from "@iconify-icon/react";

class Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
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
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    if (this.flicker && Math.random() > 0.8) {
      ctx.globalAlpha = this.alpha * 0.5;
    }
    ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  update() {
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
    this.x = w * 0.2 + Math.random() * (w * 0.6);
    this.y = h;
    this.targetY = h * 0.1 + Math.random() * (h * 0.4);
    this.velocityY = -(Math.random() * 3 + 8);
    this.hue = Math.random() * 360;
  }

  update() {
    this.y += this.velocityY;
    this.velocityY += 0.04;
    if (this.velocityY >= -1 || this.y <= this.targetY) {
      this.exploded = true;
    }
    // Add trail
    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    this.trail = this.trail.filter((t) => t.alpha > 0);
    this.trail.forEach((t) => (t.alpha -= 0.08));
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw trail
    ctx.save();
    this.trail.forEach((t) => {
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = `hsl(${this.hue}, 100%, 70%)`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Draw head
    ctx.fillStyle = `hsl(${this.hue}, 100%, 80%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

const CountdownDisplay = ({
  timeLeft,
}: {
  timeLeft: { h: number; m: number; s: number };
}) => (
  <motion.div
    key="countdown"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, y: -100, transition: { duration: 0.2 } }}
    className="font-mono text-white"
  >
    <p className="mb-4 text-xl tracking-[0.5em] text-gray-400 uppercase">
      Waiting for 2026
    </p>
    <NumberFlowGroup>
      <div className="text-7xl font-bold tabular-nums md:text-9xl">
        <NumberFlow
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

const messages = [
  "5paw55qE5LiA5bm0",
  "5biM5pyb5oiR5YCR6YO96IO96LWw5Zyo6Ieq5bex55qE6YGT6Lev5LiK",
  "6LaK6LWw6LaK56mp",
  "6LaK6LWw6LaK6aCG",
  "5aW95aW955Sf5rS777yM5aW95aW95oiQ54K66Ieq5bex",
  "5LiA5YiH5bCH5pyD5pyJ5baE5paw55qE5LiA6Z2i77yB",
  "6YCZ54WZ54Gr5pyD5pS+NDU556eS77yM5oWi5oWi6KeA6LOe5ZCn",
];

const decodeMessage = (base64: string) => {
  try {
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    return new TextDecoder().decode(bytes);
  } catch (e) {
    return base64;
  }
};

const NewYearMessage = ({ showWishes }: { showWishes: boolean }) => {
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex(0);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (index >= 0 && index < messages.length) {
      const timer = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, 4000);
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
          <h1 className="bg-linear-to-t from-yellow-500 to-white bg-clip-text text-6xl font-black text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] md:text-8xl">
            HAPPY NEW YEAR
          </h1>
          <p className="mt-4 text-2xl tracking-wide text-yellow-200 md:tracking-[1em]">
            2026
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

export default function NewYearTimePage() {
  const target = new Date("2026-01-01T00:00:00").getTime();

  const computeTimeLeft = (targetTime: number) => {
    const now = Date.now();
    const diff = Math.max(0, targetTime - now);
    const totalSeconds = Math.ceil(diff / 1000);
    return {
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rockets = useRef<Rocket[]>([]);
  const particles = useRef<Particle[]>([]);
  const stars = useRef<Star[]>([]);
  const fireworksTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startFireworks = useCallback(() => {
    setFireworksActive(true);
    if (fireworksTimeoutRef.current) clearTimeout(fireworksTimeoutRef.current);
    fireworksTimeoutRef.current = setTimeout(() => {
      setFireworksActive(false);
    }, 459000);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        if (!isNewYear) {
          setIsNewYear(true);
          setShowMessage(true);
          startFireworks();
          setTimeLeft({ h: 0, m: 0, s: 0 });
          setTimeout(() => setShowMessage(false), 459000);
        }
      } else {
        const totalSeconds = Math.ceil(diff / 1000);
        setTimeLeft({
          h: Math.floor((totalSeconds / 3600) % 24),
          m: Math.floor((totalSeconds / 60) % 60),
          s: totalSeconds % 60,
        });
      }
    };

    const timer = setInterval(updateTime, 100);
    return () => clearInterval(timer);
  }, [isNewYear, startFireworks, target]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsLoaded(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars.current = Array.from(
        { length: 150 },
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
      ];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];

      const palettes = [
        [hue],
        [hue, (hue + 30) % 360],
        [hue, (hue + 180) % 360],
        [0, 30, 60],
        [200, 240, 280],
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
          new Particle(x, y, h, 100, 60, { x: vx, y: vy }, config),
        );
      };

      if (pattern === "willow") {
        const count = 120;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 1;
          addParticle(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            { friction: 0.98, gravity: 0.04, decay: 0.005, size: 1.5 },
            45,
          );
        }
      } else if (pattern === "strobe") {
        const count = 80;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 2;
          addParticle(Math.cos(angle) * speed, Math.sin(angle) * speed, {
            flicker: true,
            decay: 0.015,
            size: 2.5,
            friction: 0.96,
          });
        }
      } else if (pattern === "heart") {
        const count = 150;
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
          addParticle(hx * s, hy * s, { decay: 0.008, size: 2 });
        }
      } else if (pattern === "star") {
        const count = 120;
        for (let i = 0; i < count; i++) {
          const angle = ((Math.PI * 2) / count) * i;
          const val = Math.cos(5 * angle);
          const r = 2 + 2 * Math.pow((val + 1) / 2, 2);
          const s = r * (0.8 + Math.random() * 0.2);
          addParticle(Math.cos(angle) * s, Math.sin(angle) * s, {
            decay: 0.01,
            size: 2,
          });
        }
      } else if (pattern === "ring") {
        const count = 100;
        for (let i = 0; i < count; i++) {
          const angle = ((Math.PI * 2) / count) * i;
          const s = 5 + Math.random() * 0.5;
          addParticle(Math.cos(angle) * s, Math.sin(angle) * s, {
            decay: 0.008,
            size: 2,
          });
        }
      } else if (pattern === "double") {
        const count = 150;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const isInner = i % 2 === 0;
          const s = isInner ? Math.random() * 3 : Math.random() * 6 + 4;
          addParticle(
            Math.cos(angle) * s,
            Math.sin(angle) * s,
            { decay: 0.01, size: isInner ? 2 : 1.5 },
            isInner ? hue : (hue + 180) % 360,
          );
        }
      } else {
        const count = 150;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6;
          addParticle(Math.cos(angle) * speed, Math.sin(angle) * speed, {
            decay: 0.006,
            size: Math.random() * 2 + 1,
          });
        }
      }
    };

    let animationId: number;
    const animate = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.current.forEach((star) => star.draw(ctx));

      ctx.globalCompositeOperation = "lighter";

      if (fireworksActive) {
        if (Math.random() < 0.05)
          rockets.current.push(new Rocket(canvas.width, canvas.height));
      }

      rockets.current.forEach((rocket, i) => {
        rocket.update();
        rocket.draw(ctx);
        if (rocket.exploded) {
          createExplosion(rocket.x, rocket.y, rocket.hue);
          rockets.current.splice(i, 1);
        }
      });

      particles.current.forEach((p, i) => {
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) particles.current.splice(i, 1);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [fireworksActive]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="z-10 text-center">
        {isLoaded && (
          <>
            <AnimatePresence mode="wait">
              {!isNewYear ? (
                timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s <= 10 ? (
                  <FinalCountdown key="final-countdown" seconds={timeLeft.s} />
                ) : (
                  <CountdownDisplay key="main-countdown" timeLeft={timeLeft} />
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
    </main>
  );
}
