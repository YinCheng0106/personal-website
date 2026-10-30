import React, { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  MotionValue,
  Transition,
} from "motion/react";
interface CircularTextProps {
  text: string;
  spinDuration?: number;
  onHover?: "slowDown" | "speedUp" | "pause" | "goBonkers";
  className?: string;
}

const getRotationTransition = (
  duration: number,
  from: number,
  loop: boolean = true,
) => ({
  from,
  to: from + 360,
  ease: "linear" as const,
  duration,
  type: "tween" as const,
  repeat: loop ? Infinity : 0,
});

const getTransition = (duration: number, from: number) => ({
  rotate: getRotationTransition(duration, from),
  scale: {
    type: "spring" as const,
    damping: 20,
    stiffness: 300,
  },
});

// Motion 12.23.24's useReducedMotion keeps only the initial React snapshot.
// Subscribe locally, as in Hero, so live browser preference changes reach React.
const motionQuery = "(prefers-reduced-motion: reduce)";

export function subscribeToReducedMotion(
  onChange: () => void,
  onReduce: () => void,
) {
  const query = window.matchMedia(motionQuery);
  const handleChange = () => {
    // Cancel before notifying React; a passive effect can run too late.
    // The browser may expose matches=true before dispatching this event.
    if (query.matches) onReduce();
    onChange();
  };
  query.addEventListener("change", handleChange);
  // Cover a preference change between render and subscription.
  if (query.matches) onReduce();
  return () => query.removeEventListener("change", handleChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(motionQuery).matches;
}

function getServerMotionSnapshot() {
  return null;
}

const CircularText: React.FC<CircularTextProps> = ({
  text,
  spinDuration = 20,
  onHover = "speedUp",
  className = "",
}) => {
  const letters = Array.from(text);
  const controls = useAnimation();
  const rotation: MotionValue<number> = useMotionValue(0);
  const stopMotion = useCallback(() => {
    controls.stop();
    rotation.stop();
    controls.set({ rotate: 0, scale: 1 });
  }, [controls, rotation]);
  const subscribe = useCallback(
    (onChange: () => void) => subscribeToReducedMotion(onChange, stopMotion),
    [stopMotion],
  );
  const reducedMotion = useSyncExternalStore(
    subscribe,
    getReducedMotionSnapshot,
    getServerMotionSnapshot,
  );

  useEffect(() => {
    // Wait for the browser snapshot before starting any repeating animation.
    if (reducedMotion !== false || getReducedMotionSnapshot()) {
      stopMotion();
      return;
    }

    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
    return () => {
      controls.stop();
      rotation.stop();
    };
  }, [spinDuration, text, onHover, controls, rotation, reducedMotion, stopMotion]);

  const handleHoverStart = () => {
    // Check the media query too, covering an event before React's next render.
    if (reducedMotion !== false || getReducedMotionSnapshot()) return;

    const start = rotation.get();

    if (!onHover) return;

    let transitionConfig: ReturnType<typeof getTransition> | Transition;
    let scaleVal = 1;

    switch (onHover) {
      case "slowDown":
        transitionConfig = getTransition(spinDuration * 2, start);
        break;
      case "speedUp":
        transitionConfig = getTransition(spinDuration / 4, start);
        break;
      case "pause":
        transitionConfig = {
          rotate: { type: "spring", damping: 20, stiffness: 300 },
          scale: { type: "spring", damping: 20, stiffness: 300 },
        };
        break;
      case "goBonkers":
        transitionConfig = getTransition(spinDuration / 20, start);
        scaleVal = 0.8;
        break;
      default:
        transitionConfig = getTransition(spinDuration, start);
    }

    controls.start({
      rotate: start + 360,
      scale: scaleVal,
      transition: transitionConfig,
    });
  };

  const handleHoverEnd = () => {
    if (reducedMotion !== false || getReducedMotionSnapshot()) return;

    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  };

  return (
    <motion.div
      className={`relative mx-auto rounded-full text-center font-black motion-reduce:!transform-none ${className}`}
      style={{
        rotate: rotation,
        WebkitTextStroke: "2px var(--background)",
        paintOrder: "stroke fill",
        textShadow: "0 0 0 var(--background)",
      }}
      initial={{ rotate: 0 }}
      animate={controls}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      {letters.map((letter, i) => {
        const rotationDeg = (360 / letters.length) * i;
        const transform = `rotateZ(${rotationDeg}deg)`;

        return (
          <span
            key={i}
            className="absolute inset-0 text-2xl transition-all duration-500 ease-[cubic-bezier(0,0,0,1)]"
            style={{ transform, WebkitTransform: transform }}
          >
            {letter}
          </span>
        );
      })}
    </motion.div>
  );
};

export default CircularText;
