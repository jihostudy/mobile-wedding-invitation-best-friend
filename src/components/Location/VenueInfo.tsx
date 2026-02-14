'use client';

import type { LocationSectionData, Venue, WeddingDate } from '@/types';

interface VenueInfoProps {
  section: LocationSectionData;
  venue: Venue;
  date: WeddingDate;
}

export default function VenueInfo({ section, venue, date }: VenueInfoProps) {
  const mapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(venue.address)}`;

  return (
    <section id="location" className="bg-wedding-beige px-6 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="font-serif text-xs uppercase tracking-[0.33em] text-wedding-brown-light/70">{section.kicker}</p>
          <h2 className="mt-3 text-3xl font-serif text-wedding-brown">{section.title}</h2>
          <p className="mt-2 text-sm text-wedding-brown-light">
            {date.year}년 {date.month}월 {date.day}일 {date.dayOfWeek} {date.time}
          </p>
        </div>

        <div className="rounded-2xl border border-wedding-brown/15 bg-white/50 p-6 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-wedding-brown">
            {venue.name}
            {venue.floor ? ` ${venue.floor}` : ''}
          </h3>
          <p className="mt-2 text-sm text-wedding-brown-light">{venue.address}</p>
          {venue.contact && <p className="text-sm text-wedding-brown-light">Tel. {venue.contact}</p>}

          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-full border border-wedding-brown/30 bg-white px-6 py-2 text-sm font-medium text-wedding-brown transition hover:bg-wedding-beige"
          >
            {section.mapCtaLabel}
          </a>
        </div>

        {venue.transport && (
          <div className="mt-8 space-y-4 rounded-2xl border border-wedding-brown/10 bg-white/45 p-5 text-sm text-wedding-brown">
            {venue.transport.parking && (
              <div>
                <p className="font-semibold">자가용</p>
                <p className="mt-1 text-wedding-brown-light">{venue.transport.parking}</p>
              </div>
            )}
            {venue.transport.subway && venue.transport.subway.length > 0 && (
              <div>
                <p className="font-semibold">지하철</p>
                {venue.transport.subway.map((line) => (
                  <p key={line} className="mt-1 text-wedding-brown-light">
                    {line}
                  </p>
                ))}
              </div>
            )}
            {venue.transport.bus && venue.transport.bus.length > 0 && (
              <div>
                <p className="font-semibold">버스</p>
                {venue.transport.bus.map((line) => (
                  <p key={line} className="mt-1 text-wedding-brown-light">
                    {line}
                  </p>
                ))}
                {venue.transport.busNote && <p className="mt-1 text-wedding-brown-light">{venue.transport.busNote}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
