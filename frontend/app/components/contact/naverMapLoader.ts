/**
 * Loads Naver Maps JS API v3 once per page.
 * Uses ncpKeyId (NCP Application Client ID).
 */

const NAVER_MAPS_SCRIPT_ID = 'naver-maps-sdk';

type NaverMapInstance = {
  setSize: (size: unknown) => void;
  destroy?: () => void;
};

type NaverMarkerInstance = Record<string, never>;

type NaverInfoWindowInstance = {
  open: (map: NaverMapInstance, marker: NaverMarkerInstance) => void;
  close: () => void;
};

export type NaverMapsNamespace = {
  maps: {
    Map: new (
      element: string | HTMLElement,
      options: {
        center: unknown;
        zoom: number;
        zoomControl?: boolean;
        zoomControlOptions?: { position: unknown };
      },
    ) => NaverMapInstance;
    LatLng: new (lat: number, lng: number) => unknown;
    Marker: new (options: { position: unknown; map: unknown; title?: string; cursor?: string }) => NaverMarkerInstance;
    InfoWindow: new (options: {
      content: string;
      borderWidth?: number;
      backgroundColor?: string;
      disableAnchor?: boolean;
      pixelOffset?: unknown;
    }) => NaverInfoWindowInstance;
    Size: new (width: number, height: number) => unknown;
    Point: new (x: number, y: number) => unknown;
    Position: { TOP_RIGHT: unknown };
    Event: {
      addListener: (target: unknown, eventName: string, listener: () => void) => unknown;
    };
  };
};

declare global {
  interface Window {
    naver?: NaverMapsNamespace;
  }
}

let loadPromise: Promise<NaverMapsNamespace> | null = null;

export function loadNaverMaps(clientId: string): Promise<NaverMapsNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Naver Maps can only load in the browser'));
  }

  if (window.naver?.maps) {
    return Promise.resolve(window.naver);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(NAVER_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.naver?.maps) resolve(window.naver);
        else reject(new Error('Naver Maps failed to initialize'));
      });
      existing.addEventListener('error', () => reject(new Error('Failed to load Naver Maps script')));
      return;
    }

    const script = document.createElement('script');
    script.id = NAVER_MAPS_SCRIPT_ID;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.async = true;
    script.onload = () => {
      if (window.naver?.maps) resolve(window.naver);
      else reject(new Error('Naver Maps failed to initialize'));
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Naver Maps script'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
