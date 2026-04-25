"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useToast from "@/components/common/toast/useToast";
import AdminLoginModal from "@/components/Admin/AdminLoginModal";
import { ApiError, apiFetch } from "@/lib/api/client";

export default function AdminPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    void apiFetch<{ authenticated: boolean }>("/api/admin/auth/session", {
      timeoutMs: 5000,
    })
      .then((result) => {
        if (cancelled) return;
        if (result.authenticated) {
          router.replace("/admin/content");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setErrorMessage("세션 확인에 실패했습니다. 다시 로그인해 주세요.");
      })

    return () => {
      cancelled = true;
    };
  }, [router]);

  const login = async (password: string) => {
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await apiFetch<{ success: true }>("/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      toast.success("관리자 로그인에 성공했습니다.");
      router.replace("/admin/content");
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
