"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
export function ResponsivePlot({
  height = 300,
  title,
  description,
  children,
}: {
  height?: number;
  title: string;
  description: string;
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(680);
  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next > 0) setWidth(Math.max(240, next));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={container} className="responsive-plot" style={{ height }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${title}. ${description}`}
      >
        <title>{title}</title>
        <desc>{description}</desc>
        {children({ width, height })}
      </svg>
    </div>
  );
}
export const chartColors = {
  neural: "#326449",
  fixed: "#55615b",
  matched: "#4b567e",
  grid: "#c4ccc0",
  muted: "#526056",
};
export function Point({
  x,
  y,
  kind,
  color,
}: {
  x: number;
  y: number;
  kind: "diamond" | "square" | "circle";
  color: string;
}) {
  if (kind === "diamond")
    return (
      <path d={`M${x} ${y - 4.5}l4.5 4.5-4.5 4.5-4.5-4.5z`} fill={color} />
    );
  if (kind === "square")
    return (
      <rect
        x={x - 4}
        y={y - 4}
        width="8"
        height="8"
        fill="var(--paper)"
        stroke={color}
        strokeWidth="1.5"
      />
    );
  return <circle cx={x} cy={y} r="2.8" fill={color} />;
}
