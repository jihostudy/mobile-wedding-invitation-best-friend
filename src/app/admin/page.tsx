"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useToast from "@/components/common/toast/useToast";
import AdminDashboard from "@/components/Admin/AdminDashboard";
import AdminLoginModal from "@/components/Admin/AdminLoginModal";
import { ApiError, apiFetch } from "@/lib/api/client";

export default function AdminPage() {
  const router = useRouter();
  const toast = useToast();
  const [checkingSession, setCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    void apiFetch<{ authenticated: boolean }>("/api/admin/auth/session")
      .then((result) => {
        if (cancelled) return;
        setIsAuthenticated(result.authenticated);
      })
      .catch(() => {
        if (cancelled) return;
        setIsAuthenticated(false);
      })
      .finally(() => {
        if (cancelled) return;
        setCheckingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const redirectHome = () => {
    router.replace("/");
  };

  const login = async (password: string) => {
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await apiFetch<{ success: true }>("/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setIsAuthenticated(true);
      setCheckingSession(false);
      toast.success("관리자 로그인에 성공했습니다.");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "로그인에 실패했습니다. 메인 페이지로 이동합니다.";
      setErrorMessage(message);
      toast.error("비밀번호가 올바르지 않아 메인으로 이동합니다.");
      redirectHome();
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      await apiFetch<{ success: true }>("/api/admin/auth/logout", {
        method: "POST",
      });
    } finally {
      setIsAuthenticated(false);
      toast.info("로그아웃되었습니다.");
      redirectHome();
    }
  };

  if (checkingSession) {
    return (
      <main className="mx-auto flex min-h-[50vh] w-full max-w-[425px] items-center justify-center">
        <p className="text-sm text-[#7a7a7a]">세션 확인 중...</p>
      </main>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <AdminDashboard
          onUnauthorized={redirectHome}
          onLogout={logout}
        />
      ) : null}
      <AdminLoginModal
        isOpen={!isAuthenticated}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onSubmit={login}
        onClose={redirectHome}
      />
    </>
  );
}
