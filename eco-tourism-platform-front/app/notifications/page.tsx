"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Bell, Check, ArrowLeft, Calendar, CheckCircle, XCircle,
  Info, AlertCircle, MessageSquare, Trash2, Handshake,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link: string | null;
  data?: Record<string, any> | null;
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
  collaboration_invite: <Handshake size={16} className="text-primary" />,
  collab_accepted: <CheckCircle size={16} className="text-primary" />,
  collab_declined: <XCircle size={16} className="text-red-500" />,
  collab_quit: <AlertCircle size={16} className="text-amber-500" />,
  collab_kicked: <AlertCircle size={16} className="text-red-500" />,
  offer_deleted: <AlertCircle size={16} className="text-slate-500" />,
  offer_schedule_changed: <Calendar size={16} className="text-teal-500" />,
  offer_schedule_conflict: <AlertCircle size={16} className="text-amber-500" />,
};

// Rendu de texte simple avec **gras** (compat données riches de Maram)
function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <span>
      {parts.map((p, i) =>
        i % 2 === 1
          ? <span key={i} className="font-semibold text-slate-800">{p}</span>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const day = Math.floor(h / 24);
  if (day === 1) return "Hier";
  if (day < 7)  return `Il y a ${day} jours`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

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

  const deleteNotification = async (id: string) => {
    setProcessingId(id);
    try {
      await apiFetch(`/notifications/${id}`, { method: "DELETE" });
      fetchNotifications();
    } catch {
      // ignore
    } finally {
      setProcessingId(null);
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

  const resolveLink = (n: Notification): string | null => {
    if (n.link) return n.link;
    const d = n.data;
    if (!d) return null;
    if (n.type === "collaboration_invite") {
      return d.collab_id ? "/profile/guide?tab=collaborations" : "/profile/guide?tab=collaborations";
    }
    if (["collab_accepted", "collab_declined", "collab_quit", "collab_kicked"].includes(n.type)) {
      return d.offer_id ? `/offers/${d.offer_id}` : "/profile/guide?tab=collaborations";
    }
    if (["offer_schedule_changed", "offer_schedule_conflict"].includes(n.type)) {
      return "/profile/guide?tab=collaborations";
    }
    if (d.offer_id) return `/offers/${d.offer_id}`;
    return null;
  };

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
            {notifications.map((notif) => {
              const target = resolveLink(notif);
              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-xl border ${
                    notif.is_read ? "border-slate-100" : "border-emerald-200 shadow-sm"
                  } p-4 transition-colors`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => target && router.push(target)}
                    >
                      <div className="mt-0.5 shrink-0">
                        {TYPE_ICONS[notif.type] ?? <Info size={16} className="text-slate-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm ${notif.is_read ? "text-slate-600" : "text-slate-800 font-semibold"}`}>
                            {notif.data ? <RichText text={notif.title} /> : notif.title}
                          </h3>
                          {!notif.is_read && (
                            <span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {notif.data ? <RichText text={notif.body ?? ""} /> : notif.body}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-slate-400">
                            {timeAgo(notif.created_at)}
                          </span>
                          {target && (
                            <span className="text-[10px] text-primary underline">
                              Voir
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.is_read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          disabled={processingId === notif.id}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary disabled:opacity-50"
                          title="Marquer comme lu"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        disabled={processingId === notif.id}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
