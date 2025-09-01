export function formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('sv-SE', options);
}

export function formatPercentage(value: number): string {
    return `${Math.round(value * 100)}%`;
}