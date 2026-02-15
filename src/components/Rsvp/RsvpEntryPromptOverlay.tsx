"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  MapPin,
  UserRound,
  UserRoundCheck,
  X,
} from "lucide-react";
import Icon from "@/components/common/Icon";
import useKeyPressCallback from "@/hooks/useKeyPressCallback";

interface RsvpEntryPromptOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onHideToday: () => void;
  onOpenRsvp: () => void;
  title: string;
  dateLine: string;
  venueLine: string;
  addressLine: string;
}

export default function RsvpEntryPromptOverlay({
  isOpen,
  onClose,
  onHideToday,
  onOpenRsvp,
  title,
  dateLine,
  venueLine,
  addressLine,
}: RsvpEntryPromptOverlayProps) {
  useKeyPressCallback({
    key: "Escape",
    enabled: isOpen,
    callback: onClose,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9990] flex items-end justify-center bg-black/45"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <button
            type="button"
            aria-label="참석 의사 전달 안내 닫기"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={onClose}
          />
          <div className="relative w-full max-w-[425px]">
            <motion.div
              className="modal-scrollbar max-h-[88dvh] overflow-y-auto rounded-t-[24px] bg-[#f6f4f2] px-8 pb-8 pt-14 shadow-[0_-8px_30px_rgba(0,0,0,0.14)]"
              initial={{ y: 48, opacity: 0.98 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-5 top-5 rounded-full p-1 text-[#8b8b8b]"
                aria-label="참석 의사 전달 안내 닫기"
              >
                <Icon icon={X} size="lg" />
              </button>
              <h3 className="text-center text-xl font-semibold text-[#242424]">
                {title}
              </h3>
              <div className="mt-5 flex justify-center">
                <div className="relative h-5 w-10 flex items-center justify-center">
                  <Icon icon={UserRound} size="lg" className="text-[#8f8f8f]" />
                  <Icon
                    icon={UserRoundCheck}
                    size="lg"
                    className=" text-[#4f4f4f]"
                  />
                </div>
              </div>

              <p className="mt-4 text-center text-sm leading-6 font-medium text-[#6f6f6f]">
                특별한 날 축하의 마음으로 참석해주시는 모든 분들을 한 분 한 분
                더 귀하게 모실 수 있도록, 아래 버튼으로 신랑 & 신부에게 꼭
                참석여부 전달을 부탁드립니다.
              </p>

              <div className="mt-6 border-y-2 font-medium border-[#d2d2d2] py-6 text-sm text-[#2f2f2f] flex flex-col gap-2 px-5">
                <p className="flex items-center gap-3">
                  <Icon icon={CalendarDays} size="sm" />
                  {dateLine}
                </p>
                <p className="mt-3 flex items-center gap-3">
                  <Icon icon={Building2} size="sm" />
                  {venueLine}
                </p>
                <p className="mt-3 flex items-center gap-3">
                  <Icon icon={MapPin} size="sm" />
                  {addressLine}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-[1fr_1.25fr] gap-3">
                <button
                  type="button"
                  onClick={onHideToday}
                  className="h-14 rounded-lg text-sm font-medium text-[#7b7b7b] transition-all duration-200 hover:bg-black/5 hover:font-semibold hover:text-[#4a4a4a] active:scale-[0.99]"
                >
                  오늘 하루 보지 않기
                </button>
                <button
                  type="button"
                  onClick={onOpenRsvp}
                  className="h-14 rounded-lg border border-[#2f2f2f] text-sm font-medium text-[#222222] transition-all duration-200 hover:bg-[#2f2f2f] hover:font-bold hover:text-white active:scale-[0.99]"
                >
                  참석의사 전달하기
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
