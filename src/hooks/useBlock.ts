// @ts-nocheck
import { useCMS } from "@/context/cmscontext";

export function useBlock(key: string) {
  const ctx = useCMS();
  const cms = ctx?.cms ?? {};
  return { content: cms[key] ?? {}, isLoading: ctx?.isLoading ?? false };
}
