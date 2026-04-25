"use client";

import Image from "next/image";
import { ensureKakaoInitialized, type KakaoSdk } from "@/lib/share/kakao";
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

const TMAP_ANDROID_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.skt.tmap.ku";
const TMAP_IOS_STORE_URL =
  "https://apps.apple.com/kr/app/%ED%8B%B0%EB%A7%B5-%EC%9E%A5%EC%86%8C%EC%B6%94%EC%B2%9C-%EC%A7%80%EB%8F%84-%EC%9A%B4%EC%A0%84%EC%A0%90%EC%88%98-%EB%8C%80%EC%A4%91%EA%B5%90%ED%86%B5-%EB%8C%80%EB%A6%AC/id431589174";

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent;
  return /Android|iPhone|iPad|iPod/i.test(userAgent);
}

function isIOSDevice() {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

function openExternalUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function navigateCurrentTab(url: string) {
  window.location.href = url;
}

function openDeepLink(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function getQueryValue(url: string, key: string) {
  const [, query = ""] = url.split("?");
  return new URLSearchParams(query).get(key);
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

function buildTmapRouteUrls(app: NavigationApp) {
  const goalx =
    getQueryValue(app.deepLink ?? "", "goalx") ||
    getQueryValue(app.webUrl ?? "", "goalx");
  const goaly =
    getQueryValue(app.deepLink ?? "", "goaly") ||
    getQueryValue(app.webUrl ?? "", "goaly");
  const goalname =
    getQueryValue(app.deepLink ?? "", "goalname") ||
    getQueryValue(app.webUrl ?? "", "goalname");

  if (!goalx || !goaly || !goalname) {
    return {
      deepLink: app.deepLink,
      fallbackUrl: isIOSDevice() ? TMAP_IOS_STORE_URL : TMAP_ANDROID_STORE_URL,
    };
  }

  const encodedName = encodeURIComponent(goalname);

  return {
    deepLink: `tmap://route?goalx=${goalx}&goaly=${goaly}&goalname=${encodedName}`,
    fallbackUrl: isIOSDevice() ? TMAP_IOS_STORE_URL : TMAP_ANDROID_STORE_URL,
  };
}

function buildKakaoNaviTarget(app: NavigationApp) {
  const x =
    getQueryValue(app.deepLink ?? "", "x") ||
    getQueryValue(app.webUrl ?? "", "x");
  const y =
    getQueryValue(app.deepLink ?? "", "y") ||
    getQueryValue(app.webUrl ?? "", "y");
  const name =
    getQueryValue(app.deepLink ?? "", "name") ||
    app.webUrl.split("/").at(-1)?.split(",")[0];
  const lng = Number(x);
  const lat = Number(y);

  if (!name || Number.isNaN(lng) || Number.isNaN(lat)) {
    return null;
  }

  return {
    name,
    x: lng,
    y: lat,
  };
}

function openTmapDeepLinkWithFallback(deepLink: string, fallbackUrl: string) {
  let didLeavePage = false;
  let timer = 0;

  const cleanup = () => {
    window.clearTimeout(timer);
    window.removeEventListener("pagehide", markPageLeave);
    window.removeEventListener("blur", markPageLeave);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };

  const markPageLeave = () => {
    didLeavePage = true;
    cleanup();
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      markPageLeave();
    }
  };

  window.addEventListener("pagehide", markPageLeave);
  window.addEventListener("blur", markPageLeave);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  timer = window.setTimeout(() => {
    cleanup();
    if (!didLeavePage && !document.hidden) {
      navigateCurrentTab(fallbackUrl);
    }
  }, 2500);

  openDeepLink(deepLink);
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

    if (app.id === "tmap") {
      const { deepLink, fallbackUrl: tmapFallbackUrl } = buildTmapRouteUrls(app);

      if (!isMobileDevice() || !deepLink) {
        if (tmapFallbackUrl) openExternalUrl(tmapFallbackUrl);
        return;
      }

      openTmapDeepLinkWithFallback(deepLink, tmapFallbackUrl);
      return;
    }

    if (app.id === "kakao") {
      const kakao = (window as Window & { Kakao?: KakaoSdk }).Kakao;
      const target = buildKakaoNaviTarget(app);

      if (!isMobileDevice() || !kakao?.Navi || !target) {
        openExternalUrl(fallbackUrl);
        return;
      }

      const initialized = ensureKakaoInitialized({
        kakao,
        appKey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY,
      });

      if (!initialized.ok) {
        openExternalUrl(fallbackUrl);
        return;
      }

      kakao.Navi.start({
        name: target.name,
        x: target.x,
        y: target.y,
        coordType: "wgs84",
      });
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
    <section className="px-9 mt-7  pt-8">
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
