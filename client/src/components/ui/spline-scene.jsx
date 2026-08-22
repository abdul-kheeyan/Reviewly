"use client";
import { Suspense, lazy, useRef, useEffect, useCallback } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

export function SplineScene({ scene, className }) {
  const containerRef = useRef(null);
  const splineRef = useRef(null);

  const handleLoad = useCallback((spline) => {
    splineRef.current = spline;
  }, []);

  // Pause WebGL rendering when the hero scrolls out of view — stops scroll jank site-wide.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const spline = splineRef.current;
        if (!spline) return;

        if (entry.isIntersecting) {
          spline.play();
        } else {
          spline.stop();
        }
      },
      { rootMargin: "80px 0px", threshold: 0.01 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-gray-300" />
          </div>
        }
      >
        <Spline scene={scene} className="h-full w-full" onLoad={handleLoad} renderOnDemand />
      </Suspense>
    </div>
  );
}
