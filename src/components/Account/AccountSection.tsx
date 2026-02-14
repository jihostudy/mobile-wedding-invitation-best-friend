'use client';

import { useState } from 'react';
import type { AccountSectionData } from '@/types';

interface AccountSectionProps {
  section: AccountSectionData;
}

export default function AccountSection({ section }: AccountSectionProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (error) {
      console.error('copy failed', error);
      alert('계좌번호 복사에 실패했습니다.');
    }
  };

  return (
    <section id="account" className="bg-wedding-beige px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <p className="font-serif text-xs uppercase tracking-[0.33em] text-wedding-brown-light/70">{section.kicker}</p>
          <h2 className="mt-3 text-3xl font-serif text-wedding-brown">{section.title}</h2>
          <p className="mt-3 text-sm text-wedding-brown-light">{section.description}</p>
        </div>

        <div className="mt-7 space-y-3">
          {section.accounts.length === 0 ? (
            <div className="rounded-xl border border-wedding-brown/15 bg-white/60 p-4 text-center text-sm text-wedding-brown-light">
              계좌 정보가 준비 중입니다.
            </div>
          ) : (
            section.accounts.map((account, index) => (
              <div key={`${account.bank}-${account.account}`} className="rounded-xl border border-wedding-brown/15 bg-white/60 p-4">
                <p className="text-xs tracking-[0.18em] text-wedding-brown-light uppercase">{account.label || `계좌 ${index + 1}`}</p>
                <p className="mt-1 text-lg font-semibold text-wedding-brown">{account.bank}</p>
                <p className="mt-2 text-sm text-wedding-brown">{account.account}</p>
                <p className="text-xs text-wedding-brown-light">예금주 {account.holder}</p>
                <button
                  onClick={() => handleCopy(account.account, index)}
                  className="mt-3 w-full rounded-lg border border-wedding-brown/20 bg-white px-3 py-2 text-sm font-medium text-wedding-brown transition hover:bg-wedding-beige"
                >
                  {copiedIndex === index ? '복사되었습니다' : '계좌번호 복사'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
