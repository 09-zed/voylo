/**
 * Logs an error in the Expo terminal during development, so the real cause
 * shows up next to the friendly message the app displays. Silent in production.
 */
export function reportError(where: string, error: unknown) {
  if (__DEV__) {
    const e = error as { message?: string; code?: string; details?: string; hint?: string };
    console.warn(`[Voylo] ${where}: ${e?.message ?? String(error)}`, e?.code ?? '', e?.details ?? '', e?.hint ?? '');
  }
}
