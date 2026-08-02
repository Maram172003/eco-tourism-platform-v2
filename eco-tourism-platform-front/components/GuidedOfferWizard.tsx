"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/ImageUploader";
import SmartDatePicker from "@/components/SmartDatePicker";
import {
  ArrowLeft, ArrowRight, X, Plus, Trash2, Loader2, Check, MapPin, Leaf, Clock, Calendar, Info, Sparkles,
} from "lucide-react";
import {
  OFFER_CATEGORIES, VENUE_TYPE_OFFERS, GUIDE_ALLOWED_OFFERS,
  CATEGORY_FORM_FIELDS, ITEM_TYPES_BY_CATEGORY, ROOM_SUB_TYPES, PRICING_UNITS,
} from "@/lib/offer-config";
import { getSchema, type SchemaField } from "@/lib/offer-schema";
import { needsLocation, canHaveGuide, guideRequirement, hasItemTypesWithoutLocation } from "@/lib/offer-rules";
import { getTaxonomy } from "@/lib/offer-taxonomy";
import { GOVERNORATE_COORDS } from "@/lib/governorate-coords";
import HierarchicalSelect from "@/components/HierarchicalSelect";
import GuideSearchInline from "@/components/GuideSearchInline";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[268px] rounded-2xl bg-slate-100 animate-pulse" />,
});

interface Props {
  token: string;
  userRole: string;
  userProjectId?: string;
  userVenueType?: string;
  userVenues?: { id: string; name: string; venue_type?: string[] | null; status?: string }[];
  onClose: () => void;
  onSuccess: (offer: any) => void;
  editOffer?: any;
  variant?: 'modal' | 'page';
}

interface AvailabilityRule {
  availability_type: string;
  start_date: string | null;
  end_date: string | null;
  weekdays: number[] | null;
  start_time: string | null;
  end_time: string | null;
  recurrence_rule: string | null;
}

interface OfferItemForm {
  id?: string;
  name: string;
  description: string;
  item_type: string;
  room_sub_type: string;
  bed_count: string;
  tent_capacity: string;
  difficulty_level: string;
  duration_hours: string;
  distance_km: string;
  activity_custom_name: string;
  details_json: Record<string, any>;
  prices: { id?: string; label: string; price: string; currency: string; pricing_unit: string; is_default: boolean }[];
  guide_id?: string;
  guide_name?: string;
  guide_enabled?: boolean;
}

const ACTIVITY_GROUPS: Record<string, { label: string; types: { value: string; label: string }[] }[]> = {
  activity: [
    {
      label: "Outdoor",
      types: [
        { value: "randonnee", label: "Randonnée" },
        { value: "trekking", label: "Trekking" },
        { value: "vtt", label: "VTT" },
        { value: "escalade", label: "Escalade" },
        { value: "kayak", label: "Kayak" },
        { value: "paddle", label: "Paddle" },
        { value: "tyrolienne", label: "Tyrolienne" },
        { value: "speleologie", label: "Spéléologie" },
        { value: "equitation", label: "Équitation" },
      ],
    },
    {
      label: "Nature",
      types: [
        { value: "observation", label: "Observation" },
        { value: "astronomie", label: "Astronomie" },
        { value: "photographie", label: "Photographie" },
      ],
    },
    {
      label: "Culture & Bien-être",
      types: [
        { value: "yoga", label: "Yoga" },
        { value: "meditation", label: "Méditation" },
        { value: "poterie", label: "Poterie" },
        { value: "cuisine", label: "Cuisine" },
        { value: "musique", label: "Musique" },
      ],
    },
    {
      label: "Sport",
      types: [
        { value: "surfing", label: "Surf" },
        { value: "diving", label: "Plongée" },
        { value: "paragliding", label: "Parapente" },
      ],
    },
    {
      label: "Autre",
      types: [{ value: "other", label: "Autre activité" }],
    },
  ],
};

const STEP_LABELS = [
  "", "Catégorie", "Informations", "Activité", "Tarifs",
  "Calendrier", "Capacité", "Carte", "Images", "Aperçu",
];

const TOTAL_STEPS = 9;

const VENUE_TYPE_MAP: Record<string, string> = {
  hebergement: 'accommodation', restauration: 'restaurant',
  artisanat: 'artisan', camping: 'camping', transport: 'transport',
  'centre activites': 'activity_center', 'espace evenementiel': 'event_space',
  'association tourisme': 'tourism_association', 'parc ecologique': 'eco_park',
  ferme: 'farm', accommodation: 'accommodation', restaurant: 'restaurant',
  artisan: 'artisan', activity_center: 'activity_center',
  event_space: 'event_space', tourism_association: 'tourism_association',
  eco_park: 'eco_park', farm: 'farm', cultural: 'activity_center',
  adventure: 'activity_center',
};

const OFFER_TYPE_MAP: Record<string, string> = {
  hebergement: 'accommodation', activite: 'activity',
  restauration: 'restaurant', artisanat: 'workshop',
  eco_tourisme: 'activity', autre: 'activity',
};

function hasDifficulty(itemType: string): boolean {
  return ["randonnee", "trekking", "vtt", "escalade", "kayak", "speleologie", "equitation", "surfing", "diving", "paragliding", "tyrolienne"].includes(itemType);
}

