"use client";

import { useState } from "react";

import FadeInUp from "@/components/common/FadeInUp";
import NaverMap from "@/components/Location/NaverMap";
import type { Venue, WeddingDate } from "@/types";

interface VenueInfoProps {
  venue: Venue;
  date: WeddingDate;
}

export default function VenueInfo({ venue, date }: VenueInfoProps) {
  const [isMapLoadFailed, setIsMapLoadFailed] = useState(false);

  const hasNaverMapKey = Boolean(process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID);
  const subwayLines = venue.transport?.subwayDetails?.length
    ? venue.transport.subwayDetails
    : (venue.transport?.subway ?? []).map((label) => ({
        label,
        color: "#8d8d8d",
      }));
  const busLines = venue.transport?.busDetails?.length
    ? venue.transport.busDetails
    : (venue.transport?.bus ?? []).map((line) => {
        if (line.includes("간선")) {
          return {
            label: `간선버스 : ${line.replace("간선버스:", "").trim()}`,
            color: "#1d3f8a",
          };
        }
        if (line.includes("지선")) {
          return {
            label: `지선버스 : ${line.replace("지선버스:", "").trim()}`,
            color: "#2d9b46",
          };
        }
        return {
          label: line,
          color: "#8d8d8d",
        };
      });

  return (
    <section id="location" className="py-16">
      <div className="mx-auto w-full max-w-[425px]">
        <div className="px-8 text-center">
          <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
            LOCATION
          </p>
          <h2 className="mt-3 text-xl tracking-[0.04em] text-wedding-gray-dark">
            오시는 길
          </h2>
        </div>

        <div className="pt-8 pb-4 text-center">
          <h3 className="text-xl font-medium text-wedding-gray">
            {venue.name}
            {venue.floor ? ` ${venue.floor}` : ""}
          </h3>
          <p className="mt-5 text-[15px] text-wedding-gray-light">
            {venue.address}
          </p>
          <p className="mt-4 text-[15px] font-medium text-wedding-gray-light">
            Tel. {venue.contact ?? "02-000-0000"}
          </p>
        </div>

        <div className="text-center shadow-sm">
          {hasNaverMapKey && !isMapLoadFailed && (
            <div>
              <NaverMap
                lat={venue.coordinates.lat}
                lng={venue.coordinates.lng}
                markerTitle={venue.name}
                onError={() => setIsMapLoadFailed(true)}
              />
            </div>
          )}

          {(!hasNaverMapKey || isMapLoadFailed) && (
            <div className="px-4 py-6">
              <p className="rounded-xl border border-wedding-brown/15 bg-wedding-beige/60 px-4 py-3 text-sm text-wedding-brown-light">
                {!hasNaverMapKey
                  ? "네이버 지도 키가 설정되지 않아 지도 미리보기를 표시할 수 없어요. 아래 버튼에서 네이버지도를 열어주세요."
                  : "지도 정보를 불러오지 못했어요. 아래 버튼에서 네이버지도를 열어주세요."}
              </p>
            </div>
          )}
        </div>

        <FadeInUp className="mx-8 mt-2 pt-8">
          <h4 className="text-base font-medium text-wedding-gray">지하철</h4>
          <div className="mt-4 space-y-2 text-[15px] text-wedding-gray">
            {subwayLines.map((line) => (
              <p key={line.label} className="flex items-center">
                <span
                  className="mr-2 inline-block h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                {line.label}
              </p>
            ))}
          </div>
        </FadeInUp>

        <FadeInUp className="mx-8 mt-8 border-t border-gray-300/80 pt-8" delay={0.12}>
          <h4 className="text-base font-medium text-wedding-gray">버스</h4>
          <div className="mt-4 space-y-2 text-[15px] text-wedding-gray">
            {busLines.map((line) => (
              <p key={line.label} className="flex items-center">
                <span
                  className="mr-2 inline-block h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                {line.label}
              </p>
            ))}
          </div>
        </FadeInUp>

        <FadeInUp className="mx-8 mt-8 border-t border-gray-300/80 pt-8" delay={0.24}>
          <h4 className="text-base font-medium text-wedding-gray">셔틀버스</h4>
          <p className="mt-4 text-[15px] text-wedding-gray">
            {venue.transport?.shuttlePickup ??
              `${date.month}월 ${date.day}일 강남구청역 인근 셔틀 탑승`}
          </p>
        </FadeInUp>
      </div>
    </section>
  );
}
