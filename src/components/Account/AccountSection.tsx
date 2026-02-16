"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, Copy } from "lucide-react";
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
  return candidates[accountIndex] ?? `${groupLabel || (side === "groom" ? "신랑측" : "신부측")} 계좌`;
}

export default function AccountSection({ section, weddingData }: AccountSectionProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(section.groups.map((group) => [group.id, true])),
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

  return (
    <section id="account" className="bg-white px-6 py-16">
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
                className="overflow-hidden rounded-t-xl rounded-b-none border border-[#e7dccb] bg-[#faf6ef]"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="relative flex w-full items-center justify-center bg-gradient-to-r from-[#f7eddc] to-[#f4e8d4] px-2 py-3 text-center"
                  aria-expanded={openGroups[group.id]}
                >
                  <span className="text-sm font-medium text-[#6f5a3d]">
                    {group.label}
                  </span>
                  <span
                    className={`absolute right-5 text-sm text-[#7a6445] transition-transform ${openGroups[group.id] ? "" : "rotate-180"}`}
                  >
                    <Icon icon={ChevronUp} size="sm" />
                  </span>
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
                  <div className="border-t border-[#e7dccb] bg-white">
                    {group.accounts.map((account, index) => {
                      const rowKey = `${group.id}-${index}`;
                      const holderName = inferAccountHolderName(
                        group.id,
                        group.label,
                        index,
                        weddingData,
                      );
                      return (
                        <div
                          key={rowKey}
                          className="flex items-start justify-between gap-4 px-5 py-4"
                        >
                          <div>
                            <p className="text-[16px] text-gray-800">
                              {holderName}
                            </p>
                            <p className="mt-2 text-sm text-gray-700">
                              {account.bank} {account.account}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopy(account.account)}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d5d5d5] bg-white text-[#5f5f5f] transition hover:bg-[#f5f5f5]"
                            aria-label={`${holderName} 계좌번호 복사`}
                          >
                            <Icon icon={Copy} size="sm" />
                          </button>
                        </div>
                      );
                    })}
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
