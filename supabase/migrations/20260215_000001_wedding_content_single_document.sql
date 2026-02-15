-- PLAN.md 기준: 단일 JSON 문서 + 서버 1회 조회
-- - wedding_content (slug='main' 1row)
-- - admin_audit_logs
-- - guest_messages(is_public) 호환 보강
-- - 초기 content seed upsert

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.wedding_content (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  content jsonb not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wedding_content_slug on public.wedding_content(slug);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  target text not null,
  target_id text,
  actor text,
  actor_ip inet,
  user_agent text,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_logs_created_at
  on public.admin_audit_logs(created_at desc);

create index if not exists idx_admin_audit_logs_action_target
  on public.admin_audit_logs(action, target);

create table if not exists public.guest_messages (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  message text not null,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  attend_status text not null check (attend_status in ('available', 'unavailable')),
  side text not null check (side in ('groom', 'bride')),
  name text not null,
  contact text not null,
  extra_count integer not null default 0 check (extra_count >= 0 and extra_count <= 20),
  eat_meal boolean not null default true,
  ride_bus boolean not null default true,
  note text not null default '',
  agree_privacy boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_rsvp_responses_created_at
  on public.rsvp_responses(created_at desc);

create index if not exists idx_rsvp_responses_side_status
  on public.rsvp_responses(side, attend_status);

create table if not exists public.snap_upload_submissions (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null default 'main',
  uploader_name text not null,
  status text not null default 'uploaded' check (status in ('uploaded', 'rejected', 'approved')),
  created_at timestamptz not null default now()
);

create index if not exists idx_snap_upload_submissions_event_created_at
  on public.snap_upload_submissions(event_slug, created_at desc);

create table if not exists public.snap_upload_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.snap_upload_submissions(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  public_url text,
  original_name text not null,
  mime_type text,
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_snap_upload_files_submission_id
  on public.snap_upload_files(submission_id);

create unique index if not exists uq_snap_upload_files_bucket_path
  on public.snap_upload_files(storage_bucket, storage_path);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'snap-uploads',
  'snap-uploads',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- trigger 연결 (중복 생성 방지)
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_wedding_content_updated_at'
  ) then
    create trigger trg_wedding_content_updated_at
    before update on public.wedding_content
    for each row
    execute function public.set_updated_at();
  end if;
end
$$;

-- guest_messages 호환 보강 (구 스키마 대응)
alter table public.guest_messages
  add column if not exists is_public boolean default true;

-- is_private 컬럼이 있으면 반영 (is_public = not is_private)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guest_messages'
      and column_name = 'is_private'
  ) then
    execute '
      update public.guest_messages
      set is_public = not coalesce(is_private, false)
      where is_public is null
    ';
  end if;
end
$$;

alter table public.guest_messages
  alter column is_public set default true;

update public.guest_messages
set is_public = true
where is_public is null;

alter table public.guest_messages
  alter column is_public set not null;

create index if not exists idx_guest_messages_public_created_at
  on public.guest_messages(is_public, created_at desc);

-- RLS
alter table public.wedding_content enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.guest_messages enable row level security;
alter table public.rsvp_responses enable row level security;
alter table public.snap_upload_submissions enable row level security;
alter table public.snap_upload_files enable row level security;

-- wedding_content 정책
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'wedding_content'
      and policyname = 'Public read wedding content'
  ) then
    create policy "Public read wedding content"
      on public.wedding_content
      for select
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'wedding_content'
      and policyname = 'Service role manage wedding content'
  ) then
    create policy "Service role manage wedding content"
      on public.wedding_content
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end
$$;

-- admin_audit_logs 정책
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_audit_logs'
      and policyname = 'Service role manage admin audit logs'
  ) then
    create policy "Service role manage admin audit logs"
      on public.admin_audit_logs
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end
$$;

