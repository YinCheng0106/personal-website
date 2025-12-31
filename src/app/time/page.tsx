"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { Button } from "@/components/ui/button";

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
  color: string;
  velocity: { x: number; y: number };
  alpha: number;
  friction: number;
  gravity: number;
  constructor(
    x: number,
    y: number,
    color: string,
    velocity: { x: number; y: number },
  ) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
    this.friction = 0.96;
    this.gravity = 0.04;
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
    this.alpha -= 0.006;
  }
}

class Rocket {
  x: number;
  y: number;
  targetY: number;
  color: string;
  velocityY: number;
  exploded: boolean = false;
  constructor(w: number, h: number) {
    this.x = w * 0.2 + Math.random() * (w * 0.6);
    this.y = h;
    this.targetY = h * 0.1 + Math.random() * (h * 0.4);
    this.velocityY = -(Math.random() * 3 + 6);
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
  }
  update() {
    this.y += this.velocityY;
    this.velocityY += 0.03;
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

const NewYearMessage = () => (
  <motion.div
    key="new-year-text"
    initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, filter: "blur(20px)" }}
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
);

export default function NewYearTimePage() {
  const target = new Date("2025-12-31T10:06:00").getTime();

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

    const createExplosion = (x: number, y: number, color: string) => {
      const patterns = ["circle", "random", "double-ring", "heart", "star"];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];

      const count = 100;
      for (let i = 0; i < count; i++) {
        let vx = 0,
          vy = 0;
        const angle = ((Math.PI * 2) / count) * i;
        const force = Math.random() * 4 + 1;

        if (pattern === "heart") {
          const t = (Math.PI * 2 * i) / count;
          const heartX = 16 * Math.pow(Math.sin(t), 3);
          const heartY = -(
            13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t)
          );
          vx = (heartX / 16) * force * 0.8;
          vy = (heartY / 16) * force * 0.8;
        } else if (pattern === "star") {
          vx = Math.cos(angle) * force * (0.5 + (i % 2) * 0.5);
          vy = Math.sin(angle) * force * (0.5 + (i % 2) * 0.5);
        } else if (pattern === "circle") {
          vx = Math.cos(angle) * force;
          vy = Math.sin(angle) * force;
        } else if (pattern === "double-ring") {
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
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.current.forEach((star) => star.draw(ctx));

      if (fireworksActive) {
        if (Math.random() < 0.05)
          rockets.current.push(new Rocket(canvas.width, canvas.height));
      }

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
                showMessage && <NewYearMessage key="message" />
              )}
            </AnimatePresence>

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