export default function GuidedOfferWizard({ token, userRole, userProjectId, userVenueType, userVenues, onClose, onSuccess, editOffer, variant = 'modal' }: Props) {
  const isEdit = !!editOffer;
  const [step, setStep] = useState<number>(isEdit ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [generatingSessions, setGeneratingSessions] = useState(false);
  const [error, setError] = useState("");
  const [publishImmediately, setPublishImmediately] = useState(true);

  const normalizedProjectType = userVenueType
    ? (VENUE_TYPE_MAP[userVenueType.toLowerCase()] ?? userVenueType) : null;

  const allowedCategories = userRole === "guide"
    ? GUIDE_ALLOWED_OFFERS
    : normalizedProjectType && VENUE_TYPE_OFFERS[normalizedProjectType]
      ? VENUE_TYPE_OFFERS[normalizedProjectType]
      : OFFER_CATEGORIES.map(c => c.value);

  const availableCategories = OFFER_CATEGORIES.filter(c => allowedCategories.includes(c.value) && c.value !== 'circuit');

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [meetingPoint, setMeetingPoint] = useState("");
  const [meetingLat, setMeetingLat] = useState<number | null>(null);
  const [meetingLng, setMeetingLng] = useState<number | null>(null);
  const [locationType, setLocationType] = useState("fixed");
  const [confirmationMode, setConfirmationMode] = useState("manual");
  const [minGroupSize, setMinGroupSize] = useState("");
  const [maxGroupSize, setMaxGroupSize] = useState("");
  const [minAge, setMinAge] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [inclusions, setInclusions] = useState("");
  const [depositPercentage, setDepositPercentage] = useState("");
  const [productionDelayDays, setProductionDelayDays] = useState("");
  const [fulfillmentMode, setFulfillmentMode] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [bookingDeadlineDays, setBookingDeadlineDays] = useState("");
  const [cancellationDeadlineDays, setCancellationDeadlineDays] = useState("");
  const [items, setItems] = useState<OfferItemForm[]>([]);
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState(editOffer?.venue_id || userProjectId || "");
  const [fetchedVenues, setFetchedVenues] = useState(userVenues ?? []);
  const venues = userVenues ?? fetchedVenues;

  useEffect(() => {
    if (userRole === "provider" && (!userVenues || userVenues.length === 0) && token) {
      apiFetch<any[]>("/providers/venues", { headers: { Authorization: `Bearer ${token}` } })
        .then((data) => setFetchedVenues(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [userRole, userVenues, token]);

  const normalizedCategory = category ? (OFFER_TYPE_MAP[category] ?? category) : '';
  const itemTypes = normalizedCategory ? (ITEM_TYPES_BY_CATEGORY[normalizedCategory] ?? []) : [];
  const activityGroups = normalizedCategory === 'activity' ? ACTIVITY_GROUPS.activity : [];
  const formFields = normalizedCategory ? (CATEGORY_FORM_FIELDS[normalizedCategory] ?? []) : [];
  const isActivity = normalizedCategory === 'activity' || normalizedCategory === 'eco_tour';
  const isAccommodation = normalizedCategory === 'accommodation';
  const isRestaurant = normalizedCategory === 'restaurant';
  const isEvent = normalizedCategory === 'event';
  const isSejour = normalizedCategory === 'sejour';
  const isCircuit = normalizedCategory === 'circuit';
  const hasItemTypeSelector = !isCircuit;
  const hasMeetingPoint = formFields.includes('meeting_point');

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  const [capacityType, setCapacityType] = useState("persons");
  const [totalQuantity, setTotalQuantity] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = "0px";
    return () => { document.body.style.overflow = ""; document.body.style.paddingRight = ""; };
  }, []);

  useEffect(() => {
    if (!editOffer) return;
    setCategory(editOffer.offer_type || editOffer.category?.slug || "");
    setTitle(editOffer.title || "");
    setDescription(editOffer.description || "");
    setRegion(editOffer.region || "");
    setAddress(editOffer.address || "");
    setLat(editOffer.latitude ?? null);
    setLng(editOffer.longitude ?? null);
    setMeetingPoint(editOffer.meeting_point || "");
    setConfirmationMode(editOffer.confirmation_mode || "automatic");
    setLocationType(editOffer.location_type || "fixed");
    setMinGroupSize(editOffer.min_group_size?.toString() || "");
    setMaxGroupSize(editOffer.max_group_size?.toString() || "");
    setMinAge(editOffer.min_age?.toString() || "");
    setImages(editOffer.images || []);
    setInclusions(editOffer.inclusions || "");
    setCancellationPolicy(editOffer.cancellation_policy || "");
    setDepositPercentage(editOffer.deposit_percentage?.toString() || "");
    setProductionDelayDays(editOffer.production_delay_days?.toString() || "");
    setFulfillmentMode(editOffer.fulfillment_mode || "");

    if (editOffer.items?.[0]) {
      setBookingDeadlineDays(editOffer.items[0].booking_deadline_days?.toString() || "");
      setCancellationDeadlineDays(editOffer.items[0].cancellation_deadline_days?.toString() || "");
      if (editOffer.items[0].capacity?.[0]) {
        setCapacityType(editOffer.items[0].capacity[0].capacity_type || "persons");
        setTotalQuantity(editOffer.items[0].capacity[0].total_quantity?.toString() || "");
      }
    }

    if (editOffer.items?.length) {
      setItems(editOffer.items.map((it: any) => ({
        id: it.id,
        name: it.name || "",
        description: it.description || "",
        item_type: it.item_type || "",
        room_sub_type: it.details_json?.room_sub_type || "",
        bed_count: it.details_json?.bed_count?.toString() || "",
        tent_capacity: it.details_json?.tent_capacity?.toString() || "",
        difficulty_level: it.details_json?.difficulty_level || "",
        duration_hours: it.details_json?.duration_hours?.toString() || "",
        distance_km: it.details_json?.distance_km?.toString() || "",
        activity_custom_name: it.details_json?.activity_custom_name || "",
        details_json: it.details_json || {},
        guide_enabled: !!it.details_json?.guide_id || canHaveGuide(normalizedCategory, it.item_type),
        guide_id: it.details_json?.guide_id || "",
        guide_name: it.details_json?.guide_name || "",
        prices: it.prices?.length
          ? it.prices.map((p: any) => ({ id: p.id, label: p.label || "", price: p.price?.toString() || "", currency: p.currency || "TND", pricing_unit: p.pricing_unit || "per_person", is_default: p.is_default ?? false }))
          : [{ label: "Plein tarif", price: "", currency: "TND", pricing_unit: "per_person", is_default: true }],
      })));
    }

    if (editOffer.items?.[0]?.availabilityRules?.length) {
      setAvailabilityRules(editOffer.items[0].availabilityRules.map((r: any) => ({
        availability_type: r.availability_type,
        start_date: r.start_date || null,
        end_date: r.end_date || null,
        weekdays: r.weekdays || null,
        start_time: r.start_time || null,
        end_time: r.end_time || null,
        recurrence_rule: r.recurrence_rule || null,
      })));
    }
  }, [editOffer]);

  useEffect(() => {
    if (category && items.length === 0 && !isEdit) {
      const autoName = itemTypes[0]?.label ?? "";
      const firstType = itemTypes[0]?.value ?? "";
      setItems([{
        name: autoName,
        description: "",
        item_type: firstType,
        room_sub_type: "",
        bed_count: "",
        tent_capacity: "",
        difficulty_level: "",
        duration_hours: "",
        distance_km: "",
        activity_custom_name: "",
        details_json: {},
        guide_enabled: canHaveGuide(normalizedCategory, firstType),
        guide_id: "",
        guide_name: "",
        prices: [{ label: "Plein tarif", price: "", currency: "TND", pricing_unit: "per_person", is_default: true }],
      }]);
    }
  }, [category]);

  const currentItemType = items[0]?.item_type ?? "";
  const isOtherActivity = currentItemType === "other";

  function updateFirstItem(field: keyof OfferItemForm, value: any) {
    const updated = [...items];
    if (!updated[0]) return;
    (updated[0] as any)[field] = value;
    setItems(updated);
  }

  function handleItemTypeChange(value: string) {
    const typeInfo = itemTypes.find(t => t.value === value) ?? activityGroups.flatMap(g => g.types).find(t => t.value === value);
    const autoName = value === "other" ? "" : (typeInfo?.label ?? "");
    updateFirstItem("item_type", value);
    updateFirstItem("name", autoName);
    if (value !== "other") updateFirstItem("activity_custom_name", "");
    if (!hasDifficulty(value)) updateFirstItem("difficulty_level", "");
    updateFirstItem("details_json", {});
    updateFirstItem("guide_enabled", canHaveGuide(normalizedCategory, value));
    updateFirstItem("guide_id", "");
    updateFirstItem("guide_name", "");
    const req = guideRequirement(normalizedCategory, value);
    if (req === 'required') updateFirstItem("guide_enabled", true);
    if (req === 'none') updateFirstItem("guide_enabled", false);
  }

  async function handleGenerateSessions() {
    if (!editOffer?.items?.[0]?.id) return;
    setGeneratingSessions(true);
    try {
      await apiFetch(`/offers/items/${editOffer.items[0].id}/availability/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Sessions générées avec succès !");
    } catch (err: any) {
      alert(err.message || "Erreur lors de la génération des sessions");
    } finally {
      setGeneratingSessions(false);
    }
  }

  function addItemPrice() {
    const updated = [...items];
    updated[0].prices.push({ label: "", price: "", currency: "TND", pricing_unit: "per_person", is_default: false });
    setItems(updated);
  }

  function removeItemPrice(idx: number) {
    const updated = [...items];
    updated[0].prices = updated[0].prices.filter((_, i) => i !== idx);
    setItems(updated);
  }

  function updateItemPrice(idx: number, field: string, value: any) {
    const updated = [...items];
    (updated[0].prices[idx] as any)[field] = value;
    setItems(updated);
  }

  function buildDetailsJson(): Record<string, any> | undefined {
    const item = items[0];
    if (!item) return undefined;
    const details: Record<string, any> = { ...item.details_json };

    if (isAccommodation) {
      if (item.item_type === 'room') {
        if (item.room_sub_type) details.room_sub_type = item.room_sub_type;
        if (item.bed_count) details.bed_count = Number(item.bed_count);
      } else if (item.item_type === 'camping_space') {
        if (item.tent_capacity) details.tent_capacity = Number(item.tent_capacity);
      }
    }

    if (isActivity || normalizedCategory === 'workshop') {
      if (item.duration_hours) details.duration_hours = Number(item.duration_hours);
      if (item.difficulty_level) details.difficulty_level = item.difficulty_level;
      if (item.distance_km) details.distance_km = Number(item.distance_km);
      if (isOtherActivity && item.activity_custom_name) details.activity_custom_name = item.activity_custom_name;
    }

    if (isEvent) {
      const activeRule = availabilityRules[0];
      if (activeRule?.start_date) details.event_start = activeRule.start_date;
      if (activeRule?.end_date) details.event_end = activeRule.end_date;
    }

    if (item.guide_id) {
      details.guide_id = item.guide_id;
      if ((item as any).guide_name) details.guide_name = (item as any).guide_name;
    }

    return Object.keys(details).length > 0 ? details : undefined;
  }

  function formatDuration(): string {
    const item = items[0];
    if (!item?.duration_hours) return "";
    const h = Number(item.duration_hours);
    if (h < 1) return `${Math.round(h * 60)} min`;
    if (h < 4) return `${h} h`;
    if (h <= 6) return "Demi-journée";
    if (h <= 10) return "Journée";
    return `${Math.round(h / 8)} jours`;
  }

  function getDefaultPricingUnit(): string {
    if (isAccommodation) return "per_night";
    if (normalizedCategory === 'circuit') return "per_person";
    if (normalizedCategory === 'sejour') return "per_person";
    if (normalizedCategory === 'transport') return "per_trip";
    if (normalizedCategory === 'restaurant') return "per_meal";
    if (normalizedCategory === 'craft') return "per_item";
    return "per_person";
  }

  function getDefaultPriceLabel(): string {
    if (isAccommodation) return "Par nuit";
    if (normalizedCategory === 'circuit') return "Par personne";
    if (normalizedCategory === 'sejour') return "Par personne";
    if (normalizedCategory === 'transport') return "Par trajet";
    if (normalizedCategory === 'restaurant') return "Par repas";
    return "Par personne";
  }

  async function handleSubmit() {
    if (!title.trim()) { setError("Le titre est obligatoire."); return; }
    if (!category) { setError("Choisissez une catégorie."); return; }
    if (userRole === "provider" && !selectedVenueId) {
      setError("Veuillez sélectionner un établissement.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const defaultUnit = getDefaultPricingUnit();
      const defaultLabel = getDefaultPriceLabel();

      const offerData: any = {
        title: title.trim(),
        offer_type: category,
        description: description.trim() || undefined,
        region: region.trim() || undefined,
        address: address.trim() || undefined,
        latitude: lat ?? undefined,
        longitude: lng ?? undefined,
        location_type: locationType,
        meeting_point: meetingPoint.trim() || undefined,
        meeting_lat: meetingLat ?? undefined,
        meeting_lng: meetingLng ?? undefined,
        confirmation_mode: confirmationMode,
        min_group_size: minGroupSize ? Number(minGroupSize) : undefined,
        max_group_size: maxGroupSize ? Number(maxGroupSize) : undefined,
        min_age: minAge ? Number(minAge) : undefined,
        images: images.length > 0 ? images : undefined,
        inclusions: inclusions.trim() || undefined,
        cancellation_policy: cancellationPolicy.trim() || undefined,
        deposit_percentage: depositPercentage ? Number(depositPercentage) : undefined,
        production_delay_days: productionDelayDays ? Number(productionDelayDays) : undefined,
        fulfillment_mode: fulfillmentMode || undefined,
      };

      /* Auto-sync activity schema fields → offer-level fields (backend requires them) */
      if (isActivity && items[0]) {
        const det = items[0].details_json || {};
        if (!offerData.min_group_size && det.nb_participants_min) offerData.min_group_size = det.nb_participants_min;
        if (!offerData.max_group_size && det.nb_participants_max) offerData.max_group_size = det.nb_participants_max;
        if (!offerData.min_age && det.age_minimum) offerData.min_age = det.age_minimum;
      }

      if (isEdit) {
        if (editOffer?.status === 'rejected') {
          (offerData as any).status = 'pending';
        } else if (publishImmediately && editOffer?.status === 'draft') {
          (offerData as any).status = 'approved';
        }
        // Si status est déjà pending/approved, ne pas envoyer de status (reste inchangé)
      }

      let resultOffer;
      if (isEdit) {
        await apiFetch<any>(`/offers/${editOffer.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(offerData),
        });
        resultOffer = await apiFetch<any>(`/offers/${editOffer.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        if (selectedVenueId) offerData.venue_id = selectedVenueId;
        resultOffer = await apiFetch<any>("/offers", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(offerData),
        });
      }

      const item = items[0];
      if (item?.name.trim()) {
        const itemData: any = {
          name: isOtherActivity && item.activity_custom_name ? item.activity_custom_name : item.name,
          description: item.description.trim() || undefined,
          item_type: item.item_type || undefined,
          details_json: buildDetailsJson(),
          confirmation_mode: confirmationMode,
          booking_deadline_days: bookingDeadlineDays ? Number(bookingDeadlineDays) : undefined,
          cancellation_deadline_days: cancellationDeadlineDays ? Number(cancellationDeadlineDays) : undefined,
        };

        let createdItem;
        try {
          if (item.id) {
            createdItem = await apiFetch<any>(`/offers/items/${item.id}`, {
              method: "PATCH",
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify(itemData),
            });
          } else {
            createdItem = await apiFetch<any>(`/offers/${resultOffer.id}/items`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify(itemData),
            });
          }
        } catch (itemErr: any) {
          // Cleanup: delete the offer if item creation failed (new offer only)
          if (!isEdit && resultOffer?.id) {
            await apiFetch(`/offers/${resultOffer.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => {});
          }
          throw itemErr;
        }

        if (createdItem) {
          for (const price of item.prices) {
            if (!price.price) continue;
            const pricePayload: any = {
              label: price.label || defaultLabel,
              price: Number(price.price),
              currency: price.currency || "TND",
              pricing_unit: price.pricing_unit || defaultUnit,
              is_default: price.is_default,
            };
            if (price.id) {
              await apiFetch(`/offers/items/prices/${price.id}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify(pricePayload),
              }).catch(() => {});
            } else {
              await apiFetch(`/offers/items/${createdItem.id}/prices`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify(pricePayload),
              }).catch(() => {});
            }
          }

          // Delete old rules before creating new ones (avoids duplicates on edit)
          if (isEdit) {
            await apiFetch(`/offers/items/${createdItem.id}/availability/delete-all`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => {});
          }

          for (const rule of availabilityRules) {
            await apiFetch(`/offers/items/${createdItem.id}/availability`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify(rule),
            }).catch(() => {});
          }

          // Auto-generate sessions from rules
          if (availabilityRules.length > 0) {
            await apiFetch(`/offers/items/${createdItem.id}/availability/generate`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => {});
          }

          // Set capacity if provided
          if (totalQuantity) {
            await apiFetch(`/offers/items/${createdItem.id}/capacity`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                capacity_type: capacityType,
                total_quantity: Number(totalQuantity),
              }),
            }).catch(() => {});
          }
        }
      }

      onSuccess(resultOffer);
    } catch (err: any) {
      setError(err.message || `Erreur lors de la ${isEdit ? "modification" : "création"}.`);
    } finally {
      setLoading(false);
    }
  }

  function getSkippedSteps(): number[] {
    const skipped: number[] = [];
    if (!needsLocation(normalizedCategory, currentItemType)) skipped.push(7);
    return skipped;
  }

  function validateStep(s: number): string | null {
    switch (s) {
      case 1:
        if (!category) return "Choisissez une catégorie.";
        return null;
      case 2:
        if (!title.trim()) return "Le titre est obligatoire.";
        if (!description.trim()) return "La description est obligatoire.";
        if (userRole === "provider" && !selectedVenueId) return "Sélectionnez un établissement.";
        return null;
      case 4: // Tarifs
        if (!items[0]?.prices?.length) return "Ajoutez au moins un prix.";
        if (items[0].prices.some((p: any) => !p.price || Number(p.price) <= 0)) return "Tous les prix doivent être > 0.";
        return null;
      default:
        return null;
    }
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setError("");
    let next = step + 1;
    while (getSkippedSteps().includes(next)) next++;
    setStep(Math.min(next, TOTAL_STEPS));
  }

  function goBack() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setError("");
    let prev = step - 1;
    while (getSkippedSteps().includes(prev)) prev--;
    setStep(Math.max(prev, isEdit ? 2 : 1));
  }

  function renderPriceUnitSelect(value: string, onChange: (v: string) => void) {
    return (
      <select className={`${inputClass} text-[11px]`} value={value} onChange={(e) => onChange(e.target.value)}>
        {PRICING_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
      </select>
    );
  }

  const currentSchema = currentItemType ? getSchema(normalizedCategory, currentItemType) : null;

  function handleSchemaField(field: string, value: any) {
    const updated = [...items];
    (updated[0] as any).details_json = { ...(updated[0] as any).details_json, [field]: value };
    setItems(updated);
    if (field === 'capacite_offre' && value && !maxGroupSize) {
      setMaxGroupSize(String(value));
    }
  }

  function getSchemaField(field: string): any {
    return items[0]?.details_json?.[field] ?? "";
  }

  function renderSchemaField(fieldName: string, fieldDef: SchemaField) {
    const val = getSchemaField(fieldName);
    if (fieldDef.conditionalOn) {
      const parentVal = getSchemaField(fieldDef.conditionalOn.field);
      if (parentVal !== fieldDef.conditionalOn.value && (fieldDef.conditionalOn.value !== true || !parentVal)) return null;
    }
    const label = <label className="text-xs font-bold text-slate-500">{fieldDef.label}{fieldDef.required ? " *" : ""}</label>;
    const baseCls = `${inputClass} ${fieldDef.type === "boolean" ? "" : ""}`;

    if (fieldDef.type === "boolean") {
      return (
        <div key={fieldName} className="flex items-center gap-2 py-1">
          <input type="checkbox" id={`sf-${fieldName}`} className="w-4 h-4 rounded border-slate-300 text-primary" checked={!!val}
            onChange={(e) => handleSchemaField(fieldName, e.target.checked)} />
          <label htmlFor={`sf-${fieldName}`} className="text-xs font-medium text-slate-700">{fieldDef.label}</label>
        </div>
      );
    }

    if (fieldDef.type === "select") {
      return (
        <div key={fieldName} className="space-y-1">
          {label}
          <select className={baseCls} value={val} onChange={(e) => handleSchemaField(fieldName, e.target.value)}>
            <option value="">Sélectionner...</option>
            {fieldDef.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );
    }

    if (fieldDef.type === "multiselect") {
      const selected: string[] = Array.isArray(val) ? val : [];
      return (
        <div key={fieldName} className="space-y-1">
          {label}
          <div className="flex flex-wrap gap-1.5">
            {fieldDef.options?.map((o) => {
              const active = selected.includes(o.value);
              return (
                <button key={o.value} type="button" onClick={() => {
                  const next = active ? selected.filter((v) => v !== o.value) : [...selected, o.value];
                  handleSchemaField(fieldName, next);
                }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border-2 transition-all ${active ? "bg-primary/10 border-primary text-slate-900" : "border-slate-100 text-slate-500 hover:border-primary/30"}`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (fieldDef.type === "hierarchy") {
      const selected: string[] = Array.isArray(val) ? val : [];
      const nodes = getTaxonomy(fieldDef.taxonomy as any);
      return (
        <div key={fieldName} className="space-y-1">
          <HierarchicalSelect
            nodes={nodes}
            selected={selected}
            onChange={(next) => handleSchemaField(fieldName, next)}
            label={fieldDef.label}
          />
        </div>
      );
    }

    if (fieldDef.type === "textarea") {
      return (
        <div key={fieldName} className="space-y-1">
          {label}
          <textarea className={`${baseCls} resize-none`} rows={3} value={val} onChange={(e) => handleSchemaField(fieldName, e.target.value)}
            placeholder={fieldDef.placeholder ?? ""} />
        </div>
      );
    }

    return (
      <div key={fieldName} className="space-y-1">
        {label}
        <input type={fieldDef.type === "number" ? "number" : "text"} min={fieldDef.min} max={fieldDef.max} step="any"
          className={baseCls} value={val} onChange={(e) => handleSchemaField(fieldName, e.target.type === "number" ? Number(e.target.value) : e.target.value)}
          placeholder={fieldDef.placeholder ?? ""} />
      </div>
    );
  }

  function renderGuideSection() {
    const item = items[0];
    if (!item?.guide_enabled) return null;
    const req = guideRequirement(normalizedCategory, item.item_type);
    const required = req === 'required';

    if (item.guide_id) {
      return (
        <div className="space-y-2 p-3 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧑‍🏫</span>
              <span className="text-xs font-bold text-slate-600">Guide {required ? "requis" : "optionnel"}</span>
            </div>
            <button type="button" onClick={() => {
              const u = [...items]; u[0].guide_id = ""; setItems(u);
            }} className="text-[10px] text-red-400 hover:text-red-600 font-medium">
              Retirer
            </button>
          </div>
          <div className="bg-white rounded-xl p-2 border border-amber-200 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-primary">{item.guide_name?.charAt(0) || "G"}</span>
            </div>
            <span className="text-xs font-semibold text-slate-700">{item.guide_name || item.guide_id}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2 p-3 bg-amber-50 rounded-2xl border border-amber-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧑‍🏫</span>
          <span className="text-xs font-bold text-slate-600">Guide {required ? "requis" : "optionnel"}</span>
        </div>
        <p className="text-[10px] text-slate-400">Recherchez un guide disponible dans votre région</p>
        <GuideSearchInline
          onSelect={(guideId, guideName, price, offeringId) => {
            const u = [...items];
            u[0].guide_id = guideId;
            (u[0] as any).guide_name = guideName;
            setItems(u);
          }}
          dayLat={lat}
          dayLng={lng}
          dayLocation={region}
        />
        {required && !item.guide_id && (
          <p className="text-[10px] text-amber-600 font-medium">⚠ Un guide est requis pour ce type d'activité</p>
        )}
      </div>
    );
  }

  function renderSchemaSections() {
    if (!currentSchema) return null;
    return currentSchema.sections.map((section) => {
      const visibleFields = section.fields.filter((f) => currentSchema.fields[f]);
      if (visibleFields.length === 0) return null;
      if (section.conditionalOn) {
        const parentVal = getSchemaField(section.conditionalOn.field);
        if (parentVal !== section.conditionalOn.value && (section.conditionalOn.value !== true || !parentVal)) return null;
      }
      return (
        <div key={section.id} className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{section.label}</p>
          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-3">
            {visibleFields.map((f) => renderSchemaField(f, currentSchema.fields[f]!))}
          </div>
        </div>
      );
    });
  }

  const isPage = variant === 'page';

  return (
    <div className={isPage ? "" : "fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-[5vh] sm:pt-[8vh] px-4"} onClick={isPage ? undefined : onClose}>
      <div className={isPage ? "bg-white rounded-3xl shadow-sm border border-slate-100 w-full" : "bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {step > (isEdit ? 2 : 1) && (
              <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{isEdit ? "Modifier l'offre" : "Nouvelle offre"}</h2>
              <p className="text-xs text-slate-400">{STEP_LABELS[step]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {(isEdit ? [2,3,4,5,6,7,8,9] : [1,2,3,4,5,6,7,8,9]).filter((s) => !getSkippedSteps().includes(s)).map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-slate-100"}`} />
            ))}
          </div>
        </div>

        <div className="p-6">

          {/* STEP 1: Category */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Choisir la catégorie</h3>
              <div className="grid grid-cols-2 gap-3">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => { setCategory(cat.value); goNext(); }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all hover:border-primary hover:bg-primary/5 ${category === cat.value ? "border-primary bg-primary/5" : "border-slate-100"}`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{cat.label}</p>
                      <p className="text-xs text-slate-400">{cat.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: General Info (MINIMAL) */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Informations générales</h3>

              {userRole === "provider" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Établissement *</label>
                  {venues && venues.length > 0 ? (
                    <select className={inputClass} value={selectedVenueId} onChange={(e) => setSelectedVenueId(e.target.value)}>
                      <option value="">Sélectionner un établissement</option>
                      {venues.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 space-y-2">
                      <p>Vous devez d&apos;abord créer un établissement pour pouvoir créer des offres.</p>
                      <a href="/dashboard" className="inline-block bg-amber-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-700 text-xs">Créer un établissement</a>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Titre de l'offre *</label>
                <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Eco Lodge Sahara, Randonnée Jbel Zaghouan..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Description</label>
                <textarea className={`${inputClass} resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Décrivez l'expérience en détail..." />
              </div>

              {!hasItemTypesWithoutLocation(normalizedCategory, itemTypes.map(it => it.value)) ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Région *</label>
                    <select className={inputClass} value={region} onChange={(e) => {
                      setRegion(e.target.value);
                      const coords = GOVERNORATE_COORDS[e.target.value];
                      if (coords) { setLat(coords.lat); setLng(coords.lng); }
                    }}>
                      <option value="">Sélectionner une région</option>
                      {Object.keys(GOVERNORATE_COORDS).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Adresse</label>
                    <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse complète" />
                  </div>
                </div>
              ) : needsLocation(normalizedCategory, "") ? (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Info size={14} className="text-slate-400 shrink-0" />
                    La localisation sera définie à l'étape suivante selon le type d'élément choisi
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    Localisation héritée du projet — non requise
                  </p>
                </div>
              )}

              {/* Confirmation mode - moved here compact */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Mode de confirmation</label>
                <select className={inputClass} value={confirmationMode} onChange={(e) => setConfirmationMode(e.target.value)}>
                  <option value="automatic">Automatique (réservation instantanée)</option>
                  <option value="manual">Manuelle (je valide chaque réservation)</option>
                </select>
              </div>

              {/* Location type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Type de localisation</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setLocationType("fixed")}
                    className={`flex-1 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${locationType === "fixed" ? "bg-primary/10 border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/30"}`}>
                    <span className="block">📍 Fixe</span>
                    <span className="block text-[10px] font-normal mt-0.5">Lieu précis</span>
                  </button>
                  <button type="button" onClick={() => setLocationType("mobile")}
                    className={`flex-1 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${locationType === "mobile" ? "bg-primary/10 border-primary text-slate-900" : "border-slate-200 text-slate-600 hover:border-primary/30"}`}>
                    <span className="block">🚐 Mobile</span>
                    <span className="block text-[10px] font-normal mt-0.5">Se déplace</span>
                  </button>
                </div>
                {locationType === "fixed" && <p className="text-[10px] text-slate-400">Vous définirez les coordonnées GPS à l'étape Carte</p>}
                {locationType === "mobile" && <p className="text-[10px] text-slate-400">L'offre se déplace chez le voyageur (zone de service à définir)</p>}
              </div>

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                {!isEdit && <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>}
                <button onClick={() => { if (!title.trim()) { setError("Le titre est obligatoire."); return; } goNext(); }} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Item intelligent */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">
                {isActivity ? "Type d'activité" : isAccommodation ? "Type d'hébergement" : isEvent ? "Type d'événement" : isSejour ? "Type de séjour" : "Élément réservable"}
              </h3>

              {/* Type selector with groups for activities */}
              {isActivity ? (
                <div className="space-y-3">
                  {activityGroups.map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{group.label}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {group.types.map((t) => {
                          const active = currentItemType === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => handleItemTypeChange(t.value)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border-2 text-left transition-all ${active ? "bg-primary/10 border-primary text-slate-900" : "border-slate-100 text-slate-600 hover:border-primary/30"}`}
                            >
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* "Autre" → custom name */}
                  {isOtherActivity && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Nom de l'activité *</label>
                      <input className={inputClass} value={items[0]?.activity_custom_name ?? ""} onChange={(e) => updateFirstItem("activity_custom_name", e.target.value)} placeholder="Ex: Cours de calligraphie arabe" />
                    </div>
                  )}

                  {/* Difficulty */}
                  {hasDifficulty(currentItemType) && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Niveau de difficulté</label>
                      <div className="flex gap-2">
                        {["easy", "moderate", "hard", "expert"].map((level) => {
                          const active = items[0]?.difficulty_level === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => updateFirstItem("difficulty_level", level)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${active ? "bg-primary/10 border-primary" : "border-slate-100 text-slate-500"}`}
                            >
                              {level === "easy" ? "Facile" : level === "moderate" ? "Modéré" : level === "hard" ? "Difficile" : "Expert"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Duration hours */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Durée estimée (heures)</label>
                    <div className="flex gap-2 items-center">
                      {[0.5, 1, 2, 3, 4, 6, 8].map((h) => {
                        const active = items[0]?.duration_hours === h.toString();
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() => updateFirstItem("duration_hours", h.toString())}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${active ? "bg-primary/10 border-primary" : "border-slate-100 text-slate-500"}`}
                          >
                            {h < 1 ? `${Math.round(h * 60)}min` : h >= 8 ? `${h / 8}j` : `${h}h`}
                          </button>
                        );
                      })}
                      <input type="number" min="0" step="0.5" className={`${inputClass} w-20`} value={items[0]?.duration_hours ?? ""}
                        onChange={(e) => updateFirstItem("duration_hours", e.target.value)} placeholder="Autre" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Non-activity: standard item_type dropdown */
                <>
                  <select className={inputClass} value={currentItemType} onChange={(e) => handleItemTypeChange(e.target.value)}>
                    <option value="">Type d'élément</option>
                    {itemTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>

                  {isAccommodation && currentItemType === 'room' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Sous-type chambre</label>
                      <select className={inputClass} value={items[0]?.room_sub_type ?? ""} onChange={(e) => updateFirstItem("room_sub_type", e.target.value)}>
                        <option value="">Sélectionner un sous-type</option>
                        {ROOM_SUB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                      </select>
                    </div>
                  )}

                  {isAccommodation && currentItemType === 'camping_space' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Capacité tente (pers.)</label>
                      <input type="number" min="1" className={`${inputClass} w-48`} value={items[0]?.tent_capacity ?? ""} onChange={(e) => updateFirstItem("tent_capacity", e.target.value)} placeholder="4" />
                    </div>
                  )}

                  {/* Item name - shown for non-activity or when auto-name is overridden */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Nom de l'élément</label>
                    <input className={inputClass} value={items[0]?.name ?? ""} onChange={(e) => updateFirstItem("name", e.target.value)} placeholder="Nom" />
                  </div>
                </>
              )}

              {/* Schema fields (détails spécifiques) */}
              {currentItemType && currentSchema && renderSchemaSections()}

              {/* Guide selection */}
              {currentItemType && renderGuideSection()}

              {/* Item description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Description de l'élément (optionnel)</label>
                <textarea className={`${inputClass} resize-none`} value={items[0]?.description ?? ""} onChange={(e) => updateFirstItem("description", e.target.value)} rows={2} placeholder="Précisions sur l'activité..." />
              </div>

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={() => { if (!items[0]?.name.trim() && !isOtherActivity) { setError("Le nom de l'élément est obligatoire."); return; } if (isOtherActivity && !items[0]?.activity_custom_name.trim()) { setError("Le nom de l'activité est obligatoire."); return; } goNext(); }} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Pricing */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Tarifs</h3>
              <p className="text-xs text-slate-400">Définissez le prix de base et les variations (adulte, enfant, étudiant...)</p>

              {items[0]?.prices.map((price, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Tarif {idx + 1}{price.is_default ? " (par défaut)" : ""}</span>
                    {items[0].prices.length > 1 && (
                      <button onClick={() => removeItemPrice(idx)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input className={`${inputClass} flex-1`} value={price.label} onChange={(e) => updateItemPrice(idx, "label", e.target.value)}
                      placeholder="Ex: Plein tarif, Enfant (6-12)" />
                    <input type="number" min="0" step="0.5" className={`${inputClass} w-28`} value={price.price}
                      onChange={(e) => updateItemPrice(idx, "price", e.target.value)} placeholder="0" />
                    <span className="text-xs text-slate-400 font-bold">TND</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select className={inputClass} value={price.pricing_unit} onChange={(e) => updateItemPrice(idx, "pricing_unit", e.target.value)}>
                      {PRICING_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <input type="checkbox" checked={price.is_default} onChange={(e) => updateItemPrice(idx, "is_default", e.target.checked)} className="rounded" />
                      Tarif par défaut
                    </label>
                  </div>
                </div>
              ))}

              {/* Dépôt / Acompte */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <span className="text-xs font-bold text-slate-600">Acompte / Dépôt de garantie</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="range" min="0" max="100" value={depositPercentage || "0"}
                    onChange={(e) => setDepositPercentage(e.target.value)}
                    className="flex-1 accent-primary h-2 rounded-full" />
                  <span className="text-sm font-bold text-primary min-w-[3ch]">{depositPercentage || "0"}%</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {depositPercentage === "0" || !depositPercentage
                    ? "Aucun acompte — paiement complet à la réservation"
                    : `L'éco-voyageur devra verser ${depositPercentage}% d'acompte pour confirmer`}
                </p>
              </div>

              <button onClick={addItemPrice} className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-1">
                <Plus size={14} /> Ajouter un tarif (enfant, étudiant, groupe...)
              </button>

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={goNext} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Smart Calendar */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-800">Disponibilités et Calendrier</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Définissez quand votre offre est disponible. Les règles créent automatiquement des créneaux réservables (sessions).
                </p>
              </div>

              <SmartDatePicker rules={availabilityRules} onChange={setAvailabilityRules} />

              {isEdit && editOffer?.items?.[0]?.id && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-700">Régénérer les sessions</p>
                      <p className="text-[10px] text-blue-500 mt-0.5">
                        Si vous modifiez les règles, cliquez pour recréer les créneaux disponibles. Les sessions avec des réservations existantes ne seront pas supprimées.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateSessions}
                    disabled={generatingSessions || availabilityRules.length === 0}
                    className="w-full py-2.5 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {generatingSessions ? (
                      <><Loader2 size={14} className="animate-spin" /> Génération en cours...</>
                    ) : (
                      <><Sparkles size={14} /> Régénérer les sessions</>
                    )}
                  </button>
                </div>
              )}
              {!isEdit && availabilityRules.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2">
                  <Sparkles size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-emerald-600">
                    Les sessions seront créées automatiquement lors de la publication. Vous pourrez les régénérer après.
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={goNext} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Capacity */}
          {step === 6 && (
            <div className="space-y-4">
              {isActivity ? (
                <>
                  <h3 className="font-bold text-slate-800">Politique & Livraison</h3>
                  <p className="text-xs text-slate-400">Paramètres de réservation pour cette activité</p>
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-[10px] text-blue-600 font-medium">
                      ℹ️ Participants min/max et âge minimum sont définis dans les détails de l&apos;activité (étape 3)
                    </p>
                  </div>
                </>
              ) : !isAccommodation && !isRestaurant ? (
                <>
                  <h3 className="font-bold text-slate-800">
                    {normalizedCategory === 'equipment_rental' ? 'Stock & Conditions' :
                     normalizedCategory === 'craft' ? 'Stock & Production' :
                     normalizedCategory === 'transport' ? 'Capacité véhicule' :
                     'Capacité'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {normalizedCategory === 'equipment_rental' ? 'Définissez la quantité disponible et les conditions de location' :
                     normalizedCategory === 'craft' ? 'Définissez le stock disponible et le délai de production' :
                     normalizedCategory === 'transport' ? 'Nombre de places disponibles par véhicule' :
                     'Définissez les limites de participants'}
                  </p>
                </>
              ) : null}

              {/* Group size - only for events (not equipment_rental, craft, transport) */}
              {!isActivity && !isAccommodation && !isRestaurant && normalizedCategory === 'event' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Participants minimum</label>
                    <input type="number" min="1" className={inputClass} value={minGroupSize} onChange={(e) => setMinGroupSize(e.target.value)} placeholder="1" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Participants maximum</label>
                    <input type="number" min="1" className={inputClass} value={maxGroupSize} onChange={(e) => setMaxGroupSize(e.target.value)} placeholder="20" />
                  </div>
                </div>
              )}

              {/* Min age - only for events */}
              {!isActivity && !isAccommodation && !isRestaurant && normalizedCategory === 'event' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Âge minimum</label>
                  <input type="number" min="0" className={`${inputClass} w-32`} value={minAge} onChange={(e) => setMinAge(e.target.value)} placeholder="0" />
                </div>
              )}

              {/* Stock capacity - adapted per category */}
              {!isAccommodation && !isRestaurant && !isActivity && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {normalizedCategory === 'equipment_rental' ? 'Quantité disponible' :
                     normalizedCategory === 'craft' ? 'Stock disponible' :
                     normalizedCategory === 'transport' ? 'Capacité véhicule' :
                     'Capacité de stock'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Type de capacité</label>
                      <select className={inputClass} value={capacityType} onChange={(e) => setCapacityType(e.target.value)}>
                        {normalizedCategory === 'equipment_rental' ? (
                          <>
                            <option value="items">Articles</option>
                            <option value="tents">Tentes</option>
                          </>
                        ) : normalizedCategory === 'craft' ? (
                          <option value="items">Articles</option>
                        ) : normalizedCategory === 'transport' ? (
                          <option value="seats">Places (par véhicule)</option>
                        ) : (
                          <>
                            <option value="persons">Personnes</option>
                            <option value="seats">Places</option>
                            <option value="items">Articles</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">
                        {normalizedCategory === 'equipment_rental' ? 'Quantité disponible' :
                         normalizedCategory === 'craft' ? 'Stock total' :
                         normalizedCategory === 'transport' ? 'Nombre de places' :
                         'Quantité totale'}
                      </label>
                      <input type="number" min="1" className={inputClass} value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)} placeholder={
                        normalizedCategory === 'equipment_rental' ? 'Ex: 10 vélos' :
                        normalizedCategory === 'craft' ? 'Ex: 50 pièces' :
                        normalizedCategory === 'transport' ? 'Ex: 8' :
                        'Ex: 20'
                      } />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {normalizedCategory === 'equipment_rental' ? 'Nombre d\'unités de cet équipement disponibles à la location' :
                     normalizedCategory === 'craft' ? 'Nombre d\'articles en stock' :
                     normalizedCategory === 'transport' ? 'Capacité maximale du véhicule' :
                     'Définit le stock global disponible'}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Description des inclusions (texte libre)</label>
                <textarea className={`${inputClass} resize-none`} value={inclusions} onChange={(e) => setInclusions(e.target.value)} rows={2} placeholder="Matériel, guide, repas, transport..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Politique d&apos;annulation</label>
                <select className={inputClass} value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)}>
                  <option value="">Sélectionner une politique</option>
                  <option value="flexible">Flexible — Remboursement complet si annulation 48h avant</option>
                  <option value="moderate">Modéré — Remboursement 50% si annulation 5 jours avant</option>
                  <option value="strict">Stricte — Remboursement uniquement si annulation 7 jours avant</option>
                  <option value="non_refundable">Non remboursable — Aucun remboursement</option>
                </select>
              </div>

              {/* Mode d'exécution - adapted per category */}
              {!isRestaurant && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Mode d&apos;exécution</label>
                  <select className={inputClass} value={fulfillmentMode} onChange={(e) => setFulfillmentMode(e.target.value)}>
                    {normalizedCategory === 'equipment_rental' ? (
                      <>
                        <option value="">Location standard</option>
                        <option value="instant_stock">Disponible immédiatement</option>
                        <option value="on_request">Sur demande (vérifier disponibilité)</option>
                      </>
                    ) : normalizedCategory === 'craft' ? (
                      <>
                        <option value="">Vente standard</option>
                        <option value="instant_stock">En stock, expédition rapide</option>
                        <option value="scheduled">Fabrication à la commande</option>
                        <option value="on_request">Sur demande (produit sur mesure)</option>
                      </>
                    ) : normalizedCategory === 'transport' ? (
                      <>
                        <option value="">Réservation classique</option>
                        <option value="instant_stock">Disponible immédiatement</option>
                        <option value="scheduled">Départs fixes à horaires réguliers</option>
                        <option value="on_request">Sur demande (itinéraire personnalisé)</option>
                      </>
                    ) : (
                      <>
                        <option value="">Standard (réservation + créneau)</option>
                        <option value="instant_stock">Stock instantané (disponible tout de suite)</option>
                        <option value="scheduled">Planifié (date fixe à l&apos;avance)</option>
                        <option value="recurring">Récurrent (tous les jours/semaines)</option>
                        <option value="on_request">Sur demande (le prestataire confirme)</option>
                      </>
                    )}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    {normalizedCategory === 'equipment_rental' ? 'Comment la location est-elle gérée ?' :
                     normalizedCategory === 'craft' ? 'Comment la vente est-elle gérée ?' :
                     normalizedCategory === 'transport' ? 'Comment le transport est-il organisé ?' :
                     'Comment cette offre est-elle exécutée ?'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Délai réservation (jours)</label>
                  <input type="number" min="0" className={inputClass} value={bookingDeadlineDays} onChange={(e) => setBookingDeadlineDays(e.target.value)} placeholder="Ex: 2" />
                  <p className="text-[10px] text-slate-400">Jours minimum avant la session pour réserver</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Délai annulation (jours)</label>
                  <input type="number" min="0" className={inputClass} value={cancellationDeadlineDays} onChange={(e) => setCancellationDeadlineDays(e.target.value)} placeholder="Ex: 1" />
                  <p className="text-[10px] text-slate-400">Jours minimum avant la session pour annuler</p>
                </div>
              </div>

              {/* Délai de production (artisanat et atelier uniquement) */}
              {(normalizedCategory === 'craft' || normalizedCategory === 'workshop') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Délai de production (jours)</label>
                  <input type="number" min="0" className={`${inputClass} w-32`} value={productionDelayDays} onChange={(e) => setProductionDelayDays(e.target.value)} placeholder="Ex: 3" />
                  <p className="text-[10px] text-slate-400">Temps nécessaire pour fabriquer/préparer l&apos;article</p>
                </div>
              )}

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={goNext} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Map (conditional) */}
          {step === 7 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Localisation</h3>

              {needsLocation(normalizedCategory, currentItemType) ? (
                <>
                  <p className="text-xs text-slate-400">Placez votre offre sur la carte — la région et l'adresse se remplissent automatiquement</p>

                  {/* Auto-filled region + address from MapPicker */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Région</label>
                      <input className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Région auto-remplie" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Adresse</label>
                      <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse auto-remplie" />
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <MapPicker
                      lat={lat ?? 33.8869}
                      lng={lng ?? 9.5375}
                      onPick={(la, ln, addr, reg) => {
                        setLat(la);
                        setLng(ln);
                        if (addr) setAddress(addr);
                        if (reg) setRegion(reg);
                      }}
                    />
                  </div>

                  {lat != null && lng != null && (
                    <p className="text-[10px] text-slate-400 font-medium">
                      GPS: {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                    </p>
                  )}

                  {hasMeetingPoint && (
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                        <MapPin size={14} /> Point de rendez-vous
                      </h4>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Lieu de rendez-vous</label>
                        <input className={inputClass} value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} placeholder="Ex: Devant l'hôtel, place centrale..." />
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <MapPicker
                          lat={meetingLat ?? lat ?? 33.8869}
                          lng={meetingLng ?? lng ?? 9.5375}
                          onPick={(la, ln) => { setMeetingLat(la); setMeetingLng(ln); }}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
                  <MapPin size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-600">Localisation héritée du projet</p>
                  <p className="text-xs text-slate-400 mt-1">Les coordonnées GPS du projet seront utilisées</p>
                </div>
              )}

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={goNext} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: Images */}
          {step === 8 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Images</h3>
              <p className="text-xs text-slate-400">Ajoutez au moins 3 photos pour mettre en valeur votre offre</p>

              <ImageUploader images={images} onChange={setImages} maxImages={10} label="Photos de l'offre" />

              {images.length > 0 && images.length < 3 && (
                <p className="text-[10px] text-amber-600 font-medium">💡 Ajoutez au moins 3 images pour un meilleur affichage</p>
              )}

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={goNext} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 9: Preview + Publish */}
          {step === 9 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Aperçu et publication</h3>

              {/* Preview card */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {images.length > 0 && (
                  <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-200">
                    <img src={images[0]} alt={title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-slate-800 text-lg">{title || "Titre de l'offre"}</h4>
                  {region && <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {region}</p>}
                  <div className="flex flex-wrap gap-2">
                    {items[0]?.duration_hours && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock size={10} /> {formatDuration()}
                      </span>
                    )}
                    {items[0]?.difficulty_level && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {items[0].difficulty_level === "easy" ? "Facile" : items[0].difficulty_level === "moderate" ? "Modéré" : items[0].difficulty_level === "hard" ? "Difficile" : "Expert"}
                      </span>
                    )}
                    {minGroupSize && maxGroupSize && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        👥 {minGroupSize}-{maxGroupSize} pers.
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    {items[0]?.prices?.[0]?.price ? (
                      <span className="font-bold text-emerald-600 text-sm">{Number(items[0].prices[0].price).toLocaleString()} TND <span className="text-[10px] font-medium text-slate-400">/{items[0].prices[0].pricing_unit?.replace('per_', '')}</span></span>
                    ) : (
                      <span className="text-xs text-slate-400">Prix non défini</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-sm">
                <label className="flex items-center gap-2 font-medium text-slate-700">
                  <input type="checkbox" checked={publishImmediately} onChange={(e) => setPublishImmediately(e.target.checked)} className="rounded text-primary" />
                  Publier immédiatement (visible dans les résultats de recherche)
                </label>
                <label className="flex items-center gap-2 font-medium text-slate-700">
                  <input type="checkbox" checked={!publishImmediately} onChange={(e) => setPublishImmediately(!e.target.checked)} className="rounded text-primary" />
                  Enregistrer comme brouillon (modifiable plus tard)
                </label>
              </div>

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {loading ? "Publication..." : (isEdit ? "Modifier l'offre" : "Publier l'offre")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}