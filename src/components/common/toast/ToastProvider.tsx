"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ToastViewport from "@/components/common/toast/ToastViewport";
import type {
  ToastApi,
  ToastItem,
  ToastOptions,
} from "@/components/common/toast/types";

const DEFAULT_DURATION = 1800;

export const ToastContext = createContext<ToastApi | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    ({ message, variant = "info", duration = DEFAULT_DURATION }: ToastOptions) => {
      const id = crypto.randomUUID();
      const nextToast: ToastItem = {
        id,
        message,
        variant,
        duration,
        createdAt: Date.now(),
      };

      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
      setToasts([nextToast]);

      const timeoutId = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timeoutId);
    },
    [dismiss],
  );

  const clear = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo<ToastApi>(
    () => ({
      show,
      dismiss,
      clear,
      success: (message, duration) => show({ message, variant: "success", duration }),
      error: (message, duration) => show({ message, variant: "error", duration }),
      info: (message, duration) => show({ message, variant: "info", duration }),
    }),
    [clear, dismiss, show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}
