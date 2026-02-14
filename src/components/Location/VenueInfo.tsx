"use client";

import type { LocationSectionData, Venue, WeddingDate } from "@/types";

interface VenueInfoProps {
  section: LocationSectionData;
  venue: Venue;
  date: WeddingDate;
}

export default function VenueInfo({ section, venue, date }: VenueInfoProps) {
  const mapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(venue.address)}`;
  const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${venue.coordinates.lat},${venue.coordinates.lng}&zoom=16&size=900x420&maptype=mapnik&markers=${venue.coordinates.lat},${venue.coordinates.lng},lightblue1`;
  const subwayLines = venue.transport?.subwayDetails?.length
    ? venue.transport.subwayDetails
    : (venue.transport?.subway ?? []).map((label, index) => ({
        label,
        color: index === 0 ? "#D31145" : "#747F00",
      }));
  const busLines = venue.transport?.bus ?? [];
  const trunkBus =
    busLines
      .find((line) => line.includes("간선"))
      ?.replace("간선버스:", "")
      .trim() ?? "-";
  const branchBus =
    busLines
      .find((line) => line.includes("지선"))
      ?.replace("지선버스:", "")
      .trim() ?? "-";

  return (
    <section id="location" className="py-16">
      <div className="mx-auto w-full max-w-[425px]">
        <div className="px-8 text-center">
          <p className="font-serif text-xs uppercase tracking-[0.33em] text-wedding-brown-light/70">
            {section.kicker}
          </p>
          <h2 className="mt-3 text-xl font-serif text-wedding-brown">
            {section.title}
          </h2>
        </div>

        <div className="mt-10 px-8 text-center">
          <h3 className="text-xl font-bold text-wedding-brown">
            {venue.name}
            {venue.floor ? ` ${venue.floor}` : ""}
          </h3>
          <p className="mt-2 text-[15px] text-wedding-brown-light">
            {venue.address}
          </p>
          <p className="mt-2 text-[15px] text-wedding-brown-light">
            Tel. {venue.contact ?? "02-000-0000"}
          </p>
        </div>

        <div className="mt-8 overflow-hidden border-y border-gray-300/70">
          <img
            src={staticMapUrl}
            alt={`${venue.name} 지도`}
            className="h-[230px] w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="px-8">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-transparent px-6 py-3 text-[15px] font-medium text-wedding-brown"
          >
            약도 이미지 보기
          </a>
        </div>

        <div className="mx-8 mt-10 border-t border-gray-300/80 pt-8">
          <h4 className="text-base font-semibold text-wedding-brown">지하철</h4>
          <div className="mt-4 space-y-2 text-[15px] text-wedding-brown">
            {subwayLines.map((line) => (
              <p key={line.label}>
                <span
                  className="mr-2 inline-block h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                {line.label}
              </p>
            ))}
          </div>
        </div>

        <div className="mx-8 mt-8 border-t border-gray-300/80 pt-8">
          <h4 className="text-base font-semibold text-wedding-brown">
            셔틀버스
          </h4>
          <p className="mt-4 text-[15px] text-wedding-brown">
            {venue.transport?.shuttlePickup ??
              `${date.month}월 ${date.day}일 강남구청역 인근 셔틀 탑승`}
          </p>
        </div>

        <div className="mx-8 mt-8 border-t border-gray-300/80 pt-8">
          <h4 className="text-base font-semibold text-wedding-brown">버스</h4>
          <div className="mt-4 space-y-2 text-[15px] text-wedding-brown">
            <p>
              <span className="mr-2 inline-block h-3.5 w-3.5 rounded-full bg-[#1d3f8a]" />
              간선버스 : {trunkBus}
            </p>
            <p>
              <span className="mr-2 inline-block h-3.5 w-3.5 rounded-full bg-[#2d9b46]" />
              지선버스 : {branchBus}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
