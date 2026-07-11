"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Bell, Check, ArrowLeft, Calendar, CheckCircle, XCircle,
  Info, AlertCircle, MessageSquare,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link: string | null;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  booking: <Calendar size={16} className="text-blue-500" />,
  booking_confirmed: <CheckCircle size={16} className="text-primary" />,
  booking_cancelled: <XCircle size={16} className="text-red-500" />,
  booking_request: <Calendar size={16} className="text-blue-500" />,
  confirmation: <CheckCircle size={16} className="text-primary" />,
  cancellation: <XCircle size={16} className="text-red-500" />,
  info: <Info size={16} className="text-amber-500" />,
  alert: <AlertCircle size={16} className="text-red-500" />,
  message: <MessageSquare size={16} className="text-purple-500" />,
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchNotifications = () => {
    apiFetch<Notification[]>("/notifications")
      .then(setNotifications)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id: string) => {
    setProcessingId(id);
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      fetchNotifications();
    } catch {
      // ignore
    } finally {
      setProcessingId(null);
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-12">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-400">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <Check size={14} /> Tout marquer comme lu
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <Bell size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border ${
                  notif.is_read ? "border-slate-100" : "border-emerald-200 shadow-sm"
                } p-4 transition-colors`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {TYPE_ICONS[notif.type] ?? <Info size={16} className="text-slate-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm ${notif.is_read ? "text-slate-600" : "text-slate-800 font-semibold"}`}>
                          {notif.title}
                        </h3>
                        {!notif.is_read && (
                          <span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{notif.body}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        {notif.link && (
                          <button
                            onClick={() => router.push(notif.link!)}
                            className="text-[10px] text-primary hover:text-emerald-700 underline"
                          >
                            Voir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      disabled={processingId === notif.id}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary disabled:opacity-50"
                      title="Marquer comme lu"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
