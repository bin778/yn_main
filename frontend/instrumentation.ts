export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { deduplicateRedirectHeaders } = await import('./app/lib/redirectHeaderCompatibility');
    deduplicateRedirectHeaders();
  }
}
