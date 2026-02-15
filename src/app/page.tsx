import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import HomePageClient from '@/components/Home/HomePageClient';
import { queryKeys } from '@/lib/queries/keys';
import { getWeddingContent } from '@/lib/wedding-content/repository';

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
