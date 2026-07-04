"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import {
  MapPin, ArrowLeft, Heart, MessageCircle, Image as ImageIcon,
  ThumbsUp, ThumbsDown, Star, Share2, Tag, Leaf, Flame,
  Check, X, Loader2, ChevronLeft, ChevronRight, Copy, Send,
  Compass, Route, Users, Camera, Layers, CloudSun, Calendar,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";
import PubInteractions from "@/components/PubInteractions";
import WeatherSection from "@/components/WeatherSection";

const PlaceMap = dynamic(() => import("@/components/map/PlaceMap"), {
  ssr: false,
  loading: () => <div className="h-48 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center"><Loader2 size={20} className="animate-spin text-slate-300" /></div>,
});

// ─── Types ──────────────────────────────────────────────────────────────────

interface PlaceDetail {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  latitude: number | null;
  longitude: number | null;
  place_name: string | null;
  region: string | null;
  category: string | null;
  tags: string[] | null;
  popularity_score: number;
  status: string;
  created_at: string;
}

interface Photo {
  id: string;
  url: string;
  entity_type: string;
  entity_id: string;
  is_hero: boolean;
  score: number;
  uploaded_by: string;
  created_at: string;
}

interface Review {
  id: string;
  author_id: string;
  target_type: string;
  target_id: string;
  rating: number;
  comment: string | null;
  photos: string[] | null;
  created_at: string;
  author: { id: string; full_name: string; email: string; photo: string | null; role: string; };
}

interface AvgRating { average: number; count: number; }
interface OfferItem {
  id: string; offer_id: string; name: string; item_type: string | null;
  region: string | null; prices: { price: number; currency: string; }[];
  offer_title?: string; images?: string[] | null;
}
interface CircuitItem {
  id: string; title: string; region: string | null;
  base_price: number | null; currency: string;
  duration_days: number | null; difficulty_level: string | null;
  images?: string[] | null;
  lat: number | null; lng: number | null;
}
interface ExperienceItem {
  id: string; title: string; description: string | null;
  images: string[] | null; region: string | null;
  created_at: string; popularity_score: number;
}
interface NearbyPlace {
  id: string; title: string; images: string[] | null;
  region: string | null; category: string | null;
  popularity_score: number; latitude: number | null; longitude: number | null;
}

interface EventItem {
  id: string; title: string; description: string | null;
  event_type: string; start_date: string; end_date: string | null;
  images: string[] | null; external_url: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
function avatarUrl(photo: string | null, name: string) {
  return photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&background=d1fae5&color=065f46&bold=true&size=64`;
}
function imgFallback(e: React.SyntheticEvent<HTMLImageElement>) {
  (e.target as HTMLImageElement).src = `https://placehold.co/400x300/e2e8f0/94a3b8?text=Photo`;
}

const ROLE_LABEL: Record<string, string> = {
  eco_traveler: "Éco-Voyageur", guide: "Guide", project_owner: "Propriétaire", admin: "Admin",
};

const SECTIONS = [
  { id: "overview", label: "Aperçu", icon: Leaf },
  { id: "gallery", label: "Galerie", icon: Camera },
  { id: "offers", label: "Offres", icon: Tag },
  { id: "circuits", label: "Circuits", icon: Route },
  { id: "experiences", label: "Expériences", icon: Compass },
  { id: "events", label: "Événements", icon: Calendar },
  { id: "reviews", label: "Avis", icon: Star },
  { id: "weather", label: "Météo", icon: CloudSun },
  { id: "map", label: "Carte", icon: MapPin },
  { id: "nearby", label: "À proximité", icon: Layers },
] as const;

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<AvgRating | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [sendingReview, setSendingReview] = useState(false);

  // Share
  const [shareDropdown, setShareDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  // Photo votes
  const [votedPhotos, setVotedPhotos] = useState<Set<string>>(new Set());
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Nearby data
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [circuits, setCircuits] = useState<CircuitItem[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(true);

  // Event creation
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", description: "", event_type: "festival", start_date: "", end_date: "", external_url: "" });
  const [creatingEvent, setCreatingEvent] = useState(false);
  const canAddEvent = token && ["eco_traveler", "guide", "project_owner", "admin"].includes(userRole || "");

  // Active section for nav highlight
  const [activeSection, setActiveSection] = useState("overview");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // ─── Auth ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const t = localStorage.getItem("token") || localStorage.getItem("access_token");
    const u = localStorage.getItem("user");
    setToken(t);
    if (u) try { const parsed = JSON.parse(u); setUserId(parsed.sub ?? parsed.id); setUserRole(parsed.role ?? null); } catch {}
  }, []);

