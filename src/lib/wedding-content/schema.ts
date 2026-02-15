import { z } from 'zod';
import type { WeddingContentV1 } from '@/types';

const personSchema = z.object({
  name: z.string(),
  englishName: z.string().optional(),
  parents: z
    .object({
      father: z.string(),
      mother: z.string(),
      fatherContact: z.string().optional(),
      motherContact: z.string().optional(),
    })
    .optional(),
  contact: z.string().optional(),
  instagram: z.string().optional(),
});

const weddingContentSchema = z.object({
  weddingData: z.object({
    groom: personSchema,
    bride: personSchema,
    date: z.object({
      year: z.number(),
      month: z.number(),
      day: z.number(),
      dayOfWeek: z.string(),
      time: z.string(),
      fullDate: z.union([z.string(), z.date()]),
    }),
    venue: z.object({
      name: z.string(),
      address: z.string(),
      floor: z.string().optional(),
      hall: z.string().optional(),
      contact: z.string().optional(),
      coordinates: z.object({ lat: z.number(), lng: z.number() }),
      parking: z.string().optional(),
      transport: z
        .object({
          subway: z.array(z.string()).optional(),
          subwayDetails: z.array(z.object({ label: z.string(), color: z.string() })).optional(),
          bus: z.array(z.string()).optional(),
          busNote: z.string().optional(),
          parking: z.string().optional(),
          shuttlePickup: z.string().optional(),
        })
        .optional(),
    }),
    backgroundMusic: z
      .object({
        enabled: z.boolean(),
        src: z.string().optional(),
        volume: z.number().optional(),
        loop: z.boolean().optional(),
        autoplay: z.boolean().optional(),
        title: z.string().optional(),
      })
      .optional(),
  }),
  heroSection: z.object({
    mainImage: z.object({ url: z.string(), alt: z.string() }),
  }),
  invitationSection: z.object({
    message: z.string(),
  }),
  gallerySection: z.object({
    images: z.array(
      z.object({
        id: z.string(),
        url: z.string(),
        alt: z.string(),
        width: z.number(),
        height: z.number(),
      }),
    ),
  }),
  interviewSection: z.object({
    description: z.string(),
    image: z.object({ url: z.string(), alt: z.string() }),
    questions: z.array(
      z.object({
        question: z.string(),
        answers: z.array(
          z.object({
            role: z.string(),
            name: z.string(),
            paragraphs: z.array(z.string()),
          }),
        ),
      }),
    ),
  }),
  accountSection: z.object({
    groups: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        accounts: z.array(
          z.object({
            bank: z.string(),
            account: z.string(),
            holder: z.string(),
            label: z.string().optional(),
            kakaoPayLink: z.string().optional(),
          }),
        ),
      }),
    ),
  }),
  snapSection: z.object({
    description: z.string(),
    images: z.array(
      z.object({
        id: z.string(),
        url: z.string(),
        alt: z.string(),
        rotation: z.number(),
        offsetX: z.number(),
      }),
    ),
    modal: z.object({
      backLabel: z.string(),
      coverImage: z.object({ url: z.string(), alt: z.string() }),
      coverKicker: z.string(),
      coverTitle: z.string(),
      coverNames: z.string(),
      guideTitle: z.string(),
      guideLines: z.array(z.string()),
      guideHighlightLines: z.array(z.string()),
      nameLabel: z.string(),
      namePlaceholder: z.string(),
      uploadEmptyHint: z.string(),
      attachButtonLabel: z.string(),
      maxFiles: z.number(),
      policyLines: z.array(z.string()),
    }),
  }),
  floatingNavItems: z.array(z.object({ id: z.string(), label: z.string() })),
  sampleGuestbookMessages: z.array(
    z.object({
      id: z.string(),
      author: z.string(),
      message: z.string(),
      createdAt: z.union([z.string(), z.date()]),
      isPublic: z.boolean(),
    }),
  ),
});

export function parseWeddingContent(input: unknown): WeddingContentV1 {
  return weddingContentSchema.parse(input) as WeddingContentV1;
}
