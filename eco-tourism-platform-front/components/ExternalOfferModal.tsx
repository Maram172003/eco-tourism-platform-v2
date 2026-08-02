"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { X, Building2, MapPin, Globe, User, Phone, DollarSign, ExternalLink, Loader2, Search } from "lucide-react";
import ExternalOfferItemSearch from "./ExternalOfferItemSearch";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[200px] bg-slate-100 animate-pulse rounded-xl" />,
});

type MyOfferItem = {
  id: string; name: string; item_type: string | null; offer_id: string; offer_title: string;
  category_slug?: string;
  prices?: { id: string; label: string; price: string; pricing_unit: string }[];
};

type ExternalRef = {
  provider_name: string;
  contact_name: string;
  phone: string;
  address: string;
  url: string;
  estimated_price: number;
  currency: string;
  notes: string;
  type: 'hebergement' | 'restaurant' | 'activite' | 'transport' | 'atelier' | 'guide_service' | 'equipment_rental' | 'evenement' | 'artisanat' | 'sejour';
  lat: number | null;
  lng: number | null;
};

/** Maps circuit program categories → offer category slugs */
const CIRCUIT_TO_OFFER_CATEGORY: Record<string, string> = {
  sejour: "sejour",
  hebergement: "accommodation",
  activite: "activity",
  restauration: "restaurant",
  transport: "transport",
  atelier: "workshop",
  guide_service: "guide_service",
  equipment_rental: "equipment_rental",
  evenement: "event",
  artisanat: "craft",
};

type Props = {
  open: boolean;
  onClose: () => void;
  myOfferItems: MyOfferItem[];
  selectedMyOfferId: string | null;
  onSelectMyOffer: (id: string | null, price?: string) => void;
  externalRef: ExternalRef | null;
  onExternalRefChange: (ref: ExternalRef | null) => void;
  dayLat: number | null;
  dayLng: number | null;
  excludeAuthorId: string;
  dayLabel?: string;
  programCategory?: string;
  region?: string;
};

const TABS = [
  { id: "my_offers", label: "Mes offres", icon: Building2 },
  { id: "external", label: "Offres externes", icon: Globe },
  { id: "standalone", label: "Référence externe", icon: ExternalLink },
];

const PROV_ITEMS = [
  { value: "sejour", label: "🌅 Séjour" },
  { value: "hebergement", label: "🏕️ Hébergement" },
  { value: "activite", label: "🎯 Activité" },
  { value: "restaurant", label: "🍽️ Restaurant" },
  { value: "transport", label: "🚐 Transport" },
  { value: "atelier", label: "🎨 Atelier" },
  { value: "guide_service", label: "🧭 Guide" },
  { value: "equipment_rental", label: "🎿 Équipement" },
  { value: "evenement", label: "🎉 Événement" },
  { value: "artisanat", label: "🏺 Artisanat" },
];

const PROG_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(PROV_ITEMS.map((p) => [p.value, p.label]));

