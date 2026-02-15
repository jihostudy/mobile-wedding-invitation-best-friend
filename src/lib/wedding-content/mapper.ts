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
    sampleGuestbookMessages: content.sampleGuestbookMessages.map((message) => ({
      ...message,
      createdAt:
        typeof message.createdAt === 'string'
          ? new Date(message.createdAt)
          : message.createdAt,
    })),
  };
}
