"use client";

import { OFFER_SCHEMAS } from "@/lib/offer-schema";
import { getTaxonomy, findLeafLabel } from "@/lib/offer-taxonomy";
import { Check, X as XIcon } from "lucide-react";

interface OfferItemDetailsProps {
  detailsJson: Record<string, any> | null;
  schemaKey: string;
}

const OPTION_LABELS: Record<string, Record<string, string>> = {
  vue: { jardin: "Jardin", piscine: "Piscine", mer: "Mer", montagne: "Montagne", ville: "Ville", aucune: "Aucune", nature: "Nature" },
  sdb_type: { prive: "Privée", partage: "Partagée", commune: "Commune", exterieure: "Extérieure (douche solaire)" },
  configuration_lits: { "1_double": "1 lit double", "2_simples": "2 lits simples", double_superpose: "Lit double + superposé", familiale: "Familiale" },
  type_lit: { simple: "Lit simple", double: "Lit double", king: "Lit king size", superpose: "Lit superposé", canape: "Canapé-lit", mixte: "Mixte" },
  type_unite: { cabane: "Cabane", bungalow: "Bungalow", suite: "Suite", tente: "Tente", dome: "Dôme", yourte: "Yourte" },
  type_terrain: { montagne: "Montagne", foret: "Forêt", desert: "Désert", route: "Route", mixte: "Mixte", plage: "Plage", manege: "Manège" },
  type_monture: { cheval: "Cheval", poney: "Poney", dromadaire: "Dromadaire", ane: "Âne" },
  type_parcours: { boucle: "Boucle", aller_retour: "Aller-retour", traversee: "Traversée" },
  type_site: { falaise: "Falaise", bloc: "Bloc", via_ferrata: "Via ferrata", mur: "Mur", deep_water: "Deep water" },
  niveau_offre: { facile: "Facile", moyen: "Moyen", difficile: "Difficile", tres_difficile: "Très difficile", tous: "Tous niveaux", debutant: "Débutant", intermediaire: "Intermédiaire", confirme: "Confirmé", avance: "Avancé", expert: "Expert", initiation: "Initiation" },
  formule_restauration: { sans: "Aucune", petit_dej: "Petit-déjeuner", demi_pension: "Demi-pension", pension_complete: "Pension complète", pension: "Pension complète", table_hotes: "Table d'hôtes" },
  type_balade: { promenade: "Promenade", randonnee: "Randonnée", trek: "Trek", initiation: "Initiation", voltige: "Voltige" },
  type_embarcation_offre: { kayak_simple: "Kayak simple", kayak_double: "Kayak double", canoe: "Canoë", paddle: "Paddle" },
  type_velo_offre: { vtt: "VTT", vae: "VAE", gravel: "Gravel", ville: "Vélo ville" },
  type_observation: { faune: "Faune", flore: "Flore", oiseaux: "Oiseaux", etoiles: "Étoiles", paysages: "Paysages" },
  type_meditation: { pleine_conscience: "Pleine conscience", guidee: "Guidée", transcendantale: "Transcendantale", zen: "Zen", vipassana: "Vipassana", marche: "Marche" },
  type_photo: { initiation: "Initiation", balade: "Balade", stage: "Stage", night: "Nocturne", macro: "Macro", paysage: "Paysage", faune: "Faune" },
  type_visite: { historique: "Historique", culturelle: "Culturelle", nature: "Nature", gastronomique: "Gastronomique", nocturne: "Nocturne", thematique: "Thématique" },
  cadre_offre: { interieur: "Intérieur", exterieur: "Extérieur", plage: "Plage", terrasse: "Terrasse", jardin: "Jardin", foret: "Forêt" },
  style_offre: { hatha: "Hatha", vinyasa: "Vinyasa", ashtanga: "Ashtanga", yin: "Yin", nidra: "Nidra", prenatal: "Prénatal" },
  langues_guides: { fr: "Français", ar: "Arabe", en: "Anglais", de: "Allemand", it: "Italien", es: "Espagnol" },
  type_tente_offre: { safari: "Safari", bell: "Bell", yurt: "Yourte", chalet: "Chalet", toile: "Toile", tipi: "Tipi" },
  qualite_literie: { basique: "Basique", confort: "Confort", premium: "Premium" },
  sanitaires_offre: { prives: "Privés", partages: "Partagés", communs: "Communs" },
  dortoir_genre: { mixte: "Mixte", hommes: "Hommes", femmes: "Femmes" },
};

