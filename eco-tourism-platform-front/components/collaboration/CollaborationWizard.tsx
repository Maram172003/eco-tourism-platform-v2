"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  ChevronRight, ChevronLeft, Check, Loader2,
  Camera, DollarSign, MapPin, Globe, Wrench, FileText, Package, Send,
} from "lucide-react";

interface CollaborationWizardProps {
  collaborationId: string;
  initialData?: Record<string, any>;
  onComplete: () => void;
  onCancel: () => void;
}

const STEPS = [
  { title: "Services", icon: Wrench, desc: "Services proposés" },
  { title: "Disponibilités", icon: MapPin, desc: "Horaires & jours" },
  { title: "Tarification", icon: DollarSign, desc: "Prix & frais" },
  { title: "Langues", icon: Globe, desc: "Langues & compétences" },
  { title: "Photos", icon: Camera, desc: "Médias & galérie" },
  { title: "Description", icon: FileText, desc: "Détails & notes" },
  { title: "Matériel", icon: Package, desc: "Équipements" },
  { title: "Confirmation", icon: Send, desc: "Récapitulatif" },
];

const SERVICE_OPTIONS = [
  "Randonnée guidée",
  "Visite culturelle",
  "Dégustation",
  "Cours de cuisine",
  "Observation faune/flore",
  "Photographie",
  "Transport aéroport",
  "Transfert interville",
  "Location véhicule",
  "Location vélo",
  "Location équipement",
  "Hébergement",
  "Restauration traditionnelle",
  "Activité nautique",
  "Bien-être / Spa",
];

const LANGUAGE_OPTIONS = [
  "Français",
  "Anglais",
  "Arabe",
  "Espagnol",
  "Italien",
  "Allemand",
  "Turc",
];

const SKILL_OPTIONS = [
  "Premiers secours",
  "Guide certifié",
  "Connaissance historique",
  "Faune & flore",
  "Montagne",
  "Plongée",
  "Cuisine locale",
  "Artisanat",
];

