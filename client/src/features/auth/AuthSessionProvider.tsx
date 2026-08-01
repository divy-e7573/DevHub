"use client";

import { useEffect } from "react";
import { restoreSession } from "./authSlice";
import { useAppDispatch } from "@/store/hooks";

export function AuthSessionProvider() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  return null;
}
