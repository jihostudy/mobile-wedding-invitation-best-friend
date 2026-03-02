import { z } from 'zod';
import {
  normalizePageSectionOrder,
  normalizePageSectionVisibility,
} from '@/lib/wedding-content/section-order';
import type { WeddingContentV1 } from '@/types';

const personSchema = z.object({
  name: z.string(),
  englishName: z.string().optional(),
  parents: z
    .object({
      father: z.string().optional(),
      mother: z.string().optional(),
      fatherContact: z.string().optional(),
      motherContact: z.string().optional(),
    })
    .optional(),
  contact: z.string().optional(),
  instagram: z.string().optional(),
});

const fallbackHeroImage = {
  url: '/images/placeholder-couple.svg',
  alt: '웨딩 메인 이미지',
};

const heroImageSchema = z.object({
  url: z.string(),
  alt: z.string(),
});

const heroSectionSchema = z
  .object({
    // Legacy field for backward compatibility with previously saved payloads.
    mainImage: heroImageSchema.optional(),
    primaryImage: heroImageSchema.optional(),
    secondaryImage: heroImageSchema.optional(),
    titleText: z.string().optional(),
  })
  .transform((hero) => {
    const primaryImage = hero.primaryImage ?? hero.mainImage ?? fallbackHeroImage;
    const secondaryImage = hero.secondaryImage ?? hero.mainImage ?? primaryImage;
    return {
      primaryImage,
      secondaryImage,
      titleText: hero.titleText ?? '결혼합니다',
    };
  });

const invitationSectionSchema = z
  .object({
    kicker: z.string().optional(),
    title: z.string().optional(),
    message: z.string(),
  })
  .transform((section) => ({
    kicker: section.kicker ?? 'INVITATION',
    title: section.title ?? '소중한 분들을 초대합니다',
    message: section.message,
  }));

function getGivenName(name: string) {
  return name.length > 1 ? name.slice(1) : name;
}

function encodeNavigationValue(value: string) {
  return encodeURIComponent(value);
}

function buildDefaultNavigationApps(
  venueName: string,
  lat: number,
  lng: number,
) {
  const encodedName = encodeNavigationValue(venueName);

  return [
    {
      id: 'naver' as const,
      label: '네이버지도',
      enabled: true,
      deepLink: `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encodedName}&appname=com.wedding.invitation`,
      webUrl: `https://map.naver.com/v5/directions/-/${lng},${lat},${encodedName}/-/transit`,
    },
    {
      id: 'tmap' as const,
      label: '티맵',
      enabled: true,
      deepLink: `tmap://route?goalx=${lng}&goaly=${lat}&goalname=${encodedName}`,
      webUrl: `https://m.tmap.co.kr/tmap2/mobile/route.jsp?goalx=${lng}&goaly=${lat}&goalname=${encodedName}`,
    },
    {
      id: 'kakao' as const,
      label: '카카오내비',
      enabled: true,
      deepLink: `kakaonavi://navigate?name=${encodedName}&x=${lng}&y=${lat}`,
      webUrl: `https://map.kakao.com/link/to/${encodedName},${lat},${lng}`,
    },
  ];
}

const calendarSectionSchema = z
  .object({
    countdownLabel: z.string().optional(),
    countdownPrefix: z.string().optional(),
    countdownSuffix: z.string().optional(),
  })
  .optional();

const guestbookSectionSchema = z
  .object({
    kicker: z.string().optional(),
    title: z.string().optional(),
  })
  .transform((section) => ({
    kicker: section.kicker ?? 'GUESTBOOK',
    title: section.title ?? '방명록',
  }));

const rsvpSectionSchema = z
  .object({
    kicker: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
  })
  .transform((section) => ({
    kicker: section.kicker ?? 'R.S.V.P.',
    title: section.title ?? '참석 의사 전달',
    description: section.description ?? '신랑, 신부에게 참석의사를\n미리 전달할 수 있어요.',
  }));

const gallerySectionSchema = z
  .object({
    kicker: z.string().optional(),
    title: z.string().optional(),
    batchSize: z.number().optional(),
    images: z.array(
      z.object({
        id: z.string(),
        url: z.string(),
        alt: z.string(),
        width: z.number(),
        height: z.number(),
      }),
    ),
  })
  .transform((section) => ({
    // Keep gallery paging predictable: at least 2 and always even.
    batchSize: Math.max(2, Math.floor((section.batchSize ?? 6) / 2) * 2),
    kicker: section.kicker ?? 'GALLERY',
    title: section.title ?? '웨딩 갤러리',
    images: section.images,
  }));

const interviewAnswerSchema = z.object({
  side: z.enum(['groom', 'bride']),
  content: z.string(),
});

const interviewLegacyAnswerSchema = z.object({
  side: z.enum(['groom', 'bride']).optional(),
  role: z.string().optional(),
  name: z.string().optional(),
  content: z.string().optional(),
  paragraphs: z.array(z.string()).optional(),
});

function inferInterviewSide(
  answer: z.infer<typeof interviewLegacyAnswerSchema>,
  index: number,
): 'groom' | 'bride' {
  if (answer.side) return answer.side;
  if (answer.role?.includes('신부')) return 'bride';
  if (answer.role?.includes('신랑')) return 'groom';
  return index === 0 ? 'groom' : 'bride';
}

function normalizeInterviewAnswerContent(
  answer: z.infer<typeof interviewLegacyAnswerSchema>,
): string {
  if (typeof answer.content === 'string') return answer.content;
  if (Array.isArray(answer.paragraphs)) {
    return answer.paragraphs.filter((paragraph) => paragraph.trim().length > 0).join('\n\n');
  }
  return '';
}

