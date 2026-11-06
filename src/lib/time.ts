export function isExpired(date: Date, now: number = Date.now()): boolean {
  return date.getTime() <= now;
}

export function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
