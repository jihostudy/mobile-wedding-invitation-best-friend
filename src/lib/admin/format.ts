import type { RsvpAttendStatus, RsvpSide } from "@/types";

export function formatAdminDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatAttendStatus(status: RsvpAttendStatus) {
  return status === "available" ? "참석" : "불참";
}

export function formatSide(side: RsvpSide) {
  return side === "groom" ? "신랑측" : "신부측";
}

export function formatBooleanKorean(value: boolean) {
  return value ? "예" : "아니오";
}

