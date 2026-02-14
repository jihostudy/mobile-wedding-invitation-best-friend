'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ClosingSectionData, ImageAsset, ShareConfig } from '@/types';

interface ThankYouSectionProps {
  section: ClosingSectionData;
  image: ImageAsset;
  share: ShareConfig;
}

export default function ThankYouSection({ section, image, share }: ThankYouSectionProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('링크 복사에 실패했습니다.');
    }
  };

  const shareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const shareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(share.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
  };

  return (
    <section id="closing" className="bg-wedding-beige px-6 py-16 pb-24">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-wedding-brown/15 bg-white p-5 shadow-lg">
          <p className="text-center font-serif text-xs uppercase tracking-[0.33em] text-wedding-brown-light/70">{section.kicker}</p>
          <h2 className="mt-4 text-center text-2xl font-serif text-wedding-brown">{section.title}</h2>

          <div className="mt-5 relative aspect-square w-full overflow-hidden rounded-lg">
            <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 420px" />
          </div>

          <div className="mt-5 space-y-2 text-center text-wedding-brown">
            {section.messages.map((message) => (
              <p key={message} className="leading-relaxed">
                {message}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            onClick={copyLink}
            className="col-span-3 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-200"
          >
            {copied ? '복사되었습니다' : section.copyButtonLabel}
          </button>
          <button
            onClick={shareFacebook}
            className="rounded-lg bg-[#1877F2] px-3 py-2 text-xs font-semibold text-white"
            aria-label="페이스북 공유"
          >
            Facebook
          </button>
          <button
            onClick={shareTwitter}
            className="rounded-lg bg-[#1DA1F2] px-3 py-2 text-xs font-semibold text-white"
            aria-label="트위터 공유"
          >
            Twitter
          </button>
          <a
            href="/api/calendar"
            download="wedding.ics"
            className="rounded-lg bg-wedding-brown px-3 py-2 text-center text-xs font-semibold text-white"
          >
            Calendar
          </a>
        </div>
      </div>
    </section>
  );
}
