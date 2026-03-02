import type { WeddingContentV1 } from "@/types";

export interface KakaoShareLink {
  mobileWebUrl: string;
  webUrl: string;
}

export interface KakaoShareFeedContent {
  title: string;
  description: string;
  imageUrl: string;
  link: KakaoShareLink;
}

export interface KakaoShareButton {
  title: string;
  link: KakaoShareLink;
}

export interface KakaoShareFeedPayload {
  objectType: "feed";
  content: KakaoShareFeedContent;
  buttons: KakaoShareButton[];
}

export interface KakaoSdk {
  init: (appKey: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (payload: KakaoShareFeedPayload) => void;
    sendScrap: (payload: { requestUrl: string }) => void;
    sendCustom: (payload: {
      templateId: number;
      templateArgs?: Record<string, string>;
    }) => void;
  };
}

function toAbsoluteUrl(url: string, origin: string) {
  try {
    return new URL(url, origin).toString();
  } catch {
    return `${origin.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
  }
}

function buildFallbackDescription(content: WeddingContentV1) {
  const date = content.weddingData.date;
  const venue = content.weddingData.venue;
  const venueSuffix = [venue.floor, venue.hall].filter(Boolean).join(" ");
  const venueLine = `${venue.name}${venueSuffix ? ` ${venueSuffix}` : ""}`;
  return `${date.year}년 ${date.month}월 ${date.day}일 (${date.dayOfWeek}) ${date.time}\n${venueLine}`;
}

export function buildKakaoSharePayload(params: {
  content: WeddingContentV1;
  origin: string;
  url: string;
  buttonTitle?: string;
}): KakaoShareFeedPayload {
  const groomName = params.content.weddingData.groom.name;
  const brideName = params.content.weddingData.bride.name;
  const title =
    params.content.kakaoShareCard?.title?.trim() ||
    `${groomName} ❤️ ${brideName} 결혼합니다`;
  const description =
    params.content.kakaoShareCard?.description?.trim() ||
    buildFallbackDescription(params.content);
  const imageUrl = toAbsoluteUrl(
    params.content.kakaoShareCard?.imageUrl?.trim() ||
      params.content.heroSection.primaryImage.url,
    params.origin,
  );
  const link: KakaoShareLink = {
    mobileWebUrl: params.url,
    webUrl: params.url,
  };
  const buttonTitle =
    params.buttonTitle?.trim() ||
    params.content.kakaoShareCard?.buttonTitle?.trim() ||
    "모바일 청첩장 보기";

  return {
    objectType: "feed",
    content: {
      title,
      description,
      imageUrl,
      link,
    },
    buttons: [
      {
        title: buttonTitle,
        link,
      },
    ],
  };
}

export function ensureKakaoInitialized(params: {
  kakao: KakaoSdk;
  appKey?: string;
}) {
  const appKey = params.appKey?.trim() ?? "";
  if (!appKey) {
    return {
      ok: false as const,
      reason: "카카오 JavaScript 키가 설정되지 않았습니다.",
    };
  }

  try {
    if (!params.kakao.isInitialized()) {
      params.kakao.init(appKey);
    }
    return { ok: true as const };
  } catch (error) {
    console.error("Failed to initialize Kakao SDK:", error);
    return {
      ok: false as const,
      reason: "카카오 SDK 초기화에 실패했습니다.",
    };
  }
}

export function buildKakaoShareTemplateArgs(params: {
  content: WeddingContentV1;
  origin: string;
  url: string;
}) {
  const payload = buildKakaoSharePayload({
    content: params.content,
    origin: params.origin,
    url: params.url,
  });

  return {
    TITLE: payload.content.title,
    DESCRIPTION: payload.content.description,
    IMAGE_URL: payload.content.imageUrl,
    BUTTON_TITLE: payload.buttons[0]?.title ?? "모바일 청첩장 보기",
    WEB_URL: payload.content.link.webUrl,
    MOBILE_WEB_URL: payload.content.link.mobileWebUrl,
  } satisfies Record<string, string>;
}
