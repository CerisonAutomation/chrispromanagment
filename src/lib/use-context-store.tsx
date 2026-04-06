// =============================================================================
// USE CONTEXT STORE HOOK
// =============================================================================

import {useContext, useSyncExternalStore} from "react";

export function useContextStore<T, S>(
  context: React.Context<{ getState: () => T; subscribe: (cb: () => void) => () => void } | null>,
  selector: (state: T) => S
): S {
  const store = useContext(context);

  if (!store) {
    throw new Error("useContextStore must be used within a provider");
  }

  const subscribe = store.subscribe;
  
  return useSyncExternalStore(
    subscribe,
    () => selector(store.getState()),
    () => selector(store.getState())
  );
}
