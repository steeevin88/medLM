"use client";

import { useToastStore } from "@/lib/store";
import { Toast, ToastClose, ToastDescription, ToastTitle } from "./toast";
import { useEffect, useState } from "react";

export function Toaster() {
  const { toasts } = useToastStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-0 z-[100] flex flex-col items-end gap-2 px-4 py-4 sm:px-6 max-h-screen w-full pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          className="w-full max-w-md"
        >
          <div className="flex flex-col gap-1">
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </div>
          <ToastClose
            onClick={() => {
              useToastStore.setState((state) => ({
                toasts: state.toasts.filter((t) => t.id !== toast.id),
              }));
            }}
          />
        </Toast>
      ))}
    </div>
  );
} 