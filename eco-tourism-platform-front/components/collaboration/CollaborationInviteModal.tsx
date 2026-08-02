"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  X, UserPlus, Search, Loader2, MapPin, Star,
  ExternalLink, ChevronDown, ChevronUp, AlertCircle, Building2,
} from "lucide-react";

type InviteeType = "guide" | "provider";

interface SearchResult {
  user_id: string;
  name: string;
  photo?: string;
  type: InviteeType;
  subtitle?: string;
}

interface Guide {
  user_id: string;
  full_name: string;
  photo: string | null;
  zone: string | null;
  guide_type: string | null;
  sustainability_score: number | null;
}

interface GuideProfile extends Guide {
  bio: string | null;
  cover_photo: string | null;
  country: string | null;
  specialties: string[] | null;
  languages_spoken: string[] | null;
  years_experience: number | null;
  offerings: any[];
}

interface CollaborationInviteModalProps {
  offerId: string;
  offerTitle: string;
  offerRegion?: string | null;
  onClose: () => void;
  onInvited: () => void;
  defaultType?: InviteeType;
}

const SERVICE_TYPES = [
  { value: "randonnee", label: "Randonnée / Nature", icon: "🥾" },
  { value: "visite_culturelle", label: "Visite culturelle", icon: "🏛️" },
  { value: "guide_tour", label: "Guide touristique", icon: "🧭" },
  { value: "transport", label: "Transport / Transfert", icon: "🚗" },
  { value: "accompagnement", label: "Accompagnement", icon: "🤝" },
  { value: "photographie", label: "Photographie", icon: "📸" },
  { value: "gastronomie", label: "Gastronomie / Dégustation", icon: "🍽️" },
  { value: "bien_etre", label: "Bien-être / Méditation", icon: "🧘" },
  { value: "autre", label: "Autre", icon: "✨" },
];

// Récupération du prix du guide depuis ses prestations (offerings), par zone.
// Priorité : municipalité exacte → gouvernorat exact → toute la Tunisie → prix le plus bas (approximation).
function recoverGuidePrice(offerings: any[], region?: string | null): number | null {
  if (!offerings?.length) return null;
  const active = offerings.filter((o: any) => o.status === "active");
  const list = active.length > 0 ? active : offerings;
  const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();
  const regionNorm = norm(region);

  const byMunicipality = list.filter(
    (o: any) => o.zone_municipality && norm(o.zone_municipality) === regionNorm,
  );
  const byGovernorate = list.filter(
    (o: any) => o.zone_governorate && norm(o.zone_governorate) === regionNorm,
  );
  const allTunisia = list.filter((o: any) => o.service_zone_type === "all_tunisia");
  const candidates = byMunicipality.length
    ? byMunicipality
    : byGovernorate.length
      ? byGovernorate
      : allTunisia.length
        ? allTunisia
        : list;

  const prices = candidates
    .map((o: any) => Number(o.price))
    .filter((p: number) => Number.isFinite(p) && p >= 0);
  return prices.length ? Math.min(...prices) : null;
}

