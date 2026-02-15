"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, X } from "lucide-react";
import Icon from "@/components/common/Icon";
import useModalLayer from "@/hooks/useModalLayer";

interface AdminLoginModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (password: string) => Promise<void>;
  onClose: () => void;
}

export default function AdminLoginModal({
  isOpen,
  isSubmitting,
  errorMessage,
  onSubmit,
  onClose,
}: AdminLoginModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setShowPassword(false);
    }
  }, [isOpen]);

  useModalLayer({
    active: isOpen,
    onEscape: onClose,
  });

  if (!isOpen) return null;

  const canSubmit = password.trim().length > 0 && !isSubmitting;

  return (
    <div
      className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/65 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-xl">
        <div className="relative">
          <h2 className="text-center text-xl font-semibold text-[#202020]">
            관리자 로그인
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 rounded-full p-1 text-[#585858] hover:bg-black/5"
            aria-label="관리자 로그인 닫기"
          >
            <Icon icon={X} size="md" />
          </button>
        </div>

        <p className="mt-3 text-center text-sm text-[#6f6f6f]">
          비밀번호 인증 후 관리자 페이지에 접근할 수 있습니다.
        </p>

        <form
          className="mt-6"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!canSubmit) return;
            await onSubmit(password);
          }}
        >
          <label className="text-sm font-medium text-[#222222]" htmlFor="admin-password">
            비밀번호
          </label>
          <div className="mt-2 flex h-12 items-center rounded-[10px] border border-[#d2d2d2] px-3">
            <Icon icon={LockKeyhole} size="sm" className="text-[#8a8a8a]" />
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력해 주세요."
              className="ml-2 h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-[#222222] outline-none placeholder:text-[#b9b9b9]"
              autoFocus
            />
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              aria-pressed={showPassword}
              className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8a8a8a] hover:bg-black/5"
            >
              <Icon icon={showPassword ? EyeOff : Eye} size="sm" />
            </button>
          </div>

          {errorMessage ? (
            <p className="mt-3 text-sm text-[#d62020]">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`mt-6 h-12 w-full rounded-[10px] text-sm font-semibold transition ${
              canSubmit ? "bg-[#1f1f1f] text-white" : "bg-[#ececec] text-[#adadad]"
            }`}
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