  // ─── Click outside share ──────────────────────────────────────────────────

  useEffect(() => {
    if (!shareDropdown) return;
    function onClickOutside(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareDropdown(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [shareDropdown]);

  // ─── Intersection Observer for active section ─────────────────────────────

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );
    const refs = sectionRefs.current;
    Object.values(refs).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [loading]);

  // ─── Fetch place + nearby data ───────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiFetch<PlaceDetail>(`/publications/${id}`).catch(() => null),
      apiFetch<Photo[]>(`/photos?entity_type=publication&entity_id=${id}`).catch(() => []),
      apiFetch<Review[]>(`/reviews/target/publication/${id}`).catch(() => []),
      apiFetch<AvgRating>(`/reviews/average/publication/${id}`).catch(() => null),
    ]).then(([placeData, photosData, reviewsData, avgData]) => {
      setPlace(placeData);
      setPhotos(photosData);
      setReviews(reviewsData as Review[]);
      setAvgRating(avgData as AvgRating);
      setLoading(false);
    });
  }, [id]);

  // Fetch nearby content when place is loaded
  useEffect(() => {
    if (!place?.region) {
      setLoadingNearby(false);
      return;
    }
    Promise.all([
      apiFetch<OfferItem[]>(`/offers?region=${encodeURIComponent(place.region)}`).catch(() => []),
      apiFetch<CircuitItem[]>(`/circuits?region=${encodeURIComponent(place.region)}`).catch(() => []),
      apiFetch<ExperienceItem[]>(`/publications/experiences?region=${encodeURIComponent(place.region)}`).catch(() => []),
      apiFetch<NearbyPlace[]>(`/publications/places?region=${encodeURIComponent(place.region)}&limit=8`).catch(() => []),
      apiFetch<EventItem[]>(`/places/${place.id}/events`).catch(() => []),
    ]).then(([o, c, e, n, ev]) => {
      setOffers(o);
      setCircuits(c);
      setExperiences(e);
      setNearbyPlaces(n.filter((p) => p.id !== place.id));
      setEvents(ev);
      setLoadingNearby(false);
    });
  }, [place?.id, place?.region]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleUpvote(photoId: string) {
    if (!token) return router.push(`/auth/login?redirect=/places/${id}`);
    if (votedPhotos.has(photoId)) return;
    setVotedPhotos((prev) => new Set(prev).add(photoId));
    await apiFetch(`/photos/${photoId}/upvote`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const updated = await apiFetch<Photo[]>(`/photos?entity_type=publication&entity_id=${id}`);
    setPhotos(updated);
  }

  async function handleDownvote(photoId: string) {
    if (!token) return router.push(`/auth/login?redirect=/places/${id}`);
    if (votedPhotos.has(photoId)) return;
    setVotedPhotos((prev) => new Set(prev).add(photoId));
    await apiFetch(`/photos/${photoId}/downvote`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const updated = await apiFetch<Photo[]>(`/photos?entity_type=publication&entity_id=${id}`);
    setPhotos(updated);
  }

  async function handleSetHero(photoId: string) {
    if (!token) return;
    await apiFetch(`/photos/${photoId}/hero`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const updated = await apiFetch<Photo[]>(`/photos?entity_type=publication&entity_id=${id}`);
    setPhotos(updated);
  }

  async function handleUploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/upload`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const { url } = await uploadRes.json();
      await apiFetch("/photos", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url, entity_type: "publication", entity_id: id }),
      });
      const updated = await apiFetch<Photo[]>(`/photos?entity_type=publication&entity_id=${id}`);
      setPhotos(updated);
      setShowAddPhoto(false);
    } catch {} finally {
      setUploading(false);
    }
  }

  async function sendReview() {
    if (!token || !reviewComment.trim()) return;
    setSendingReview(true);
    try {
      await apiFetch("/reviews", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: "publication", target_id: id, rating: reviewRating, comment: reviewComment.trim() }),
      });
      const [updatedReviews, updatedAvg] = await Promise.all([
        apiFetch<Review[]>(`/reviews/target/publication/${id}`),
        apiFetch<AvgRating>(`/reviews/average/publication/${id}`),
      ]);
      setReviews(updatedReviews);
      setAvgRating(updatedAvg);
      setReviewComment("");
      setReviewRating(5);
      setReviewOpen(false);
    } catch (err: any) {
      if (err?.message?.includes("déjà")) alert("Vous avez déjà laissé un avis sur ce lieu.");
      else alert("Erreur lors de l'envoi de l'avis.");
    } finally {
      setSendingReview(false);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!token) return;
    if (!confirm("Supprimer cet avis ?")) return;
    try {
      await apiFetch(`/reviews/${reviewId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      const avg = await apiFetch<AvgRating>(`/reviews/average/publication/${id}`);
      setAvgRating(avg);
    } catch {}
  }

  async function handleCreateEvent() {
    if (!token || !eventForm.title.trim() || !eventForm.start_date) return;
    setCreatingEvent(true);
    try {
      await apiFetch(`/places/${id}/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventForm.title.trim(),
          description: eventForm.description.trim() || undefined,
          event_type: eventForm.event_type,
          start_date: new Date(eventForm.start_date).toISOString(),
          end_date: eventForm.end_date ? new Date(eventForm.end_date).toISOString() : undefined,
          external_url: eventForm.external_url.trim() || undefined,
        }),
      });
      const updated = await apiFetch<EventItem[]>(`/places/${id}/events`);
      setEvents(updated);
      setEventModalOpen(false);
      setEventForm({ title: "", description: "", event_type: "festival", start_date: "", end_date: "", external_url: "" });
    } catch { alert("Erreur lors de la création de l'événement."); }
    finally { setCreatingEvent(false); }
  }

  function handleCopyLink() {
    setShareDropdown(false);
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ─── Derived data ────────────────────────────────────────────────────────

  // Photos triées : hero en premier, puis par score, puis par date
  const sortedPhotos = [...photos].sort((a, b) => (b.is_hero ? 1 : 0) - (a.is_hero ? 1 : 0) || b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Galerie unifiée : photos de la communauté (hero first) + images du lieu
  const allImages = [
    ...sortedPhotos.map((p) => ({ url: p.url, from: "photo" as const, is_hero: p.is_hero })),
    ...(place?.images?.map((url) => ({ url, from: "place" as const, is_hero: false })) ?? []),
  ];

  // Tous les médias pour la galerie (avec source et lien)
  type MediaItem = { url: string; label: string; href?: string; id: string; score?: number; is_hero?: boolean; photoId?: string };
  const mediaItems: MediaItem[] = [
    // Photos de la communauté (avec votes/hero)
    ...sortedPhotos.map((p) => ({ url: p.url, label: "Communauté", id: `photo-${p.id}`, score: p.score, is_hero: p.is_hero, photoId: p.id })),
    // Images du lieu lui-même
    ...(place?.images?.map((url, i) => ({ url, label: "Lieu", id: `place-${i}` })) ?? []),
    // Images des offres à proximité
    ...offers.flatMap((o) =>
      ((o as any).images || []).map((url: string, i: number) => ({ url, label: "Offre", href: `/offers/${o.offer_id || o.id}`, id: `offer-${o.offer_id || o.id}-${i}` }))
    ),
    // Images des circuits à proximité
    ...circuits.flatMap((c) =>
      (c.images || []).map((url: string, i: number) => ({ url, label: "Circuit", href: `/circuits/${c.id}`, id: `circuit-${c.id}-${i}` }))
    ),
    // Images des expériences à proximité
    ...experiences.flatMap((e) =>
      (e.images || []).map((url: string, i: number) => ({ url, label: "Expérience", id: `exp-${e.id}-${i}` }))
    ),
    // Images des événements
    ...events.flatMap((ev) =>
      (ev.images || []).map((url: string, i: number) => ({ url, label: "Événement", id: `event-${ev.id}-${i}` }))
    ),
  ];
  const uniqueMedia = mediaItems.filter((m, idx, self) => self.findIndex((x) => x.url === m.url) === idx);
  const totalMedia = uniqueMedia.length;

  // ─── Loading / Error ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <p className="text-slate-500">Lieu introuvable</p>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <AppNavbar title={place.title} />

      {/* Hero / Gallery */}
      <section ref={(el) => { sectionRefs.current["overview"] = el; }} id="overview">
        <div className="relative">
          {allImages.length > 0 ? (
            <>
              <div className="h-64 sm:h-80 md:h-96 bg-slate-100 relative">
                <img
                  src={allImages[galleryIdx]?.url}
                  alt={place.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                  onError={imgFallback}
                />
                {allImages.length > 1 && (
                  <>
                    <button onClick={() => setGalleryIdx((i) => (i - 1 + allImages.length) % allImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 hover:bg-white shadow-sm">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setGalleryIdx((i) => (i + 1) % allImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 hover:bg-white shadow-sm">
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, i) => (
                        <button key={i} onClick={() => setGalleryIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === galleryIdx ? "bg-white" : "bg-white/50"}`} />
                      ))}
                    </div>
                  </>
                )}
                {/* Back button */}
                <button onClick={() => router.back()} className="absolute top-3 left-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm transition-colors z-10">
                  <ArrowLeft size={18} className="text-slate-600" />
                </button>
                {token && (
                  <button onClick={() => setShowAddPhoto(true)} className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm transition-colors z-10" title="Ajouter une photo">
                    <ImageIcon size={18} className="text-slate-600" />
                  </button>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto bg-slate-50 border-b border-slate-100">
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => setGalleryIdx(i)} className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === galleryIdx ? "border-primary" : "border-transparent"}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" onError={imgFallback} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-48 bg-slate-100 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <ImageIcon size={40} className="mx-auto mb-2" />
                <p className="text-sm">Aucune photo pour ce lieu</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <BackToDashboard />

        {/* ─── Layout: sidebar nav + content ─────────────────────────────── */}
        <div className="flex gap-6 relative">
          {/* Sidebar Navigation (desktop) */}
          <nav className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-24 space-y-1">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                      activeSection === sec.id
                        ? "bg-primary/10 text-primary"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={14} />
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Main Content */}
          <div className="flex-1 min-w-0">

            {/* ─── Top anchor tabs (mobile) ──────────────────────────────── */}
            <div className="lg:hidden mb-4 overflow-x-auto -mx-4 px-4">
              <div className="flex gap-1 pb-2 border-b border-slate-100 min-w-max">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollTo(sec.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-colors ${
                        activeSection === sec.id
                          ? "bg-primary/10 text-primary"
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={12} />
                      {sec.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ═══════════════ OVERVIEW ═══════════════ */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {place.category && (
                        <span className="text-[10px] font-semibold text-white bg-primary rounded-full px-2 py-0.5 flex items-center gap-1">
                          <Tag size={10} /> {place.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                        <Flame size={14} /> {place.popularity_score}
                      </span>
                      {avgRating && avgRating.count > 0 && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 ml-1">
                          <Star size={12} fill="currentColor" /> {avgRating.average} ({avgRating.count})
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">{place.title}</h1>
                    {(place.place_name || place.region) && (
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin size={14} /> {place.place_name}{place.place_name && place.region ? ", " : ""}{place.region}
                      </p>
                    )}
                  </div>
                </div>

                {place.description && (
                  <p className="text-sm text-slate-600 mb-4 whitespace-pre-line">{place.description}</p>
                )}

                {place.tags && place.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {place.tags.map((tag) => (
                      <span key={tag} className="text-[11px] text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">#{tag}</span>
                    ))}
                  </div>
                )}

                {/* Share */}
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <div ref={shareRef} className="relative">
                    <button
                      onClick={() => setShareDropdown(!shareDropdown)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${copied ? "text-primary" : "text-slate-400 hover:text-primary"}`}
                    >
                      {copied ? <Check size={16} /> : <Share2 size={16} />}
                      {copied ? "Copié !" : "Partager"}
                    </button>
                    {shareDropdown && (
                      <div className="absolute top-full mt-1 left-0 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-10">
                        <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                          <Copy size={14} className="text-slate-400 shrink-0" />
                          Copier le lien
                        </button>
                        <button
                          onClick={() => {
                            setShareDropdown(false);
                            const text = `Découvre ${place.title} sur Éco-Voyage !`;
                            if (navigator.share) {
                              navigator.share({ title: text, url: window.location.href }).catch(() => {});
                            } else {
                              navigator.clipboard.writeText(`${text}\n${window.location.href}`).then(() => {
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              });
                            }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-50"
                        >
                          <Send size={14} className="text-blue-400 shrink-0" />
                          Partager sur...
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════ GALLERY ═══════════════ */}
            <section ref={(el) => { sectionRefs.current["gallery"] = el; }} id="gallery" className="mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                <h2 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-1.5">
                  <Camera size={16} /> Galerie
                  <span className="text-sm font-normal text-slate-400 ml-1">({totalMedia} médias)</span>
                </h2>

                {totalMedia > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {uniqueMedia.map((media) => {
                      const isCommunity = !!media.photoId;
                      const photo = isCommunity ? sortedPhotos.find((p) => p.id === media.photoId) : null;
                      return (
                        <div key={media.id} className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-square">
                          <img
                            src={media.url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={imgFallback}
                          />
                          {/* Source badge */}
                          <span className={`absolute top-2 left-2 text-[9px] font-bold rounded-full px-1.5 py-0.5 shadow ${
                            media.label === "Communauté" ? "bg-primary text-white" :
                            media.label === "Offre" ? "bg-blue-500 text-white" :
                            media.label === "Circuit" ? "bg-violet-500 text-white" :
                            media.label === "Expérience" ? "bg-amber-500 text-white" :
                            "bg-slate-700 text-white"
                          }`}>
                            {media.label}
                          </span>
                          {media.is_hero && (
                            <span className="absolute top-2 right-2 bg-amber-400 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow">
                              <Star size={9} /> Principale
                            </span>
                          )}
                          {/* Hover overlay */}
                          {media.photoId ? (
                            // Community photo with votes
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-white text-xs font-bold">{media.score}</span>
                                    <span className="text-[10px] text-white/60">pts</span>
                                    <div className="flex gap-1 ml-1">
                                      <button onClick={() => media.photoId && handleUpvote(media.photoId)} disabled={media.photoId ? votedPhotos.has(media.photoId) : true} className={`p-1 rounded-full transition-all ${media.photoId && votedPhotos.has(media.photoId) ? "bg-green-500 text-white" : "bg-white/20 text-white hover:bg-green-500/80"}`} title="J'aime">
                                        <ThumbsUp size={10} />
                                      </button>
                                      <button onClick={() => media.photoId && handleDownvote(media.photoId)} disabled={media.photoId ? votedPhotos.has(media.photoId) : true} className={`p-1 rounded-full transition-all ${media.photoId && votedPhotos.has(media.photoId) ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-red-500/80"}`} title="Je n'aime pas">
                                        <ThumbsDown size={10} />
                                      </button>
                                    </div>
                                  </div>
                                  {token && !media.is_hero && media.photoId && (
                                    <button onClick={() => handleSetHero(media.photoId!)} className="p-1 rounded-full bg-white/20 text-white hover:bg-amber-400/80 transition-all" title="Définir comme photo principale">
                                      <Star size={10} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-[9px] text-white/50 mt-1">Votez pour les photos</p>
                              </div>
                            </div>
                          ) : media.href ? (
                            // Linked media (offer, circuit)
                            <a href={media.href} className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                              <span className="text-white text-[11px] font-semibold">Voir {media.label.toLowerCase()}</span>
                            </a>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">Aucune photo pour ce lieu.</p>
                )}

                {/* Source filters */}
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
                  {["Tout", "Communauté", "Offre", "Circuit", "Expérience", "Événement"].map((f) => (
                    <span key={f} className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                      f === "Tout" ? "bg-slate-800 text-white" :
                      f === "Communauté" ? "bg-primary/10 text-primary" :
                      f === "Offre" ? "bg-blue-50 text-blue-600" :
                      f === "Circuit" ? "bg-violet-50 text-violet-600" :
                      f === "Expérience" ? "bg-amber-50 text-amber-600" :
                      "bg-pink-50 text-pink-600"
                    }`}>
                      {f}
                    </span>
                  ))}
                </div>

                {token && !showAddPhoto && (
                  <button onClick={() => setShowAddPhoto(true)} className="w-full mt-4 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <ImageIcon size={16} /> Ajouter une photo
                  </button>
                )}

                {showAddPhoto && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Ajouter une photo</span>
                      <button onClick={() => setShowAddPhoto(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                    </div>
                    <label className="flex items-center justify-center gap-2 w-full py-6 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-primary hover:bg-white transition-colors">
                      <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" disabled={uploading} />
                      {uploading ? (
                        <Loader2 size={20} className="animate-spin text-primary" />
                      ) : (
                        <>
                          <ImageIcon size={20} className="text-slate-400" />
                          <span className="text-sm text-slate-500">Choisir un fichier</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
            </section>

            {/* ═══════════════ OFFERS ═══════════════ */}
            <section ref={(el) => { sectionRefs.current["offers"] = el; }} id="offers" className="mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                <h2 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-1.5">
                  <Tag size={16} /> Offres à proximité
                </h2>
                {loadingNearby ? (
                  <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
                ) : offers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    {place.region ? `Aucune offre disponible dans ${place.region}.` : "Ce lieu n'a pas de région définie."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {offers.slice(0, 6).map((offer) => (
                      <button
                        key={offer.id}
                        onClick={() => router.push(`/offers/${offer.offer_id || offer.id}`)}
                        className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          {offer.images?.[0] ? (
                            <img src={offer.images[0]} alt="" className="w-full h-full object-cover" onError={imgFallback} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Tag size={18} className="text-slate-300" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate">{offer.offer_title || offer.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{offer.item_type || "Offre"}</p>
                          {offer.prices?.[0] && (
                            <p className="text-xs font-bold text-primary mt-1">{offer.prices[0].price.toLocaleString()} {offer.prices[0].currency}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {offers.length > 6 && (
                  <button onClick={() => router.push(`/offers?region=${encodeURIComponent(place.region || "")}`)} className="w-full mt-3 text-center text-xs font-semibold text-primary hover:underline">
                    Voir toutes les offres ({offers.length})
                  </button>
                )}
              </div>
            </section>

            {/* ═══════════════ CIRCUITS ═══════════════ */}
            <section ref={(el) => { sectionRefs.current["circuits"] = el; }} id="circuits" className="mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                <h2 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-1.5">
                  <Route size={16} /> Circuits à proximité
                </h2>
                {loadingNearby ? (
                  <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
                ) : circuits.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    {place.region ? `Aucun circuit disponible dans ${place.region}.` : "Ce lieu n'a pas de région définie."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {circuits.slice(0, 6).map((circuit) => (
                      <button
                        key={circuit.id}
                        onClick={() => router.push(`/circuits/${circuit.id}`)}
                        className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          {circuit.images?.[0] ? (
                            <img src={circuit.images[0]} alt="" className="w-full h-full object-cover" onError={imgFallback} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Route size={18} className="text-slate-300" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate">{circuit.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {circuit.difficulty_level && (
                              <span className="mr-1">
                                {circuit.difficulty_level === "easy" ? "🟢" : circuit.difficulty_level === "moderate" ? "🟡" : circuit.difficulty_level === "hard" ? "🔴" : "⚫"}
                              </span>
                            )}
                            {circuit.duration_days ? `${circuit.duration_days} jours` : "Circuit"}
                          </p>
                          {circuit.base_price != null && (
                            <p className="text-xs font-bold text-primary mt-1">{circuit.base_price.toLocaleString()} {circuit.currency}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {circuits.length > 6 && (
                  <button onClick={() => router.push(`/circuits?region=${encodeURIComponent(place.region || "")}`)} className="w-full mt-3 text-center text-xs font-semibold text-primary hover:underline">
                    Voir tous les circuits ({circuits.length})
                  </button>
                )}
              </div>
            </section>

            {/* ═══════════════ EXPERIENCES ═══════════════ */}
            <section ref={(el) => { sectionRefs.current["experiences"] = el; }} id="experiences" className="mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                <h2 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-1.5">
                  <Compass size={16} /> Expériences à proximité
                </h2>
                {loadingNearby ? (
                  <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
                ) : experiences.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    {place.region ? `Aucune expérience partagée dans ${place.region}.` : "Ce lieu n'a pas de région définie."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {experiences.slice(0, 6).map((exp) => (
                      <div key={exp.id} className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          {exp.images?.[0] ? (
                            <img src={exp.images[0]} alt="" className="w-full h-full object-cover" onError={imgFallback} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Compass size={18} className="text-slate-300" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700">{exp.title}</p>
                          {exp.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{exp.description}</p>}
                          <p className="text-[10px] text-slate-400 mt-1">{fmtDate(exp.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ═══════════════ EVENTS ═══════════════ */}
            <section ref={(el) => { sectionRefs.current["events"] = el; }} id="events" className="mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                    <Calendar size={16} /> Événements
                    {events.length > 0 && <span className="text-sm font-normal text-slate-400 ml-1">({events.length})</span>}
                  </h2>
                  {canAddEvent ? (
                    <button onClick={() => setEventModalOpen(true)} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-emerald-600 transition-colors">
                      + Ajouter
                    </button>
                  ) : !token ? (
                    <button onClick={() => router.push(`/auth/login?redirect=/places/${id}`)} className="text-[11px] font-semibold text-primary hover:underline">
                      Connectez-vous pour ajouter un événement
                    </button>
                  ) : null}
                </div>
                {loadingNearby ? (
                  <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
                ) : events.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Aucun événement programmé pour ce lieu.</p>
                ) : (
                  <div className="space-y-3">
                    {events.map((ev) => {
                      const typeColors: Record<string, string> = {
                        festival: "bg-pink-100 text-pink-600",
                        concert: "bg-purple-100 text-purple-600",
                        market: "bg-amber-100 text-amber-600",
                        competition: "bg-red-100 text-red-600",
                        exhibition: "bg-blue-100 text-blue-600",
                        workshop: "bg-emerald-100 text-emerald-600",
                        other: "bg-slate-100 text-slate-600",
                      };
                      const typeLabel: Record<string, string> = {
                        festival: "Festival", concert: "Concert", market: "Marché",
                        competition: "Compétition", exhibition: "Exposition",
                        workshop: "Atelier", other: "Autre",
                      };
                      const startDate = new Date(ev.start_date);
                      const endDate = ev.end_date ? new Date(ev.end_date) : null;
                      return (
                        <div key={ev.id} className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                          {ev.images?.[0] ? (
                            <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                              <img src={ev.images[0]} alt="" className="w-full h-full object-cover" onError={imgFallback} />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                              <Calendar size={22} className="text-slate-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[ev.event_type] || typeColors.other}`}>
                                {typeLabel[ev.event_type] || ev.event_type}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {startDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                {endDate && endDate > startDate && ` → ${endDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-700">{ev.title}</p>
                            {ev.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ev.description}</p>}
                            {ev.external_url && (
                              <a href={ev.external_url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-blue-500 hover:underline mt-1 inline-block">
                                En savoir plus →
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* ═══════════════ REVIEWS ═══════════════ */}
            <section ref={(el) => { sectionRefs.current["reviews"] = el; }} id="reviews" className="mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Star size={16} /> Avis
                    {avgRating && avgRating.count > 0 && (
                      <span className="text-sm font-normal text-slate-400 ml-1">({avgRating.average} · {avgRating.count} avis)</span>
                    )}
                  </h2>
                  {token ? (
                    <button onClick={() => setReviewOpen(!reviewOpen)} className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${reviewOpen ? "bg-slate-100 text-slate-500" : "bg-primary text-white hover:bg-emerald-600"}`}>
                      {reviewOpen ? "Annuler" : "Donner mon avis"}
                    </button>
                  ) : (
                    <button onClick={() => router.push(`/auth/login?redirect=/places/${id}`)} className="text-xs font-bold text-primary hover:underline">
                      Connectez-vous pour donner votre avis
                    </button>
                  )}
                </div>

                {reviewOpen && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)} className="transition-colors">
                          <Star size={18} className={star <= reviewRating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                        </button>
                      ))}
                      <span className="text-xs text-slate-400 ml-2">{reviewRating}/5</span>
                    </div>
                    <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Partagez votre expérience dans ce lieu..." rows={3} maxLength={1000}
                      className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary/40 transition-colors resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button onClick={sendReview} disabled={!reviewComment.trim() || sendingReview}
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {sendingReview ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        Publier mon avis
                      </button>
                    </div>
                  </div>
                )}

                {reviews.length === 0 && !reviewOpen && (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Aucun avis pour ce lieu. {token ? "Soyez le premier !" : "Connectez-vous pour donner votre avis."}
                  </p>
                )}

                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-50">
                      <img src={avatarUrl(review.author?.photo, review.author?.full_name)} alt={review.author?.full_name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold text-slate-800">{review.author?.full_name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{ROLE_LABEL[review.author?.role] || review.author?.role}</span>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-400">{fmtDate(review.created_at)}</span>
                        </div>
                        <div className="flex gap-0.5 mb-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={11} className={star <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                          ))}
                        </div>
                        {review.comment && <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>}
                        {token && review.author_id === userId && (
                          <button onClick={() => handleDeleteReview(review.id)} className="mt-1 text-[11px] font-bold text-slate-300 hover:text-rose-400 transition-colors">Supprimer</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════════════ WEATHER ═══════════════ */}
            <section ref={(el) => { sectionRefs.current["weather"] = el; }} id="weather" className="mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                <h2 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-1.5">
                  <CloudSun size={16} /> Météo
                </h2>
                {place.latitude && place.longitude ? (
                  <WeatherSection lat={place.latitude} lng={place.longitude} placeName={place.place_name || place.title} />
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">Coordonnées manquantes pour la météo.</p>
                )}
              </div>
            </section>

            {/* ═══════════════ MAP ═══════════════ */}
            <section ref={(el) => { sectionRefs.current["map"] = el; }} id="map" className="mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                <h2 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-1.5">
                  <MapPin size={16} /> Carte
                </h2>
                {place.latitude && place.longitude ? (
                  <div className="rounded-xl overflow-hidden border border-slate-100 h-80">
                    <PlaceMap
                      lat={place.latitude}
                      lng={place.longitude}
                      title={place.title}
                      markers={[
                        // Nearby places (exclure le lieu courant)
                        ...nearbyPlaces
                          .filter((p) => p.id !== place.id && p.latitude && p.longitude)
                          .map((p) => ({
                            id: p.id,
                            lat: p.latitude!,
                            lng: p.longitude!,
                            title: p.title,
                            type: "place" as const,
                            href: `/places/${p.id}`,
                          })),
                        // Offers with coordinates
                        ...(offers as any[]).filter((o: any) => o.latitude && o.longitude).map((o: any) => ({
                          id: o.offer_id || o.id,
                          lat: o.latitude!,
                          lng: o.longitude!,
                          title: o.offer_title || o.name,
                          type: "offer" as const,
                          href: `/offers/${o.offer_id || o.id}`,
                        })),
                        // Circuits with coordinates
                        ...circuits.filter((c) => c.lat && c.lng).map((c) => ({
                          id: c.id,
                          lat: c.lat!,
                          lng: c.lng!,
                          title: c.title,
                          type: "circuit" as const,
                          href: `/circuits/${c.id}`,
                        })),
                      ]}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">Ce lieu n'a pas de coordonnées GPS.</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <a href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700"
                  >
                    <MapPin size={14} /> Ouvrir dans Google Maps
                  </a>
                  <div className="flex items-center gap-3 ml-auto text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Ce lieu</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block" /> Lieux</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Offres</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" /> Circuits</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════ NEARBY PLACES ═══════════════ */}
            <section ref={(el) => { sectionRefs.current["nearby"] = el; }} id="nearby" className="mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                <h2 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-1.5">
                  <Layers size={16} /> Lieux à proximité
                </h2>
                {loadingNearby ? (
                  <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
                ) : nearbyPlaces.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    {place.region ? `Aucun autre lieu trouvé dans ${place.region}.` : "Ce lieu n'a pas de région définie."}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {nearbyPlaces.map((np) => (
                      <button
                        key={np.id}
                        onClick={() => { router.push(`/places/${np.id}`); }}
                        className="group rounded-xl overflow-hidden border border-slate-100 hover:border-primary/20 hover:shadow-sm transition-all text-left"
                      >
                        <div className="aspect-[4/3] bg-slate-100">
                          {np.images?.[0] ? (
                            <img src={np.images[0]} alt={np.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={imgFallback} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Layers size={24} className="text-slate-300" /></div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-bold text-slate-700 truncate">{np.title}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {np.category && <span className="text-[9px] text-white bg-primary/70 rounded-full px-1.5 py-0.5">{np.category}</span>}
                            <span className="text-[10px] text-slate-400 ml-auto flex items-center gap-0.5"><Flame size={10} /> {np.popularity_score}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {nearbyPlaces.length > 8 && (
                  <button onClick={() => router.push(`/explore?region=${encodeURIComponent(place.region || "")}`)} className="w-full mt-3 text-center text-xs font-semibold text-primary hover:underline">
                    Explorer tous les lieux dans {place.region}
                  </button>
                )}
              </div>
            </section>

            {/* ═══════════════ COMMENTS (PubInteractions) ═══════════════ */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6 mb-6">
              <PubInteractions
                pubId={id}
                token={token || ""}
                viewerId={userId || ""}
                shareUrl={window.location.href}
                pubTitle={place.title}
              />
            </div>

          </div>{/* /Main Content */}
        </div>{/* /Layout */}
      </div>

      {/* Lightbox */}
      {lightboxOpen && allImages[galleryIdx] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={28} /></button>
          <img src={allImages[galleryIdx].url} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Event creation modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEventModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Ajouter un événement</h3>
              <button onClick={() => setEventModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <input value={eventForm.title} onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))} placeholder="Titre de l'événement *" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary/40" />
              <textarea value={eventForm.description} onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" rows={3} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary/40 resize-none" />
              <select value={eventForm.event_type} onChange={(e) => setEventForm((f) => ({ ...f, event_type: e.target.value }))} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary/40">
                <option value="festival">Festival</option>
                <option value="concert">Concert</option>
                <option value="market">Marché</option>
                <option value="competition">Compétition</option>
                <option value="exhibition">Exposition</option>
                <option value="workshop">Atelier</option>
                <option value="other">Autre</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Date début *</label>
                  <input type="date" value={eventForm.start_date} onChange={(e) => setEventForm((f) => ({ ...f, start_date: e.target.value }))} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary/40" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Date fin (optionnel)</label>
                  <input type="date" value={eventForm.end_date} onChange={(e) => setEventForm((f) => ({ ...f, end_date: e.target.value }))} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary/40" />
                </div>
              </div>
              <input value={eventForm.external_url} onChange={(e) => setEventForm((f) => ({ ...f, external_url: e.target.value }))} placeholder="Lien externe (optionnel)" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary/40" />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-slate-100">
              <button onClick={() => setEventModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Annuler</button>
              <button onClick={handleCreateEvent} disabled={!eventForm.title.trim() || !eventForm.start_date || creatingEvent} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1.5 transition-colors">
                {creatingEvent ? <Loader2 size={12} className="animate-spin" /> : <Calendar size={12} />}
                Publier l'événement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
