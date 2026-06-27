"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Leaf, Heart, Plus, Send, Trash2, ImageIcon,
  FileText, Star, X, Upload, ChevronDown, ChevronUp,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Author = {
  user_id: string;
  full_name: string;
  photo: string | null;
  role: string;
};

type ImageVote = { vote_count: number; user_voted: boolean };

type Contribution = {
  id: string;
  user_id: string;
  user_role: string;
  type: "description" | "images";
  content: string | null;
  images: string[] | null;
  vote_count: number;
  user_voted: boolean;
  image_votes?: Record<number, ImageVote>;
  created_at: string;
  author?: Author;
};

function AuthorBubble({ author }: { author?: Author }) {
  if (!author) return null;
  const initials = author.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="w-6 h-6 rounded-full overflow-hidden bg-emerald-100 border-2 border-white shadow-sm shrink-0 flex items-center justify-center">
        {author.photo
          ? <img src={author.photo} alt={author.full_name} className="w-full h-full object-cover" />
          : <span className="text-[8px] font-black text-emerald-700">{initials}</span>
        }
      </div>
      <span className="text-[11px] font-bold text-slate-600 truncate">{author.full_name}</span>
    </div>
  );
}

async function uploadImage(file: File, token: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error("Upload échoué");
  return ((await res.json()) as { url: string }).url;
}

