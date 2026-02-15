"use client";

import { useState } from "react";
import { ChevronUp, Copy, MessageCircle } from "lucide-react";
import Icon from "@/components/common/Icon";
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
                    <Icon icon={ChevronUp} size="sm" />
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
                              <Icon
                                icon={Copy}
                                size="sm"
                                className="text-wedding-brown-light"
                              />
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
                              <Icon icon={MessageCircle} size="lg" className="text-black" />
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
