import { NextResponse } from 'next/server';
import { WEDDING_DATA } from '@/constants/wedding-data';

/**
 * ICS (iCalendar) 파일 생성 API
 * 캘린더 저장 기능
 */
export async function GET() {
  const { groom, bride, date, venue } = WEDDING_DATA;

  // 날짜 포맷 (YYYYMMDDTHHMMSS)
  const startDate = date.fullDate;
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2시간 후

  const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}00`;
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invitation//KO
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@wedding-invitation
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${groom.name} ♥ ${bride.name} 결혼식
DESCRIPTION:${groom.name}과 ${bride.name}의 결혼식에 초대합니다.
LOCATION:${venue.name}, ${venue.address}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:1시간 후 결혼식이 시작됩니다.
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return new NextResponse(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="wedding.ics"',
    },
  });
}


