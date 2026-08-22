"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// Tracks the mouse over its parent element and renders a soft radial glow.
// Mouse updates are rAF-throttled so they don't compete with the Spline WebGL loop.
export function Spotlight({
  className,
  size = 260,
  fill = "#F8F9FA",
  springOptions = { stiffness: 420, damping: 36, mass: 0.4 },
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState(null);
  const rafRef = useRef(null);
  const pendingPoint = useRef(null);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (parent) {
      parent.style.position = "relative";
      parent.style.overflow = "hidden";
      setParentElement(parent);
    }
  }, []);

  const flushMousePoint = useCallback(() => {
    rafRef.current = null;
    const point = pendingPoint.current;
    if (!point) return;
    mouseX.set(point.x);
    mouseY.set(point.y);
  }, [mouseX, mouseY]);

  const handleMouseMove = useCallback(
    (event) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      pendingPoint.current = {
        x: event.clientX - left,
        y: event.clientY - top,
      };
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(flushMousePoint);
      }
    },
    [parentElement, flushMousePoint]
  );

  useEffect(() => {
    if (!parentElement) return;
    const onEnter = () => setIsHovered(true);
    const onLeave = () => setIsHovered(false);

    parentElement.addEventListener("mousemove", handleMouseMove, { passive: true });
    parentElement.addEventListener("mouseenter", onEnter);
    parentElement.addEventListener("mouseleave", onLeave);
    return () => {
      parentElement.removeEventListener("mousemove", handleMouseMove);
      parentElement.removeEventListener("mouseenter", onEnter);
      parentElement.removeEventListener("mouseleave", onLeave);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [parentElement, handleMouseMove]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute rounded-full blur-lg transition-opacity duration-200 will-change-[left,top,opacity]",
        isHovered ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
        background: `radial-gradient(circle at center, ${fill}26, transparent 80%)`,
      }}
    />
  );
}
