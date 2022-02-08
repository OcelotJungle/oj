export function bound(x: number, min: number = 0, max: number = 1): number {
    return Math.min(max, Math.max(min, x));
}