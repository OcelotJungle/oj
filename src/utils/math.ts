export function bound(x: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, x));
}