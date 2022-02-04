export function sleep(delay: number = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
}

export function capitalize(str: string): string {
    return `${str[0].toUpperCase()}${str.substring(1)}`;
}