function formatValue(field: any, value: any): string | string[] | null {
  if (value == null || value === "") return null;

  if (field.type === "boolean") return value ? "Oui" : "Non";
  if (field.type === "number") return field.unit ? `${value} ${field.unit}` : String(value);
  if (field.type === "time") return value;

  if (field.type === "select") {
    const labels = OPTION_LABELS[field.label.toLowerCase().replace(/[^a-z]/g, "_")] || {};
    return (field.options?.find((o: any) => o.value === value)?.label) || labels[value] || value;
  }

  if (field.type === "multiselect" && Array.isArray(value)) {
    if (field.options) {
      const optionMap = Object.fromEntries((field.options as any[]).map((o: any) => [o.value, o.label]));
      return value.map((v: string) => optionMap[v] || OPTION_LABELS[field.label.toLowerCase().replace(/[^a-z]/g, "_")]?.[v] || v);
    }
    // langues_guides style - use global map keyed by field name part
    if (value.length > 0 && typeof value[0] === "string" && value[0].length <= 5) {
      return value.map((v: string) => OPTION_LABELS.langues_guides?.[v] || v);
    }
    return value;
  }

  if (field.type === "hierarchy" && Array.isArray(value)) {
    const taxonomy = getTaxonomy(field.taxonomy);
    return value.map((v: string) => findLeafLabel(taxonomy, v) || v);
  }

  if (typeof value === "string") return value;
  return String(value);
}

export default function OfferItemDetails({ detailsJson, schemaKey }: OfferItemDetailsProps) {
  if (!detailsJson || Object.keys(detailsJson).length === 0) return null;

  const schema = OFFER_SCHEMAS[schemaKey];
  if (!schema) return null;

  const renderedFields = new Set<string>();

  return (
    <div className="space-y-4">
      {schema.sections.map((section) => {
        const sectionFields = section.fields.filter((f) => {
          const fieldDef = schema.fields[f];
          if (!fieldDef) return false;
          if (fieldDef.conditionalOn) {
            const parentVal = detailsJson[fieldDef.conditionalOn.field];
            if (parentVal !== fieldDef.conditionalOn.value) return false;
          }
          const val = detailsJson[f];
          return val != null && val !== "" && !(Array.isArray(val) && val.length === 0);
        });
        if (sectionFields.length === 0) return null;

        return (
          <div key={section.id}>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{section.label}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {sectionFields.map((fieldKey) => {
                renderedFields.add(fieldKey);
                const fieldDef = schema.fields[fieldKey];
                const rawVal = detailsJson[fieldKey];
                const formatted = formatValue(fieldDef, rawVal);
                if (!formatted) return null;

                return (
                  <div key={fieldKey} className="flex items-start gap-2 bg-slate-50 rounded-lg px-3 py-2">
                    <span className="text-[11px] font-semibold text-slate-500 shrink-0 min-w-[80px]">{fieldDef.label}</span>
                    <span className="text-[11px] text-slate-700">
                      {Array.isArray(formatted) ? (
                        <span className="flex flex-wrap gap-1">
                          {formatted.map((v, i) => (
                            <span key={i} className="bg-primary/5 text-primary rounded-md px-1.5 py-0.5">{v}</span>
                          ))}
                        </span>
                      ) : (
                        formatted
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Render any remaining fields not in sections */}
      {(() => {
        const remaining = Object.keys(detailsJson).filter(
          (k) => !renderedFields.has(k) && schema.fields[k] && detailsJson[k] != null && detailsJson[k] !== "" && !(Array.isArray(detailsJson[k]) && detailsJson[k].length === 0)
        );
        if (remaining.length === 0) return null;
        return (
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Autres informations</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {remaining.map((fieldKey) => {
                const fieldDef = schema.fields[fieldKey];
                const formatted = formatValue(fieldDef, detailsJson[fieldKey]);
                if (!formatted) return null;
                return (
                  <div key={fieldKey} className="flex items-start gap-2 bg-slate-50 rounded-lg px-3 py-2">
                    <span className="text-[11px] font-semibold text-slate-500 shrink-0 min-w-[80px]">{fieldDef.label}</span>
                    <span className="text-[11px] text-slate-700">
                      {Array.isArray(formatted) ? (
                        <span className="flex flex-wrap gap-1">
                          {formatted.map((v, i) => (
                            <span key={i} className="bg-primary/5 text-primary rounded-md px-1.5 py-0.5">{v}</span>
                          ))}
                        </span>
                      ) : (
                        formatted
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
