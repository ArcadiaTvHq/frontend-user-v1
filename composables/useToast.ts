import { useToastStore } from "~/stores/toast";

export const useToast = () => {
  const toastStore = useToastStore();

  const showSuccess = (message: string, duration?: number) => {
    return toastStore.showToast(message, "success", duration);
  };

  const showError = (message: string, duration?: number) => {
    return toastStore.showToast(message, "error", duration);
  };

  const showInfo = (message: string, duration?: number) => {
    return toastStore.showToast(message, "info", duration);
  };

  const removeToast = (id: string) => {
    toastStore.removeToast(id);
  };

  const clearAll = () => {
    toastStore.clearAllToasts();
  };

  return {
    toasts: toastStore.toasts,
    showSuccess,
    showError,
    showInfo,
    removeToast,
    clearAll,
  };
};
