export function capitalize(this: string): string {
    return `${this[0].toUpperCase()}${this.substring(1)}`;
}