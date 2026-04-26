"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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

  const handleSelectAccount = (groupId: string, accountIndex: number) => {
    setSelectedAccountIndexByGroup((prev) => ({
      ...prev,
      [groupId]: accountIndex,
    }));
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
                    {group.visibleAccounts.map(({ accountIndex }) => {
                      const holderName = inferAccountHolderName(
                        group.id,
                        group.label,
                        accountIndex,
                        weddingData,
                      );
                      const isSelected =
                        selectedAccountIndexByGroup[group.id] ===
                        accountIndex;
                      return (
                        <button
                          key={`${group.id}-selector-${accountIndex}`}
                          type="button"
                          onClick={() =>
                            handleSelectAccount(group.id, accountIndex)
                          }
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
                        const selectedAccountItem =
                          group.visibleAccounts.find(
                            ({ accountIndex }) =>
                              accountIndex === selectedIndex,
                          );
                        if (!selectedAccountItem) return null;
                        const selectedAccount = selectedAccountItem.account;
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
                            <div className="mt-5 grid grid-cols-1 gap-3">
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
          ))}
        </div>
      </div>
    </section>
  );
}
