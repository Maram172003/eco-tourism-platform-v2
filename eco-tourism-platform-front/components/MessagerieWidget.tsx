"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Conversation = {
  id: string;
  other_user: { user_id: string; full_name: string | null; photo: string | null; role: string };
  last_message: { content: string; created_at: string; is_mine: boolean } | null;
  unread_count: number;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "maintenant";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

export default function MessagerieWidget({ token }: { token: string }) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<Conversation[]>("/messages/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(setConversations).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0);

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-primary">
            <MessageSquare size={16} strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-base text-slate-800">Messagerie</span>
        </div>
        {totalUnread > 0 && (
          <span className="bg-primary text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
            {totalUnread}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                <div className="h-2 bg-slate-100 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-4">
          <MessageSquare size={28} className="text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">Aucune conversation</p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.slice(0, 3).map((c) => (
            <button key={c.id} onClick={() => router.push("/messagerie")}
              className="w-full flex items-center gap-3 hover:bg-slate-50 rounded-xl px-2 py-2 transition-colors text-left">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                  {c.other_user.photo
                    ? <img src={c.other_user.photo} alt={c.other_user.full_name ?? ""} className="w-full h-full object-cover" />
                    : <span className="material-symbols-outlined text-slate-400 text-base">person</span>
                  }
                </div>
                {c.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full text-[8px] font-black text-slate-900 flex items-center justify-center">
                    {c.unread_count}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={`text-sm truncate ${c.unread_count > 0 ? "font-extrabold text-slate-900" : "font-bold text-slate-700"}`}>
                    {c.other_user.full_name ?? "—"}
                  </p>
                  {c.last_message && (
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {timeAgo(c.last_message.created_at)}
                    </span>
                  )}
                </div>
                {c.last_message && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {c.last_message.is_mine ? "Vous : " : ""}{c.last_message.content}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <button onClick={() => router.push("/messagerie")}
        className="mt-4 w-full py-2.5 rounded-2xl border-2 border-slate-100 text-xs font-extrabold text-slate-500 hover:border-primary hover:text-primary transition-all">
        Voir toutes mes conversations
      </button>
    </div>
  );
}
