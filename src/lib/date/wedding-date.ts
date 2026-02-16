import type { WeddingDate } from "@/types";

function parseTimeLabel(timeLabel: string) {
  const normalized = timeLabel.trim();
  const match = normalized.match(/(\d{1,2})(?:\D+(\d{1,2}))?/);

  let hour = 12;
  let minute = 0;

  if (match) {
    hour = Number(match[1]);
    minute = Number(match[2] ?? "0");
  }

  const isMorning = /오전/.test(normalized);
  const isAfternoon = /오후|저녁|밤|pm|PM/.test(normalized);
  const isDaytime = /낮/.test(normalized);

  if (isMorning && hour === 12) {
    hour = 0;
  } else if ((isAfternoon || isDaytime) && hour < 12) {
    hour += 12;
  }

  hour = Math.max(0, Math.min(hour, 23));
  minute = Math.max(0, Math.min(minute, 59));

  return { hour, minute };
}

export function buildWeddingDateTime(date: WeddingDate) {
  const { hour, minute } = parseTimeLabel(date.time);
  return new Date(date.year, date.month - 1, date.day, hour, minute, 0, 0);
}
