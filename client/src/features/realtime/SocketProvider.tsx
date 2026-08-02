"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearNotifications, fetchNotifications, receivedNotification } from "@/features/notifications/notificationSlice";
import type { AppNotification, ClientToServerEvents, ServerToClientEvents } from "@/types/realtime";

type DevHubSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
const SocketContext = createContext<DevHubSocket | null>(null);
function socketUrl(): string { const configured = process.env.NEXT_PUBLIC_SOCKET_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ""; return configured.replace(/\/api(?:\/v\d+)?\/?$/, ""); }

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const userId = useAppSelector((state) => state.auth.user?.id);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const socketRef = useRef<DevHubSocket | null>(null);
  const [socket, setSocket] = useState<DevHubSocket | null>(null);
  useEffect(() => {
    if (!isAuthenticated || !userId) { socketRef.current?.disconnect(); socketRef.current = null; setSocket(null); dispatch(clearNotifications()); return; }
    const nextSocket = io(socketUrl(), { withCredentials: true, transports: ["websocket", "polling"], autoConnect: true });
    socketRef.current = nextSocket;
    setSocket(nextSocket);
    void dispatch(fetchNotifications());
    nextSocket.on("new_notification", (notification: AppNotification) => dispatch(receivedNotification(notification)));
    return () => { nextSocket.off("new_notification"); nextSocket.disconnect(); if (socketRef.current === nextSocket) { socketRef.current = null; setSocket(null); } };
  }, [dispatch, isAuthenticated, userId]);
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
export function useSocket(): DevHubSocket | null { return useContext(SocketContext); }
