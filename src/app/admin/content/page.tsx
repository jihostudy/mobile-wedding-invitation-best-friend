"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import AdminSummaryCards from "@/components/Admin/AdminSummaryCards";
import useToast from "@/components/common/toast/useToast";
import {
  useAdminWeddingContentQuery,
  useUpdateWeddingContentMutation,
  useUploadWeddingContentAssetMutation,
} from "@/lib/queries/wedding-content";
import { useAdminGuestMessagesQuery } from "@/lib/queries/admin-guest-messages";
import { useAdminRsvpResponsesQuery } from "@/lib/queries/rsvp";
import { useAdminSnapSubmissionsQuery } from "@/lib/queries/snap";
import type { WeddingContentV1 } from "@/types";

type PathSegment = string | number;
type Indexable = Record<string | number, unknown>;
const MAX_ASSET_UPLOAD_SIZE_BYTES = 4 * 1024 * 1024;
const GALLERY_IMAGE_ALT = "신랑신부 사진";
const SNAP_COVER_IMAGE_ALT = "스냅 업로드 커버 이미지";

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function isIndexable(value: unknown): value is Indexable {
  return typeof value === "object" && value !== null;
}

function getValueAtPath(obj: unknown, path: PathSegment[]) {
  let cursor: unknown = obj;
  for (const key of path) {
    if (!isIndexable(cursor)) return undefined;
    cursor = cursor[key];
  }
  return cursor;
}

function setValueAtPath<T>(obj: T, path: PathSegment[], value: unknown): T {
  const next = deepClone(obj);
  if (path.length === 0) return next;

  let cursor: unknown = next;
  for (let index = 0; index < path.length - 1; index += 1) {
    if (!isIndexable(cursor)) return next;
    cursor = cursor[path[index]];
  }
  if (!isIndexable(cursor)) return next;

  const last = path[path.length - 1];
  cursor[last] = value;
  return next;
}

function pushArrayItemAtPath<T>(obj: T, path: PathSegment[], item: unknown): T {
  const next = deepClone(obj);
  const arr = getValueAtPath(next, path);
  if (!Array.isArray(arr)) return next;
  arr.push(item);
  return next;
}

function removeArrayItemAtPath<T>(
  obj: T,
  path: PathSegment[],
  index: number,
): T {
  const next = deepClone(obj);
  const arr = getValueAtPath(next, path);
  if (!Array.isArray(arr)) return next;
  arr.splice(index, 1);
  return next;
}

