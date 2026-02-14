'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CalendarSectionData, Person, WeddingDate } from '@/types';

interface WeddingCalendarProps {
  section: CalendarSectionData;
  groom: Person;
  bride: Person;
  date: WeddingDate;
}

export default function WeddingCalendar({ section, groom, bride, date }: WeddingCalendarProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = date.fullDate.getTime() - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [date.fullDate]);

  const calendarDays = useMemo(() => {
    const year = date.year;
    const month = date.month - 1;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const leadingDays = Array.from({ length: firstDay.getDay() }, () => null);
    const monthDays = Array.from({ length: lastDay.getDate() }, (_, index) => index + 1);

    return [...leadingDays, ...monthDays];
  }, [date.month, date.year]);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <section id="calendar" className="bg-[#F9ECE3] px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <p className="font-serif text-xs uppercase tracking-[0.32em] text-wedding-brown-light/70">{section.title}</p>
          <p className="mt-3 text-3xl font-semibold text-wedding-brown">
            {date.year}.{String(date.month).padStart(2, '0')}.{String(date.day).padStart(2, '0')}
          </p>
          <p className="mt-1 text-sm text-wedding-brown-light">{section.subtitle}</p>
        </div>

        <div className="mt-8 rounded-2xl border border-wedding-brown/10 bg-white/40 p-5 shadow-sm">
          <div className="mb-3 text-center text-sm font-medium text-wedding-brown-light">{section.monthLabel}</div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className={`py-2 text-center text-xs ${day === '일' ? 'text-red-500' : 'text-wedding-brown-light'}`}>
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isSunday = day !== null && index % 7 === 0;
              const isWeddingDay = day === date.day;
              return (
                <div
                  key={`day-${index}`}
                  className={`aspect-square flex items-center justify-center text-sm ${
                    isWeddingDay
                      ? 'rounded-full bg-wedding-brown/25 font-semibold text-wedding-brown'
                      : isSunday
                      ? 'text-red-500'
                      : day
                      ? 'text-wedding-brown'
                      : 'text-transparent'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-wedding-brown/10 bg-white/50 px-4 py-5">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'DAYS', value: String(timeLeft.days).padStart(3, '0') },
              { label: 'HOUR', value: String(timeLeft.hours).padStart(2, '0') },
              { label: 'MIN', value: String(timeLeft.minutes).padStart(2, '0') },
              { label: 'SEC', value: String(timeLeft.seconds).padStart(2, '0') },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-2xl font-bold text-wedding-brown">{item.value}</p>
                <p className="mt-1 text-[10px] tracking-[0.2em] text-wedding-brown-light">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-wedding-brown-light">
          {groom.name} ♥ {bride.name}의 결혼식이 <span className="font-semibold text-wedding-brown">{timeLeft.days}일</span> 남았습니다.
        </p>
      </div>
    </section>
  );
}
