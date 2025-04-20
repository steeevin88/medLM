"use client";

import { create } from "zustand";
import { ToastProps } from "@/components/ui/use-toast";

// Define the store state
type ToastState = {
  toasts: ToastProps[];
};

// Define action types
type ActionType =
  | {
      type: "ADD_TOAST";
      toast: ToastProps;
    }
  | {
      type: "UPDATE_TOAST";
      toast: Partial<ToastProps> & { id: string };
    }
  | {
      type: "DISMISS_TOAST";
      toastId: string;
    }
  | {
      type: "REMOVE_TOAST";
      toastId: string;
    };

// Create the store
export const useToastStore = create<ToastState>(() => ({
  toasts: [],
}));

// Function to dispatch actions to the store
export function dispatch(action: ActionType) {
  useToastStore.setState((state) => {
    switch (action.type) {
      case "ADD_TOAST":
        return {
          toasts: [...state.toasts, action.toast],
        };
      case "UPDATE_TOAST":
        return {
          toasts: state.toasts.map((t) =>
            t.id === action.toast.id ? { ...t, ...action.toast } : t
          ),
        };
      case "DISMISS_TOAST":
        return {
          toasts: state.toasts.map((t) =>
            t.id === action.toastId ? { ...t, open: false } : t
          ),
        };
      case "REMOVE_TOAST":
        return {
          toasts: state.toasts.filter((t) => t.id !== action.toastId),
        };
      default:
        return state;
    }
  });
} 