-- guest_messages 정책 보강
-- public select: 공개 메시지만
-- public insert: 누구나 작성 가능
-- service role: 전체 관리 가능
do $$
begin
  -- 구 정책 정리 (과도한 공개 권한 제거)
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'guest_messages'
      and policyname = 'Public read access'
  ) then
    drop policy "Public read access" on public.guest_messages;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'guest_messages'
      and policyname = 'Public insert access'
  ) then
    drop policy "Public insert access" on public.guest_messages;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'guest_messages'
      and policyname = 'Delete messages'
  ) then
    drop policy "Delete messages" on public.guest_messages;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'guest_messages'
      and policyname = 'Delete own messages'
  ) then
    drop policy "Delete own messages" on public.guest_messages;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'guest_messages'
      and policyname = 'Public read public guest messages'
  ) then
    create policy "Public read public guest messages"
      on public.guest_messages
      for select
      using (is_public = true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'guest_messages'
      and policyname = 'Public insert guest messages'
  ) then
    create policy "Public insert guest messages"
      on public.guest_messages
      for insert
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'guest_messages'
      and policyname = 'Service role manage guest messages'
  ) then
    create policy "Service role manage guest messages"
      on public.guest_messages
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end
$$;

-- rsvp/snap 정책
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'rsvp_responses'
      and policyname = 'Public insert rsvp responses'
  ) then
    create policy "Public insert rsvp responses"
      on public.rsvp_responses
      for insert
      with check (agree_privacy = true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'rsvp_responses'
      and policyname = 'Service role manage rsvp responses'
  ) then
    create policy "Service role manage rsvp responses"
      on public.rsvp_responses
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'snap_upload_submissions'
      and policyname = 'Public insert snap upload submissions'
  ) then
    create policy "Public insert snap upload submissions"
      on public.snap_upload_submissions
      for insert
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'snap_upload_submissions'
      and policyname = 'Service role manage snap upload submissions'
  ) then
    create policy "Service role manage snap upload submissions"
      on public.snap_upload_submissions
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'snap_upload_files'
      and policyname = 'Public insert snap upload files'
  ) then
    create policy "Public insert snap upload files"
      on public.snap_upload_files
      for insert
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'snap_upload_files'
      and policyname = 'Service role manage snap upload files'
  ) then
    create policy "Service role manage snap upload files"
      on public.snap_upload_files
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end
$$;

-- storage.objects 정책 (snap-uploads 버킷)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public insert snap upload objects'
  ) then
    create policy "Public insert snap upload objects"
      on storage.objects
      for insert
      with check (bucket_id = 'snap-uploads');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Service role manage snap upload objects'
  ) then
    create policy "Service role manage snap upload objects"
      on storage.objects
      for all
      using (bucket_id = 'snap-uploads' and auth.role() = 'service_role')
      with check (bucket_id = 'snap-uploads' and auth.role() = 'service_role');
  end if;
end
$$;