export default function CollaborationInviteModal({
  offerId,
  offerTitle,
  offerRegion,
  onClose,
  onInvited,
  defaultType = "guide",
}: CollaborationInviteModalProps) {
  const [inviteeType, setInviteeType] = useState<InviteeType>(defaultType);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [guideProfile, setGuideProfile] = useState<GuideProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [guidePrice, setGuidePrice] = useState("");
  const [serviceType, setServiceType] = useState("randonnee");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const fetchResults = useCallback(
    (q: string) => {
      if (q.trim().length > 0 && q.trim().length < 2) return;
      setLoading(true);
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      params.set("mode", inviteeType === "guide" ? "guide" : "provider");
      if (inviteeType === "provider") params.set("section", serviceType);
      apiFetch<SearchResult[]>(`/collaborations/collaborators/search?${params.toString()}`)
        .then((data) => setResults(Array.isArray(data) ? data : []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    },
    [inviteeType, serviceType],
  );

  useEffect(() => {
    setSelected(null);
    setGuideProfile(null);
    setResults([]);
    fetchResults("");
  }, [inviteeType, serviceType, fetchResults]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchResults(search), 300);
    return () => clearTimeout(timer);
  }, [search, fetchResults]);

  // Fetch guide profile when a guide is selected
  useEffect(() => {
    if (!selected || selected.type !== "guide") {
      setGuideProfile(null);
      setGuidePrice("");
      return;
    }
    setLoadingProfile(true);
    apiFetch<GuideProfile>(`/guide/public/${selected.user_id}`)
      .then((profile) => {
        setGuideProfile(profile);
        const recovered = recoverGuidePrice(profile.offerings, offerRegion);
        setGuidePrice(recovered != null ? String(recovered) : "");
      })
      .catch(() => setGuideProfile(null))
      .finally(() => setLoadingProfile(false));
  }, [selected, offerRegion]);

  const handleSend = async () => {
    if (!selected) return;
    setSending(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        invited_user_id: selected.user_id,
        invited_user_type: selected.type,
        invited_user_name: selected.name,
        offer_id: offerId,
        section: serviceType,
        message: message || null,
      };
      if (selected.type === "guide") {
        const price = parseFloat(guidePrice);
        if (!Number.isNaN(price) && price >= 0) payload.guide_price = price;
      }
      await apiFetch("/collaborations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onInvited();
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const personLabel =
    inviteeType === "guide"
      ? "un guide"
      : "un prestataire";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Inviter {personLabel}</h3>
              <p className="text-xs text-slate-500 truncate max-w-[300px]">{offerTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Toggle guide / provider */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setInviteeType("guide")}
              className={`py-2 rounded-lg text-sm font-semibold transition ${
                inviteeType === "guide"
                  ? "bg-white shadow text-emerald-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              🥾 Guide
            </button>
            <button
              onClick={() => setInviteeType("provider")}
              className={`py-2 rounded-lg text-sm font-semibold transition ${
                inviteeType === "provider"
                  ? "bg-white shadow text-emerald-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              🏨 Prestataire
            </button>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Rechercher {personLabel}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  inviteeType === "guide"
                    ? "Nom, zone, spécialité..."
                    : "Nom de l'établissement, région, type..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
              />
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
              </div>
            ) : (
              <div className="mt-3 max-h-64 overflow-y-auto space-y-2">
                {results.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    Aucun résultat. Tapez au moins 2 caractères.
                  </p>
                ) : (
                  results.map((r) => (
                    <button
                      key={r.user_id}
                      onClick={() =>
                        setSelected(
                          selected?.user_id === r.user_id ? null : r
                        )
                      }
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition border ${
                        selected?.user_id === r.user_id
                          ? "bg-emerald-50 border-emerald-200 shadow-sm"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 overflow-hidden shrink-0">
                        {r.photo ? (
                          <img src={r.photo} alt="" className="w-full h-full object-cover" />
                        ) : r.type === "provider" ? (
                          <Building2 className="w-5 h-5" />
                        ) : (
                          r.name?.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {r.name}
                          </p>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                              r.type === "provider"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {r.type === "provider" ? "Prestataire" : "Guide"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {r.type === "guide" ? (
                            <>
                              {r.subtitle === "Local" || r.subtitle === "Pro" ? (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                                  {r.subtitle === "Local" ? "Local" : "Pro"}
                                </span>
                              ) : (
                                r.subtitle && <span>{r.subtitle}</span>
                              )}
                            </>
                          ) : (
                            r.subtitle && <span>{r.subtitle}</span>
                          )}
                        </div>
                      </div>
                      {selected?.user_id === r.user_id ? (
                        <ChevronUp size={16} className="text-emerald-500 shrink-0" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-300 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected guide profile preview */}
          {selected && selected.type === "guide" && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              {loadingProfile ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                </div>
              ) : guideProfile ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 overflow-hidden shrink-0">
                      {guideProfile.photo ? (
                        <img src={guideProfile.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-emerald-700">
                          {guideProfile.full_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800">{guideProfile.full_name}</p>
                      <p className="text-xs text-slate-500">
                        {guideProfile.country || ""} {guideProfile.zone ? `· ${guideProfile.zone}` : ""}
                        {guideProfile.years_experience ? ` · ${guideProfile.years_experience} ans d'exp.` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/profile/guide/${guideProfile.user_id}`}
                      target="_blank"
                      className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold shrink-0"
                    >
                      Voir profil <ExternalLink size={12} />
                    </Link>
                  </div>

                  {guideProfile.bio && (
                    <p className="text-xs text-slate-500 line-clamp-2">{guideProfile.bio}</p>
                  )}

                  {guideProfile.specialties && guideProfile.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {guideProfile.specialties.map((s, i) => (
                        <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {guideProfile.languages_spoken && guideProfile.languages_spoken.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {guideProfile.languages_spoken.map((l, i) => (
                        <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {l}
                        </span>
                      ))}
                    </div>
                  )}

                  {guideProfile.offerings && guideProfile.offerings.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Prestations ({guideProfile.offerings.length})
                      </p>
                      <div className="space-y-1">
                        {guideProfile.offerings.slice(0, 3).map((o) => (
                          <div key={o.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-1.5 border border-slate-100">
                            <span className="text-slate-700 font-medium truncate">{o.title}</span>
                            {o.price && (
                              <span className="text-emerald-600 font-semibold shrink-0 ml-2">
                                {Number(o.price).toLocaleString()} TND
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Selected provider summary */}
          {selected && selected.type === "provider" && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                  {selected.photo ? (
                    <img src={selected.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{selected.name}</p>
                  <p className="text-xs text-slate-500">{selected.subtitle || "Prestataire"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Prix du guide récupéré automatiquement */}
          {selected && selected.type === "guide" && (
            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Prix du guide
                <span className="ml-1.5 text-[10px] font-medium text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5">
                  récupéré automatiquement
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={guidePrice}
                  onChange={(e) => setGuidePrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 pr-12 rounded-xl border border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm font-bold text-slate-800 bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  TND
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                Prix récupéré depuis la prestation du guide
                {offerRegion ? ` pour la zone « ${offerRegion} »` : " (zone de l'offre)"}. Modifiable :
                ce montant est ajouté au tarif de base de l&apos;offre.
              </p>
            </div>
          )}

          {/* Type de prestation */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Type de prestation demandée
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SERVICE_TYPES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setServiceType(s.value)}
                  className={`p-2.5 rounded-xl text-center text-xs font-medium border transition ${
                    serviceType === s.value
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-base block">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Message {inviteeType === "guide" ? "au guide" : "au prestataire"} (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                inviteeType === "guide"
                  ? "Décrivez ce que vous attendez du guide pour cette offre..."
                  : "Décrivez ce que vous attendez du prestataire pour cette offre..."
              }
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-5 py-4 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={!selected || sending}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Envoyer l&apos;invitation
          </button>
        </div>
      </div>
    </div>
  );
}
