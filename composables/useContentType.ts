import { ref, readonly } from "vue";
import { useState } from "#app";

export const useContentType = () => {
  const contentType = useState<string | null>("currentContentType", () => null);

  const setContentType = (type: string | null) => {
    contentType.value = type;
  };

  return {
    contentType: readonly(contentType),
    setContentType,
  };
};
