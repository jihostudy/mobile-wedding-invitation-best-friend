"use client";

import Image from "next/image";
import type { NavigationApp, NavigationAppId } from "@/types";

interface LocationNavigationProps {
  description?: string;
  apps?: NavigationApp[];
}

const APP_ORDER: NavigationAppId[] = ["naver", "tmap", "kakao"];

const APP_ICON_MAP: Record<NavigationAppId, string> = {
  naver: "/icons/social/naver.png",
  tmap: "/icons/social/tmap.jpeg",
  kakao: "/icons/social/kakaonavi.png",
};

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent;
  return /Android|iPhone|iPad|iPod/i.test(userAgent);
}

function openExternalUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function buildNaverDirectionsUrl(app: NavigationApp) {
  if (app.webUrl.includes("/directions/")) {
    return app.webUrl;
  }
  if (!app.deepLink) {
    return app.webUrl;
  }

  const [, query = ""] = app.deepLink.split("?");
  const params = new URLSearchParams(query);
  const dlat = params.get("dlat");
  const dlng = params.get("dlng");
  const dname = params.get("dname");

  if (!dlat || !dlng || !dname) {
    return app.webUrl;
  }

  return `https://map.naver.com/v5/directions/-/${dlng},${dlat},${encodeURIComponent(
    dname,
  )}/-/transit`;
}

export default function LocationNavigation({
  description = "원하시는 앱을 선택하시면 길안내가 시작됩니다.",
  apps = [],
}: LocationNavigationProps) {
  const orderedApps = APP_ORDER.map((id) => apps.find((app) => app.id === id))
    .filter((app): app is NavigationApp => Boolean(app))
    .filter((app) => app.enabled);

  if (orderedApps.length === 0) {
    return null;
  }

  const handleNavigate = (app: NavigationApp) => {
    if (typeof window === "undefined") return;
    const fallbackUrl =
      app.id === "naver"
        ? buildNaverDirectionsUrl(app)
        : app.webUrl || app.deepLink;
    if (!fallbackUrl) return;

    if (app.id === "naver") {
      openExternalUrl(fallbackUrl);
      return;
    }

    if (!isMobileDevice() || !app.deepLink) {
      openExternalUrl(fallbackUrl);
      return;
    }

    const attemptedAt = Date.now();
    window.location.href = app.deepLink;

    window.setTimeout(() => {
      const elapsed = Date.now() - attemptedAt;
      if (!document.hidden && elapsed < 1800) {
        openExternalUrl(fallbackUrl);
      }
    }, 1200);
  };

  return (
    <section className="mx-8 mt-7 border-t border-gray-300/80 pt-8">
      <h4 className="text-base font-semibold text-wedding-gray">내비게이션</h4>
      <p className="mt-2 text-xs text-wedding-gray-light">{description}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {orderedApps.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => handleNavigate(app)}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#dedede] bg-white px-2 text-sm font-medium text-[#4e4e4e] transition hover:bg-[#f8f8f8]"
          >
            <Image src={APP_ICON_MAP[app.id]} alt="" width={18} height={18} />
            <span className="font-medium">{app.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
