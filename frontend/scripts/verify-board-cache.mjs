import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
for (const ext of ['.ts', '.tsx'])
  require.extensions[ext] = (mod, name) => {
    const compiled = ts.transpileModule(fs.readFileSync(name, 'utf8'), {
      fileName: name,
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    mod._compile(compiled.outputText, name);
  };

const originalLoad = Module._load;
const { ServerResponse } = require('node:http');
const { deduplicateRedirectHeaders } = require('../app/lib/redirectHeaderCompatibility.ts');
deduplicateRedirectHeaders();
deduplicateRedirectHeaders();
const response = new ServerResponse({ method: 'GET' });
response.setHeader('Location', '/target/');
response.appendHeader('location', '/target/');
assert.equal(response.getHeader('location'), '/target/');
response.appendHeader('set-cookie', ['session=a', 'session=b']);
assert.deepEqual(response.getHeader('set-cookie'), ['session=a', 'session=b']);
response.setHeader('vary', 'RSC');
response.appendHeader('vary', 'RSC');
assert.deepEqual(response.getHeader('vary'), ['RSC', 'RSC'], 'non-Location headers are unchanged');

const { BOARD_SECTIONS } = require('../app/(story)/constants/boardSections.ts');
for (const [table, sections] of Object.entries(BOARD_SECTIONS)) {
  const slug = table === 'success' ? 'success-story' : table;
  for (const section of sections) {
    assert.ok(
      fs.existsSync(path.join(root, 'app/(story)', slug, section.slug, 'page.tsx')),
      `Missing dynamic category page: ${slug}/${section.slug}`,
    );
  }
}
const factories = [];
let sanitizeCalls = 0;
let policySuffix = '';
Module._load = function (name, parent, isMain) {
  if (name === 'server-only') return {};
  if (name === 'next/cache')
    return {
      unstable_cache(fn, keys, options) {
        factories.push({ keys, options });
        const entries = new Map();
        return async (...args) => {
          const key = JSON.stringify([keys, args]);
          if (!entries.has(key)) entries.set(key, await fn(...args));
          return entries.get(key);
        };
      },
    };
  if (name.startsWith('@/')) return originalLoad.call(this, path.join(root, name.slice(2)), parent, isMain);
  const loaded = originalLoad.call(this, name, parent, isMain);
  if (name.endsWith('/sanitizeLegacyBoardHtml'))
    return {
      ...loaded,
      sanitizeLegacyBoardHtml(html) {
        sanitizeCalls++;
        if (html === 'fixture-sanitizer-failure') throw new Error('sanitizer unavailable');
        return loaded.sanitizeLegacyBoardHtml(html);
      },
    };
  return loaded;
};

const cacheFile = path.join(root, 'app/lib/cachedBoardHtml.ts');
function loadCachedHtml() {
  delete require.cache[cacheFile];
  if (!policySuffix) return require(cacheFile);
  const source = fs.readFileSync(cacheFile, 'utf8').replace("'board-html-v1'", "'board-html-v2'");
  const mod = new Module(cacheFile, import.meta);
  mod.filename = cacheFile;
  mod.paths = Module._nodeModulePaths(path.dirname(cacheFile));
  mod._compile(
    ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    cacheFile,
  );
  return mod.exports;
}
const cache = loadCachedHtml();
assert.equal(
  Object.keys(require.cache).some(name => name.includes('/jsdom/')),
  false,
  'cache import must not load JSDOM',
);
const unsafe =
  '<table width="100%"><tr><td style="vertical-align:top">safe<img src="/a.png" onerror="attack()"></td></tr></table>';
const first = await cache.getCachedBoardHtml(unsafe);
assert.doesNotMatch(first, /onerror/);
assert.match(first, /<table/);
assert.equal(await cache.getCachedBoardHtml(unsafe), first);
assert.equal(sanitizeCalls, 1, 'same HTML must use the cache wrapper');
await cache.getCachedBoardHtml(unsafe + '<p>edited</p>');
assert.equal(sanitizeCalls, 2, 'edited HTML needs a new cache entry');
assert.equal(factories[0].options.revalidate, 3600);
policySuffix = 'v2';
const nextPolicy = loadCachedHtml();
await nextPolicy.getCachedBoardHtml(unsafe);
assert.notDeepEqual(factories[0].keys, factories[1].keys, 'policy changes need new keys');
assert.equal(sanitizeCalls, 3);
await assert.rejects(nextPolicy.getCachedBoardHtml('fixture-sanitizer-failure'), /sanitizer unavailable/);

// Client refresh failure is separate from the completed mutation, and retry only refreshes.
const eventTarget = new EventTarget();
globalThis.window = eventTarget;
const results = [];
eventTarget.addEventListener('board-cache-refresh', event => results.push(event.detail));
const refresh = require('../app/lib/boardCacheRefresh.ts');
const admin = require('../app/(story)/lib/boardAdminApi.ts');
const calls = [];
let refreshStatus = 503;
let deleteStatus = 200;
let refreshOk = true;
globalThis.fetch = async (url, options) => {
  calls.push({ url, options });
  const status = url === '/api/board/revalidate' ? refreshStatus : deleteStatus;
  return Response.json(status === 200 ? { ok: refreshOk } : { error: 'fixture failure' }, { status });
};
await admin.deleteBoardPost('news', 101);
assert.deepEqual(
  calls.map(call => call.options.method),
  ['DELETE', 'POST'],
);
assert.equal(results.at(-1).ok, false);
refreshStatus = 200;
assert.equal(await refresh.refreshBoardCache(results.at(-1).request), true);
assert.equal(calls.at(-1).url, '/api/board/revalidate');
assert.equal(calls.filter(call => call.options.method === 'DELETE').length, 1, 'retry must not repeat deletion');
refreshOk = false;
assert.equal(
  await refresh.refreshBoardCache(results.at(-1).request),
  false,
  'HTTP 200 without ok:true is still a failed refresh',
);
refreshOk = true;
deleteStatus = 403;
const previousCount = calls.length;
await assert.rejects(admin.deleteBoardPost('news', 101));
assert.equal(calls.length, previousCount + 1, 'failed deletion must not invalidate');
globalThis.fetch = async () => {
  throw new Error('offline');
};
assert.equal(await admin.revalidateBoardPost('news', 101), false);

// Exercise the retry notice with real React state and a DOM, including navigation persistence.
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let routerRefreshes = 0;
const priorLoad = Module._load;
Module._load = function (name, parent, isMain) {
  if (name === 'next/navigation')
    return {
      useRouter: () => ({
        refresh: () => {
          routerRefreshes++;
        },
      }),
    };
  return priorLoad.call(this, name, parent, isMain);
};
const React = require('react');
const { createRoot } = require('react-dom/client');
const Notice = require('../app/components/BoardCacheRefreshNotice.tsx').default;
const reactRoot = createRoot(document.getElementById('root'));
await React.act(async () => {
  reactRoot.render(React.createElement(Notice));
});
assert.equal(document.querySelector('[role="alert"]'), null);
const request = { bo_table: 'news', wr_id: 101 };
await React.act(async () => {
  await refresh.refreshBoardCache(request);
});
assert.match(document.querySelector('[role="alert"]').textContent, /変更|변경은 저장/);
globalThis.fetch = async url => {
  assert.equal(url, '/api/board/revalidate');
  return Response.json({ ok: true });
};
await React.act(async () => {
  document.querySelector('button').click();
});
assert.equal(document.querySelector('[role="alert"]'), null);
assert.equal(routerRefreshes, 1);
await React.act(async () => reactRoot.unmount());
dom.window.close();
Module._load = originalLoad;
process.stdout.write(
  'Passed sanitizer cache wiring/lazy loading/policy, mutation refresh failure/retry, and notice interaction checks.\n',
);
