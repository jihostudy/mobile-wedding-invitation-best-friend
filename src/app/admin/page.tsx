"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useToast from "@/components/common/toast/useToast";
import AdminLoginModal from "@/components/Admin/AdminLoginModal";
import { ApiError, apiFetch } from "@/lib/api/client";

export default function AdminPage() {
  const router = useRouter();
  const toast = useToast();
  const [checkingSession, setCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    void apiFetch<{ authenticated: boolean }>("/api/admin/auth/session")
      .then((result) => {
        if (cancelled) return;
        if (result.authenticated) {
          router.replace("/admin/guest-messages");
        }
      })
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        setCheckingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (password: string) => {
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await apiFetch<{ success: true }>("/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      toast.success("관리자 로그인에 성공했습니다.");
      router.replace("/admin/guest-messages");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "로그인에 실패했습니다.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="mx-auto flex min-h-[50vh] w-full max-w-[425px] items-center justify-center rounded-3xl border border-[#ece4d7] bg-[radial-gradient(circle_at_top_right,#fff9ef_0%,#f8f3ea_48%,#f5f0e6_100%)] px-6 py-10 shadow-[0_18px_40px_rgba(70,55,25,0.10)]">
        <p className="text-sm text-[#7e705b]">세션 확인 중...</p>
      </main>
    );
  }

  return (
    <AdminLoginModal
      isOpen
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      onSubmit={login}
      onClose={() => router.replace("/")}
    />
  );
}
