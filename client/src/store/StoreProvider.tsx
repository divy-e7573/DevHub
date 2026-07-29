// Client-side store provider.
//
// Next.js App Router renders layouts on the server by default, so the Redux
// provider must be a client component. This wrapper creates a single store
// instance per browser session and provides it to the tree.

"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./index";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
