/**
 * Math engine — direct port of the Python helpers in yoga_poses.py.
 * Pure functions only; no React, DOM, tfjs, or Node imports.
 * Works identically in React Native and the browser.
 */

export interface Point {
  x: number;
  y: number;
  /** Detector confidence 0..1 (optional). */
  score?: number;
}

/**
 * Three-joint angle in degrees between vectors B→A and B→C.
 * Mirrors Python `calculate_angle` (atan2-based, always 0..180).
 */
export function calculateAngle(a: Point, b: Point, c: Point): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/** Euclidean distance in the same units the points are in (pixels). */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function midpoint(p1: Point, p2: Point): Point {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}
