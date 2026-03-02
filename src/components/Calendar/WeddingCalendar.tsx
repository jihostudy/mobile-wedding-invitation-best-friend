"use client";

import { useEffect, useMemo, useState } from "react";
import FadeInUp from "@/components/common/FadeInUp";
import { buildWeddingDateTime } from "@/lib/date/wedding-date";
import type { CalendarSectionData, WeddingDate } from "@/types";

interface WeddingCalendarProps {
  date: WeddingDate;
  section: CalendarSectionData;
}

export default function WeddingCalendar({
  date,
  section,
}: WeddingCalendarProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const targetDate = useMemo(() => buildWeddingDateTime(date), [date]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const calendarDays = useMemo(() => {
    const year = date.year;
    const month = date.month - 1;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const leadingDays = Array.from({ length: firstDay.getDay() }, () => null);
    const monthDays = Array.from(
      { length: lastDay.getDate() },
      (_, index) => index + 1,
    );

    return [...leadingDays, ...monthDays];
  }, [date.month, date.year]);

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  return (
    <section id="calendar" className="bg-white px-9 py-16">
      <div className="mx-auto w-full max-w-md text-center">
        <FadeInUp delay={0.12} amount={0.15}>
          <div className="border-y border-gray-300/40 px-2 pb-4 pt-6">
            <p className="text-center text-lg font-semibold text-[#3f3f3f]">
              {date.year}년 {date.month}월 {date.day}일
            </p>
            <p className="mt-2 pb-4 text-sm text-[#3f3f3f]">
              {date.dayOfWeek} {date.time}
            </p>
            <div className="grid grid-cols-7 text-[14px] text-[#363636]">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className={`py-3 text-center ${day === "일" ? "text-[#d28390]" : ""}`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-[15px] text-[#585858]">
              {calendarDays.map((day, index) => {
                const isSunday = day !== null && index % 7 === 0;
                const isWeddingDay = day === date.day;
                return (
                  <div
                    key={`day-${index}`}
                    className="flex h-[40px] items-center justify-center"
                  >
                    {day ? (
                      <span
                        className={`flex h-[40px] w-[40px] items-center justify-center ${
                          isWeddingDay
                            ? "wedding-day-pulse rounded-full text-white"
                            : isSunday
                              ? "text-[#d28390]"
                              : "text-[#585858]"
                        }`}
                      >
                        {day}
                      </span>
                    ) : (
                      <span className="text-transparent">0</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2} amount={0.15}>
          <div className="mt-8 pt-4">
            <div className="font-crimson flex items-end justify-center gap-1 text-center">
              <div className="w-[72px]">
                <div className="mb-1 text-[13px] tracking-[0.04em] text-[#9a9a9a]">
                  DAYS
                </div>
                <span className="block min-w-[2rem] text-[26px] font-medium leading-none text-[#3c3c3c]">
                  {timeLeft.days}
                </span>
              </div>
              <div className="w-[14px]">
                <div className="mb-1 text-[13px] tracking-[0.04em] text-transparent">
                  &nbsp;
                </div>
                <span className="block h-[26px] text-[14px] leading-[26px] text-[#7a7a7a]">
                  :
                </span>
              </div>
              <div className="w-[62px]">
                <div className="mb-1 text-[13px] tracking-[0.04em] text-[#9a9a9a]">
                  HOUR
                </div>
                <span className="block text-[26px] font-medium leading-none text-[#3c3c3c]">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
              </div>
              <div className="w-[14px]">
                <div className="mb-1 text-[13px] tracking-[0.04em] text-transparent">
                  &nbsp;
                </div>
                <span className="block h-[26px] text-[14px] leading-[26px] text-[#7a7a7a]">
                  :
                </span>
              </div>
              <div className="w-[62px]">
                <div className="mb-1 text-[13px] tracking-[0.04em] text-[#9a9a9a]">
                  MIN
                </div>
                <span className="block text-[26px] font-medium leading-none text-[#3c3c3c]">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
              </div>
              <div className="w-[14px]">
                <div className="mb-1 text-[13px] tracking-[0.04em] text-transparent">
                  &nbsp;
                </div>
                <span className="block h-[26px] text-[14px] leading-[26px] text-[#7a7a7a]">
                  :
                </span>
              </div>
              <div className="w-[62px]">
                <div className="mb-1 text-[13px] tracking-[0.04em] text-[#9a9a9a]">
                  SEC
                </div>
                <span className="block text-[26px] font-medium leading-none text-[#3c3c3c]">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.28} amount={0.15}>
          <p className="mt-7 text-[15px] text-[#4a4a4a]">
            {section.countdownLabel}{" "}
            <span className="font-semibold">D-{timeLeft.days}</span>
          </p>
        </FadeInUp>
      </div>
    </section>
  );
}