-- 초기 콘텐츠 seed (slug='main')
insert into public.wedding_content (slug, content, version)
values (
  'main',
  $$
  {
    "weddingData": {
      "groom": {
        "name": "김동현",
        "englishName": "Kim Dong Hyun",
        "parents": {
          "father": "김○○",
          "mother": "○○○"
        },
        "contact": "010-0000-0000"
      },
      "bride": {
        "name": "강다연",
        "englishName": "Kang Da Yeon",
        "parents": {
          "father": "강○○",
          "mother": "○○○"
        },
        "contact": "010-0000-0000"
      },
      "date": {
        "year": 2026,
        "month": 6,
        "day": 20,
        "dayOfWeek": "토요일",
        "time": "낮 12시 30분",
        "fullDate": "2026-06-20T12:30:00+09:00"
      },
      "venue": {
        "name": "루클라비더화이트",
        "address": "서울 강남구 논현로 742",
        "floor": "2층, 4층",
        "coordinates": {
          "lat": 37.518468,
          "lng": 127.029789
        },
        "parking": "건물 지하 1~3층 무료 주차 가능",
        "transport": {
          "subway": [
            "신분당선 신사역 1번 출구 도보 15분",
            "7호선 학동역 8번 출구 도보 7분"
          ],
          "subwayDetails": [
            {
              "label": "신분당선 신사역 1번 출구 도보 15분",
              "color": "#D31145"
            },
            {
              "label": "7호선 학동역 8번 출구 도보 7분",
              "color": "#747F00"
            }
          ],
          "bus": [
            "간선버스: 146, 540, 4318",
            "지선버스: 3414, 4318"
          ],
          "parking": "건물 지하 1~3층 (3시간 무료)",
          "shuttlePickup": "학동역 8번 출구 앞 셔틀 탑승"
        }
      },
      "backgroundMusic": {
        "enabled": true,
        "src": "/audio/sound_test.mp3",
        "autoplay": false,
        "loop": true,
        "volume": 0.4,
        "title": "웨딩 배경음악"
      }
    },
    "heroSection": {
      "mainImage": {
        "url": "/images/placeholder-couple.svg",
        "alt": "김동현과 강다연의 결혼식"
      }
    },
    "invitationSection": {
      "message": "저희 두 사람의 작은 만남이\n사랑의 결실을 이루어\n소중한 결혼식을 올리게 되었습니다.\n\n평생 서로 귀하게 여기며\n첫 마음 그대로 존중하고 배려하며 살겠습니다.\n\n오로지 믿음과 사랑을 약속하는 날\n오셔서 축복해 주시면 더 없는 기쁨으로\n간직하겠습니다."
    },
    "gallerySection": {
      "images": [
        {"id":"1","url":"/images/placeholder-couple.svg","alt":"신랑신부 메인 사진","width":800,"height":1200},
        {"id":"2","url":"/images/placeholder-couple.svg","alt":"신랑신부 야외 사진","width":800,"height":1200},
        {"id":"3","url":"/images/placeholder-couple.svg","alt":"신랑신부 웨딩 사진","width":800,"height":1200},
        {"id":"4","url":"/images/placeholder-couple.svg","alt":"신랑신부 사진","width":800,"height":1200},
        {"id":"5","url":"/images/placeholder-couple.svg","alt":"신랑신부 사진","width":800,"height":1200},
        {"id":"6","url":"/images/placeholder-couple.svg","alt":"신랑신부 사진","width":800,"height":1200},
        {"id":"7","url":"/images/placeholder-couple.svg","alt":"신랑신부 사진","width":800,"height":1200},
        {"id":"8","url":"/images/placeholder-couple.svg","alt":"신랑신부 사진","width":800,"height":1200},
        {"id":"9","url":"/images/placeholder-couple.svg","alt":"신랑신부 사진","width":800,"height":1200}
      ]
    },
    "interviewSection": {
      "description": "결혼을 앞두고 저희 두 사람의\n인터뷰를 준비했습니다.",
      "image": {
        "url": "/images/placeholder-couple.svg",
        "alt": "신랑 신부 인터뷰 대표 사진"
      },
      "questions": [
        {
          "question": "Q1. 결혼을 앞둔 소감",
          "answers": [
            {
              "role": "신랑",
              "name": "김동현",
              "paragraphs": [
                "드디어 장가갑니다! 먼저 인생에서 가장 큰 결심을 할 수 있게 해준 예비 신부에게 정말 고맙습니다.",
                "가족이라는 단어를 함께 한다는 것은 정말 설레고 아름다운 일이지만 그만큼 책임감을 더 갖고 살아야겠다고 다짐했습니다.",
                "저희 부부가 한걸음 한걸음 성장해 나가는 모습을 지켜봐주시고 응원해주세요."
              ]
            },
            {
              "role": "신부",
              "name": "강다연",
              "paragraphs": [
                "오래된 연인에서 이제는 서로의 부부가 되기로 약속했습니다.",
                "아직은 남자친구라는 말이 더 익숙하지만, 그동안 제 옆을 든든하게 지켜주면서 큰 행복을 준 예비 신랑에게 고맙습니다.",
                "이제는 저의 평생의 반려자가 될 신랑에게 좋은 아내로서 더욱 배려하며 큰 힘이 되는 존재로 살겠습니다."
              ]
            }
          ]
        },
        {
          "question": "Q2. 앞으로의 우리",
          "answers": [
            {
              "role": "신랑",
              "name": "김동현",
              "paragraphs": [
                "서로의 다름을 존중하면서 같은 방향을 바라보는 부부가 되고 싶습니다.",
                "사소한 일상에서도 감사함을 잊지 않고, 웃음이 많은 가정을 만들어가겠습니다."
              ]
            },
            {
              "role": "신부",
              "name": "강다연",
              "paragraphs": [
                "서로에게 가장 편안한 쉼이 되는 사람이 되고 싶습니다.",
                "좋은 날도 어려운 날도 손을 놓지 않고, 함께 성장하는 부부로 살아가겠습니다."
              ]
            }
          ]
        }
      ]
    },
    "accountSection": {
      "groups": [
        {
          "id": "groom",
          "label": "신랑측",
          "accounts": [
            {"holder":"김동현","bank":"신한은행","account":"110-123-456789","kakaoPayLink":"https://pay.kakao.com"},
            {"holder":"김○○","bank":"우리은행","account":"110-000-000001"},
            {"holder":"○○○","bank":"국민은행","account":"110-000-000002"}
          ]
        },
        {
          "id": "bride",
          "label": "신부측",
          "accounts": [
            {"holder":"강다연","bank":"카카오뱅크","account":"3333-01-1234567","kakaoPayLink":"https://pay.kakao.com"},
            {"holder":"강○○","bank":"토스뱅크","account":"110-000-000004"},
            {"holder":"○○○","bank":"카카오뱅크","account":"110-000-000005"}
          ]
        }
      ]
    },
    "snapSection": {
      "description": "신랑신부의 행복한 순간을 담아주세요.\n예식 당일, 아래 버튼을 통해 사진을 올려주세요.\n많은 참여 부탁드려요!",
      "images": [
        {"id":"snap-1","url":"/images/placeholder-couple.svg","alt":"스냅 예시 사진 1","rotation":-16,"offsetX":-52},
        {"id":"snap-2","url":"/images/placeholder-couple.svg","alt":"스냅 예시 사진 2","rotation":-4,"offsetX":0},
        {"id":"snap-3","url":"/images/placeholder-couple.svg","alt":"스냅 예시 사진 3","rotation":10,"offsetX":50}
      ],
      "modal": {
        "backLabel": "청첩장 보기",
        "coverImage": {
          "url": "/images/placeholder-couple.svg",
          "alt": "스냅 업로드 커버 이미지"
        },
        "coverKicker": "스냅",
        "coverTitle": "예식 당일, 빛나는 순간을\n공유해 주세요!",
        "coverNames": "김진호 · 이나은",
        "guideTitle": "우리의 소중한 순간을 함께 담아주세요!",
        "guideLines": [
          "1. 설렘 가득한 신랑·신부의 모습",
          "2. 두 사람의 빛나는 입장 & 행진",
          "3. 가족, 친구들과 함께한 따뜻한 찰나",
          "4. 그리고 여러분의 시선에서 담은 순간들까지!"
        ],
        "guideHighlightLines": [
          "📸 가장 멋진 사진을 공유해주신 분께는 신랑·신부가 직접 준비한 맛있는 한 끼를 선물로 드립니다!",
          "✨ 예식 당일, 아래 사진 첨부하기 버튼을 눌러 사진을 업로드해주세요. 작은 순간 하나하나가 저희에게 큰 선물이 될 거예요.",
          "여러분의 많은 참여, 기다리고 있겠습니다❤️"
        ],
        "nameLabel": "이름",
        "namePlaceholder": "입력하신 이름으로 폴더가 생성됩니다.",
        "uploadEmptyHint": "예식 당일 촬영한 사진을 업로드해 주세요.",
        "attachButtonLabel": "사진 첨부하기",
        "maxFiles": 40,
        "policyLines": [
          "한 번에 최대 40장까지 업로드하실 수 있습니다.",
          "가능하면 여러 장을 한 번에 묶어서 업로드해 주세요.",
          "업로드 가능한 파일 크기는 사진 1장당 10MB 이하입니다.",
          "업로드는 예식 당일부터 다음날까지 가능합니다."
        ]
      }
    },
    "floatingNavItems": [
      {"id":"hero","label":"처음"},
      {"id":"interview","label":"인터뷰"},
      {"id":"gallery","label":"사진"},
      {"id":"calendar","label":"일정"},
      {"id":"location","label":"오시는 길"},
      {"id":"account","label":"계좌"},
      {"id":"guestbook","label":"방명록"}
    ],
    "sampleGuestbookMessages": [
      {"id":"sample-1","author":"해니","message":"🎀💘 결혼 너무 축하해요 💗💞🎉🎊 새로운 인생 시작 🔥 앞날이 행복으로 가득하길 바래요!!!!","createdAt":"2026-03-10T10:20:00+09:00","isPublic":true},
      {"id":"sample-2","author":"김현우","message":"🎉 진호님! 나은님! 드디어 현실판 로맨스 영화 개봉인가요?! 🎬 두 분, 진짜 천생연분이니까 행복만 하세요~ 쪽쪽쪽! 💖","createdAt":"2026-03-11T12:05:00+09:00","isPublic":true},
      {"id":"sample-3","author":"윤미","message":"이나은, 결혼 그거 나랑 하기로 했었잖아. 그래도 너의 행복을 위해 보내줄게~ 사랑하는 우리 나은 결혼 너무 너무 축하해!!!💖👰🏻🤵🏻💖","createdAt":"2026-03-12T09:35:00+09:00","isPublic":true},
      {"id":"sample-4","author":"유인","message":"진호형, 나은누나! 두 분의 결혼을 진심으로 축하드립니다💐 언제나 지금처럼 사랑 가득한 날들 보내세요!","createdAt":"2026-03-12T20:10:00+09:00","isPublic":true},
      {"id":"sample-5","author":"수지","message":"두 분의 미소가 너무 예뻐서 보는 사람도 행복해지는 커플이에요. 결혼 진심으로 축하해요!","createdAt":"2026-03-13T08:40:00+09:00","isPublic":true},
      {"id":"sample-6","author":"민호","message":"한 가정을 이루는 소중한 시작, 오늘의 마음 끝까지 간직하시길 바랍니다. 축하드립니다!","createdAt":"2026-03-13T14:22:00+09:00","isPublic":true},
      {"id":"sample-7","author":"지은","message":"나은아 너무 예쁘다! 진호오빠도 멋져요! 앞으로도 서로 아끼는 모습 오래오래 보여주세요 💕","createdAt":"2026-03-13T19:05:00+09:00","isPublic":true},
      {"id":"sample-8","author":"동현","message":"오랜 시간 함께 만든 신뢰와 사랑으로 더 단단한 부부가 되실 거라 믿어요. 정말 축하합니다!","createdAt":"2026-03-14T09:10:00+09:00","isPublic":true},
      {"id":"sample-9","author":"소라","message":"예쁜 날, 예쁜 두 사람! 웃는 날이 더 많고 평범한 일상도 특별하게 빛나길 바랄게요.","createdAt":"2026-03-14T13:33:00+09:00","isPublic":true},
      {"id":"sample-10","author":"태훈","message":"형 결혼 축하해요! 이제 형수님 말씀 잘 듣고, 더 행복한 모습 많이 보여주세요 😄","createdAt":"2026-03-14T18:52:00+09:00","isPublic":true},
      {"id":"sample-11","author":"가영","message":"두 분이 함께하는 모든 계절이 따뜻하고 다정하길 바랍니다. 진심으로 축하드려요!","createdAt":"2026-03-15T10:25:00+09:00","isPublic":true},
      {"id":"sample-12","author":"재현","message":"좋은 사람 옆에 더 좋은 사람이 선 오늘, 두 분의 앞날에 축복이 가득하길 기도합니다.","createdAt":"2026-03-15T15:46:00+09:00","isPublic":true},
      {"id":"sample-13","author":"은지","message":"결혼 정말 축하해요! 서로의 가장 든든한 편이 되어 오래오래 행복하게 지내세요 💐","createdAt":"2026-03-15T21:08:00+09:00","isPublic":true}
    ]
  }
  $$::jsonb,
  1
)
on conflict (slug) do update
set
  content = excluded.content,
  updated_at = now();

commit;