const interviewQuestionSchema = z
  .object({
    question: z.string(),
    answers: z.array(z.union([interviewAnswerSchema, interviewLegacyAnswerSchema])),
  })
  .transform((question) => {
    const normalizedBySide = new Map<'groom' | 'bride', string>();
    question.answers.forEach((answer, index) => {
      const side = inferInterviewSide(answer, index);
      if (normalizedBySide.has(side)) return;
      normalizedBySide.set(side, normalizeInterviewAnswerContent(answer));
    });

    return {
      question: question.question,
      answers: [
        { side: 'groom' as const, content: normalizedBySide.get('groom') ?? '' },
        { side: 'bride' as const, content: normalizedBySide.get('bride') ?? '' },
      ],
    };
  });

const interviewSectionSchema = z
  .object({
    kicker: z.string().optional(),
    title: z.string().optional(),
    description: z.string(),
    image: z.object({ url: z.string(), alt: z.string() }),
    questions: z.array(interviewQuestionSchema),
  })
  .transform((section) => ({
    kicker: section.kicker ?? 'INTERVIEW',
    title: section.title ?? '우리 두 사람의 이야기',
    description: section.description,
    image: section.image,
    questions: section.questions,
  }));

const weddingContentSchema = z
  .object({
    weddingData: z.object({
    groom: personSchema,
    bride: personSchema,
    date: z.object({
      year: z.number(),
      month: z.number(),
      day: z.number(),
      dayOfWeek: z.string(),
      time: z.string(),
    }),
    venue: z
      .object({
        name: z.string(),
        address: z.string(),
        floor: z.string().optional(),
        hall: z.string().optional(),
        contact: z.string().optional(),
        coordinates: z.object({ lat: z.number(), lng: z.number() }),
        parking: z.string().optional(),
        transport: z
          .object({
            navigation: z
              .object({
                description: z.string().optional(),
                apps: z
                  .array(
                    z.object({
                      id: z.enum(['naver', 'tmap', 'kakao']),
                      label: z.string(),
                      enabled: z.boolean(),
                      deepLink: z.string(),
                      webUrl: z.string(),
                    }),
                  )
                  .optional(),
              })
              .optional(),
            subway: z.array(z.string()).optional(),
            subwayDetails: z.array(z.object({ label: z.string(), color: z.string() })).optional(),
            busDetails: z.array(z.object({ label: z.string(), color: z.string() })).optional(),
            bus: z.array(z.string()).optional(),
            busNote: z.string().optional(),
            parking: z.string().optional(),
            shuttlePickup: z.string().optional(),
          })
          .optional(),
      })
      .transform((venue) => {
        if (!venue.transport) {
          return venue;
        }

        const defaultApps = buildDefaultNavigationApps(
          venue.name,
          venue.coordinates.lat,
          venue.coordinates.lng,
        );
        const apps = venue.transport.navigation?.apps?.length
          ? venue.transport.navigation.apps
          : defaultApps;

        return {
          ...venue,
          transport: {
            ...venue.transport,
            navigation: {
              description:
                venue.transport.navigation?.description ??
                '원하시는 앱을 선택하시면 길안내가 시작됩니다.',
              apps,
            },
          },
        };
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
    heroSection: heroSectionSchema,
    invitationSection: invitationSectionSchema,
    calendarSection: calendarSectionSchema,
    gallerySection: gallerySectionSchema,
    interviewSection: interviewSectionSchema,
    guestbookSection: guestbookSectionSchema,
    rsvpSection: rsvpSectionSchema,
    accountSection: z.object({
      kicker: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      groups: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          accounts: z.array(
            z.object({
              bank: z.string(),
              account: z.string(),
            }),
          ),
        }),
      ),
    }).transform((section) => ({
      kicker: section.kicker ?? 'ACCOUNT',
      title: section.title ?? '마음 전하실 곳',
      description:
        section.description ??
        '참석이 어려우신 분들을 위해\n계좌번호를 기재하였습니다.\n너그러운 마음으로 양해 부탁드립니다.',
      groups: section.groups,
    })),
    snapSection: z.object({
      kicker: z.string().optional(),
      title: z.string().optional(),
      description: z.string(),
      uploadOpenAt: z.string().optional(),
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
    }).transform((section) => ({
      kicker: section.kicker ?? 'CAPTURE OUR MOMENTS',
      title: section.title ?? '스냅',
      description: section.description,
      uploadOpenAt: section.uploadOpenAt ?? '2026-06-20T11:30:00+09:00',
      images: section.images,
      modal: section.modal,
    })),
    closingSection: z
      .object({
        image: z.object({ url: z.string(), alt: z.string() }).optional(),
      })
      .optional()
      .transform((section) => ({
        image: section?.image ?? {
          url: '/images/placeholder-couple.svg',
          alt: '감사 인사 이미지',
        },
      })),
    pageSectionOrder: z.array(z.string()).optional(),
    pageSectionVisibility: z.unknown().optional(),
    floatingNavItems: z.array(z.object({ id: z.string(), label: z.string() })),
  })
  .passthrough()
  .transform((content) => ({
    ...content,
    calendarSection: {
      countdownLabel:
        content.calendarSection?.countdownLabel ??
        content.calendarSection?.countdownPrefix ??
        `${getGivenName(content.weddingData.groom.name)}❤️${getGivenName(content.weddingData.bride.name)}의 결혼식`,
    },
    pageSectionOrder: normalizePageSectionOrder(content.pageSectionOrder),
    pageSectionVisibility: normalizePageSectionVisibility(content.pageSectionVisibility),
  }));

export function parseWeddingContent(input: unknown): WeddingContentV1 {
  return weddingContentSchema.parse(input) as WeddingContentV1;
}
