import { afterEach, expect, test } from "bun:test";
import { motionValue } from "motion/react";
import { subscribeToReducedMotion } from "./circularText";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

afterEach(() => {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
});

function mediaQuery(initial = false) {
  let matches = initial;
  const listeners = new Set<() => void>();
  const query = {
    get matches() {
      return matches;
    },
    addEventListener: (type: string, listener: () => void) => {
      expect(type).toBe("change");
      listeners.add(listener);
    },
    removeEventListener: (type: string, listener: () => void) => {
      expect(type).toBe("change");
      expect(listeners.delete(listener)).toBe(true);
    },
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      matchMedia: (name: string) => {
        expect(name).toBe("(prefers-reduced-motion: reduce)");
        return query;
      },
    },
  });
  return {
    listeners,
    change(next: boolean) {
      matches = next;
      for (const listener of listeners) listener();
    },
  };
}

test("cancels real Motion values and resets before notifying React", () => {
  const media = mediaQuery();
  const rotation = motionValue(45);
  const scale = motionValue(0.8);
  const order: string[] = [];
  // Attach an active animation without scheduling a browser frame loop.
  void rotation.start(() => ({ stop: () => order.push("stop") }) as never);
  expect(rotation.isAnimating()).toBe(true);
  const unsubscribe = subscribeToReducedMotion(
    () => {
      order.push("notify");
      expect(rotation.isAnimating()).toBe(false);
      expect(rotation.get()).toBe(0);
      expect(scale.get()).toBe(1);
    },
    () => {
      rotation.stop();
      rotation.set(0);
      scale.set(1);
    },
  );
  media.change(true);
  expect(order).toEqual(["stop", "notify"]);
  unsubscribe();
  rotation.destroy();
  scale.destroy();
});

test("handles initial reduce and the render-to-subscription gap", () => {
  const media = mediaQuery(true);
  const calls: string[] = [];
  const unsubscribe = subscribeToReducedMotion(
    () => calls.push("notify"),
    () => calls.push("reset"),
  );
  expect(calls).toEqual(["reset"]);
  expect(media.listeners.size).toBe(1);
  unsubscribe();
  expect(media.listeners.size).toBe(0);
});

test("uses one listener through rapid transitions and removes it on unmount", () => {
  const media = mediaQuery();
  const calls: string[] = [];
  const unsubscribe = subscribeToReducedMotion(
    () => calls.push("notify"),
    () => calls.push("reset"),
  );
  for (let i = 0; i < 12; i++) {
    media.change(i % 2 === 0);
    expect(media.listeners.size).toBe(1);
  }
  expect(calls.filter((x) => x === "reset")).toHaveLength(6);
  expect(calls.filter((x) => x === "notify")).toHaveLength(12);
  unsubscribe();
  const count = calls.length;
  media.change(true);
  expect(calls).toHaveLength(count);
  const remount = subscribeToReducedMotion(
    () => calls.push("notify"),
    () => calls.push("reset"),
  );
  expect(calls.at(-1)).toBe("reset");
  expect(media.listeners.size).toBe(1);
  remount();
  expect(media.listeners.size).toBe(0);
});
