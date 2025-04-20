// Inspired by react-hot-toast library
import { dispatch, useToastStore } from "@/lib/store";

export type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

export type ToastActionElement = React.ReactElement<{
  altText: string;
  onClick: () => void;
}>;

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function generateId() {
  return `${count++}`;
}

export function toast({
  title,
  description,
  action,
  variant,
}: Omit<ToastProps, "id">) {
  const id = generateId();

  const update = (props: Omit<ToastProps, "id">) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });

  const dismiss = () =>
    dispatch({
      type: actionTypes.DISMISS_TOAST,
      toastId: id,
    });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      id,
      title,
      description,
      action,
      variant,
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

export function useToast() {
  const { toasts } = useToastStore();

  return {
    toast,
    toasts,
    dismiss: (toastId: string) =>
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
} 