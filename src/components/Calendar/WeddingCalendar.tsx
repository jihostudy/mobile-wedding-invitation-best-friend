'use client';

import { useState, useEffect } from 'react';
import { WEDDING_DATA } from '@/constants/wedding-data';

/**
 * 결혼식 캘린더 및 카운트다운 타이머
 */
export default function WeddingCalendar() {
  const { groom, bride, date } = WEDDING_DATA;
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // 카운트다운 계산
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const weddingDate = date.fullDate.getTime();
      const difference = weddingDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [date.fullDate]);

  // 캘린더 생성
  const getCalendarDays = () => {
    const year = date.year;
    const month = date.month - 1; // JavaScript Date는 0부터 시작
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 빈 칸 추가 (첫 주의 시작일 전)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // 날짜 추가
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const calendarDays = getCalendarDays();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const weddingDay = date.day;

  return (
    <section className="section bg-wedding-beige">
      <div className="max-w-md w-full">
        {/* 날짜 정보 */}
        <div className="text-center mb-6">
          <p className="text-2xl font-semibold text-wedding-brown mb-2">
            {date.year}.{date.month}.{date.day}
          </p>
          <p className="text-base text-wedding-brown-light">
            {date.dayOfWeek} {date.time}
          </p>
        </div>

        {/* 캘린더 */}
        <div className="mb-8">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm text-wedding-brown-light py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isWeddingDay = day === weddingDay;
              return (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center text-sm ${
                    isWeddingDay
                      ? 'bg-wedding-brown/30 rounded-full text-wedding-brown font-semibold'
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

        {/* 카운트다운 타이머 */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2">
            {/* DAYS */}
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-lg px-4 py-3 min-w-[70px] text-center shadow-sm border border-wedding-beige">
                <p className="text-2xl font-bold text-wedding-brown">
                  {String(timeLeft.days).padStart(2, '0')}
                </p>
              </div>
              <p className="text-xs text-wedding-brown-light mt-2 font-medium">DAYS</p>
            </div>

            <span className="text-wedding-brown text-2xl font-bold">:</span>

            {/* HOUR */}
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-lg px-4 py-3 min-w-[70px] text-center shadow-sm border border-wedding-beige">
                <p className="text-2xl font-bold text-wedding-brown">
                  {String(timeLeft.hours).padStart(2, '0')}
                </p>
              </div>
              <p className="text-xs text-wedding-brown-light mt-2 font-medium">HOUR</p>
            </div>

            <span className="text-wedding-brown text-2xl font-bold">:</span>

            {/* MIN */}
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-lg px-4 py-3 min-w-[70px] text-center shadow-sm border border-wedding-beige">
                <p className="text-2xl font-bold text-wedding-brown">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </p>
              </div>
              <p className="text-xs text-wedding-brown-light mt-2 font-medium">MIN</p>
            </div>

            <span className="text-wedding-brown text-2xl font-bold">:</span>

            {/* SEC */}
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-lg px-4 py-3 min-w-[70px] text-center shadow-sm border border-wedding-beige">
                <p className="text-2xl font-bold text-wedding-brown">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </p>
              </div>
              <p className="text-xs text-wedding-brown-light mt-2 font-medium">SEC</p>
            </div>
          </div>
        </div>

        {/* 하단 메시지 */}
        <div className="text-center">
          <p className="text-sm text-wedding-brown-light">
            {groom.name} ❤️ {bride.name}의 결혼식이{' '}
            <span className="text-wedding-brown font-semibold">
              {timeLeft.days}일
            </span>
            남았습니다.
          </p>
        </div>
      </div>
    </section>
  );
}

