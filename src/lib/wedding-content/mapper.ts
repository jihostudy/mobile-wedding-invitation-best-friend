import type { WeddingContentV1 } from '@/types';

export function toViewWeddingContent(content: WeddingContentV1): WeddingContentV1 {
  const fullDate = content.weddingData.date.fullDate;
  const convertedDate = typeof fullDate === 'string' ? new Date(fullDate) : fullDate;

  return {
    ...content,
    weddingData: {
      ...content.weddingData,
      date: {
        ...content.weddingData.date,
        fullDate: convertedDate,
      },
    },
  };
}
