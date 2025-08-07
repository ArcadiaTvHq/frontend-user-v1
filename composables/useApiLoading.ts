import { useLoadingStore } from "~/stores/loading";

export const useApiLoading = () => {
  const loadingStore = useLoadingStore();

  const startApiLoading = () => {
    loadingStore.startApiLoading();
  };

  const stopApiLoading = () => {
    loadingStore.stopApiLoading();
  };

  const withApiLoading = async <T>(apiCall: () => Promise<T>): Promise<T> => {
    try {
      startApiLoading();
      const result = await apiCall();
      return result;
    } finally {
      stopApiLoading();
    }
  };

  return {
    startApiLoading,
    stopApiLoading,
    withApiLoading,
  };
};
