"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Circle, CircleCheckBig, CircleX, Minus, Plus, X } from "lucide-react";
import Icon from "@/components/common/Icon";
import useToast from "@/components/common/toast/useToast";
import useModalLayer from "@/hooks/useModalLayer";
import { useCreateRsvpMutation } from "@/lib/queries/rsvp";

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type AttendStatus = "available" | "unavailable";
type Side = "groom" | "bride";

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function SelectCard({
  label,
  selected,
  onClick,
  leadingIcon,
  centerContent = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  leadingIcon?: "check" | "x";
  centerContent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-14 w-full items-center rounded-[12px] border px-5 text-left ${
        selected ? "border-[#2a2a2a] bg-white" : "border-[#d6d6d6] bg-[#f3f3f3]"
      } ${centerContent ? "justify-center" : "justify-between"}`}
      aria-pressed={selected}
    >
      <span
        className={`inline-flex items-center gap-3 text-sm font-medium ${
          selected ? "text-[#212121]" : "text-[#8f8f8f]"
        }`}
      >
        {leadingIcon === "check" ? (
          <Icon
            icon={CircleCheckBig}
            size="sm"
            className={selected ? "text-[#2f2f2f]" : "text-[#a8a8a8]"}
          />
        ) : null}
        {leadingIcon === "x" ? (
          <Icon
            icon={CircleX}
            size="sm"
            className={selected ? "text-[#2f2f2f]" : "text-[#a8a8a8]"}
          />
        ) : null}
        {label}
      </span>
      {!centerContent &&
        (selected ? (
          <span className="inline-flex items-center justify-center text-[#1f1f1f]">
            <Icon icon={CircleCheckBig} size="sm" />
          </span>
        ) : (
          <span className="inline-flex items-center justify-center rounded-full text-[#bdbdbd]">
            <Icon icon={Circle} size="lg" />
          </span>
        ))}
    </button>
  );
}

export default function RsvpModal({
  isOpen,
  onClose,
  onComplete,
}: RsvpModalProps) {
  const toast = useToast();
  const createRsvpMutation = useCreateRsvpMutation();
  const [attendStatus, setAttendStatus] = useState<AttendStatus>("available");
  const [side, setSide] = useState<Side>("groom");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [extraCount, setExtraCount] = useState(0);
  const [eatMeal, setEatMeal] = useState(true);
  const [rideBus, setRideBus] = useState(true);
  const [note, setNote] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useModalLayer({
    active: isOpen,
    onEscape: onClose,
  });

  const canSubmit =
    agreePrivacy && name.trim().length > 0 && contact.trim().length > 0;

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[10000]"
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <motion.div
        className="mx-auto h-full w-full max-w-[425px]"
        initial={{ y: 20, opacity: 0.82 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="modal-scrollbar h-full overflow-y-auto bg-white px-5 pb-10 pt-8">
          <div className="relative">
            <h3 className="text-center text-xl font-semibold text-[#202020]">
              참석 의사 전달
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-0 top-1 rounded-full p-1 text-[#222222]"
              aria-label="참석 의사 전달 모달 닫기"
            >
              <Icon icon={X} size="lg" />
            </button>
          </div>

          <p className="mt-4 whitespace-pre-line text-center text-sm leading-6 text-[#808080]">
            원활한 예식 진행을 위해 참석 정보를{"\n"}미리 알려주시면
            감사하겠습니다.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <SelectCard
              label="가능"
              selected={attendStatus === "available"}
              onClick={() => setAttendStatus("available")}
              leadingIcon="check"
              centerContent
            />
            <SelectCard
              label="불가"
              selected={attendStatus === "unavailable"}
              onClick={() => setAttendStatus("unavailable")}
              leadingIcon="x"
              centerContent
            />
          </div>

          <form
            className="mt-8 space-y-10"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!canSubmit) return;
              setSubmitError("");
              setIsSubmitting(true);
              const result = await createRsvpMutation
                .mutateAsync({
                  attendStatus,
                  side,
                  name: name.trim(),
                  contact: contact.trim(),
                  extraCount,
                  eatMeal,
                  rideBus,
                  note: note.trim(),
                  agreePrivacy,
                })
                .then(() => ({ success: true as const }))
                .catch((error: unknown) => ({
                  success: false as const,
                  error:
                    error instanceof Error
                      ? error.message
                      : "참석의사 저장에 실패했습니다.",
                }));
              setIsSubmitting(false);

              if (!result.success) {
                setSubmitError(result.error || "참석의사 저장에 실패했습니다.");
                return;
              }

              toast.success("전달되었습니다");
              onComplete?.();
              onClose();
            }}
          >
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#1f1f1f]">
                  <span className="mr-1 text-[#d62020]">*</span>성함
                </label>
                <div className="flex items-center gap-4 text-xs font-semibold text-[#1f1f1f]">
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      name="side"
                      value="groom"
                      checked={side === "groom"}
                      onChange={() => setSide("groom")}
                      className="h-5 w-5 accent-black"
                    />
                    신랑측
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      name="side"
                      value="bride"
                      checked={side === "bride"}
                      onChange={() => setSide("bride")}
                      className="h-5 w-5 accent-black"
                    />
                    신부측
                  </label>
                </div>
              </div>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="성함을 입력해 주세요."
                className="mt-3 h-11 w-full border-0 border-b border-[#c7c7c7] bg-transparent px-1 text-sm text-[#2f2f2f] placeholder:text-[#c2c2c2] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#1f1f1f]">
                <span className="mr-1 text-[#d62020]">*</span>연락처
              </label>
              <input
                type="text"
                value={contact}
                onChange={(event) =>
                  setContact(formatPhoneNumber(event.target.value))
                }
                placeholder="참석자 대표 연락처를 입력해 주세요."
                className="mt-3 h-11 w-full border-0 border-b border-[#c7c7c7] bg-transparent px-1 text-sm text-[#2f2f2f] placeholder:text-[#c2c2c2] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="shrink-0 text-sm font-semibold text-[#1f1f1f]">
                <span className="mr-1 text-[#d62020]">*</span>추가인원
              </p>
              <div className="ml-auto flex items-center gap-14">
                <button
                  type="button"
                  onClick={() => setExtraCount((prev) => Math.max(prev - 1, 0))}
                  className="rounded-full border border-[#d1d1d1] p-1 text-[#b6b6b6]"
                  aria-label="추가 인원 감소"
                >
                  <Icon icon={Minus} size="sm" />
                </button>
                <span className="min-w-6 text-center text-base font-medium text-[#1f1f1f]">
                  {extraCount}명
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setExtraCount((prev) => Math.min(prev + 1, 20))
                  }
                  className="rounded-full border border-[#bfbfbf] p-1 text-[#7d7d7d]"
                  aria-label="추가 인원 증가"
                >
                  <Icon icon={Plus} size="sm" />
                </button>
              </div>
            </div>

            {attendStatus === "available" && (
              <>
                <div>
                  <p className="text-sm font-semibold text-[#1f1f1f]">
                    <span className="mr-1 text-[#d62020]">*</span>식사여부
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <SelectCard
                      label="식사함"
                      selected={eatMeal}
                      onClick={() => setEatMeal(true)}
                      leadingIcon="check"
                      centerContent
                    />
                    <SelectCard
                      label="식사안함"
                      selected={!eatMeal}
                      onClick={() => setEatMeal(false)}
                      leadingIcon="x"
                      centerContent
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#1f1f1f]">
                    <span className="mr-1 text-[#d62020]">*</span>버스 탑승 여부
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <SelectCard
                      label="탑승함"
                      selected={rideBus}
                      onClick={() => setRideBus(true)}
                      leadingIcon="check"
                      centerContent
                    />
                    <SelectCard
                      label="탑승안함"
                      selected={!rideBus}
                      onClick={() => setRideBus(false)}
                      leadingIcon="x"
                      centerContent
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-semibold text-[#1f1f1f]">
                전달사항
              </label>
              <input
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value.slice(0, 30))}
                placeholder="전달하실 내용을 입력해 주세요. (최대 30자)"
                className="mt-3 h-11 w-full border-0 border-b border-[#c7c7c7] bg-transparent px-1 text-xs text-[#2f2f2f] placeholder:text-[#c2c2c2] focus:outline-none"
              />
            </div>

            <label className="block rounded-[12px] border border-[#d5d5d5] px-4 py-4">
              <span className="inline-flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(event) => setAgreePrivacy(event.target.checked)}
                  className="h-5 w-5 rounded border-[#bdbdbd] accent-black"
                />
                <span>
                  <p className="text-sm font-semibold text-[#222222]">
                    동의합니다.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#808080]">
                    참석여부 전달을 위한 개인정보 수집 및 이용에 동의해주세요.
                    <br />
                    항목: 성함,연락처,동행인 성함 · 보유기간: 청첩장 이용
                    종료시까지
                  </p>
                </span>
              </span>
            </label>

            {submitError && (
              <p className="text-xs text-[#d62020]">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={`h-14 w-full rounded-[12px] border text-sm font-semibold ${
                canSubmit && !isSubmitting
                  ? "bg-wedding-brown-light text-wedding-beige"
                  : "border-[#d6d6d6] bg-[#f2f2f2] text-[#c6c6c6]"
              }`}
            >
              {isSubmitting ? "전달 중..." : "신랑 & 신부에게 전달하기"}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
