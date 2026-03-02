"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown, ChevronUp, Copy, UserRound } from "lucide-react";
import Icon from "@/components/common/Icon";
import useToast from "@/components/common/toast/useToast";
import type { AccountSectionData, WeddingInfo } from "@/types";

interface AccountSectionProps {
  section: AccountSectionData;
  weddingData: WeddingInfo;
}

function inferAccountHolderName(
  groupId: string,
  groupLabel: string,
  accountIndex: number,
  weddingData: WeddingInfo,
) {
  const isGroomGroup = groupId.includes("groom") || groupLabel.includes("신랑");
  const isBrideGroup = groupId.includes("bride") || groupLabel.includes("신부");
  if (!isGroomGroup && !isBrideGroup) {
    return `${groupLabel || "계좌"} ${accountIndex + 1}`;
  }

  const side = isGroomGroup ? "groom" : "bride";
  const person = isGroomGroup ? weddingData.groom : weddingData.bride;
  const candidates = [
    person.name,
    person.parents?.father ?? `${side === "groom" ? "신랑" : "신부"} 아버지`,
    person.parents?.mother ?? `${side === "groom" ? "신랑" : "신부"} 어머니`,
  ];
  return (
    candidates[accountIndex] ??
    `${groupLabel || (side === "groom" ? "신랑측" : "신부측")} 계좌`
  );
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function AccountSection({
  section,
  weddingData,
}: AccountSectionProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(section.groups.map((group) => [group.id, true])),
  );
  const [selectedAccountIndexByGroup, setSelectedAccountIndexByGroup] =
    useState<Record<string, number | null>>(
      Object.fromEntries(section.groups.map((group) => [group.id, null])),
    );
  const toast = useToast();

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("계좌번호가 복사되었습니다.");
    } catch (error) {
      console.error("copy failed", error);
      toast.error("계좌번호 복사에 실패했습니다.");
    }
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleSelectAccount = (groupId: string, accountIndex: number) => {
    setSelectedAccountIndexByGroup((prev) => ({
      ...prev,
      [groupId]: accountIndex,
    }));
  };

  const handleKakaoPay = (kakaoPayUrl?: string) => {
    const nextUrl = (kakaoPayUrl ?? "").trim();
    if (!nextUrl || !isValidHttpUrl(nextUrl)) {
      toast.info("카카오페이 송금 링크가 준비 중입니다.");
      return;
    }
    // Mobile-friendly redirect for KakaoPay transfer links.
    window.location.href = nextUrl;
  };

  return (
    <section id="account" className="bg-white px-9 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <p className="font-crimson text-sm uppercase tracking-[0.33em] text-wedding-brown">
            {section.kicker}
          </p>
          <h2 className="mt-3 text-xl tracking-[0.04em] text-wedding-gray-dark">
            {section.title}
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-8 text-wedding-gray">
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
                className="overflow-hidden rounded-xl border border-wedding-brown/15 bg-white"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="relative flex w-full items-center justify-between border-b border-wedding-brown/10 bg-[#faf7f2] px-5 py-4 text-left"
                  aria-expanded={openGroups[group.id]}
                >
                  <span className="inline-flex items-center gap-2 text-base font-medium text-wedding-gray">
                    <Icon
                      icon={UserRound}
                      size="md"
                      className="text-wedding-brown-light"
                    />
                    {group.label}
                  </span>
                  <Icon
                    icon={openGroups[group.id] ? ChevronUp : ChevronDown}
                    size="md"
                    className="text-wedding-brown-light"
                  />
                </button>

                <motion.div
                  initial={false}
                  animate={
                    openGroups[group.id]
                      ? { height: "auto", opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{
                    height: {
                      duration: 0.34,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    opacity: {
                      duration: 0.22,
                      ease: "easeOut",
                    },
                  }}
                  style={{ willChange: "height, opacity" }}
                  className="overflow-hidden"
                  aria-hidden={!openGroups[group.id]}
                >
                  <div className="space-y-5 bg-[#fdfcf9] px-5 py-6">
                    <p className="text-center text-[14px] font-medium text-wedding-gray">
                      어떤 분에게 마음을 전하시고 싶으신가요?
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {group.accounts.map((_, index) => {
                        const holderName = inferAccountHolderName(
                          group.id,
                          group.label,
                          index,
                          weddingData,
                        );
                        const isSelected =
                          selectedAccountIndexByGroup[group.id] === index;
                        return (
                          <button
                            key={`${group.id}-selector-${index}`}
                            type="button"
                            onClick={() => handleSelectAccount(group.id, index)}
                            className={`flex h-[84px] w-[84px] items-center justify-center rounded-full px-2 text-[14px] font-medium leading-tight transition ${
                              isSelected
                                ? "bg-wedding-brown text-white shadow-[0_8px_18px_rgba(95,78,57,0.22)]"
                                : "border border-wedding-brown/20 bg-white text-wedding-brown hover:bg-[#fbf8f2]"
                            }`}
                          >
                            {holderName}
                          </button>
                        );
                      })}
                    </div>

                    {selectedAccountIndexByGroup[group.id] !== null && (
                      <div className="rounded-2xl border border-wedding-brown/15 bg-white px-3 py-5">
                        {(() => {
                          const selectedIndex =
                            selectedAccountIndexByGroup[group.id];
                          if (selectedIndex === null) {
                            return null;
                          }
                          const selectedAccount = group.accounts[selectedIndex];
                          if (!selectedAccount) return null;
                          const hasKakaoPayLink = isValidHttpUrl(
                            (selectedAccount.kakaoPayUrl ?? "").trim(),
                          );
                          const holderName = inferAccountHolderName(
                            group.id,
                            group.label,
                            selectedIndex,
                            weddingData,
                          );

                          return (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCopy(selectedAccount.account)}
                                className="w-full text-center text-sm font-medium text-wedding-gray underline-offset-4 transition hover:underline"
                                aria-label={`${holderName} ${selectedAccount.bank} ${selectedAccount.account} 계좌번호 복사`}
                              >
                                {holderName} · {selectedAccount.bank}{" "}
                                {selectedAccount.account}
                              </button>
                              <div
                                className={`mt-5 grid gap-3 ${
                                  hasKakaoPayLink
                                    ? "grid-cols-2"
                                    : "grid-cols-1"
                                }`}
                              >
                                {hasKakaoPayLink ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleKakaoPay(
                                        selectedAccount.kakaoPayUrl,
                                      )
                                    }
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#f8e500] px-3 text-xs font-semibold text-[#1f1f1f] transition hover:bg-[#f3df00]"
                                  >
                                    <Image
                                      src="/icons/social/kakaopay.svg"
                                      alt="카카오페이"
                                      width={28}
                                      height={28}
                                      className="h-4 w-auto"
                                    />
                                    카카오페이 송금
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(selectedAccount.account)
                                  }
                                  className="inline-flex h-11 items-center justify-center gap-1 rounded-[12px] border border-wedding-brown/20 bg-white px-3 text-xs font-semibold text-wedding-brown transition hover:bg-[#fbf8f2]"
                                >
                                  <Icon icon={Copy} size="sm" />
                                  계좌번호 복사
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
