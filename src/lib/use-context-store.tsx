"use client";

import {createContext, ReactNode, useContext} from "react";
import {create, StoreApi, useStore} from "zustand";

export function createContextStore<T>(initialState: T) {
  const Context = createContext<StoreApi<T> | null>(null);

  const Provider = ({children, initialData}: { children: ReactNode; initialData?: Partial<T> }) => {
    const store = create<any>()((set) => ({
      ...initialState,
      ...initialData,
    }));

    return <Context.Provider value={store}>{children}</Context.Provider>;
  };

  return {
    Provider,
    ctx: Context,
    use: function useStoreWithSelector<U>(selector: (state: T) => U): U {
      const store = useContext(Context);
      if (!store) {
        throw new Error("useContextStore must be used inside Provider");
      }
      return useStore(store, selector);
    },
  };
}
