"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useState } from "react";
import { markNotificationsRead } from "@/services/notification.service";
import { getApiErrorMessage } from "@/services/auth.service";
import { markNotificationsLocallyRead } from "@/features/notifications/notificationSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function notificationText(type: "like" | "comment" | "follow" | "message"): string { return { like: "liked your post", comment: "commented on your post", follow: "started following you", message: "sent you a message" }[type]; }
export function NotificationBell() {
  const dispatch = useAppDispatch();
  const { items, unreadCount } = useAppSelector((state) => state.notifications);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [open, setOpen] = useState(false); const [error, setError] = useState<string | null>(null);
  if (!isAuthenticated) return null;
  async function openMenu(): Promise<void> { setOpen((value) => !value); const unreadIds = items.filter((item) => !item.read).map((item) => item.id); if (unreadIds.length === 0) return; try { await markNotificationsRead(unreadIds); dispatch(markNotificationsLocallyRead(unreadIds)); } catch (requestError) { setError(getApiErrorMessage(requestError)); } }
  return <div className="relative"><button type="button" aria-label="Notifications" aria-expanded={open} onClick={() => void openMenu()} className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950"><Bell size={20} />{unreadCount > 0 ? <span className="absolute right-0 top-0 min-w-4 rounded-full bg-rose-600 px-1 text-center text-[10px] font-bold leading-4 text-white">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}</button>{open ? <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"><p className="px-2 py-1 text-sm font-semibold text-slate-950">Notifications</p>{error ? <p className="px-2 py-1 text-xs text-red-600">{error}</p> : null}{items.length ? <ul className="max-h-96 overflow-y-auto">{items.map((notification) => <li key={notification.id}><Link onClick={() => setOpen(false)} href={notification.link} className="block rounded-lg px-2 py-3 hover:bg-slate-50"><p className="text-sm text-slate-700"><span className="font-semibold text-slate-950">{notification.sender.name}</span> {notificationText(notification.type)}</p><p className="mt-1 text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p></Link></li>)}</ul> : <p className="px-2 py-4 text-sm text-slate-500">You are all caught up.</p>}</div> : null}</div>;
}
