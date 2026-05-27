// @ts-nocheck
import { useEffect, useRef } from "react";
import { UseFormWatch, UseFormReset, FieldValues } from "react-hook-form";

const PREFIX = "cpm_form_";

export function useFormPersist<T extends FieldValues>(
  key: string,
  {
    watch,
    reset,
    exclude = [],
    storage = typeof window !== "undefined" ? window.localStorage : null,
  }: {
    watch: UseFormWatch<T>;
    reset: UseFormReset<T>;
    exclude?: (keyof T)[];
    storage?: Storage | null;
  },
) {
  const storageKey = `${PREFIX}${key}`;
  const restored = useRef(false);

  // Restore persisted values on mount once
  useEffect(() => {
    if (!storage || restored.current) {
return;
}
    try {
      const raw = storage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<T>;
        // Filter out excluded keys
        exclude.forEach((k) => {
 delete parsed[k as string]; 
});
        reset(parsed as T, { keepDefaultValues: true });
      }
    } catch {
      storage.removeItem(storageKey);
    }
    restored.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch and persist on every change
  useEffect(() => {
    if (!storage) {
return;
}
    const sub = watch((values) => {
      try {
        const toStore: Partial<T> = { ...values };
        exclude.forEach((k) => {
 delete toStore[k as string]; 
});
        storage.setItem(storageKey, JSON.stringify(toStore));
      } catch {
        // storage full or unavailable
      }
    });
    return () => sub.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, storage]);

  return {
    clear: () => storage?.removeItem(storageKey),
  };
}
