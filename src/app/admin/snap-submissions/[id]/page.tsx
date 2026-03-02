"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import { Download } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { formatAdminDateTime } from "@/lib/admin/format";
import AdminSummaryCards from "@/components/Admin/AdminSummaryCards";
import Carousel from "@/components/common/Carousel";
import useToast from "@/components/common/toast/useToast";
import { useAdminGuestMessagesQuery } from "@/lib/queries/admin-guest-messages";
import { useAdminRsvpResponsesQuery } from "@/lib/queries/rsvp";
import {
  useAdminSnapSubmissionQuery,
  useAdminSnapSubmissionsQuery,
} from "@/lib/queries/snap";
import type { SnapFileDto } from "@/types";

const statusLabelMap: Record<"approved" | "rejected", string> = {
  approved: "승인됨",
  rejected: "반려됨",
};

const statusChipClassMap: Record<"approved" | "rejected", string> = {
  approved: "border-[#b8dfc2] bg-[#ebf8ef] text-[#25643a]",
  rejected: "border-[#e5c2c2] bg-[#fdeeee] text-[#8d3232]",
};

export default function AdminSnapSubmissionDetailPage() {
  const toast = useToast();
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? "";
  const router = useRouter();

  const guestMessagesQuery = useAdminGuestMessagesQuery();
  const rsvpResponsesQuery = useAdminRsvpResponsesQuery();
  const snapSubmissionsQuery = useAdminSnapSubmissionsQuery();
  const submissionQuery = useAdminSnapSubmissionQuery(submissionId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(3 / 4);

  useEffect(() => {
    const errors = [
      guestMessagesQuery.error,
      rsvpResponsesQuery.error,
      snapSubmissionsQuery.error,
      submissionQuery.error,
    ];
    const hasUnauthorizedError = errors.some(
      (error) => error instanceof ApiError && error.status === 401,
    );
    if (hasUnauthorizedError) {
      router.replace("/admin");
    }
  }, [
    guestMessagesQuery.error,
    router,
    rsvpResponsesQuery.error,
    snapSubmissionsQuery.error,
    submissionQuery.error,
  ]);

  const loading =
    guestMessagesQuery.isLoading ||
    rsvpResponsesQuery.isLoading ||
    snapSubmissionsQuery.isLoading;
  const guestMessageCount = guestMessagesQuery.data?.messages.length ?? 0;
  const attendanceCount = rsvpResponsesQuery.data?.responses.length ?? 0;
  const snapCount = snapSubmissionsQuery.data?.submissions.length ?? 0;

  const submission = submissionQuery.data?.submission;
  const files = submission?.files ?? [];
  const boundedIndex = useMemo(() => {
    if (files.length === 0) return 0;
    if (currentIndex < 0) return 0;
    if (currentIndex >= files.length) return files.length - 1;
    return currentIndex;
  }, [currentIndex, files.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [submissionId]);

  useEffect(() => {
    const file = files[boundedIndex];
    if (!file?.publicUrl) {
      setCurrentAspectRatio(3 / 4);
      return;
    }

    let cancelled = false;
    const probe = new window.Image();
    probe.onload = () => {
      if (cancelled) return;
      const width = probe.naturalWidth || 0;
      const height = probe.naturalHeight || 0;
      if (width > 0 && height > 0) {
        setCurrentAspectRatio(width / height);
      }
    };
    probe.onerror = () => {
      if (cancelled) return;
      setCurrentAspectRatio(3 / 4);
    };
    probe.src = file.publicUrl;

    return () => {
      cancelled = true;
    };
  }, [boundedIndex, files]);

  const getFileName = (file: SnapFileDto, index: number) => {
    const original = file.originalName?.trim();
    if (original) return original;
    const safeUploader = (submission?.uploaderName || "snap").replace(/\s+/g, "_");
    return `${safeUploader}_${index + 1}.jpg`;
  };

  const downloadSingleFile = async (file: SnapFileDto, index: number) => {
    if (!file.publicUrl) {
      toast.error("다운로드할 이미지 경로가 없습니다.");
      return;
    }

    const filename = getFileName(file, index);
    try {
      const response = await fetch(file.publicUrl);
      if (!response.ok) {
        throw new Error(`download failed: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement("a");
      link.href = file.publicUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const downloadAllFiles = async () => {
    if (files.length === 0 || isDownloadingAll) return;
    setIsDownloadingAll(true);

    try {
      const zip = new JSZip();
      const usedNames = new Set<string>();
      let addedCount = 0;
      let failedCount = 0;

      const getUniqueFileName = (name: string) => {
        if (!usedNames.has(name)) {
          usedNames.add(name);
          return name;
        }

        const dotIndex = name.lastIndexOf(".");
        const base = dotIndex > 0 ? name.slice(0, dotIndex) : name;
        const ext = dotIndex > 0 ? name.slice(dotIndex) : "";

        let suffix = 2;
        let candidate = `${base} (${suffix})${ext}`;
        while (usedNames.has(candidate)) {
          suffix += 1;
          candidate = `${base} (${suffix})${ext}`;
        }
        usedNames.add(candidate);
        return candidate;
      };

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (!file.publicUrl) {
          failedCount += 1;
          continue;
        }

        try {
          const response = await fetch(file.publicUrl);
          if (!response.ok) throw new Error(`download failed: ${response.status}`);
          const blob = await response.blob();
          const filename = getUniqueFileName(getFileName(file, index));
          zip.file(filename, blob);
          addedCount += 1;
        } catch {
          failedCount += 1;
        }
      }

      if (addedCount === 0) {
        toast.error("ZIP으로 묶을 수 있는 이미지가 없습니다.");
        return;
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const safeUploader = (submission?.uploaderName || "snap")
        .trim()
        .replace(/[^\p{L}\p{N}_-]+/gu, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 40);
      const zipFileName = `스냅사진_${safeUploader || "snap"}_${submissionId.slice(0, 8) || "album"}.zip`;
      const blobUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);

      if (failedCount > 0) {
        toast.success(`ZIP 다운로드 완료 (${addedCount}개 성공, ${failedCount}개 실패)`);
      } else {
        toast.success(`ZIP 다운로드 완료 (${addedCount}개)`);
      }
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[980px] px-6 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#2f271b]">스냅 상세</h1>
        <Link
          href="/admin/snap-submissions"
          className="rounded-lg border border-[#d6c9b2] bg-white/80 px-3 py-2 text-sm text-[#554634] transition hover:bg-[#f6efe3]"
        >
          목록으로
        </Link>
      </div>
      <AdminSummaryCards
        loading={loading}
        guestMessageCount={guestMessageCount}
        attendanceCount={attendanceCount}
        snapCount={snapCount}
        active="snap-submissions"
      />

      {submissionQuery.isLoading ? (
        <p className="mt-6 text-sm text-[#7f7f7f]">불러오는 중...</p>
      ) : null}

      {!submissionQuery.isLoading && submissionQuery.error instanceof ApiError && submissionQuery.error.status === 404 ? (
        <div className="mt-6 rounded-xl border border-[#e7d1d1] bg-[#fff8f8] px-5 py-4 text-sm text-[#8a4545]">
          요청한 스냅 앨범을 찾을 수 없습니다.
        </div>
      ) : null}

      {!submissionQuery.isLoading && submission ? (
        <section className="mt-6 rounded-2xl border border-[#e8dece] bg-white/90 p-5 shadow-[0_10px_24px_rgba(70,55,25,0.08)]">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-[#2f2f2f]">
              {submission.uploaderName || "익명"}
            </p>
            {submission.status !== "uploaded" ? (
              <span
                className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${
                  statusChipClassMap[submission.status]
                }`}
              >
                {statusLabelMap[submission.status]}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => {
                void downloadAllFiles();
              }}
              disabled={files.length === 0 || isDownloadingAll}
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-[#d6c9b2] bg-white px-3 py-1.5 text-xs text-[#574938] transition hover:bg-[#f6efe3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />
              {isDownloadingAll ? "다운로드 중..." : "전체 다운로드"}
            </button>
          </div>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            업로드: {formatAdminDateTime(submission.createdAt)} / 파일 {files.length}장
          </p>

          {files.length > 0 ? (
            <>
              <div className="relative mx-auto mt-5 w-full max-w-[560px] overflow-visible rounded-xl bg-[#f2f2f2]">
                <button
                  type="button"
                  onClick={() => {
                    const file = files[boundedIndex];
                    if (!file) return;
                    void downloadSingleFile(file, boundedIndex);
                  }}
                  className="absolute right-2 top-2 z-40 inline-flex items-center gap-1 rounded-md border border-[#d6c9b2] bg-white/90 px-2 py-1 text-[11px] text-[#574938] shadow-sm backdrop-blur transition hover:bg-white"
                >
                  <Download size={12} />
                  현재 사진 다운로드
                </button>
                <Carousel<SnapFileDto>
                  items={files}
                  index={boundedIndex}
                  onIndexChange={setCurrentIndex}
                  loop={false}
                  showArrows={files.length > 1}
                  showDots={false}
                  className="mx-auto w-full"
                  viewportClassName="overflow-hidden rounded-xl bg-[#f2f2f2] transition-[aspect-ratio,height] duration-300 ease-in-out"
                  viewportStyle={{ aspectRatio: currentAspectRatio, transition: "aspect-ratio 300ms ease, height 300ms ease" }}
                  renderItem={(file, params) => (
                    <div className="relative h-full w-full">
                      {file.publicUrl ? (
                        <Image
                          src={file.publicUrl}
                          alt={file.originalName || `snap image ${params.index + 1}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 100vw, 560px"
                          priority={params.index === boundedIndex}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-[#a0a0a0]">
                          이미지 경로가 없습니다.
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
              <p className="mt-3 text-center text-xs text-[#7a7a7a]">
                {boundedIndex + 1} / {files.length}
              </p>

              <div className="mx-auto mt-4 grid w-full max-w-[560px] grid-cols-4 gap-2 sm:grid-cols-6">
                {files.map((file, index) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`relative aspect-square w-full overflow-hidden rounded-md border transition ${
                      index === boundedIndex
                        ? "border-[#3a3a3a] ring-1 ring-[#3a3a3a]"
                        : "border-[#d8d8d8] hover:border-[#bcbcbc]"
                    }`}
                    aria-label={`${index + 1}번 이미지 보기`}
                    aria-current={index === boundedIndex}
                  >
                    {file.publicUrl ? (
                      <Image
                        src={file.publicUrl}
                        alt={file.originalName || `thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-[#9a9a9a]">
                        없음
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-5 text-sm text-[#7f7f7f]">이 제출건에는 이미지가 없습니다.</p>
          )}
        </section>
      ) : null}
    </main>
  );
}
