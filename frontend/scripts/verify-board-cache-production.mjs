import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const nextCli = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));
const posts = new Map();
const views = [];
const lists = [];
let outage = false;
function post(id, slug = String(id), extra = {}) {
  return {
    wr_id: id,
    wr_subject: `Fixture ${id}`,
    wr_content: '<p>safe body<img src="/fixture.png" onerror="attack()"></p>',
    wr_name: 'fixture',
    wr_datetime: '2026-01-01 12:00:00',
    wr_hit: 1,
    wr_seo_slug: slug,
    wr_seo_description: '',
    wr_schema: '',
    og_image_url: null,
    prev: null,
    next: null,
    files: [],
    ...extra,
  };
}
posts.set('news:101', post(101, '한글-사례'));
posts.set('success:201', post(201, 'case-201'));
posts.set('news:102', post(102, 'scheduled', { unpublished: true }));

const upstream = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const json = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };
  const table = url.searchParams.get('bo_table');
  if (url.pathname.endsWith('/auth/me.php'))
    return json({ is_admin: req.headers.cookie?.includes('fixture_admin=1') ? 'super' : '' });
  if (url.pathname.endsWith('/get_view.php')) {
    views.push(url.search);
    if (outage) return json({ error: 'temporary outage' }, 503);
    const item = [...posts.entries()].find(
      ([key, item]) =>
        key.startsWith(`${table}:`) &&
        (url.searchParams.get('wr_id') === String(item.wr_id) || url.searchParams.get('slug') === item.wr_seo_slug),
    )?.[1];
    if (!item || item.unpublished) return json({ error: 'not found' }, 404);
    return json(item);
  }
  if (url.pathname.endsWith('/get_list.php')) {
    lists.push(url.search);
    const items = [...posts.entries()]
      .filter(([key, item]) => key.startsWith(`${table}:`) && !item.unpublished)
      .map(([, item]) => ({
        ...item,
        has_file: false,
        notice: false,
        thumbnail_url: null,
      }));
    return json({
      total: items.length,
      page: Number(url.searchParams.get('page') || 1),
      per_page: 12,
      total_pages: 3,
      items,
    });
  }
  return json({ error: 'unknown fixture endpoint' }, 404);
});
await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
const upstreamBase = `http://127.0.0.1:${upstream.address().port}/api/board`;
const portProbe = http.createServer();
await new Promise(resolve => portProbe.listen(0, '127.0.0.1', resolve));
const appPort = portProbe.address().port;
await new Promise(resolve => portProbe.close(resolve));
const base = `http://127.0.0.1:${appPort}`;
const env = { ...process.env, BOARD_API_URL: upstreamBase, NEXT_TELEMETRY_DISABLED: '1' };
// Advance only the test server's cache clock; never wait an hour or change application TTLs.
const clockDir = await fs.mkdtemp(path.join(os.tmpdir(), 'yn-board-cache-'));
const offsetFile = path.join(clockDir, 'offset');
const clockLoader = path.join(clockDir, 'clock.cjs');
let clockOffset = 0;
await fs.writeFile(offsetFile, '0');
await fs.writeFile(
  clockLoader,
  `
  const fs = require('node:fs');
  const offset = () => Number(fs.readFileSync(${JSON.stringify(offsetFile)}, 'utf8'));
  const now = Date.now;
  Date.now = () => now() + offset();
  const origin = performance.timeOrigin;
  Object.defineProperty(performance, 'timeOrigin', { get: () => origin + offset() });
`,
);
async function advanceClock(milliseconds = 43_201_000) {
  clockOffset += milliseconds;
  await fs.writeFile(offsetFile, String(clockOffset));
}
let app;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function run(args) {
  const childEnv =
    args[0] === 'start' ? { ...env, NODE_OPTIONS: `${env.NODE_OPTIONS ?? ''} --require=${clockLoader}` } : env;
  const child = spawn(process.execPath, [nextCli, ...args], {
    cwd: root,
    env: childEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', chunk => process.stdout.write(chunk));
  child.stderr.on('data', chunk => process.stderr.write(chunk));
  return child;
}
const checks = [];
function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      checks.push(name);
      process.stdout.write(`PASS ${name}\n`);
    });
}
async function page(path) {
  const response = await fetch(base + path, { redirect: 'manual' });
  return {
    status: response.status,
    cache: response.headers.get('x-nextjs-cache'),
    location: response.headers.get('location'),
    html: await response.text(),
  };
}
async function invalidate(body, authenticated = true) {
  const response = await fetch(`${base}/api/board/revalidate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authenticated ? { Cookie: 'fixture_admin=1' } : {}) },
    body: JSON.stringify(body),
  });
  return response.status;
}
try {
  const build = run(['build']);
  assert.equal(await new Promise(resolve => build.on('exit', resolve)), 0, 'production build failed');
  const manifest = JSON.parse(await fs.readFile(new URL('../.next/prerender-manifest.json', import.meta.url), 'utf8'));
  assert.ok(manifest.dynamicRoutes['/[bo_table]/[wr_id]'], 'detail must be eligible for on-demand ISR');
  app = run(['start', '--hostname', '127.0.0.1', '--port', String(appPort)]);
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(base + '/');
      ready = true;
      break;
    } catch {
      await wait(100);
    }
  }
  assert.ok(ready, 'production server did not start');

  await check('first render sanitized; second request HIT with no upstream read', async () => {
    const first = await page('/news/한글-사례/');
    assert.equal(first.status, 200, JSON.stringify({ views, excerpt: first.html.slice(-250) }));
    assert.equal(first.cache, 'MISS');
    assert.match(first.html, /safe body/);
    assert.doesNotMatch(first.html, /onerror=/);
    const reads = views.length;
    const second = await page('/news/한글-사례/');
    assert.equal(second.cache, 'HIT');
    assert.equal(views.length, reads);
  });
  await check('numeric ID redirects to canonical Korean slug', async () => {
    const response = await page('/news/101/');
    assert.equal(response.status, 308);
    assert.equal(decodeURIComponent(response.location), '/news/한글-사례/');
  });
  await check('category and nested category retain page/search/sort query behavior', async () => {
    for (const path of [
      '/news/press/?page=2&q=fixture&sort=subject_asc',
      '/success-story/criminal/drugs/?page=2&q=fixture&sort=subject_asc',
    ]) {
      const response = await page(path);
      assert.equal(response.status, 200);
    }
    assert.ok(
      lists.some(
        query =>
          query.includes('category=press') &&
          query.includes('page=2') &&
          query.includes('q=fixture') &&
          query.includes('sort=subject_asc'),
      ),
    );
    assert.ok(lists.some(query => query.includes('category=criminal') && query.includes('subcategory=drugs')));
    const other = await page('/news/press/?page=3&q=different&sort=subject_desc');
    assert.equal(other.status, 200);
    assert.ok(
      lists.some(
        query => query.includes('page=3') && query.includes('q=different') && query.includes('sort=subject_desc'),
      ),
    );
  });
  await check('unauthorized invalidation cannot expire a cached article', async () => {
    assert.equal(await invalidate({ bo_table: 'news', wr_id: 101 }, false), 403);
    assert.equal((await page('/news/한글-사례/')).cache, 'HIT');
  });
  await check('saved body and old/new slugs refresh on first request', async () => {
    posts.set(
      'news:105',
      post(105, 'neighbour', { prev: { wr_id: 101, wr_subject: 'old neighbour title', wr_seo_slug: '한글-사례' } }),
    );
    assert.ok((await page('/news/neighbour/')).html.includes('old neighbour title'));
    posts.set('news:101', post(101, 'edited-slug', { wr_content: '<p>edited body</p>' }));
    posts.set(
      'news:105',
      post(105, 'neighbour', {
        prev: { wr_id: 101, wr_subject: 'updated neighbour title', wr_seo_slug: 'edited-slug' },
      }),
    );
    assert.equal(await invalidate({ bo_table: 'news', wr_id: 101, wr_seo_slug: 'edited-slug' }), 200);
    assert.equal((await page('/news/한글-사례/')).status, 404);
    const fresh = await page('/news/edited-slug/');
    assert.equal(fresh.status, 200);
    assert.match(fresh.html, /edited body/);
    assert.equal((await page('/news/edited-slug/')).cache, 'HIT');
    const neighbour = await page('/news/neighbour/');
    assert.ok(neighbour.html.includes('updated neighbour title'), 'other cached articles must refresh navigation');
    assert.ok(neighbour.html.includes('/news/edited-slug/'));
  });
  await check('API outage on first visit is 500, never a cached 404', async () => {
    outage = true;
    assert.equal((await page('/news/uncached-outage/')).status, 500);
    outage = false;
    posts.set('news:103', post(103, 'uncached-outage'));
    assert.equal((await page('/news/uncached-outage/')).status, 200);
  });
  await check('expired ISR retains good content during outage and recovers on regeneration', async () => {
    posts.set('news:104', post(104, 'regeneration', { wr_content: '<p>last good version</p>' }));
    assert.equal((await page('/news/regeneration/')).status, 200);
    assert.equal((await page('/news/regeneration/')).cache, 'HIT');
    outage = true;
    await advanceClock();
    const reads = views.length;
    const stale = await page('/news/regeneration/');
    assert.equal(stale.status, 200);
    assert.match(stale.html, /last good version/);
    assert.equal(stale.cache, 'STALE');
    for (let i = 0; i < 30 && views.length === reads; i++) await wait(100);
    assert.ok(views.length > reads, 'background regeneration must consult the upstream');
    await wait(200);
    const stillGood = await page('/news/regeneration/');
    assert.equal(stillGood.status, 200);
    assert.match(stillGood.html, /last good version/);
    await wait(200);
    outage = false;
    posts.set('news:104', post(104, 'regeneration', { wr_content: '<p>recovered version</p>' }));
    await advanceClock(31_000); // Next.js backs off failed ISR regeneration for up to 30s.
    let recovered;
    for (let i = 0; i < 30; i++) {
      recovered = await page('/news/regeneration/');
      if (recovered.cache === 'HIT' && recovered.html.includes('recovered version')) break;
      await wait(100);
    }
    assert.equal(recovered.cache, 'HIT');
    assert.ok(recovered.html.includes('recovered version'), 'recovered page must replace the last good version');
  });
  await check('deleted article stops serving cached body on next request', async () => {
    posts.delete('news:101');
    assert.equal(await invalidate({ bo_table: 'news', wr_id: 101 }), 200);
    assert.equal((await page('/news/edited-slug/')).status, 404);
  });
  await check('scheduled negative cache expires after twelve hours; cancellation invalidates immediately', async () => {
    assert.equal((await page('/news/scheduled/')).status, 404);
    posts.set('news:102', post(102, 'scheduled'));
    assert.equal((await page('/news/scheduled/')).status, 404, 'cached 404 remains until expiry');
    await advanceClock();
    let published;
    for (let i = 0; i < 30; i++) {
      published = await page('/news/scheduled/');
      if (published.status === 200) break;
      await wait(100);
    }
    assert.equal(published.status, 200);
    posts.delete('news:102');
    assert.equal(await invalidate({ bo_table: 'news', wr_id: 102 }), 200);
    assert.equal((await page('/news/scheduled/')).status, 404);
  });
  await check('move refreshes both source and destination, including negative cache', async () => {
    assert.equal((await page('/success-story/case-201/')).status, 200);
    assert.equal((await page('/column/case-201/')).status, 404);
    const item = posts.get('success:201');
    posts.delete('success:201');
    posts.set('column:301', { ...item, wr_id: 301 });
    assert.equal(await invalidate({ bo_table: 'success', wr_id: 0, extra_bo_tables: ['column'] }), 200);
    assert.equal((await page('/success-story/case-201/')).status, 404);
    assert.equal((await page('/column/case-201/')).status, 200);
  });
  process.stdout.write(
    `Passed ${checks.length} production cache scenarios (fixture API only; no production writes).\n`,
  );
} finally {
  if (app && app.exitCode === null) {
    app.kill('SIGTERM');
    await new Promise(resolve => app.once('exit', resolve));
  }
  await new Promise(resolve => upstream.close(resolve));
  await fs.rm(clockDir, { recursive: true, force: true });
}
