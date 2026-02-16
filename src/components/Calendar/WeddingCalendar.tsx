"use client";

import { useEffect, useMemo, useState } from "react";
import { buildWeddingDateTime } from "@/lib/date/wedding-date";
import type { Person, WeddingDate } from "@/types";

interface WeddingCalendarProps {
  groom: Person;
  bride: Person;
  date: WeddingDate;
}

export default function WeddingCalendar({
  groom,
  bride,
  date,
}: WeddingCalendarProps) {
  const groomGivenName =
    groom.name.length > 1 ? groom.name.slice(1) : groom.name;
  const brideGivenName =
    bride.name.length > 1 ? bride.name.slice(1) : bride.name;
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [elapsedDays, setElapsedDays] = useState(0);
  const [isMarried, setIsMarried] = useState(false);

  const targetDate = useMemo(() => buildWeddingDateTime(date), [date]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        const passed = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setElapsedDays(passed);
        setIsMarried(true);
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
      setElapsedDays(0);
      setIsMarried(false);
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
    <section id="calendar" className="bg-white px-6 py-16">
      <div className="mx-auto w-full max-w-md text-center">
        <p className="text-xl font-medium tracking-[0.01em] text-[#2f2f2f]">
          {date.year}.{String(date.month).padStart(2, "0")}.
          {String(date.day).padStart(2, "0")}
        </p>
        <p className="mt-2 text-base text-[#3f3f3f]">
          {date.dayOfWeek} {date.time}
        </p>

        <div className="mt-8 border-y border-gray-300/40 px-2 pb-4 pt-6">
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

        <div className="mt-8 pt-4">
          <div className="font-crimson flex items-end justify-center gap-1 text-center">
            <div className="w-[72px]">
              <div className="mb-1 text-[10px] tracking-[0.04em] text-[#9a9a9a]">
                DAYS
              </div>
              <span className="block min-w-[2rem] text-[31px] font-medium leading-none text-[#3c3c3c]">
                {timeLeft.days}
              </span>
            </div>
            <div className="w-[14px]">
              <div className="mb-1 text-[10px] tracking-[0.04em] text-transparent">
                &nbsp;
              </div>
              <span className="block text-[31px] leading-none text-[#7a7a7a]">
                :
              </span>
            </div>
            <div className="w-[62px]">
              <div className="mb-1 text-[10px] tracking-[0.04em] text-[#9a9a9a]">
                HOUR
              </div>
              <span className="block text-[31px] font-medium leading-none text-[#3c3c3c]">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
            </div>
            <div className="w-[14px]">
              <div className="mb-1 text-[10px] tracking-[0.04em] text-transparent">
                &nbsp;
              </div>
              <span className="block text-[31px] leading-none text-[#7a7a7a]">
                :
              </span>
            </div>
            <div className="w-[62px]">
              <div className="mb-1 text-[10px] tracking-[0.04em] text-[#9a9a9a]">
                MIN
              </div>
              <span className="block text-[31px] font-medium leading-none text-[#3c3c3c]">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
            </div>
            <div className="w-[14px]">
              <div className="mb-1 text-[10px] tracking-[0.04em] text-transparent">
                &nbsp;
              </div>
              <span className="block text-[31px] leading-none text-[#7a7a7a]">
                :
              </span>
            </div>
            <div className="w-[62px]">
              <div className="mb-1 text-[10px] tracking-[0.04em] text-[#9a9a9a]">
                SEC
              </div>
              <span className="block text-[31px] font-medium leading-none text-[#3c3c3c]">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-7 text-[15px] text-[#4a4a4a]">
          {isMarried ? (
            <>
              {groomGivenName}, {brideGivenName} 결혼한지{" "}
              <span className="font-semibold">{elapsedDays}</span>일 되었습니다.
            </>
          ) : (
            <>
              {groomGivenName}, {brideGivenName}의 결혼식이{" "}
              <span className="font-semibold">{timeLeft.days}</span>일
              남았습니다.
            </>
          )}
        </p>
      </div>
    </section>
  );
}
