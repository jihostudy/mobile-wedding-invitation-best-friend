"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
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

export default function AccountSection({
  section,
  weddingData,
}: AccountSectionProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const hasBrideGroup = section.groups.some(
      (group) => group.id.includes("bride") || group.label.includes("신부"),
    );
    return Object.fromEntries(
      section.groups.map((group, index) => [
        group.id,
        group.id.includes("bride") ||
          group.label.includes("신부") ||
          (!hasBrideGroup && index === 0),
      ]),
    );
  });
  const toast = useToast();
  const visibleGroups = useMemo(
    () =>
      section.groups
        .map((group) => ({
          ...group,
          visibleAccounts: group.accounts
            .map((account, accountIndex) => ({ account, accountIndex }))
            .filter(
              ({ account }) =>
                account.bank.trim().length > 0 &&
                account.account.trim().length > 0,
            ),
        }))
        .filter((group) => group.visibleAccounts.length > 0),
    [section.groups],
  );

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

  if (visibleGroups.length === 0) {
    return null;
  }

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
          {visibleGroups.map((group) => (
            <div key={group.id} className="overflow-hidden ">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="relative flex h-[52px] w-full items-center justify-center rounded-t-lg bg-wedding-brown/10 px-5 text-center transition hover:bg-wedding-brown/15"
                aria-expanded={openGroups[group.id]}
              >
                <span className="text-base font-medium tracking-[0.04em] text-wedding-brown">
                  {group.label} 계좌번호
                </span>
                <Icon
                  icon={openGroups[group.id] ? ChevronUp : ChevronDown}
                  size="md"
                  className="absolute right-6 text-wedding-brown"
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
                className="overflow-hidden bg-white"
                aria-hidden={!openGroups[group.id]}
              >
                <div className="bg-white divide-y divide-wedding-brown/10">
                  {group.visibleAccounts.map(({ account, accountIndex }) => {
                    const holderName = inferAccountHolderName(
                      group.id,
                      group.label,
                      accountIndex,
                      weddingData,
                    );

                    return (
                      <div
                        key={`${group.id}-account-${accountIndex}`}
                        className="grid min-h-[104px] grid-cols-[1fr_auto] items-center gap-4 bg-white px-5 py-5"
                      >
                        <div className="min-w-0 text-left">
                          <p className="text-base font-medium leading-6 text-wedding-gray">
                            {holderName}
                          </p>
                          <p className="mt-2 break-all text-xs leading-6 text-wedding-gray-light">
                            {account.bank} {account.account}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(account.account)}
                          className="inline-flex h-12 items-center  justify-center gap-1 rounded-lg border border-wedding-brown/20 bg-white px-5 text-xs font-semibold text-wedding-brown transition hover:bg-white"
                          aria-label={`${holderName} ${account.bank} ${account.account} 계좌번호 복사`}
                        >
                          <Icon icon={Copy} size="sm" />
                          복사하기
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
