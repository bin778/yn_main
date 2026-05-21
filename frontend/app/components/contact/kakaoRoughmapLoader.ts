/**
 * Kakao map embed loader. roughmapLoader.js uses document.write (broken in Next.js),
 * so we mirror its window.daum.roughmap init and load roughmapLander.js directly.
 */

const ROUGHMAP_LANDER_SRC =
  'https://t1.kakaocdn.net/kakaomapweb/roughmap/place/prod/207038f2_1774248312945/roughmapLander.js';

const LANDER_POLL_MS = 50;
const LANDER_POLL_MAX = 100;

type RoughmapConfig = {
  phase: string;
  cdn: string;
  URL_KEY_DATA_LOAD_PRE: string;
  url_protocal: string;
  url_cdn_domain: string;
};

function initRoughmapConfig(): void {
  if (typeof window === 'undefined') return;

  const daum = window.daum as { roughmap?: RoughmapConfig & { Lander?: unknown } } | undefined;
  if (daum?.roughmap?.phase) return;

  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const roughmap: RoughmapConfig = {
    phase: 'prod',
    cdn: '207038f2_1774248312945',
    URL_KEY_DATA_LOAD_PRE: `${protocol}//t1.kakaocdn.net/roughmap/`,
    url_protocal: protocol,
    url_cdn_domain: '//t1.kakaocdn.net',
  };

  window.daum = { ...daum, roughmap: roughmap as NonNullable<typeof window.daum>['roughmap'] };
}

function isLanderReady(): boolean {
  const Lander = (window.daum?.roughmap as { Lander?: unknown } | undefined)?.Lander;
  return typeof Lander === 'function';
}

function waitForLander(): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const poll = () => {
      if (isLanderReady()) {
        resolve();
        return;
      }
      attempts += 1;
      if (attempts >= LANDER_POLL_MAX) {
        reject(new Error('Kakao roughmap Lander failed to load'));
        return;
      }
      setTimeout(poll, LANDER_POLL_MS);
    };

    poll();
  });
}

let loadPromise: Promise<void> | null = null;

export function loadKakaoRoughmapLander(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (isLanderReady()) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  initRoughmapConfig();

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-roughmap-lander="true"]');
    if (existing) {
      waitForLander().then(resolve).catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.src = ROUGHMAP_LANDER_SRC;
    script.charset = 'UTF-8';
    script.async = true;
    script.dataset.kakaoRoughmapLander = 'true';
    script.onload = () => {
      waitForLander().then(resolve).catch(reject);
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Kakao roughmap Lander script'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