export default function CollaborationWizard({
  collaborationId,
  initialData,
  onComplete,
  onCancel,
}: CollaborationWizardProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    services: initialData?.services ?? [],
    service_description: initialData?.service_description ?? "",
    availability_type: initialData?.availability_type ?? "flexible",
    available_days: initialData?.available_days ?? ["lundi","mardi","mercredi","jeudi","vendredi"],
    available_hours: initialData?.available_hours ?? "08:00 - 18:00",
    pricing_model: initialData?.pricing_model ?? "per_person",
    price: initialData?.price ?? "",
    currency: initialData?.currency ?? "TND",
    extra_fees: initialData?.extra_fees ?? [],
    languages: initialData?.languages ?? ["Français"],
    skills: initialData?.skills ?? [],
    certifications: initialData?.certifications ?? [],
    photos: initialData?.photos ?? [],
    video_url: initialData?.video_url ?? "",
    detailed_description: initialData?.detailed_description ?? "",
    notes_for_provider: initialData?.notes_for_provider ?? "",
    equipment_provided: initialData?.equipment_provided ?? [],
    equipment_required: initialData?.equipment_required ?? [],
  });

  const update = (key: string, value: any) => setData((d) => ({ ...d, [key]: value }));

  const toggleArray = (key: string, value: string) => {
    setData((d) => {
      const arr: string[] = (d as Record<string, any>)[key] ?? [];
      return {
        ...d,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const saveStep = async (final = false) => {
    setSaving(true);
    try {
      await apiFetch(`/collaborations/${collaborationId}/contribution`, {
        method: "PATCH",
        body: JSON.stringify({
          contribution: { ...data, confirmed: final },
        }),
      });
      if (final) onComplete();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    if (step < STEPS.length - 1) {
      await saveStep(false);
      setStep((s) => s + 1);
    } else {
      await saveStep(true);
    }
  };

  const prev = () => step > 0 && setStep((s) => s - 1);

  const DAYS = ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Progress bar */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900">
              Contribution — {STEPS[step].title}
            </h3>
            <span className="text-xs text-slate-500">
              Étape {step + 1}/{STEPS.length}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          {/* Step icons */}
          <div className="flex justify-between mt-3">
            {STEPS.map((s, i) => {
              const SI = s.icon;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-1 ${
                    i <= step ? "text-emerald-600" : "text-slate-300"
                  }`}
                >
                  <SI className="w-4 h-4" />
                  <span className="text-[10px] hidden sm:block">{s.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Step 0: Services */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Sélectionnez les services que vous proposez.
              </p>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleArray("services", s)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                      data.services.includes(s)
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <textarea
                value={data.service_description}
                onChange={(e) => update("service_description", e.target.value)}
                placeholder="Description détaillée de vos services..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm resize-none"
              />
            </div>
          )}

          {/* Step 1: Disponibilités */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {["fixed", "flexible", "on_request"].map((t) => (
                  <button
                    key={t}
                    onClick={() => update("availability_type", t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${
                      data.availability_type === t
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t === "fixed" ? "Fixe" : t === "flexible" ? "Flexible" : "Sur demande"}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Jours disponibles</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleArray("available_days", d)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition capitalize ${
                        data.available_days.includes(d)
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Horaires</label>
                <input
                  type="text"
                  value={data.available_hours}
                  onChange={(e) => update("available_hours", e.target.value)}
                  placeholder="08:00 - 18:00"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 2: Tarification */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "fixed", label: "Forfait" },
                  { value: "hourly", label: "Horaire" },
                  { value: "per_group", label: "Par groupe" },
                  { value: "per_person", label: "Par personne" },
                ].map((m) => (
                  <button
                    key={m.value}
                    onClick={() => update("pricing_model", m.value)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition ${
                      data.pricing_model === m.value
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Prix</label>
                  <input
                    type="number"
                    value={data.price}
                    onChange={(e) => update("price", e.target.value ? Number(e.target.value) : "")}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Devise</label>
                  <select
                    value={data.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm"
                  >
                    <option value="TND">TND</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Langues */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Langues parlées</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((l) => (
                    <button
                      key={l}
                      onClick={() => toggleArray("languages", l)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                        data.languages.includes(l)
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Compétences</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleArray("skills", s)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                        data.skills.includes(s)
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Photos */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">URLs des photos</label>
                {data.photos.map((_: string, i: number) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={data.photos[i]}
                      onChange={(e) => {
                        const p = [...data.photos];
                        p[i] = e.target.value;
                        update("photos", p);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm"
                      placeholder="https://..."
                    />
                    <button
                      onClick={() => update("photos", data.photos.filter((_: string, j: number) => j !== i))}
                      className="px-3 text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => update("photos", [...data.photos, ""])}
                  className="text-sm text-emerald-600 font-semibold hover:underline"
                >
                  + Ajouter une photo
                </button>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Vidéo (URL optionnel)</label>
                <input
                  type="text"
                  value={data.video_url}
                  onChange={(e) => update("video_url", e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 5: Description */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Description détaillée</label>
                <textarea
                  value={data.detailed_description}
                  onChange={(e) => update("detailed_description", e.target.value)}
                  placeholder="Décrivez votre expérience, votre approche, ce qui vous rend unique..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Notes pour le prestataire</label>
                <textarea
                  value={data.notes_for_provider}
                  onChange={(e) => update("notes_for_provider", e.target.value)}
                  placeholder="Informations privées pour le prestataire..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 6: Matériel */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Matériel que vous fournissez</label>
                {data.equipment_provided.map((_: string, i: number) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={data.equipment_provided[i]}
                      onChange={(e) => {
                        const p = [...data.equipment_provided];
                        p[i] = e.target.value;
                        update("equipment_provided", p);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm"
                      placeholder="Ex: Gilets de pluie, casques..."
                    />
                    <button
                      onClick={() => update("equipment_provided", data.equipment_provided.filter((_: string, j: number) => j !== i))}
                      className="px-3 text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => update("equipment_provided", [...data.equipment_provided, ""])}
                  className="text-sm text-emerald-600 font-semibold hover:underline"
                >
                  + Ajouter
                </button>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Matériel requis pour le client</label>
                {data.equipment_required.map((_: string, i: number) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={data.equipment_required[i]}
                      onChange={(e) => {
                        const p = [...data.equipment_required];
                        p[i] = e.target.value;
                        update("equipment_required", p);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm"
                      placeholder="Ex: Chaussures de marche, bouteille d'eau..."
                    />
                    <button
                      onClick={() => update("equipment_required", data.equipment_required.filter((_: string, j: number) => j !== i))}
                      className="px-3 text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => update("equipment_required", [...data.equipment_required, ""])}
                  className="text-sm text-emerald-600 font-semibold hover:underline"
                >
                  + Ajouter
                </button>
              </div>
            </div>
          )}

          {/* Step 7: Confirmation */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-xl p-4">
                <h4 className="font-bold text-emerald-800 mb-3">Récapitulatif</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Services :</span> {data.services.join(", ") || "Non défini"}</p>
                  <p><span className="font-semibold">Disponibilités :</span> {data.available_days.join(", ")} · {data.available_hours}</p>
                  <p><span className="font-semibold">Tarif :</span> {data.price || "—"} {data.currency} ({data.pricing_model})</p>
                  <p><span className="font-semibold">Langues :</span> {data.languages.join(", ")}</p>
                  <p><span className="font-semibold">Compétences :</span> {data.skills.join(", ") || "—"}</p>
                  <p><span className="font-semibold">Photos :</span> {data.photos.filter(Boolean).length} photo(s)</p>
                  <p><span className="font-semibold">Matériel fourni :</span> {data.equipment_provided.filter(Boolean).join(", ") || "—"}</p>
                  <p><span className="font-semibold">Matériel requis :</span> {data.equipment_required.filter(Boolean).join(", ") || "—"}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                En confirmant, votre contribution sera envoyée au prestataire pour validation.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-5 py-4 flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Abandonner
            </button>
            {step > 0 && (
              <button
                onClick={prev}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Retour
              </button>
            )}
          </div>
          <button
            onClick={next}
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : step === STEPS.length - 1 ? (
              <>
                <Check className="w-4 h-4" />
                Confirmer
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
