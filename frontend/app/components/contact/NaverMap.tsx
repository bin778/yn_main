'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { loadNaverMaps } from '@/app/components/contact/naverMapLoader';
import {
  getKakaoDirectionsUrl,
  getNaverDirectionsUrl,
  getNaverPlaceUrl,
  getTmapDirectionsUrl,
  getTmapPlatform,
  MAP_DIRECTION_ICONS,
  NAVER_MAP_CLIENT_ID,
  type OfficeMapLocation,
  type TmapPlatform,
} from '@/app/constants/contactContent';

type NaverMapProps = {
  location: OfficeMapLocation;
  title: string;
  className?: string;
};

const MAP_HEIGHT_MOBILE = 300;
const MAP_HEIGHT_DESKTOP = 450;
const DESKTOP_QUERY = '(min-width: 1024px)';
const DIRECTION_ICON_SIZE = 20;

type DirectionAction = {
  href: string;
  label: string;
  ariaLabel: string;
  iconSrc: string;
  targetBlank?: boolean;
};

function getMapHeight() {
  return window.matchMedia(DESKTOP_QUERY).matches ? MAP_HEIGHT_DESKTOP : MAP_HEIGHT_MOBILE;
}

function openNaverPlace(placeUrl: string) {
  window.open(placeUrl, '_blank', 'noopener,noreferrer');
}

function buildInfoWindowContent(title: string, placeUrl: string): string {
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const safeUrl = placeUrl.replace(/"/g, '&quot;');
  return [
    '<div style="padding:8px 12px;font-size:13px;line-height:1.4;color:#121212;white-space:nowrap;">',
    `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:none;display:block;">`,
    `<strong>${safeTitle}</strong>`,
    '<div style="margin-top:4px;color:#023373;font-size:12px;">네이버 지도에서 보기</div>',
    '</a>',
    '</div>',
  ].join('');
}

function MapLoadError({ className }: { className?: string }) {
  return (
    <div
      className={`flex min-h-[280px] w-full min-w-0 items-center justify-center rounded border border-[#e5e5e5] bg-[#f8f8f8] text-sm text-[#666] lg:min-h-[450px] ${className ?? ''}`}
      role="status"
    >
      지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
    </div>
  );
}

const emptySubscribe = () => () => undefined;

function useTmapPlatform(): TmapPlatform | null {
  return useSyncExternalStore(
    emptySubscribe,
    () => getTmapPlatform(navigator.userAgent),
    () => null,
  );
}

export default function NaverMap({ location, title, className }: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const tmapPlatform = useTmapPlatform();
  const hasClientId = NAVER_MAP_CLIENT_ID !== '';
  const placeUrl = getNaverPlaceUrl(location.naverPlaceId);

  const directionActions: DirectionAction[] = [
    {
      href: getNaverDirectionsUrl(location),
      label: '네이버',
      ariaLabel: '네이버 길찾기',
      iconSrc: MAP_DIRECTION_ICONS.naver,
      targetBlank: true,
    },
    {
      href: getKakaoDirectionsUrl(location),
      label: '카카오',
      ariaLabel: '카카오 길찾기',
      iconSrc: MAP_DIRECTION_ICONS.kakao,
      targetBlank: true,
    },
    ...(tmapPlatform
      ? [
          {
            href: getTmapDirectionsUrl(location, tmapPlatform),
            label: '티맵',
            ariaLabel: '티맵 길찾기',
            iconSrc: MAP_DIRECTION_ICONS.tmap,
          } satisfies DirectionAction,
        ]
      : []),
  ];

  useEffect(() => {
    if (!hasClientId) return;

    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let mapInstance: { setSize: (size: unknown) => void; destroy?: () => void } | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const initMap = async () => {
      try {
        const naver = await loadNaverMaps(NAVER_MAP_CLIENT_ID);
        if (cancelled || !containerRef.current) return;

        const height = getMapHeight();
        containerRef.current.style.height = `${height}px`;

        const center = new naver.maps.LatLng(location.lat, location.lng);
        mapInstance = new naver.maps.Map(containerRef.current, {
          center,
          zoom: location.zoom,
          zoomControl: true,
          zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
        });

        const marker = new naver.maps.Marker({
          position: center,
          map: mapInstance,
          title,
          cursor: 'pointer',
        });

        const infoWindow = new naver.maps.InfoWindow({
          content: buildInfoWindowContent(title, placeUrl),
          borderWidth: 0,
          backgroundColor: '#fff',
          disableAnchor: false,
          pixelOffset: new naver.maps.Point(0, -4),
        });
        infoWindow.open(mapInstance, marker);

        naver.maps.Event.addListener(marker, 'click', () => openNaverPlace(placeUrl));

        resizeObserver = new ResizeObserver(entries => {
          const entry = entries[0];
          if (!entry || !mapInstance) return;
          const width = Math.round(entry.contentRect.width);
          if (width <= 0) return;
          mapInstance.setSize(new naver.maps.Size(width, getMapHeight()));
        });
        resizeObserver.observe(containerRef.current);
      } catch (error) {
        console.error('네이버 지도를 불러오지 못했습니다.', error);
        if (!cancelled) setLoadError(true);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapInstance?.destroy?.();
    };
  }, [hasClientId, location.lat, location.lng, location.zoom, placeUrl, title]);

  if (!hasClientId || loadError) {
    return <MapLoadError className={className} />;
  }

  return (
    <div className={`relative z-0 isolate w-full min-w-0 max-w-full overflow-hidden ${className ?? ''}`}>
      <div
        ref={containerRef}
        className="relative z-0 mx-auto w-full max-w-full min-h-[280px] overflow-hidden lg:min-h-[450px]"
        role="img"
        aria-label={`${title} 위치 지도. 마커를 클릭하면 네이버 지도에서 열립니다.`}
      />
      <div className="relative z-0 mt-3 flex flex-wrap gap-2">
        {directionActions.map(action => (
          <a
            key={action.label}
            href={action.href}
            aria-label={action.ariaLabel}
            {...(action.targetBlank ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="inline-flex cursor-pointer items-center justify-center gap-1 md:gap-1.5 rounded-[3px] bg-[#023373] px-2 py-2 text-[13px] font-bold text-white shadow-[0_12px_30px_rgba(2,51,115,0.28)] transition-opacity hover:opacity-80 md:gap-2 md:px-5 md:py-3 md:text-base"
          >
            <Image
              src={action.iconSrc}
              alt=""
              width={DIRECTION_ICON_SIZE}
              height={DIRECTION_ICON_SIZE}
              className="h-4 w-4 object-contain md:h-5 md:w-5"
            />
            {action.label} 길찾기
          </a>
        ))}
      </div>
    </div>
  );
}
