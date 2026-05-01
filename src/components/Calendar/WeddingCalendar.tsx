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
    <section id="calendar" className="bg-white px-9 py-12">
      <div className="mx-auto w-full max-w-md text-center">
        <FadeInUp delay={0.12} amount={0.15}>
          <div className="border-y border-gray-300/40 px-2 pb-8 pt-8">
            <p className="text-center text-lg font-semibold text-[#3f3f3f]">
              {date.year}년 {date.month}월 {date.day}일
            </p>
            <p className="mt-2 mb-5 text-sm text-[#3f3f3f]">
              {date.dayOfWeek} {date.time}
            </p>

            <div className="mt-1 grid grid-cols-7 text-[14px] text-[#363636]">
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
                    {day && isWeddingDay ? (
                      <span className="wedding-day-pulse relative flex h-[40px] w-[40px] items-center justify-center text-white">
                        <svg
                          aria-hidden
                          className="absolute left-1/2 top-1/2 -z-10 h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 overflow-visible"
                          viewBox="0 0 48 48"
                        >
                          <path
                            className="wedding-day-heart-halo"
                            d="M24 41s-2.1-1.8-4.7-4.1C11.2 29.8 6 25 6 17.8 6 12.1 10.5 8 15.9 8c3.2 0 6.2 1.5 8.1 3.9C25.9 9.5 28.9 8 32.1 8 37.5 8 42 12.1 42 17.8c0 7.2-5.2 12-13.3 19.1C26.1 39.2 24 41 24 41z"
                          />
                          <path
                            className="wedding-day-heart-fill"
                            d="M24 41s-2.1-1.8-4.7-4.1C11.2 29.8 6 25 6 17.8 6 12.1 10.5 8 15.9 8c3.2 0 6.2 1.5 8.1 3.9C25.9 9.5 28.9 8 32.1 8 37.5 8 42 12.1 42 17.8c0 7.2-5.2 12-13.3 19.1C26.1 39.2 24 41 24 41z"
                          />
                        </svg>
                        <span className="relative z-10">{day}</span>
                      </span>
                    ) : day ? (
                      <span
                        className={`flex h-[40px] w-[40px] items-center justify-center ${
                          isSunday ? "text-[#d28390]" : "text-[#585858]"
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
                  DAY
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
