"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

interface NaverMapProps {
  lat: number;
  lng: number;
  markerTitle: string;
  onError: () => void;
}

export default function NaverMap({
  lat,
  lng,
  markerTitle,
  onError,
}: NaverMapProps) {
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerRef = useRef<naver.maps.Marker | null>(null);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  useEffect(() => {
    if (window.naver?.maps) {
      setIsScriptReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isScriptReady || !mapElementRef.current || !window.naver?.maps) {
      return;
    }

    const position = new window.naver.maps.LatLng(lat, lng);
    mapRef.current = new window.naver.maps.Map(mapElementRef.current, {
      center: position,
      zoom: 16,
      zoomControl: false,
    });

    markerRef.current = new window.naver.maps.Marker({
      position,
      map: mapRef.current,
      title: markerTitle,
    });

    const escapedTitle = markerTitle
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

    infoWindowRef.current = new window.naver.maps.InfoWindow({
      content: `<div style="margin-bottom:10px;padding:12px 20px;border-radius:6px;background:rgba(255,255,255);color:#2f2f2f;font-size:12px;line-height:1.2;font-weight:700;white-space:nowrap;">${escapedTitle}</div>`,
      disableAnchor: true,
      borderWidth: 0,
      backgroundColor: "transparent",
    });
    infoWindowRef.current.open(mapRef.current, markerRef.current);

    return () => {
      infoWindowRef.current?.close();
      infoWindowRef.current = null;
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [isScriptReady, lat, lng, markerTitle]);

  if (!clientId) {
    return null;
  }

  return (
    <div className="relative">
      {!isScriptReady && (
        <div
          className="h-[280px] animate-pulse bg-wedding-beige/60 sm:h-[320px]"
          aria-label="네이버 지도 로딩 중"
        />
      )}
      <div
        ref={mapElementRef}
        className={`h-[280px] sm:h-[320px] ${isScriptReady ? "block" : "hidden"}`}
        aria-label="예식장 위치 지도"
      />
      <Script
        id="naver-map-script"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`}
        strategy="afterInteractive"
        onLoad={() => setIsScriptReady(true)}
        onError={onError}
      />
    </div>
  );
}
