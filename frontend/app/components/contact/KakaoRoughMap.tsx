'use client';

import { useEffect, useRef, useState } from 'react';

import type { KakaoMapEmbed } from '@/app/constants/contactContent';

import { loadKakaoRoughmapLander } from '@/app/components/contact/kakaoRoughmapLoader';

declare global {
  interface Window {
    daum?: {
      roughmap: {
        phase?: string;
        cdn?: string;
        URL_KEY_DATA_LOAD_PRE?: string;
        url_protocal?: string;
        url_cdn_domain?: string;
        Lander: new (options: { timestamp: string; key: string; mapHeight: number | string; mapWidth?: string }) => {
          render: () => void;
        };
      };
    };
  }
}

type KakaoRoughMapProps = {
  embed: KakaoMapEmbed;
  className?: string;
};

/** Kakao roughmap injects `.address` / `.phone` with `.tit`(주소·전화) and `.txt` values. */
const KAKAO_MAP_CONTACT_INFO_CLASSES =
  '[&_.address_.tit]:!text-[12px] md:[&_.address_.tit]:!text-[14px] ' +
  '[&_.address_.txt]:!text-[12px] md:[&_.address_.txt]:!text-[14px] ' +
  '[&_.phone_.tit]:!text-[12px] md:[&_.phone_.tit]:!text-[14px] ' +
  '[&_.phone_.txt]:!text-[12px] md:[&_.phone_.txt]:!text-[14px]';

function KakaoRoughMapInner({ embed, className }: KakaoRoughMapProps) {
  const containerId = `daumRoughmapContainer${embed.timestamp}`;
  const renderedRef = useRef(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    renderedRef.current = false;
    let cancelled = false;

    const renderMap = async () => {
      try {
        await loadKakaoRoughmapLander();
        if (cancelled || renderedRef.current) return;

        const container = document.getElementById(containerId);
        const Lander = window.daum?.roughmap?.Lander;
        if (!container || typeof Lander !== 'function') {
          setLoadError(true);
          return;
        }

        renderedRef.current = true;
        const mapHeight = window.matchMedia('(min-width: 1024px)').matches ? 450 : 300;
        new Lander({
          timestamp: embed.timestamp,
          key: embed.key,
          mapHeight,
        }).render();
      } catch {
        if (!cancelled) setLoadError(true);
      }
    };

    renderMap();

    return () => {
      cancelled = true;
    };
  }, [embed.timestamp, embed.key, containerId]);

  if (loadError) {
    return (
      <div
        className={`flex min-h-[280px] w-full min-w-0 items-center justify-center rounded border border-[#e5e5e5] bg-[#f8f8f8] text-sm text-[#666] lg:min-h-[450px] ${className ?? ''}`}
        role="status"
      >
        지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  return (
    <div className={`w-full min-w-0 max-w-full overflow-hidden ${className ?? ''}`}>
      <div
        id={containerId}
        className={`root_daum_roughmap root_daum_roughmap_landing mx-auto w-full max-w-full min-h-[280px] lg:min-h-[450px] [&_iframe]:max-w-full ${KAKAO_MAP_CONTACT_INFO_CLASSES}`}
      />
    </div>
  );
}

export default function KakaoRoughMap({ embed, className }: KakaoRoughMapProps) {
  return <KakaoRoughMapInner key={`${embed.timestamp}-${embed.key}`} embed={embed} className={className} />;
}
