import type { Metadata, Viewport } from "next";
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import HomePageClient from '@/components/Home/HomePageClient';
import { queryKeys } from '@/lib/queries/keys';
import { getWeddingContent } from '@/lib/wedding-content/repository';

function toAbsoluteImageUrl(imageUrl: string, siteUrl: string) {
  try {
    return new URL(imageUrl, siteUrl).toString();
  } catch {
    const normalizedSiteUrl = siteUrl.replace(/\/$/, "");
    const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
    return `${normalizedSiteUrl}${normalizedPath}`;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getWeddingContent("main");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const imageUrl = toAbsoluteImageUrl(content.kakaoShareCard.imageUrl, siteUrl);

  return {
    title: content.kakaoShareCard.title,
    description: content.kakaoShareCard.description,
    openGraph: {
      title: content.kakaoShareCard.title,
      description: content.kakaoShareCard.description,
      type: "website",
      url: siteUrl,
      locale: "ko_KR",
      images: [
        {
          url: imageUrl,
          alt: content.kakaoShareCard.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.kakaoShareCard.title,
      description: content.kakaoShareCard.description,
      images: [imageUrl],
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const content = await getWeddingContent("main");
  const disableZoom = Boolean(content.content.weddingData.display?.disableZoom);

  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: disableZoom ? 1 : 5,
    userScalable: !disableZoom,
    themeColor: "#F5F1E8",
  };
}

export default async function HomePage() {
  const queryClient = new QueryClient();
  const content = await getWeddingContent('main');
  queryClient.setQueryData(queryKeys.weddingContent('main'), content);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageClient />
    </HydrationBoundary>
  );
}