function moveArrayItemAtPath<T>(
  obj: T,
  path: PathSegment[],
  fromIndex: number,
  toIndex: number,
): T {
  const next = deepClone(obj);
  const arr = getValueAtPath(next, path);
  if (!Array.isArray(arr)) return next;
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= arr.length ||
    toIndex >= arr.length
  ) {
    return next;
  }
  const [item] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, item);
  return next;
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDateInputValue(year: number, month: number, day: number) {
  const yyyy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getKoreanDayOfWeek(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  const weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return weekdays[date.getDay()] ?? "";
}

function getDisplayFileNameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const encodedFileName = pathname.split("/").pop() ?? "";
    const fileName = decodeURIComponent(encodedFileName);
    const match = fileName.match(/^(\d+)-(.+)-([0-9a-f-]{36})\.([a-z0-9]+)$/i);
    if (match?.[2]) {
      return `${match[2].replace(/-/g, " ")}.${match[4]}`;
    }
    return fileName;
  } catch {
    return "";
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function toDateTimeLocalInputValue(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromDateTimeLocalInputValue(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString();
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";

  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    }
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function getAccountOwnerLabel(groupId: string, groupLabel: string, accountIndex: number) {
  const isGroomGroup = groupId.includes("groom") || groupLabel.includes("신랑");
  const isBrideGroup = groupId.includes("bride") || groupLabel.includes("신부");

  if (isGroomGroup) {
    return (["신랑", "부친", "모친"][accountIndex] ?? `신랑측 계좌 ${accountIndex + 1}`);
  }
  if (isBrideGroup) {
    return (["신부", "부친", "모친"][accountIndex] ?? `신부측 계좌 ${accountIndex + 1}`);
  }
  return `계좌 ${accountIndex + 1}`;
}

function hasAnyParentValue(parents: {
  father?: string;
  mother?: string;
  fatherContact?: string;
  motherContact?: string;
}) {
  return Boolean(
    parents.father?.trim() ||
      parents.mother?.trim() ||
      parents.fatherContact?.trim() ||
      parents.motherContact?.trim(),
  );
}

function normalizeTransportDetails(content: WeddingContentV1): WeddingContentV1 {
  const next = deepClone(content);
  const transport = next.weddingData.venue.transport;
  if (transport) {
    if (
      (!transport.subwayDetails || transport.subwayDetails.length === 0) &&
      transport.subway?.length
    ) {
      transport.subwayDetails = transport.subway.map((label) => ({
        label,
        color: "#8d8d8d",
      }));
    }

    if (
      (!transport.busDetails || transport.busDetails.length === 0) &&
      transport.bus?.length
    ) {
      transport.busDetails = transport.bus.map((line) => {
        if (line.includes("간선")) {
          return {
            label: `간선버스 : ${line.replace("간선버스:", "").trim()}`,
            color: "#1d3f8a",
          };
        }
        if (line.includes("지선")) {
          return {
            label: `지선버스 : ${line.replace("지선버스:", "").trim()}`,
            color: "#2d9b46",
          };
        }
        return { label: line, color: "#8d8d8d" };
      });
    }
  }

  next.gallerySection.images = next.gallerySection.images.map((image) => ({
    ...image,
    alt: GALLERY_IMAGE_ALT,
  }));
  if (!next.weddingData.backgroundMusic) {
    next.weddingData.backgroundMusic = {
      enabled: true,
      autoplay: true,
      loop: true,
      volume: 0.4,
      src: "",
    };
  } else {
    next.weddingData.backgroundMusic.autoplay = true;
  }

  return next;
}

function SectionCard({
  isActive,
  title,
  children,
}: {
  isActive: boolean;
  title: string;
  children: React.ReactNode;
}) {
  if (!isActive) return null;

  return (
    <section className="rounded-2xl border border-[#e7ddcc] bg-white/90 px-5 py-4 shadow-[0_8px_20px_rgba(70,55,25,0.08)]">
      <div className="flex w-full items-center justify-between gap-3 text-left">
        <h2 className="text-base font-semibold text-[#2f271b]">{title}</h2>
      </div>
      <div className="space-y-4 pt-4">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "date" | "datetime-local";
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-[#6f6350]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-[#dfd4c1] bg-white px-3 text-sm text-[#2e261b] outline-none focus:border-[#b9a17e]"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-[#6f6350]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full resize-y rounded-lg border border-[#dfd4c1] bg-white px-3 py-2 text-sm text-[#2e261b] outline-none focus:border-[#b9a17e]"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const safeColor = /^#([0-9A-Fa-f]{6})$/.test(value) ? value : "#8d8d8d";
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-[#6f6350]">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="relative inline-flex h-10 w-12 overflow-hidden rounded-lg border border-[#dfd4c1] bg-white">
          <span
            className="absolute inset-2 rounded-md"
            style={{ backgroundColor: safeColor }}
          />
          <input
            type="color"
            value={safeColor}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={`${label} 선택`}
          />
        </span>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 min-w-0 flex-1 rounded-lg border border-[#dfd4c1] bg-white px-3 text-sm text-[#2e261b] outline-none focus:border-[#b9a17e]"
        />
      </div>
    </label>
  );
}

export default function AdminContentPage() {
  const router = useRouter();
  const toast = useToast();
  const contentQuery = useAdminWeddingContentQuery("main");
  const updateMutation = useUpdateWeddingContentMutation("main");
  const uploadAssetMutation = useUploadWeddingContentAssetMutation("main");

  const guestMessagesQuery = useAdminGuestMessagesQuery();
  const rsvpQuery = useAdminRsvpResponsesQuery();
  const snapSubmissionsQuery = useAdminSnapSubmissionsQuery();

  const [sourceContent, setSourceContent] = useState<WeddingContentV1 | null>(
    null,
  );
  const [draftContent, setDraftContent] = useState<WeddingContentV1 | null>(
    null,
  );
  const [version, setVersion] = useState<number>(1);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("groomInfo");
  const sourceContentRef = useRef<WeddingContentV1 | null>(null);
  const draftContentRef = useRef<WeddingContentV1 | null>(null);

  useEffect(() => {
    sourceContentRef.current = sourceContent;
    draftContentRef.current = draftContent;
  }, [draftContent, sourceContent]);

  useEffect(() => {
    const errors = [
      contentQuery.error,
      guestMessagesQuery.error,
      rsvpQuery.error,
      snapSubmissionsQuery.error,
    ];
    const hasUnauthorizedError = errors.some(
      (error) => error instanceof ApiError && error.status === 401,
    );
    if (hasUnauthorizedError) {
      router.replace("/admin");
    }
  }, [
    contentQuery.error,
    guestMessagesQuery.error,
    router,
    rsvpQuery.error,
    snapSubmissionsQuery.error,
  ]);

  useEffect(() => {
    if (!contentQuery.data) return;

    const nextSource = normalizeTransportDetails(contentQuery.data.content);
    const nextVersion = contentQuery.data.version;
    const currentSource = sourceContentRef.current;
    const currentDraft = draftContentRef.current;

    if (!currentSource || !currentDraft) {
      setSourceContent(nextSource);
      setDraftContent(deepClone(nextSource));
      setVersion(nextVersion);
      return;
    }

    const unchanged =
      JSON.stringify(currentSource) === JSON.stringify(currentDraft);
    if (unchanged) {
      setSourceContent(nextSource);
      setDraftContent(deepClone(nextSource));
      setVersion(nextVersion);
    }
  }, [contentQuery.data]);

  const loadingCounts =
    guestMessagesQuery.isLoading ||
    rsvpQuery.isLoading ||
    snapSubmissionsQuery.isLoading;
  const guestMessageCount = guestMessagesQuery.data?.messages.length ?? 0;
  const attendanceCount = rsvpQuery.data?.responses.length ?? 0;
  const snapCount = snapSubmissionsQuery.data?.submissions.length ?? 0;

  const isDirty = useMemo(() => {
    if (!sourceContent || !draftContent) return false;
    return JSON.stringify(sourceContent) !== JSON.stringify(draftContent);
  }, [draftContent, sourceContent]);

  useEffect(() => {
    if (!isDirty) return;

    const warningMessage =
      "저장하지 않은 변경사항이 있습니다. 페이지를 나가면 변경사항이 사라집니다.";
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = warningMessage;
    };

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (anchor.href === window.location.href) return;

      const confirmed = window.confirm(warningMessage);
      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [isDirty]);

  const updatePath = useCallback((path: PathSegment[], value: unknown) => {
    setDraftContent((prev) => {
      if (!prev) return prev;
      return setValueAtPath(prev, path, value);
    });
  }, []);

  const updateParentField = useCallback(
    (
      side: "groom" | "bride",
      key: "father" | "mother" | "fatherContact" | "motherContact",
      rawValue: string,
    ) => {
      setDraftContent((prev) => {
        if (!prev) return prev;
        const next = deepClone(prev);
        const person = next.weddingData[side];
        const existing = person.parents ?? {};
        const value =
          key === "fatherContact" || key === "motherContact"
            ? formatPhoneNumber(rawValue)
            : rawValue;
        const normalizedValue = value.trim();

        const updatedParents = { ...existing };
        if (normalizedValue.length === 0) {
          delete updatedParents[key];
        } else {
          updatedParents[key] = value;
        }

        if (hasAnyParentValue(updatedParents)) {
          person.parents = updatedParents;
        } else {
          delete person.parents;
        }

        return next;
      });
    },
    [],
  );

  const addArrayItem = useCallback((path: PathSegment[], item: unknown) => {
    setDraftContent((prev) => {
      if (!prev) return prev;
      return pushArrayItemAtPath(prev, path, item);
    });
  }, []);

  const removeArrayItem = useCallback((path: PathSegment[], index: number) => {
    setDraftContent((prev) => {
      if (!prev) return prev;
      return removeArrayItemAtPath(prev, path, index);
    });
  }, []);

  const moveArrayItem = useCallback(
    (path: PathSegment[], fromIndex: number, toIndex: number) => {
      setDraftContent((prev) => {
        if (!prev) return prev;
        return moveArrayItemAtPath(prev, path, fromIndex, toIndex);
      });
    },
    [],
  );

  const updateInterviewAnswer = useCallback(
    (questionIndex: number, side: "groom" | "bride", contentValue: string) => {
      setDraftContent((prev) => {
        if (!prev) return prev;
        const next = deepClone(prev);
        const question = next.interviewSection.questions[questionIndex];
        if (!question) return prev;

        const existingAnswer = question.answers.find(
          (answer) => answer.side === side,
        );
        if (existingAnswer) {
          existingAnswer.content = contentValue;
        } else {
          question.answers.push({ side, content: contentValue });
        }
        return next;
      });
    },
    [],
  );

  const handleUpload = useCallback(
    async (
      file: File,
      urlPath: PathSegment[],
      key: string,
      options?: {
        altPath?: PathSegment[];
        widthPath?: PathSegment[];
        heightPath?: PathSegment[];
      },
    ) => {
      try {
        const isAudioFile = file.type.startsWith("audio/");
        if (file.size > MAX_ASSET_UPLOAD_SIZE_BYTES) {
          toast.error(
            isAudioFile
              ? "음원 파일 용량이 커서 업로드할 수 없습니다. 관리자에게 문의해 주세요."
              : `이미지 파일 용량이 너무 큽니다. 최대 ${formatFileSize(MAX_ASSET_UPLOAD_SIZE_BYTES)}까지 업로드할 수 있습니다.`,
          );
          return;
        }

        setUploadingKey(key);
        const result = await uploadAssetMutation.mutateAsync({ file });

        setDraftContent((prev) => {
          if (!prev) return prev;
          let next = setValueAtPath(prev, urlPath, result.asset.url);

          if (options?.altPath) {
            const currentAlt = String(
              getValueAtPath(next, options.altPath) ?? "",
            ).trim();
            if (!currentAlt && result.asset.altDefault) {
              next = setValueAtPath(
                next,
                options.altPath,
                result.asset.altDefault,
              );
            }
          }

          if (options?.widthPath && typeof result.asset.width === "number") {
            next = setValueAtPath(next, options.widthPath, result.asset.width);
          }
          if (options?.heightPath && typeof result.asset.height === "number") {
            next = setValueAtPath(
              next,
              options.heightPath,
              result.asset.height,
            );
          }

          return next;
        });

        toast.success(isAudioFile ? "음원이 업로드되었습니다." : "이미지가 업로드되었습니다.");
      } catch (error) {
        const isAudioFile = file.type.startsWith("audio/");
        const message =
          error instanceof ApiError && error.status === 413
            ? isAudioFile
              ? "음원 파일 용량이 커서 업로드할 수 없습니다. 관리자에게 문의해 주세요."
              : "이미지 파일 용량이 너무 커서 업로드할 수 없습니다."
            : error instanceof ApiError
            ? error.message
            : isAudioFile
              ? "음원 업로드에 실패했습니다."
              : "이미지 업로드에 실패했습니다.";
        toast.error(message);
      } finally {
        setUploadingKey(null);
      }
    },
    [toast, uploadAssetMutation],
  );

  const save = async () => {
    if (!draftContent || !sourceContent) return;

    try {
      const result = await updateMutation.mutateAsync({
        content: draftContent,
        expectedVersion: version,
      });

      setSourceContent(deepClone(draftContent));
      setVersion(result.version);
      toast.success("메인 콘텐츠를 저장했습니다.");
      void contentQuery.refetch();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(
          "다른 수정이 먼저 반영되었습니다. 최신 데이터로 갱신합니다.",
        );
        const latest = await contentQuery.refetch();
      if (latest.data) {
          const normalized = normalizeTransportDetails(latest.data.content);
          setSourceContent(normalized);
          setDraftContent(deepClone(normalized));
          setVersion(latest.data.version);
        }
        return;
      }

      const message =
        error instanceof ApiError
          ? error.message
          : "저장 중 오류가 발생했습니다.";
      toast.error(message);
    }
  };

  const resetDraft = () => {
    if (!sourceContent) return;
    setDraftContent(deepClone(sourceContent));
    toast.success("변경사항을 취소했습니다.");
  };

  if (contentQuery.isLoading || !draftContent || !sourceContent) {
    return (
      <main className="mx-auto w-full max-w-[980px] px-6 py-10">
        <h1 className="text-2xl font-semibold text-[#2f271b]">
          메인 콘텐츠 편집
        </h1>
        <p className="mt-4 text-sm text-[#7e705b]">콘텐츠를 불러오는 중...</p>
      </main>
    );
  }

  const content = draftContent;
  const busDetails = content.weddingData.venue.transport?.busDetails?.length
    ? content.weddingData.venue.transport.busDetails
    : (content.weddingData.venue.transport?.bus ?? []).map((line) => {
        if (line.includes("간선")) {
          return {
            label: `간선버스 : ${line.replace("간선버스:", "").trim()}`,
            color: "#1d3f8a",
          };
        }
        if (line.includes("지선")) {
          return {
            label: `지선버스 : ${line.replace("지선버스:", "").trim()}`,
            color: "#2d9b46",
          };
        }
        return { label: line, color: "#8d8d8d" };
      });
  const sectionNavItems = [
    { id: "groomInfo", label: "신랑 정보" },
    { id: "brideInfo", label: "신부 정보" },
    { id: "backgroundMusic", label: "배경음악" },
    { id: "hero", label: "상단 소개" },
    { id: "invitation", label: "초대 문구" },
    { id: "interview", label: "인터뷰" },
    { id: "gallery", label: "갤러리" },
    { id: "weddingInfo", label: "예식 정보" },
    { id: "guestbook", label: "방명록" },
    { id: "rsvp", label: "참석 의사 전달" },
    { id: "snap", label: "스냅" },
    { id: "account", label: "계좌 정보" },
    { id: "closing", label: "마지막 감사 이미지" },
  ];
  const snapNoticeText = [
    ...(content.snapSection.modal.guideLines ?? []),
    ...(content.snapSection.modal.guideHighlightLines ?? []),
    ...(content.snapSection.modal.policyLines ?? []),
  ].join("\n");

  return (
    <main className="mx-auto w-full max-w-[980px] px-6 py-10 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#2f271b]">
          메인 콘텐츠 편집
        </h1>
        <span className="rounded-full bg-[#f1ede5] px-3 py-1 text-xs text-[#786b56]">
          version {version}
        </span>
      </div>

      <AdminSummaryCards
        loading={loadingCounts}
        guestMessageCount={guestMessageCount}
        attendanceCount={attendanceCount}
        snapCount={snapCount}
        active="content"
      />

      <p className="mt-5 text-xs text-[#7b6f5c]">
        배열 항목만 삭제할 수 있으며, 루트 섹션은 삭제되지 않습니다. 저장 즉시
        메인 화면에 반영됩니다.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
        {sectionNavItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSection(item.id)}
            className={`rounded-xl border px-3 py-3 text-left transition ${
              activeSection === item.id
                ? "border-[#b9a17e] bg-[#fff7ea] shadow-[0_8px_18px_rgba(112,84,47,0.12)]"
                : "border-[#e7ddcc] bg-white/90 hover:bg-[#fffaf2]"
            }`}
          >
            <p className="text-sm font-semibold text-[#2f271b]">{item.label}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <SectionCard
          isActive={activeSection === "groomInfo"}
          title="신랑 정보"
        >
          <div className="rounded-xl border border-[#e7ddcc] bg-[#fffcf7] p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="이름"
                value={content.weddingData.groom.name}
                onChange={(value) =>
                  updatePath(["weddingData", "groom", "name"], value)
                }
              />
              <TextField
                label="연락처"
                value={content.weddingData.groom.contact ?? ""}
                onChange={(value) =>
                  updatePath(
                    ["weddingData", "groom", "contact"],
                    formatPhoneNumber(value),
                  )
                }
              />
              <TextField
                label="부친"
                value={content.weddingData.groom.parents?.father ?? ""}
                onChange={(value) => updateParentField("groom", "father", value)}
              />
              <TextField
                label="부친 연락처"
                value={content.weddingData.groom.parents?.fatherContact ?? ""}
                onChange={(value) =>
                  updateParentField("groom", "fatherContact", value)
                }
              />
              <TextField
                label="모친"
                value={content.weddingData.groom.parents?.mother ?? ""}
                onChange={(value) => updateParentField("groom", "mother", value)}
              />
              <TextField
                label="모친 연락처"
                value={content.weddingData.groom.parents?.motherContact ?? ""}
                onChange={(value) =>
                  updateParentField("groom", "motherContact", value)
                }
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          isActive={activeSection === "brideInfo"}
          title="신부 정보"
        >
          <div className="rounded-xl border border-[#e7ddcc] bg-[#fffcf7] p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="이름"
                value={content.weddingData.bride.name}
                onChange={(value) =>
                  updatePath(["weddingData", "bride", "name"], value)
                }
              />
              <TextField
                label="연락처"
                value={content.weddingData.bride.contact ?? ""}
                onChange={(value) =>
                  updatePath(
                    ["weddingData", "bride", "contact"],
                    formatPhoneNumber(value),
                  )
                }
              />
              <TextField
                label="부친"
                value={content.weddingData.bride.parents?.father ?? ""}
                onChange={(value) => updateParentField("bride", "father", value)}
              />
              <TextField
                label="부친 연락처"
                value={content.weddingData.bride.parents?.fatherContact ?? ""}
                onChange={(value) =>
                  updateParentField("bride", "fatherContact", value)
                }
              />
              <TextField
                label="모친"
                value={content.weddingData.bride.parents?.mother ?? ""}
                onChange={(value) => updateParentField("bride", "mother", value)}
              />
              <TextField
                label="모친 연락처"
                value={content.weddingData.bride.parents?.motherContact ?? ""}
                onChange={(value) =>
                  updateParentField("bride", "motherContact", value)
                }
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          isActive={activeSection === "weddingInfo"}
          title="예식 정보"
        >

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="예식 날짜"
              type="date"
              value={toDateInputValue(
                content.weddingData.date.year,
                content.weddingData.date.month,
                content.weddingData.date.day,
              )}
              onChange={(value) => {
                const [yearText, monthText, dayText] = value.split("-");
                const year = Number(yearText);
                const month = Number(monthText);
                const day = Number(dayText);
                if (!year || !month || !day) return;

                updatePath(["weddingData", "date", "year"], year);
                updatePath(["weddingData", "date", "month"], month);
                updatePath(["weddingData", "date", "day"], day);
                updatePath(
                  ["weddingData", "date", "dayOfWeek"],
                  getKoreanDayOfWeek(year, month, day),
                );
              }}
            />
            <label className="block min-w-0">
              <span className="mb-1.5 block text-xs font-semibold text-[#6f6350]">
                요일
              </span>
              <input
                type="text"
                value={content.weddingData.date.dayOfWeek}
                readOnly
                className="h-10 w-full rounded-lg border border-[#dfd4c1] bg-[#f5f0e7] px-3 text-sm text-[#6f6350] outline-none"
              />
            </label>
            <TextField
              label="시간"
              value={content.weddingData.date.time}
              onChange={(value) =>
                updatePath(["weddingData", "date", "time"], value)
              }
            />
          </div>

          <div className="rounded-xl border border-[#eadfcb] bg-[#fffcf7] p-3">
            <p className="text-sm font-semibold text-[#4e422f]">예식장 정보</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <TextField
                label="예식장 이름"
                value={content.weddingData.venue.name}
                onChange={(value) =>
                  updatePath(["weddingData", "venue", "name"], value)
                }
              />
              <TextField
                label="예식장 연락처"
                value={content.weddingData.venue.contact ?? ""}
                onChange={(value) =>
                  updatePath(
                    ["weddingData", "venue", "contact"],
                    formatPhoneNumber(value),
                  )
                }
              />
              <TextAreaField
                label="예식장 주소"
                value={content.weddingData.venue.address}
                onChange={(value) =>
                  updatePath(["weddingData", "venue", "address"], value)
                }
                rows={2}
              />
              <TextField
                label="층"
                value={content.weddingData.venue.floor ?? ""}
                onChange={(value) =>
                  updatePath(["weddingData", "venue", "floor"], value)
                }
              />
              <label className="block min-w-0">
                <span className="mb-1.5 block text-xs font-semibold text-[#6f6350]">
                  위도 (읽기 전용)
                </span>
                <input
                  type="text"
                  readOnly
                  value={String(content.weddingData.venue.coordinates.lat)}
                  className="h-10 w-full rounded-lg border border-[#dfd4c1] bg-[#f5f0e7] px-3 text-sm text-[#6f6350] outline-none"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-1.5 block text-xs font-semibold text-[#6f6350]">
                  경도 (읽기 전용)
                </span>
                <input
                  type="text"
                  readOnly
                  value={String(content.weddingData.venue.coordinates.lng)}
                  className="h-10 w-full rounded-lg border border-[#dfd4c1] bg-[#f5f0e7] px-3 text-sm text-[#6f6350] outline-none"
                />
              </label>
            </div>

            <div className="mt-4 rounded-lg border border-[#efe4d2] bg-white p-3">
              <p className="text-sm font-semibold text-[#4e422f]">교통 정보</p>
              <div className="mt-3 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#6f6350]">
                      지하철
                    </p>
                    <button
                      type="button"
                      className="rounded-md border border-[#d7c9b1] px-2 py-1 text-xs"
                      onClick={() =>
                        setDraftContent((prev) => {
                          if (!prev) return prev;
                          const next = deepClone(prev);
                          const current =
                            next.weddingData.venue.transport?.subwayDetails ??
                            [];
                          next.weddingData.venue.transport = {
                            ...(next.weddingData.venue.transport ?? {}),
                            subwayDetails: [
                              ...current,
                              { label: "", color: "#8d8d8d" },
                            ],
                          };
                          return next;
                        })
                      }
                    >
                      노선 추가
                    </button>
                  </div>
                  {(
                    content.weddingData.venue.transport?.subwayDetails ?? []
                  ).map((item, index) => (
                    <div
                      key={`subway-detail-${index}`}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto] sm:items-end"
                    >
                      <ColorField
                        label="색상"
                        value={item.color}
                        onChange={(value) =>
                          updatePath(
                            [
                              "weddingData",
                              "venue",
                              "transport",
                              "subwayDetails",
                              index,
                              "color",
                            ],
                            value,
                          )
                        }
                      />
                      <TextField
                        label={`노선 ${index + 1}`}
                        value={item.label}
                        onChange={(value) =>
                          updatePath(
                            [
                              "weddingData",
                              "venue",
                              "transport",
                              "subwayDetails",
                              index,
                              "label",
                            ],
                            value,
                          )
                        }
                      />
                      <div className="pt-0 sm:pt-6">
                        <button
                          type="button"
                          className="h-10 rounded-md border border-[#e1bfbf] px-3 text-xs text-[#8a4a4a]"
                          onClick={() =>
                            removeArrayItem(
                              [
                                "weddingData",
                                "venue",
                                "transport",
                                "subwayDetails",
                              ],
                              index,
                            )
                          }
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#6f6350]">
                      버스
                    </p>
                    <button
                      type="button"
                      className="rounded-md border border-[#d7c9b1] px-2 py-1 text-xs"
                      onClick={() =>
                        setDraftContent((prev) => {
                          if (!prev) return prev;
                          const next = deepClone(prev);
                          const current =
                            next.weddingData.venue.transport?.busDetails ?? [];
                          next.weddingData.venue.transport = {
                            ...(next.weddingData.venue.transport ?? {}),
                            busDetails: [
                              ...current,
                              { label: "", color: "#8d8d8d" },
                            ],
                          };
                          return next;
                        })
                      }
                    >
                      노선 추가
                    </button>
                  </div>
                  {busDetails.map((item, index) => (
                    <div
                      key={`bus-detail-${index}`}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto] sm:items-end"
                    >
                      <ColorField
                        label="색상"
                        value={item.color}
                        onChange={(value) =>
                          updatePath(
                            [
                              "weddingData",
                              "venue",
                              "transport",
                              "busDetails",
                              index,
                              "color",
                            ],
                            value,
                          )
                        }
                      />
                      <TextField
                        label={`노선 ${index + 1}`}
                        value={item.label}
                        onChange={(value) =>
                          updatePath(
                            [
                              "weddingData",
                              "venue",
                              "transport",
                              "busDetails",
                              index,
                              "label",
                            ],
                            value,
                          )
                        }
                      />
                      <div className="pt-0 sm:pt-6">
                        <button
                          type="button"
                          className="h-10 rounded-md border border-[#e1bfbf] px-3 text-xs text-[#8a4a4a]"
                          onClick={() =>
                            removeArrayItem(
                              [
                                "weddingData",
                                "venue",
                                "transport",
                                "busDetails",
                              ],
                              index,
                            )
                          }
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <TextField
                  label="셔틀 안내"
                  value={
                    content.weddingData.venue.transport?.shuttlePickup ?? ""
                  }
                  onChange={(value) =>
                    updatePath(
                      ["weddingData", "venue", "transport", "shuttlePickup"],
                      value,
                    )
                  }
                />

              </div>
            </div>
          </div>

        </SectionCard>

        <SectionCard
          isActive={activeSection === "backgroundMusic"}
          title="배경음악"
        >
          <div className="rounded-xl border border-[#eadfcb] bg-[#fffcf7] p-3">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm text-[#4f4332]">
                <input
                  type="checkbox"
                  checked={Boolean(content.weddingData.backgroundMusic?.enabled)}
                  onChange={(event) =>
                    updatePath(
                      ["weddingData", "backgroundMusic", "enabled"],
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4"
                />
                사용
              </label>
              <label className="flex items-center gap-2 text-sm text-[#4f4332]">
                <input
                  type="checkbox"
                  checked={Boolean(content.weddingData.backgroundMusic?.loop)}
                  onChange={(event) =>
                    updatePath(
                      ["weddingData", "backgroundMusic", "loop"],
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4"
                />
                반복
              </label>
              <label className="flex items-center gap-2 text-sm text-[#4f4332]">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  className="h-4 w-4"
                />
                자동 재생
              </label>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-[#efe4d2] bg-white p-3">
              <div className="text-xs text-[#7e705b]">
                {content.weddingData.backgroundMusic?.src
                  ? `업로드된 음원: ${getDisplayFileNameFromUrl(content.weddingData.backgroundMusic.src) || "파일명 확인 불가"}`
                  : "아직 업로드된 음원이 없습니다."}
              </div>
              <label>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void (async () => {
                      await handleUpload(
                        file,
                        ["weddingData", "backgroundMusic", "src"],
                        "background-music",
                      );
                      updatePath(["weddingData", "backgroundMusic", "autoplay"], true);
                      updatePath(["weddingData", "backgroundMusic", "enabled"], true);
                    })();
                    event.target.value = "";
                  }}
                />
                <span className="inline-flex h-9 cursor-pointer items-center rounded-md border border-[#d7c9b1] bg-white px-3 text-xs text-[#574938]">
                  {uploadingKey === "background-music" ? "업로드 중..." : "음원 업로드"}
                </span>
              </label>
            </div>

            {content.weddingData.backgroundMusic?.src ? (
              <audio
                src={content.weddingData.backgroundMusic.src}
                controls
                className="mt-3 w-full"
              />
            ) : null}

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <TextField
                label="볼륨"
                type="number"
                value={String(content.weddingData.backgroundMusic?.volume ?? 0.5)}
                onChange={(value) =>
                  updatePath(
                    ["weddingData", "backgroundMusic", "volume"],
                    toNumber(value, content.weddingData.backgroundMusic?.volume ?? 0.5),
                  )
                }
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          isActive={activeSection === "hero"}
          title="상단 소개"
        >
          <TextField
            label="문구"
            value={content.heroSection.titleText}
            onChange={(value) => updatePath(["heroSection", "titleText"], value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#eadfcb] bg-[#fffcf7] p-3">
              <p className="text-sm font-semibold text-[#4e422f]">첫 번째 사진</p>
              <div className="mt-3 overflow-hidden rounded-lg border border-[#e5dccb] bg-[#f7f2e8]">
                <div className="relative aspect-square w-full">
                  {content.heroSection.primaryImage.url ? (
                    <Image
                      src={content.heroSection.primaryImage.url}
                      alt={content.heroSection.primaryImage.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 980px) 100vw, 420px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[#8f816b]">
                      업로드된 이미지가 없습니다.
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end border-t border-[#efe4d2] pt-3">
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      void handleUpload(
                        file,
                        ["heroSection", "primaryImage", "url"],
                        "hero-primary-image",
                        { altPath: ["heroSection", "primaryImage", "alt"] },
                      );
                      event.target.value = "";
                    }}
                  />
                  <span className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-[#d7c9b1] bg-white px-3 text-xs font-medium text-[#574938]">
                    {uploadingKey === "hero-primary-image"
                      ? "업로드 중..."
                      : "이미지 업로드"}
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-[#eadfcb] bg-[#fffcf7] p-3">
              <p className="text-sm font-semibold text-[#4e422f]">두 번째 사진</p>
              <div className="mt-3 overflow-hidden rounded-lg border border-[#e5dccb] bg-[#f7f2e8]">
                <div className="relative aspect-square w-full">
                  {content.heroSection.secondaryImage.url ? (
                    <Image
                      src={content.heroSection.secondaryImage.url}
                      alt={content.heroSection.secondaryImage.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 980px) 100vw, 420px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[#8f816b]">
                      업로드된 이미지가 없습니다.
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end border-t border-[#efe4d2] pt-3">
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      void handleUpload(
                        file,
                        ["heroSection", "secondaryImage", "url"],
                        "hero-secondary-image",
                        { altPath: ["heroSection", "secondaryImage", "alt"] },
                      );
                      event.target.value = "";
                    }}
                  />
                  <span className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-[#d7c9b1] bg-white px-3 text-xs font-medium text-[#574938]">
                    {uploadingKey === "hero-secondary-image"
                      ? "업로드 중..."
                      : "이미지 업로드"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          isActive={activeSection === "invitation"}
          title="초대 문구"
        >
          <TextField
            label="영문 제목"
            value={content.invitationSection.kicker}
            onChange={(value) =>
              updatePath(["invitationSection", "kicker"], value)
            }
          />
          <TextField
            label="제목"
            value={content.invitationSection.title}
            onChange={(value) =>
              updatePath(["invitationSection", "title"], value)
            }
          />
          <TextAreaField
            label="문구"
            value={content.invitationSection.message}
            onChange={(value) =>
              updatePath(["invitationSection", "message"], value)
            }
            rows={7}
          />
        </SectionCard>

        <SectionCard
          isActive={activeSection === "guestbook"}
          title="방명록"
        >
          <TextField
            label="영문 제목"
            value={content.guestbookSection.kicker}
            onChange={(value) =>
              updatePath(["guestbookSection", "kicker"], value)
            }
          />
          <TextField
            label="제목"
            value={content.guestbookSection.title}
            onChange={(value) =>
              updatePath(["guestbookSection", "title"], value)
            }
          />
        </SectionCard>

        <SectionCard
          isActive={activeSection === "rsvp"}
          title="참석 의사 전달"
        >
          <TextField
            label="영문 제목"
            value={content.rsvpSection.kicker}
            onChange={(value) =>
              updatePath(["rsvpSection", "kicker"], value)
            }
          />
          <TextField
            label="제목"
            value={content.rsvpSection.title}
            onChange={(value) =>
              updatePath(["rsvpSection", "title"], value)
            }
          />
          <TextAreaField
            label="문구"
            value={content.rsvpSection.description}
            onChange={(value) =>
              updatePath(["rsvpSection", "description"], value)
            }
            rows={3}
          />
        </SectionCard>

        <SectionCard
          isActive={activeSection === "interview"}
          title="인터뷰"
        >
          <TextField
            label="영문 제목"
            value={content.interviewSection.kicker}
            onChange={(value) =>
              updatePath(["interviewSection", "kicker"], value)
            }
          />
          <TextField
            label="제목"
            value={content.interviewSection.title}
            onChange={(value) =>
              updatePath(["interviewSection", "title"], value)
            }
          />
          <TextAreaField
            label="문구"
            value={content.interviewSection.description}
            onChange={(value) =>
              updatePath(["interviewSection", "description"], value)
            }
            rows={3}
          />
          <div className="overflow-hidden rounded-lg border border-[#e5dccb] bg-[#f7f2e8]">
            {content.interviewSection.image.url ? (
              <div className="w-full">
                <img
                  src={content.interviewSection.image.url}
                  alt={content.interviewSection.image.alt}
                  className="block h-auto w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex min-h-[180px] w-full items-center justify-center text-xs text-[#8f816b]">
                업로드된 이미지가 없습니다.
              </div>
            )}
          </div>
          <div className="flex items-center justify-end border-t border-[#efe4d2] pt-3">
            <label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void handleUpload(
                    file,
                    ["interviewSection", "image", "url"],
                    "interview-image",
                    { altPath: ["interviewSection", "image", "alt"] },
                  );
                  event.target.value = "";
                }}
              />
              <span className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-[#d7c9b1] bg-white px-3 text-xs font-medium text-[#574938]">
                {uploadingKey === "interview-image"
                  ? "업로드 중..."
                  : "이미지 업로드"}
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md border border-[#d7c9b1] bg-white px-3 py-1.5 text-xs"
              onClick={() =>
                addArrayItem(["interviewSection", "questions"], {
                  question: "",
                  answers: [
                    {
                      side: "groom",
                      content: "",
                    },
                    {
                      side: "bride",
                      content: "",
                    },
                  ],
                })
              }
            >
              질문 추가
            </button>
          </div>

          <div className="space-y-4">
            {content.interviewSection.questions.map((questionItem, qIndex) => (
              <div
                key={`question-${qIndex}`}
                className="rounded-xl border border-[#eadfcb] bg-[#fffcf7] p-3"
              >
                <div className="flex items-center gap-2">
                  <TextField
                    label={`질문 ${qIndex + 1}`}
                    value={questionItem.question}
                    onChange={(value) =>
                      updatePath(
                        ["interviewSection", "questions", qIndex, "question"],
                        value,
                      )
                    }
                  />
                  <button
                    type="button"
                    className="mt-6 h-10 rounded-md border border-[#e1bfbf] px-3 text-xs text-[#8a4a4a]"
                    onClick={() =>
                      removeArrayItem(["interviewSection", "questions"], qIndex)
                    }
                  >
                    질문 삭제
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  <div className="rounded-lg border border-[#efe5d6] bg-white p-3">
                    <p className="mb-2 text-xs font-semibold text-[#6f6350]">
                      신랑 {content.weddingData.groom.name}
                    </p>
                    <TextAreaField
                      label="신랑 답변"
                      value={
                        questionItem.answers.find(
                          (answer) => answer.side === "groom",
                        )?.content ?? ""
                      }
                      onChange={(value) =>
                        updateInterviewAnswer(qIndex, "groom", value)
                      }
                      rows={5}
                    />
                  </div>
                  <div className="rounded-lg border border-[#efe5d6] bg-white p-3">
                    <p className="mb-2 text-xs font-semibold text-[#6f6350]">
                      신부 {content.weddingData.bride.name}
                    </p>
                    <TextAreaField
                      label="신부 답변"
                      value={
                        questionItem.answers.find(
                          (answer) => answer.side === "bride",
                        )?.content ?? ""
                      }
                      onChange={(value) =>
                        updateInterviewAnswer(qIndex, "bride", value)
                      }
                      rows={5}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          isActive={activeSection === "gallery"}
          title="갤러리"
        >
          <TextField
            label="영문 제목"
            value={content.gallerySection.kicker}
            onChange={(value) =>
              updatePath(["gallerySection", "kicker"], value)
            }
          />
          <TextField
            label="제목"
            value={content.gallerySection.title}
            onChange={(value) =>
              updatePath(["gallerySection", "title"], value)
            }
          />
          <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-[#6f6350]">
              한 번에 보여줄 개수
            </span>
            <select
              value={String(content.gallerySection.batchSize)}
              onChange={(event) =>
                updatePath(["gallerySection", "batchSize"], Number(event.target.value))
              }
              className="h-10 w-full rounded-lg border border-[#dfd4c1] bg-white px-3 text-sm text-[#2e261b] outline-none focus:border-[#b9a17e]"
            >
              {[2, 4, 6, 8, 10, 12].map((count) => (
                <option key={count} value={count}>
                  {count}개
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md border border-[#d7c9b1] bg-white px-3 py-1.5 text-xs"
              onClick={() =>
                addArrayItem(["gallerySection", "images"], {
                  id: `gallery-${Date.now()}`,
                  url: "",
                  alt: GALLERY_IMAGE_ALT,
                  width: 1200,
                  height: 1600,
                })
              }
            >
              이미지 추가
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {content.gallerySection.images.map((image, index) => (
              <div
                key={image.id}
                className="rounded-xl border border-[#eadfcb] bg-[#fffcf7] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#6f6350]">
                    이미지 {index + 1}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-8 rounded-md border border-[#d7c9b1] px-2 text-xs disabled:opacity-50"
                      onClick={() =>
                        moveArrayItem(
                          ["gallerySection", "images"],
                          index,
                          index - 1,
                        )
                      }
                      disabled={index === 0}
                    >
                      앞으로
                    </button>
                    <button
                      type="button"
                      className="h-8 rounded-md border border-[#d7c9b1] px-2 text-xs disabled:opacity-50"
                      onClick={() =>
                        moveArrayItem(
                          ["gallerySection", "images"],
                          index,
                          index + 1,
                        )
                      }
                      disabled={index === content.gallerySection.images.length - 1}
                    >
                      뒤로
                    </button>
                  </div>
                </div>
                <div className="mt-3 overflow-hidden rounded-lg border border-[#e5dccb] bg-[#f7f2e8]">
                  <div className="relative aspect-square w-full">
                    {image.url ? (
                      <Image
                        src={image.url}
                        alt={GALLERY_IMAGE_ALT}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 980px) 100vw, 600px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#8f816b]">
                        업로드된 이미지가 없습니다.
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#efe4d2] pt-3">
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const key = `gallery-${index}`;
                        void handleUpload(
                          file,
                          ["gallerySection", "images", index, "url"],
                          key,
                          {
                            altPath: ["gallerySection", "images", index, "alt"],
                            widthPath: [
                              "gallerySection",
                              "images",
                              index,
                              "width",
                            ],
                            heightPath: [
                              "gallerySection",
                              "images",
                              index,
                              "height",
                            ],
                          },
                        );
                        event.target.value = "";
                      }}
                    />
                    <span className="inline-flex h-9 cursor-pointer items-center rounded-md border border-[#d7c9b1] bg-white px-3 text-xs text-[#574938]">
                      {uploadingKey === `gallery-${index}`
                        ? "업로드 중..."
                        : "이미지 업로드"}
                    </span>
                  </label>
                  <button
                    type="button"
                    className="h-9 rounded-md border border-[#e1bfbf] px-3 text-xs text-[#8a4a4a]"
                    onClick={() =>
                      removeArrayItem(["gallerySection", "images"], index)
                    }
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          isActive={activeSection === "account"}
          title="계좌 정보"
        >
          <TextField
            label="영문 제목"
            value={content.accountSection.kicker}
            onChange={(value) =>
              updatePath(["accountSection", "kicker"], value)
            }
          />
          <TextField
            label="제목"
            value={content.accountSection.title}
            onChange={(value) =>
              updatePath(["accountSection", "title"], value)
            }
          />
          <TextAreaField
            label="문구"
            value={content.accountSection.description}
            onChange={(value) =>
              updatePath(["accountSection", "description"], value)
            }
            rows={3}
          />
          <p className="text-xs text-[#7a6c58]">
            예금주 표시는 신랑/신부 및 부모 정보에서 자동으로 연동됩니다. 계좌에는 은행과 계좌번호만 입력하세요.
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md border border-[#d7c9b1] bg-white px-3 py-1.5 text-xs"
              onClick={() =>
                addArrayItem(["accountSection", "groups"], {
                  id: `group-${Date.now()}`,
                  label: "",
                  accounts: [],
                })
              }
            >
              그룹 추가
            </button>
          </div>

          <div className="space-y-3">
            {content.accountSection.groups.map((group, groupIndex) => (
              <div
                key={group.id}
                className="rounded-xl border border-[#eadfcb] bg-[#fffcf7] p-3"
              >
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <TextField
                    label="그룹 이름"
                    value={group.label}
                    onChange={(value) =>
                      updatePath(
                        ["accountSection", "groups", groupIndex, "label"],
                        value,
                      )
                    }
                  />
                  <button
                    type="button"
                    className="mt-6 h-10 rounded-md border border-[#e1bfbf] px-3 text-xs text-[#8a4a4a]"
                    onClick={() =>
                      removeArrayItem(["accountSection", "groups"], groupIndex)
                    }
                  >
                    그룹 삭제
                  </button>
                </div>

                <div className="mt-3">
                  <div className="mb-2 flex justify-end">
                    <button
                      type="button"
                      className="rounded-md border border-[#d7c9b1] bg-white px-3 py-1.5 text-xs"
                      onClick={() =>
                        addArrayItem(
                          ["accountSection", "groups", groupIndex, "accounts"],
                          {
                            bank: "",
                            account: "",
                          },
                        )
                      }
                    >
                      계좌 추가
                    </button>
                  </div>
                  <div className="space-y-2">
                    {group.accounts.map((account, accountIndex) => (
                      <div
                        key={`account-${groupIndex}-${accountIndex}`}
                        className="rounded-lg border border-[#efe5d6] bg-white p-3"
                      >
                        <p className="mb-2 text-xs font-semibold text-[#7a6c58]">
                          {getAccountOwnerLabel(group.id, group.label, accountIndex)}
                        </p>
                        <div className="grid gap-2 md:grid-cols-2">
                          <TextField
                            label="은행"
                            value={account.bank}
                            onChange={(value) =>
                              updatePath(
                                [
                                  "accountSection",
                                  "groups",
                                  groupIndex,
                                  "accounts",
                                  accountIndex,
                                  "bank",
                                ],
                                value,
                              )
                            }
                          />
                          <TextField
                            label="계좌"
                            value={account.account}
                            onChange={(value) =>
                              updatePath(
                                [
                                  "accountSection",
                                  "groups",
                                  groupIndex,
                                  "accounts",
                                  accountIndex,
                                  "account",
                                ],
                                value,
                              )
                            }
                          />
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button
                            type="button"
                            className="h-9 rounded-md border border-[#e1bfbf] px-3 text-xs text-[#8a4a4a]"
                            onClick={() =>
                              removeArrayItem(
                                [
                                  "accountSection",
                                  "groups",
                                  groupIndex,
                                  "accounts",
                                ],
                                accountIndex,
                              )
                            }
                          >
                            계좌 삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          isActive={activeSection === "snap"}
          title="스냅"
        >
          <TextField
            label="영문 제목"
            value={content.snapSection.kicker}
            onChange={(value) =>
              updatePath(["snapSection", "kicker"], value)
            }
          />
          <TextField
            label="제목"
            value={content.snapSection.title}
            onChange={(value) =>
              updatePath(["snapSection", "title"], value)
            }
          />
          <TextAreaField
            label="문구"
            value={content.snapSection.description}
            onChange={(value) =>
              updatePath(["snapSection", "description"], value)
            }
            rows={3}
          />
          <TextField
            label="업로드 가능 시간"
            type="datetime-local"
            value={toDateTimeLocalInputValue(content.snapSection.uploadOpenAt)}
            onChange={(value) =>
              updatePath(
                ["snapSection", "uploadOpenAt"],
                fromDateTimeLocalInputValue(value),
              )
            }
          />

          <div className="rounded-xl border border-[#eadfcb] bg-[#fffcf7] p-4">
            <p className="text-sm font-semibold text-[#4e422f]">예시 렌더 미리보기</p>
            <div className="relative mx-auto mt-3 h-[230px] w-full max-w-[320px]">
              {content.snapSection.images.slice(0, 3).map((image, index) => {
                const zIndex = index === 1 ? 20 : 10;
                return (
                  <div
                    key={`snap-preview-${image.id}`}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ zIndex }}
                  >
                    <div
                      className="relative h-[200px] w-[160px] overflow-hidden rounded-[22px] border-[10px] border-white bg-white shadow-[0_8px_18px_rgba(0,0,0,0.14)]"
                      style={{
                        transform: `translateX(${image.offsetX}px) rotate(${image.rotation}deg)`,
                      }}
                    >
                      {image.url ? (
                        <Image
                          src={image.url}
                          alt="스냅 예시 이미지"
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#8f816b]">
                          이미지 없음
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md border border-[#d7c9b1] bg-white px-3 py-1.5 text-xs"
              onClick={() =>
                addArrayItem(["snapSection", "images"], {
                  id: `snap-image-${Date.now()}`,
                  url: "",
                  alt: "",
                  rotation: 0,
                  offsetX: 0,
                })
              }
            >
              스냅 이미지 추가
            </button>
          </div>
          <div className="space-y-2 rounded-xl border border-[#eadfcb] bg-[#fffcf7] p-3">
            <div className="grid grid-cols-[64px_1fr_1fr_auto] items-center gap-2 px-1 text-[11px] font-semibold text-[#6f6350]">
              <span>항목</span>
              <span>회전</span>
              <span>X 오프셋</span>
              <span className="text-right">작업</span>
            </div>
            {content.snapSection.images.map((image, index) => (
              <div
                key={image.id}
                className="grid grid-cols-[64px_1fr_1fr_auto] items-center gap-2 rounded-lg border border-[#eadfcb] bg-white p-2"
              >
                <span className="text-xs font-medium text-[#6f6350]">
                  #{index + 1}
                </span>
                <input
                  type="number"
                  value={String(image.rotation)}
                  onChange={(event) =>
                    updatePath(
                      ["snapSection", "images", index, "rotation"],
                      toNumber(event.target.value, image.rotation),
                    )
                  }
                  className="h-9 min-w-0 rounded-md border border-[#dfd4c1] bg-white px-2 text-sm text-[#2e261b] outline-none focus:border-[#b9a17e]"
                />
                <input
                  type="number"
                  value={String(image.offsetX)}
                  onChange={(event) =>
                    updatePath(
                      ["snapSection", "images", index, "offsetX"],
                      toNumber(event.target.value, image.offsetX),
                    )
                  }
                  className="h-9 min-w-0 rounded-md border border-[#dfd4c1] bg-white px-2 text-sm text-[#2e261b] outline-none focus:border-[#b9a17e]"
                />
                <div className="flex items-center gap-2">
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const key = `snap-${index}`;
                        void handleUpload(
                          file,
                          ["snapSection", "images", index, "url"],
                          key,
                        );
                        event.target.value = "";
                      }}
                    />
                    <span className="inline-flex h-9 cursor-pointer items-center rounded-md border border-[#d7c9b1] bg-white px-3 text-xs text-[#574938]">
                      {uploadingKey === `snap-${index}` ? "업로드 중..." : "업로드"}
                    </span>
                  </label>
                  <button
                    type="button"
                    className="h-9 rounded-md border border-[#e1bfbf] px-3 text-xs text-[#8a4a4a]"
                    onClick={() =>
                      removeArrayItem(["snapSection", "images"], index)
                    }
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[#eadfcb] bg-[#fffcf7] p-3">
            <p className="text-sm font-semibold text-[#4e422f]">
              스냅 모달 설정
            </p>
            <div className="mt-3 overflow-hidden rounded-lg border border-[#e5dccb] bg-[#f7f2e8]">
              {content.snapSection.modal.coverImage.url ? (
                <div className="w-full">
                  <img
                    src={content.snapSection.modal.coverImage.url}
                    alt={SNAP_COVER_IMAGE_ALT}
                    className="block h-auto w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex min-h-[180px] w-full items-center justify-center text-xs text-[#8f816b]">
                  업로드된 커버 이미지가 없습니다.
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void handleUpload(
                      file,
                      ["snapSection", "modal", "coverImage", "url"],
                      "snap-cover",
                    );
                    updatePath(
                      ["snapSection", "modal", "coverImage", "alt"],
                      SNAP_COVER_IMAGE_ALT,
                    );
                    event.target.value = "";
                  }}
                />
                <span className="inline-flex h-9 cursor-pointer items-center rounded-md border border-[#d7c9b1] bg-white px-3 text-xs text-[#574938]">
                  {uploadingKey === "snap-cover"
                    ? "업로드 중..."
                    : "커버 이미지 업로드"}
                </span>
              </label>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <TextField
                label="가이드 제목"
                value={content.snapSection.modal.guideTitle}
                onChange={(value) =>
                  updatePath(["snapSection", "modal", "guideTitle"], value)
                }
              />
              <TextField
                label="빈 업로드 문구"
                value={content.snapSection.modal.uploadEmptyHint}
                onChange={(value) =>
                  updatePath(["snapSection", "modal", "uploadEmptyHint"], value)
                }
              />
              <TextField
                label="첨부 버튼 문구"
                value={content.snapSection.modal.attachButtonLabel}
                onChange={(value) =>
                  updatePath(
                    ["snapSection", "modal", "attachButtonLabel"],
                    value,
                  )
                }
              />
              <TextField
                label="최대 파일 수"
                type="number"
                value={String(content.snapSection.modal.maxFiles)}
                onChange={(value) =>
                  updatePath(
                    ["snapSection", "modal", "maxFiles"],
                    toNumber(value, content.snapSection.modal.maxFiles),
                  )
                }
              />
            </div>
            <p className="mt-3 text-xs text-[#7b6f5c]">
              뒤로가기 라벨, 이름 라벨, 이름 입력 안내 문구는 고정 문구로 표시됩니다.
            </p>

            <div className="mt-4">
              <TextAreaField
                label="모달 안내 문구 (줄바꿈으로 구분)"
                value={snapNoticeText}
                onChange={(value) => {
                  const lines = value.replace(/\r\n?/g, "\n").split("\n");
                  updatePath(["snapSection", "modal", "guideLines"], lines);
                  updatePath(["snapSection", "modal", "guideHighlightLines"], []);
                  updatePath(["snapSection", "modal", "policyLines"], []);
                }}
                rows={10}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          isActive={activeSection === "closing"}
          title="마지막 감사 이미지"
        >
          <div className="overflow-hidden rounded-lg border border-[#e5dccb] bg-[#f7f2e8]">
            <div className="relative aspect-[3/4] w-full">
              {content.closingSection.image.url ? (
                <Image
                  src={content.closingSection.image.url}
                  alt={content.closingSection.image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 980px) 100vw, 420px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#8f816b]">
                  업로드된 이미지가 없습니다.
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end border-t border-[#efe4d2] pt-3">
            <label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void handleUpload(
                    file,
                    ["closingSection", "image", "url"],
                    "closing-image",
                    { altPath: ["closingSection", "image", "alt"] },
                  );
                  event.target.value = "";
                }}
              />
              <span className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-[#d7c9b1] bg-white px-3 text-xs font-medium text-[#574938]">
                {uploadingKey === "closing-image" ? "업로드 중..." : "이미지 업로드"}
              </span>
            </label>
          </div>
        </SectionCard>
      </div>

      <div className="fixed bottom-6 left-1/2 z-[10030] -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-2xl border border-[#dfd3bf] bg-white/95 px-3 py-2 shadow-[0_10px_24px_rgba(70,55,25,0.20)] backdrop-blur">
          <button
            type="button"
            onClick={resetDraft}
            disabled={!isDirty || updateMutation.isPending}
            className="h-10 rounded-lg border border-[#d6c9b2] bg-white px-4 text-sm font-medium text-[#554634] transition hover:bg-[#f6efe3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            변경 취소
          </button>
          <button
            type="button"
            onClick={() => {
              void save();
            }}
            disabled={!isDirty || updateMutation.isPending}
            className="h-10 rounded-lg bg-[#4f402a] px-5 text-sm font-semibold text-white transition hover:bg-[#614f34] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateMutation.isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </main>
  );
}
