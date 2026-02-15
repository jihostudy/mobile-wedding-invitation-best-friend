"use client";

import { useState } from "react";
import type { AccountSectionData } from "@/types";

interface AccountSectionProps {
  section: AccountSectionData;
}

export default function AccountSection({ section }: AccountSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(section.groups.map((group) => [group.id, true])),
  );

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (error) {
      console.error("copy failed", error);
      alert("계좌번호 복사에 실패했습니다.");
    }
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <section id="account" className="bg-white px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <p className="font-crimson text-xs uppercase tracking-[0.33em] text-wedding-brown-light/70">
            {section.kicker}
          </p>
          <h2 className="mt-3 text-xl text-wedding-brown">
            {section.title}
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-wedding-brown-light">
            {section.description}
          </p>
        </div>

        <div className="mt-7 space-y-3">
          {section.groups.length === 0 ? (
            <div className="rounded-xl border border-wedding-brown/15 bg-[#f7f7f7] p-4 text-center text-sm text-wedding-brown-light">
              계좌 정보가 준비 중입니다.
            </div>
          ) : (
            section.groups.map((group) => (
              <div
                key={group.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-[#f3f3f3]"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="relative flex w-full items-center justify-center bg-[#f3f3f3] px-5 py-4 text-center"
                  aria-expanded={openGroups[group.id]}
                >
                  <span className="text-lg font-medium text-wedding-brown">
                    {group.label}
                  </span>
                  <span
                    className={`absolute right-5 text-sm text-wedding-brown transition-transform ${openGroups[group.id] ? "rotate-180" : ""}`}
                  >
                    ⌃
                  </span>
                </button>

                {openGroups[group.id] && (
                  <div className="border-t border-gray-200 bg-white">
                    {group.accounts.map((account, index) => {
                      const rowKey = `${group.id}-${index}`;
                      return (
                        <div
                          key={rowKey}
                          className={`flex items-center justify-between px-5 py-4`}
                        >
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(account.account, rowKey)
                              }
                              className="flex items-center gap-2 text-left text-[16px] text-wedding-brown"
                            >
                              <svg
                                className="h-4 w-4 text-wedding-brown-light"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              {account.holder}
                            </button>
                            <p className="mt-1 text-[15px] text-wedding-brown-light">
                              {account.bank} {account.account}
                            </p>
                            {copiedKey === rowKey && (
                              <p className="mt-1 text-xs text-wedding-brown-light">
                                복사되었습니다
                              </p>
                            )}
                          </div>

                          {account.kakaoPayLink && (
                            <a
                              href={account.kakaoPayLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE500]"
                              aria-label="카카오페이로 송금하기"
                            >
                              <svg
                                className="h-6 w-6 text-black"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 3C6.8 3 2.6 6.3 2.6 10.3c0 2.6 1.7 4.9 4.3 6.2l-1.1 4.1c-.1.4.3.7.7.5l4.9-3.2c.3 0 .5.1.8.1 5.2 0 9.4-3.3 9.4-7.3S17.2 3 12 3z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
