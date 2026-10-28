import { ServerResponse } from 'node:http';

const PATCHED = Symbol.for('yn.redirect-header-deduplication');

/**
 * Next 16.2.6 replays the same Location twice on a cold ISR redirect.
 * Remove when upstream https://github.com/vercel/next.js/pull/95913 ships.
 * Only identical Location values are suppressed; other headers are untouched.
 */
export function deduplicateRedirectHeaders(): void {
  const prototype = ServerResponse.prototype as typeof ServerResponse.prototype & { [PATCHED]?: boolean };
  if (prototype[PATCHED]) return;
  const appendHeader = prototype.appendHeader;
  prototype.appendHeader = function (name, value) {
    if (name.toLowerCase() === 'location') {
      const existing = this.getHeader(name);
      const previous = Array.isArray(existing) ? existing : existing === undefined ? [] : [String(existing)];
      const incoming = Array.isArray(value) ? value : [value];
      const remaining = incoming.filter(item => !previous.includes(item));
      if (remaining.length === 0) return this;
      return appendHeader.call(this, name, remaining);
    }
    return appendHeader.call(this, name, value);
  };
  prototype[PATCHED] = true;
}