// ─── Description card with expand/collapse ────────────────────────────────────
function DescCard({
  c, isTop, canVote, voted, onVote, canDelete, onDelete,
}: {
  c: Contribution; isTop: boolean; canVote: boolean; voted: boolean;
  onVote: () => void; canDelete: boolean; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = c.content ?? "";
  const isLong = text.length > 220;

  return (
    <div className={`relative rounded-2xl p-3.5 border transition-all ${
      isTop ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm" : "border-slate-100 bg-white"
    }`}>
      {isTop && (
        <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
          <Star className="w-2.5 h-2.5 fill-white" /> Top
        </span>
      )}
      <AuthorBubble author={c.author} />
      <p className={`text-xs text-slate-700 leading-relaxed whitespace-pre-line pr-10 ${!expanded && isLong ? "line-clamp-4" : ""}`}>
        {text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {expanded ? <><ChevronUp className="w-3 h-3" /> Réduire</> : <><ChevronDown className="w-3 h-3" /> Lire la suite</>}
        </button>
      )}
      <div className="flex items-center gap-2 mt-2.5">
        <button
          onClick={onVote}
          disabled={!canVote}
          className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
            voted
              ? "bg-rose-100 text-rose-600 shadow-sm"
              : "bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Heart className={`w-3 h-3 ${voted ? "fill-rose-500" : ""}`} />
          {c.vote_count > 0 && <span>{c.vote_count}</span>}
        </button>
        {canDelete && (
          <button onClick={onDelete} className="ml-auto text-slate-300 hover:text-red-400 p-1 rounded-lg hover:bg-red-50 transition-all">
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Flat image item ──────────────────────────────────────────────────────────
type FlatImage = {
  url: string;
  voteCount: number;
  userVoted: boolean;
  author?: Author;
  contributionId: string;
  imageIndex: number;
  canVote: boolean;
  canDelete: boolean;
};

// ─── Top images — card per image (PhotoCard style) ───────────────────────────
function TopImagesGrid({
  items,
  onVote,
  onDelete,
}: {
  items: FlatImage[];
  onVote: (contributionId: string, imageIndex: number) => void;
  onDelete: (contributionId: string) => void;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const rankColors = ["bg-yellow-400 text-yellow-900", "bg-slate-300 text-slate-700", "bg-amber-600 text-white"];

  return (
    <>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={`${item.contributionId}-${item.imageIndex}`} className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
            {/* Author header — same style as old PhotoCard */}
            <div className="px-3 pt-2.5 pb-1 flex items-center gap-2 bg-white">
              {item.author && (
                <>
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-emerald-100 border-2 border-white shadow-sm shrink-0 flex items-center justify-center">
                    {item.author.photo
                      ? <img src={item.author.photo} alt={item.author.full_name} className="w-full h-full object-cover" />
                      : <span className="text-[8px] font-black text-emerald-700">{initials(item.author.full_name)}</span>}
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 truncate flex-1">{item.author.full_name}</span>
                </>
              )}
              {/* Rank badge in header */}
              <span className={`flex items-center gap-0.5 text-[9px] font-black px-2 py-0.5 rounded-full ${rankColors[i] ?? "bg-slate-100 text-slate-500"}`}>
                #{i + 1}
              </span>
              {item.canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(item.contributionId)}
                  className="text-slate-300 hover:text-red-400 p-1 rounded-lg hover:bg-red-50 transition-all shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Image */}
            <div className="relative px-2 pb-2">
              <button type="button" onClick={() => setLightbox(item.url)} className="block w-full focus:outline-none">
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-36 object-cover rounded-xl cursor-zoom-in hover:opacity-90 transition-opacity"
                />
              </button>
              {/* Vote button on image */}
              {item.canVote ? (
                <button
                  type="button"
                  onClick={() => onVote(item.contributionId, item.imageIndex)}
                  className={`absolute bottom-3.5 right-3.5 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-all shadow-sm ${
                    item.userVoted ? "bg-rose-500 text-white" : "bg-black/50 text-white hover:bg-rose-500"
                  }`}
                >
                  <Heart className={`w-2.5 h-2.5 ${item.userVoted ? "fill-white" : ""}`} />
                  {item.voteCount > 0 && <span>{item.voteCount}</span>}
                </button>
              ) : item.voteCount > 0 ? (
                <div className="absolute bottom-3.5 right-3.5 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/40 text-white shadow-sm pointer-events-none">
                  <Heart className="w-2.5 h-2.5 fill-rose-300" />
                  <span>{item.voteCount}</span>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

export type TopPhotoItem = { url: string; author: Author };
export type TopPhotoData = { images: string[]; author: Author; items: TopPhotoItem[] };
export type TopDescData  = { content: string; author: Author };

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PlaceContributions({
  publicationId,
  onCountLoaded,
  onTopPhotoLoaded,
  onTopDescLoaded,
  publisherId,
}: {
  publicationId: string;
  onCountLoaded?: (n: number) => void;
  onTopPhotoLoaded?: (data: TopPhotoData | null) => void;
  onTopDescLoaded?: (data: TopDescData | null) => void;
  publisherId?: string;
}) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"description" | "images">("description");
  const [formContent, setFormContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const currentUserId = token
    ? (() => { try { return JSON.parse(atob(token.split(".")[1])).sub; } catch { return null; } })()
    : null;

  const isOwner = !!publisherId && !!currentUserId && publisherId === currentUserId;

  const onCountLoadedRef = useRef(onCountLoaded);
  useEffect(() => { onCountLoadedRef.current = onCountLoaded; });
  const onTopPhotoLoadedRef = useRef(onTopPhotoLoaded);
  useEffect(() => { onTopPhotoLoadedRef.current = onTopPhotoLoaded; });
  const onTopDescLoadedRef = useRef(onTopDescLoaded);
  useEffect(() => { onTopDescLoadedRef.current = onTopDescLoaded; });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Contribution[]>(
        `/places/${publicationId}/contributions${currentUserId ? `?viewer=${currentUserId}` : ""}`
      );
      setContributions(data);
      onCountLoadedRef.current?.(data.length);
      // Flatten all images → sort by vote_count desc → top 3
      const allFlatImages = data
        .filter((c) => c.type === "images" && c.images && c.images.length > 0)
        .flatMap((c) =>
          (c.images ?? []).map((url, idx) => ({
            url,
            voteCount: c.image_votes?.[idx]?.vote_count ?? 0,
            author: c.author,
          }))
        )
        .sort((a, b) => b.voteCount - a.voteCount)
        .slice(0, 3);

      if (allFlatImages.length > 0 && allFlatImages[0].author) {
        onTopPhotoLoadedRef.current?.({
          images: allFlatImages.map((f) => f.url),
          author: allFlatImages[0].author,
          items: allFlatImages
            .filter((f) => f.author)
            .map((f) => ({ url: f.url, author: f.author! })),
        });
      } else {
        onTopPhotoLoadedRef.current?.(null);
      }
      const topDesc = data.find((c) => c.type === "description" && c.content);
      onTopDescLoadedRef.current?.(
        topDesc && topDesc.author ? { content: topDesc.content!, author: topDesc.author } : null
      );
    } catch {
      setContributions([]);
      onCountLoadedRef.current?.(0);
      onTopPhotoLoadedRef.current?.(null);
      onTopDescLoadedRef.current?.(null);
    } finally {
      setLoading(false);
    }
  }, [publicationId, currentUserId]);

  useEffect(() => { load(); }, [load]);

  function addFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setSelectedFiles((prev) => [...prev, { file, preview }]);
      };
      reader.readAsDataURL(file);
    });
  }

  const handleVote = async (id: string, imageIndex?: number) => {
    if (!token) return;

    const prevContribs = contributions;

    if (imageIndex !== undefined) {
      // Per-image optimistic update
      setContributions((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const prevImgVote = c.image_votes?.[imageIndex] ?? { vote_count: 0, user_voted: false };
          const nowVoted = !prevImgVote.user_voted;
          return {
            ...c,
            vote_count: c.vote_count + (nowVoted ? 1 : -1),
            image_votes: {
              ...c.image_votes,
              [imageIndex]: { vote_count: prevImgVote.vote_count + (nowVoted ? 1 : -1), user_voted: nowVoted },
            },
          };
        })
      );
      try {
        const res = await apiFetch<{ voted: boolean; image_index: number | null; vote_count: number; image_vote_count: number }>(
          `/contributions/${id}/vote`,
          { method: "POST", body: JSON.stringify({ imageIndex }) }
        );
        setContributions((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c;
            return {
              ...c,
              vote_count: res.vote_count,
              image_votes: {
                ...c.image_votes,
                [imageIndex]: { vote_count: res.image_vote_count, user_voted: res.voted },
              },
            };
          })
        );
      } catch {
        setContributions(prevContribs);
      }
    } else {
      // Description vote
      setContributions((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, vote_count: c.vote_count + (c.user_voted ? -1 : 1), user_voted: !c.user_voted }
            : c
        )
      );
      try {
        const res = await apiFetch<{ voted: boolean; vote_count: number }>(`/contributions/${id}/vote`, { method: "POST" });
        setContributions((prev) =>
          prev.map((c) => c.id === id ? { ...c, vote_count: res.vote_count, user_voted: res.voted } : c)
        );
      } catch {
        setContributions(prevContribs);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await apiFetch(`/contributions/${id}`, { method: "DELETE" });
      const updated = contributions.filter((c) => c.id !== id);
      setContributions(updated);
      onCountLoadedRef.current?.(updated.length);
    } catch {}
  };

  const handleSubmit = async () => {
    setError("");
    if (formType === "description" && formContent.trim().length < 20) {
      setError("La description doit faire au moins 20 caractères.");
      return;
    }
    if (formType === "images" && selectedFiles.length === 0) {
      setError("Sélectionnez au moins une image.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrls: string[] = [];
      if (formType === "images") {
        setUploading(true);
        const freshToken = localStorage.getItem("access_token") ?? "";
        imageUrls = await Promise.all(selectedFiles.map((f) => uploadImage(f.file, freshToken)));
        setUploading(false);
      }

      await apiFetch(`/places/${publicationId}/contributions`, {
        method: "POST",
        body: JSON.stringify({
          type: formType,
          content: formType === "description" ? formContent : undefined,
          images: formType === "images" ? imageUrls : undefined,
        }),
      });

      setFormContent("");
      setSelectedFiles([]);
      setShowForm(false);
      await load();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la soumission.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const descriptions = contributions.filter((c) => c.type === "description");
  const imgs = contributions.filter((c) => c.type === "images");

  return (
    <div className="border-t border-slate-100 bg-slate-50/30 px-4 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest">
          <Leaf className="w-3.5 h-3.5 text-emerald-500" />
          Contributions de la communauté
          {contributions.length > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full ml-0.5">
              {contributions.length}
            </span>
          )}
        </p>
        {token && !isOwner && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
              showForm
                ? "bg-slate-200 text-slate-600"
                : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
            }`}
          >
            {showForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showForm ? "Annuler" : "Contribuer"}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-3.5 space-y-3 border border-slate-100 shadow-sm mb-3">
          <div className="grid grid-cols-2 gap-2">
            {(["description", "images"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setFormType(t); setError(""); }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  formType === t
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-400 hover:border-slate-300"
                }`}
              >
                {t === "description" ? <FileText className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                {t === "description" ? "Texte" : "Photos"}
              </button>
            ))}
          </div>

          {formType === "description" ? (
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Partagez votre expérience sur ce lieu… (min. 20 caractères)"
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50"
            />
          ) : (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
              />
              {selectedFiles.length === 0 ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 rounded-xl py-5 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-semibold">Cliquer pour ajouter des photos</span>
                  <span className="text-[10px]">JPG, PNG, WEBP</span>
                </button>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {selectedFiles.map((f, idx) => (
                    <div key={idx} className="relative group">
                      <img src={f.preview} alt="" className="w-full h-20 object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 hover:border-emerald-300 hover:text-emerald-400 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-1.5 bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl hover:bg-emerald-600 disabled:opacity-60 transition-colors shadow-sm"
          >
            <Send className="w-3 h-3" />
            {uploading ? "Upload en cours…" : submitting ? "Envoi…" : "Publier ma contribution"}
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : contributions.length === 0 ? (
        <p className="text-xs text-slate-400 italic text-center py-2">
          {token ? "Aucune contribution. Soyez le premier !" : "Aucune contribution pour ce lieu."}
        </p>
      ) : (
        <div className="space-y-4">
          {descriptions.length > 0 && (
            <div>
              <p className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                <FileText className="w-3 h-3" />
                Descriptions <span className="text-emerald-600">({descriptions.length})</span>
              </p>
              <div className="space-y-2">
                {descriptions.map((c, i) => (
                  <DescCard
                    key={c.id}
                    c={c}
                    isTop={i === 0 && descriptions.length > 1}
                    canVote={!!token}
                    voted={c.user_voted}
                    onVote={() => handleVote(c.id)}
                    canDelete={c.user_id === currentUserId}
                    onDelete={() => handleDelete(c.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {imgs.length > 0 && (() => {
            // Flatten all images from all photo contributions → sort by vote count → top 3
            const flatImages: FlatImage[] = imgs.flatMap((c) =>
              (c.images ?? []).map((url, idx) => ({
                url,
                voteCount: c.image_votes?.[idx]?.vote_count ?? 0,
                userVoted: c.image_votes?.[idx]?.user_voted ?? false,
                author: c.author,
                contributionId: c.id,
                imageIndex: idx,
                canVote: !!token,
                canDelete: c.user_id === currentUserId,
              }))
            ).sort((a, b) => b.voteCount - a.voteCount).slice(0, 3);

            return (
              <div>
                <p className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  <ImageIcon className="w-3 h-3" />
                  Photos <span className="text-emerald-600">(top {flatImages.length})</span>
                </p>
                <TopImagesGrid
                  items={flatImages}
                  onVote={(contribId, imageIndex) => handleVote(contribId, imageIndex)}
                  onDelete={(contribId) => handleDelete(contribId)}
                />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