export default function ExternalOfferModal({
  open, onClose, myOfferItems, selectedMyOfferId, onSelectMyOffer,
  externalRef, onExternalRefChange, dayLat, dayLng, excludeAuthorId, dayLabel,
  programCategory, region,
}: Props) {
  const [tab, setTab] = useState("my_offers");
  const [query, setQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [mapQuery, setMapQuery] = useState("");
  const [mapSearching, setMapSearching] = useState(false);

  async function searchPlace(query: string): Promise<{ lat: number; lng: number; display_name: string } | null> {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=fr`);
      const data = await res.json();
      if (!data.length) return null;
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display_name: data[0].display_name };
    } catch { return null; }
  }

  if (!open) return null;

  const offerCategorySlug = programCategory ? CIRCUIT_TO_OFFER_CATEGORY[programCategory] : undefined;

  const filteredMyItems = (() => {
    let items = myOfferItems;
    if (query.trim()) {
      items = items.filter((it) =>
        it.name.toLowerCase().includes(query.toLowerCase()) ||
        it.offer_title.toLowerCase().includes(query.toLowerCase()) ||
        it.item_type?.toLowerCase().includes(query.toLowerCase()) ||
        it.category_slug?.toLowerCase().includes(query.toLowerCase()));
    }
    return items;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Lier une activité</h2>
            {dayLabel && <p className="text-xs text-slate-400 mt-0.5">{dayLabel}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Tab 1: My Offers */}
          {tab === "my_offers" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                {offerCategorySlug
                  ? `Offres de type "${PROG_CATEGORY_LABELS[programCategory || ""] || programCategory}" uniquement.`
                  : "Sélectionne une de tes offres existantes à associer à cette activité."}
              </p>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Chercher dans mes offres..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {filteredMyItems.map((item) => {
                  const isSelected = selectedMyOfferId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { onSelectMyOffer(isSelected ? null : item.id, item.prices?.[0]?.price); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-primary bg-primary" : "border-slate-300"
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="bg-slate-100 rounded px-1 py-0.5">{item.item_type || "—"}</span>
                          <span>via {item.offer_title}</span>
                          {item.prices?.[0] && (
                            <span className="font-medium text-primary">💰 {Number(item.prices[0].price).toLocaleString()} TND</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredMyItems.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">
                    {query ? "Aucune offre trouvée" : "Aucune offre personnelle. Crée d'abord une offre dans ton tableau de bord."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: External Offers */}
          {tab === "external" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Offres d&apos;autres propriétaires à proximité de ce lieu.
              </p>
              <ExternalOfferItemSearch
                lat={dayLat}
                lng={dayLng}
                category={offerCategorySlug}
                excludeAuthorId={excludeAuthorId}
                dayLabel={dayLabel}
                region={region}
                onSelect={(offerItemId, offerTitle, itemName, providerName, price) => {
                  onSelectMyOffer(offerItemId, price);
                  onClose();
                }}
              />
            </div>
          )}

          {/* Tab 3: Standalone External Reference */}
          {tab === "standalone" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Ajoute une référence externe si aucun propriétaire sur la plateforme ne propose ce service dans ce lieu.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Type de prestation *</label>
                  <select
                    value={externalRef?.type || "hebergement"}
                    onChange={(e) => onExternalRefChange({ ...(externalRef || {} as ExternalRef), type: e.target.value as ExternalRef['type'] })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {PROV_ITEMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nom du prestataire *</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={externalRef?.provider_name || ""}
                      onChange={(e) => onExternalRefChange({ ...(externalRef || {} as ExternalRef), provider_name: e.target.value })}
                      placeholder="Ex: Hôtel Dar El Houda"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Contact</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={externalRef?.contact_name || ""}
                      onChange={(e) => onExternalRefChange({ ...(externalRef || {} as ExternalRef), contact_name: e.target.value })}
                      placeholder="Nom du contact"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Téléphone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={externalRef?.phone || ""}
                      onChange={(e) => onExternalRefChange({ ...(externalRef || {} as ExternalRef), phone: e.target.value })}
                      placeholder="+216 XX XXX XXX"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Prix estimé</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      value={externalRef?.estimated_price || ""}
                      onChange={(e) => onExternalRefChange({ ...(externalRef || {} as ExternalRef), estimated_price: Number(e.target.value) })}
                      placeholder="150"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Adresse</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={externalRef?.address || ""}
                      onChange={(e) => onExternalRefChange({ ...(externalRef || {} as ExternalRef), address: e.target.value })}
                      placeholder="Adresse complète"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-500">Localisation (lat/lng)</label>
                    <button type="button" onClick={() => setShowMap(!showMap)}
                      className="text-xs font-bold text-primary hover:underline">
                      {showMap ? "Masquer la carte" : "Choisir sur la carte"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" step="any" value={externalRef?.lat ?? ""} onChange={(e) => onExternalRefChange({ ...(externalRef || {} as ExternalRef), lat: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Latitude" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                    <input type="number" step="any" value={externalRef?.lng ?? ""} onChange={(e) => onExternalRefChange({ ...(externalRef || {} as ExternalRef), lng: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Longitude" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                  </div>
                  {showMap && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-1.5">
                        <input type="text" value={mapQuery} onChange={(e) => setMapQuery(e.target.value)}
                          placeholder="Rechercher un lieu..." className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (async () => { setMapSearching(true); const r = await searchPlace(mapQuery); if (r) onExternalRefChange({ ...(externalRef || {} as ExternalRef), lat: r.lat, lng: r.lng, address: r.display_name }); setMapSearching(false); })(); } }} />
                        <button type="button" onClick={async () => { setMapSearching(true); const r = await searchPlace(mapQuery); if (r) onExternalRefChange({ ...(externalRef || {} as ExternalRef), lat: r.lat, lng: r.lng, address: r.display_name }); setMapSearching(false); }}
                          className="px-2.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50">
                          {mapSearching ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                        </button>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-200">
                        <MapPicker
                          lat={externalRef?.lat ?? null}
                          lng={externalRef?.lng ?? null}
                          onPick={(lat, lng, addr) => onExternalRefChange({ ...(externalRef || {} as ExternalRef), lat, lng, address: addr || externalRef?.address || "" })}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Site web</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={externalRef?.url || ""}
                      onChange={(e) => onExternalRefChange({ ...(externalRef || {} as ExternalRef), url: e.target.value })}
                      placeholder="https://"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                  <textarea
                    value={externalRef?.notes || ""}
                    onChange={(e) => onExternalRefChange({ ...(externalRef || {} as ExternalRef), notes: e.target.value })}
                    placeholder="Informations complémentaires..."
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
              {(externalRef?.provider_name || externalRef?.phone || externalRef?.address) && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 font-bold">✓</span>
                  Référence externe enregistrée
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-emerald-600"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
