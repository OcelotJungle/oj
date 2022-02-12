export function bound(x: number, min = 0, max = 1): number {
    return Math.min(max, Math.max(min, x));
}