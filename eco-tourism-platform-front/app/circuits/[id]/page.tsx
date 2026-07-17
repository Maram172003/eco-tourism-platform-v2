"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft, Leaf, MapPin, Clock, Users, Calendar,
  Check, DollarSign, Info, Plus, Trash2, Edit, X, Share2, Copy, Heart, ShoppingCart,
  AlertTriangle, Timer, Tag, Search, Globe,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";
import CircuitMap from "@/components/map/CircuitMap";
import ImageUploader from "@/components/ImageUploader";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TimelineView from "@/components/TimelineView";
import ExternalOfferModal from "@/components/ExternalOfferModal";
import type { MyOfferItem } from "@/components/OfferItemSearchInline";
import governorates from "@/lib/tunisia-governorates.json";

const TUNISIA_REGIONS = governorates.map((g) => g.name);

const OPTION_GROUP_LABELS: Record<string, string> = {
  transport: "Transport",
  accommodation: "Hébergement",
  equipment: "Équipement",
  activity: "Activité",
  food: "Repas",
};

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[268px] rounded-2xl bg-slate-100 animate-pulse" />,
});

const PROG_EMOJIS = ["📍", "🚐", "🥾", "🛶", "🏛️", "🍽️", "🏕️", "🌅", "📸", "🎒", "🚲", "🐪", "🦅", "🌿", "🏊", "🧗", "🎶", "🎨", "🛒", "⛺", "🚗", "🐴", "🚌", "✈️", "🚣"];

const PROG_TRANSPORTS = ["", "🚐 Van", "🥾 À pied", "🚲 Vélo", "🐪 Chameau", "🚗 Voiture", "🛶 Kayak", "🐴 Cheval", "🚌 Bus", "✈️ Vol", "🚣 Barque"];

const PROG_CATEGORIES = [
  { value: "hebergement", label: "🏨 Hébergement" },
  { value: "activite", label: "🥾 Activité" },
  { value: "restauration", label: "🍽️ Restauration" },
  { value: "transport", label: "🚌 Transport" },
  { value: "workshop", label: "🎨 Atelier" },
];

const PROG_SUBTYPES: Record<string, { value: string; label: string }[]> = {
  activite: [
    { value: "randonnee", label: "🥾 Randonnée" },
    { value: "kayak", label: "🛶 Kayak" },
    { value: "velo", label: "🚲 Vélo" },
    { value: "visite", label: "🏛️ Visite culturelle" },
    { value: "plage", label: "🏖️ Plage / Baignade" },
    { value: "observation", label: "🦅 Observation nature" },
    { value: "quad", label: "🏎️ Quad / 4x4" },
    { value: "plongee", label: "🤿 Plongée" },
    { value: "equitation", label: "🐴 Équitation" },
  ],
  restauration: [
    { value: "petit_dejeuner", label: "🥐 Petit-déjeuner" },
    { value: "dejeuner", label: "🍱 Déjeuner" },
    { value: "diner", label: "🍷 Dîner" },
    { value: "degustation", label: "🧀 Dégustation" },
  ],
  hebergement: [
    { value: "hotel", label: "🏨 Hôtel" },
    { value: "ecolodge", label: "🌿 Écolodge" },
    { value: "camping", label: "⛺ Camping" },
    { value: "gite", label: "🏡 Gîte / Maison d'hôte" },
  ],
  transport: [
    { value: "van", label: "🚐 Van privé" },
    { value: "bus", label: "🚌 Bus" },
    { value: "bateau", label: "⛵ Bateau" },
    { value: "vol", label: "✈️ Vol" },
  ],
  workshop: [
    { value: "cuisine", label: "👨‍🍳 Cuisine" },
    { value: "artisanat", label: "🎨 Artisanat" },
    { value: "yoga", label: "🧘 Yoga / Bien-être" },
    { value: "musique", label: "🎵 Musique / Danse" },
  ],
};

interface CircuitProgramItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  is_included: boolean;
  is_required: boolean;
  emoji: string | null;
  duration_minutes: number | null;
  distance_km: number | null;
  transport_mode: string | null;
  guide_id: string | null;
  guide_name: string | null;
  linked_offer_item_id: string | null;
  category: string | null;
  subtypes: string[] | null;
  price: number | null;
  photos: string[] | null;
  fields: Record<string, any> | null;
  unit_details: Record<string, any> | null;
  external_reference: Record<string, any> | null;
  is_external_reference: boolean;
}

interface CircuitDay {
  id: string;
  day_number: number;
  title: string;
  description: string | null;
  date: string | null;
  lat: number | null;
  lng: number | null;
  location_name: string | null;
  programItems?: CircuitProgramItem[];
}

interface CircuitOption {
  id: string;
  option_group: string | null;
  option_type: string;
  extra_price: number | null;
  is_included: boolean;
  is_required: boolean;
  status: string;
}

interface CircuitDetails {
  id: string;
  author_id: string;
  venue_id: string | null;
  title: string;
  description: string | null;
  base_price: number | null;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  duration_nights: number | null;
  region: string | null;
  max_participants: number | null;
  booking_deadline_days: number | null;
  confirmation_mode: string | null;
  difficulty_level: string | null;
  inclusions: string | null;
  exclusions: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  status: string;
  currency: string;
  images: string[] | null;
  cover_image: string | null;
  waypoints: string | null;
  days: CircuitDay[];
  options: CircuitOption[];
}

interface StoredUser {
  sub?: string;
  id?: string;
  role: string;
  full_name?: string;
}

export default function CircuitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [circuit, setCircuit] = useState<CircuitDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editDays, setEditDays] = useState("");
  const [editNights, setEditNights] = useState("");
  const [editMax, setEditMax] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editLat, setEditLat] = useState<number | null>(null);
  const [editLng, setEditLng] = useState<number | null>(null);
  const [editAddress, setEditAddress] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editCoverImage, setEditCoverImage] = useState("");
  const [editInclusions, setEditInclusions] = useState("");
  const [editExclusions, setEditExclusions] = useState("");
  const [editConfirmationMode, setEditConfirmationMode] = useState("automatic");
  const [editDifficultyLevel, setEditDifficultyLevel] = useState("moderate");
  const [editBookingDeadlineDays, setEditBookingDeadlineDays] = useState("");
  const [editCurrency, setEditCurrency] = useState("TND");
  const [editSearchQuery, setEditSearchQuery] = useState("");
  const [editSearching, setEditSearching] = useState(false);

  const [showAddDay, setShowAddDay] = useState(false);
  const [dayTitle, setDayTitle] = useState("");
  const [dayDesc, setDayDesc] = useState("");
  const [dayNum, setDayNum] = useState("");
  const [dayDate, setDayDate] = useState("");
  const [dayLat, setDayLat] = useState<number | null>(null);
  const [dayLng, setDayLng] = useState<number | null>(null);
  const [dayLocationName, setDayLocationName] = useState("");

  const [showEditDay, setShowEditDay] = useState<string | null>(null);
  const [editDayTitle, setEditDayTitle] = useState("");
  const [editDayDesc, setEditDayDesc] = useState("");
  const [editDayNum, setEditDayNum] = useState("");
  const [editDayDate, setEditDayDate] = useState("");
  const [editDayLat, setEditDayLat] = useState<number | null>(null);
  const [editDayLng, setEditDayLng] = useState<number | null>(null);
  const [editDayLocationName, setEditDayLocationName] = useState("");

  const [showAddOption, setShowAddOption] = useState(false);
  const [optType, setOptType] = useState("single_choice");
  const [optGroup, setOptGroup] = useState("");
  const [optPrice, setOptPrice] = useState("");
  const [optIncluded, setOptIncluded] = useState(false);
  const [optRequired, setOptRequired] = useState(false);

  const [showAddProgram, setShowAddProgram] = useState<string | null>(null);
  const [editProgramItem, setEditProgramItem] = useState<{ dayId: string; item: CircuitProgramItem } | null>(null);
  const [progTitle, setProgTitle] = useState("");
  const [progDesc, setProgDesc] = useState("");
  const [progStart, setProgStart] = useState("");
  const [progEnd, setProgEnd] = useState("");
  const [progEmoji, setProgEmoji] = useState("📍");
  const [progDuration, setProgDuration] = useState("");
  const [progDistance, setProgDistance] = useState("");
  const [progTransport, setProgTransport] = useState("");
  const [progLinkedOfferItemId, setProgLinkedOfferItemId] = useState<string | null>(null);
  const [progOfferItems, setProgOfferItems] = useState<MyOfferItem[]>([]);
  const [showProgEmojiPicker, setShowProgEmojiPicker] = useState(false);
  const [showGuideSearch, setShowGuideSearch] = useState(false);
  const [guideSearchQuery, setGuideSearchQuery] = useState("");
  const [guideSearchResults, setGuideSearchResults] = useState<any[]>([]);
  const [guideSearchLoading, setGuideSearchLoading] = useState(false);
  const [progGuideId, setProgGuideId] = useState<string | null>(null);
  const [progGuideName, setProgGuideName] = useState<string | null>(null);
  const [progWithGuide, setProgWithGuide] = useState(false);

  const [progCategory, setProgCategory] = useState("activite");
  const [progSubtypes, setProgSubtypes] = useState<string[]>([]);
  const [progPrice, setProgPrice] = useState("");
  const [progPhotos, setProgPhotos] = useState<string[]>([]);
  const [progGuideCost, setProgGuideCost] = useState<string>("");
  const [progExternalRef, setProgExternalRef] = useState<any>(null);
  const [progIsExternalRef, setProgIsExternalRef] = useState(false);
  const [showExtOfferModal, setShowExtOfferModal] = useState(false);
  const [progSelectedOfferPrice, setProgSelectedOfferPrice] = useState<string>("");
  const [progIsIncluded, setProgIsIncluded] = useState(true);
  const [progIsRequired, setProgIsRequired] = useState(false);

  const [showEditMap, setShowEditMap] = useState(false);
  const [showDayMap, setShowDayMap] = useState(false);
  const [showEditDayMap, setShowEditDayMap] = useState(false);

  const [showReserve, setShowReserve] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [reserveParticipants, setReserveParticipants] = useState(1);
  const [reserveSubmitting, setReserveSubmitting] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reserveSuccess, setReserveSuccess] = useState(false);

  const [myReservation, setMyReservation] = useState<any>(null);
  const [showModifyReservation, setShowModifyReservation] = useState(false);
  const [modifyParticipants, setModifyParticipants] = useState(1);
  const [modifySubmitting, setModifySubmitting] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancelReservation, setConfirmCancelReservation] = useState(false);

  const loadCircuit = () => {
    const t = localStorage.getItem("access_token");
    apiFetch<CircuitDetails>(`/circuits/${id}`, t ? { headers: { Authorization: `Bearer ${t}` } } : {})
      .then(setCircuit)
      .catch(() => setCircuit(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const t = localStorage.getItem("access_token");
    if (stored) setUser(JSON.parse(stored));
    if (t) setToken(t);
    loadCircuit();
    if (t && id) {
      apiFetch<any>(`/favorites/check/circuit/${id}`, { headers: { Authorization: `Bearer ${t}` } })
        .then((res) => setIsFavorite(res?.isFavorite ?? false))
        .catch(() => {});
    }
    if (t) {
      apiFetch<MyOfferItem[]>("/offers/items/mine", { headers: { Authorization: `Bearer ${t}` } })
        .then((items) => setProgOfferItems(Array.isArray(items) ? items : []))
        .catch(() => {});
    }
  }, [id]);

  const toggleFavorite = async () => {
    if (!token) return;
    setTogglingFav(true);
    try {
      await apiFetch("/favorites", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: "circuit", target_id: id }),
      });
      setIsFavorite((prev) => !prev);
    } catch {}
    setTogglingFav(false);
  };

  const addToCart = async () => {
    setAddingToCart(true);
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        const cartRes = await apiFetch<any>("/travel-carts/me", { headers: { Authorization: `Bearer ${token}` } });
        await apiFetch(`/travel-carts/${cartRes.id}/items`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ circuit_id: id, quantity: 1 }),
        });
      } else {
        const cart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        cart.push({ id: crypto.randomUUID(), type: "circuit", ref_id: id, quantity: 1, added_at: new Date().toISOString() });
        localStorage.setItem("guest_cart", JSON.stringify(cart));
      }
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 2000);
    } catch (e) {
      console.error("Add to cart error:", e);
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    if (!token || !id) return;
    apiFetch<any[]>(`/circuits/reservations/incoming`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((reservations) => {
        const mine = reservations.find((r: any) => r.circuit_id === id && r.user_id === (user?.sub ?? user?.id) && r.status !== "cancelled" && r.status !== "rejected");
        if (mine) {
          setMyReservation(mine);
          setModifyParticipants(mine.participants_count || 1);
        }
      })
      .catch(() => {});
  }, [token, id, user]);

  const userId = user?.sub ?? user?.id;
  const isAuthor = !!circuit && !!userId && circuit.author_id === userId;
  const canReserve = user?.role === "eco_traveler";
  const effectivePrice = circuit?.base_price ?? 0;
  const availableOptions = circuit?.options?.filter((o) => o.status === "active" && !o.is_included) ?? [];
  const totalDistance = circuit?.days?.reduce((sum, d) => sum + (d.programItems?.reduce((s, p) => s + (Number(p.distance_km) || 0), 0) || 0), 0) || 0;

  function handleOptionToggle(optionId: string, optionType: string) {
    if (optionType === "multiple_choice") {
      setSelectedOptionIds((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptionIds((prev) =>
        prev.includes(optionId) ? [] : [optionId]
      );
    }
  }

  async function handleReserve() {
    if (!token) return;
    setReserveSubmitting(true);
    setReserveError(null);
    try {
      const selectedOpts = circuit?.options
        ?.filter((o) => selectedOptionIds.includes(o.id) && o.status === "active")
        .map((o) => ({
          circuit_option_id: o.id,
          quantity: 1,
        })) ?? [];

      const result = await apiFetch<any>(`/circuits/${id}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          participants_count: reserveParticipants,
          options: selectedOpts.length > 0 ? selectedOpts : undefined,
        }),
      });
      setMyReservation(result);
      setReserveSuccess(true);
      setShowReserve(false);
    } catch (err: any) {
      setReserveError(err.message || "Erreur lors de la réservation");
    } finally {
      setReserveSubmitting(false);
    }
  }

  async function handleModifyReservation() {
    if (!token || !myReservation) return;
    setModifySubmitting(true);
    try {
      await apiFetch(`/circuits/reservations/${myReservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          participants_count: modifyParticipants,
        }),
      });
      setMyReservation((prev: any) => ({ ...prev, participants_count: modifyParticipants, final_total: effectivePrice * modifyParticipants }));
      setShowModifyReservation(false);
    } catch (err: any) {
      setReserveError(err.message || "Erreur lors de la modification");
    } finally {
      setModifySubmitting(false);
    }
  }

  async function handleCancelReservation() {
    if (!token || !myReservation) return;
    try {
      await apiFetch(`/circuits/reservations/${myReservation.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyReservation(null);
    } catch (err: any) {
      setReserveError(err.message || "Erreur lors de l'annulation");
    }
  }

  const sortedDays = [...(circuit?.days ?? [])].sort((a, b) => a.day_number - b.day_number);

  async function handleEdit() {
    if (!token) return;
    const body: Record<string, any> = {};
    if (editTitle) body.title = editTitle;
    if (editDesc) body.description = editDesc;
    if (editPrice) body.base_price = Number(editPrice);
    if (editRegion) body.region = editRegion;
    if (editDays) body.duration_days = Number(editDays);
    if (editNights) body.duration_nights = Number(editNights);
    if (editMax) body.max_participants = Number(editMax);
    if (editStartDate) body.start_date = editStartDate;
    if (editEndDate) body.end_date = editEndDate;
    if (editLat !== null) body.lat = editLat;
    if (editLng !== null) body.lng = editLng;
    if (editAddress) body.address = editAddress;
    if (editImages.length > 0) body.images = editImages;
    if (editCoverImage) body.cover_image = editCoverImage;
    if (editInclusions) body.inclusions = editInclusions;
    if (editExclusions) body.exclusions = editExclusions;
    if (editConfirmationMode) body.confirmation_mode = editConfirmationMode;
    if (editDifficultyLevel) body.difficulty_level = editDifficultyLevel;
    if (editBookingDeadlineDays) body.booking_deadline_days = Number(editBookingDeadlineDays);
    if (editCurrency) body.currency = editCurrency;
    try {
      await apiFetch(`/circuits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      setShowEdit(false);
      loadCircuit();
    } catch { alert("Erreur lors de la modification"); }
  }

  async function handleDelete() {
    if (!token) return;
    try {
      await apiFetch(`/circuits/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/dashboard");
    } catch (err: any) {
      setReserveError(err.message || "Erreur lors de la suppression");
    }
  }

  async function handleAddDay() {
    if (!token || !dayTitle || !dayNum) return;
    try {
      await apiFetch(`/circuits/${id}/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          day_number: Number(dayNum),
          title: dayTitle,
          description: dayDesc || undefined,
          date: dayDate || undefined,
          lat: dayLat ?? undefined,
          lng: dayLng ?? undefined,
          location_name: dayLocationName || undefined,
        }),
      });
      setShowAddDay(false);
      setDayTitle(""); setDayDesc(""); setDayNum(""); setDayDate(""); setDayLat(null); setDayLng(null); setDayLocationName("");
      setShowDayMap(false);
      loadCircuit();
    } catch (err: any) {
      setReserveError(err.message || "Erreur lors de l'ajout du jour");
    }
  }

  async function handleEditDay(dayId: string) {
    if (!token || !editDayTitle || !editDayNum || editDayLat === null || editDayLng === null) return;
    try {
      await apiFetch(`/circuits/${id}/days/${dayId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          day_number: Number(editDayNum),
          title: editDayTitle,
          description: editDayDesc || undefined,
          date: editDayDate || undefined,
          lat: editDayLat,
          lng: editDayLng,
          location_name: editDayLocationName || undefined,
        }),
      });
      setShowEditDay(null);
      loadCircuit();
    } catch (err: any) {
      setReserveError(err.message || "Erreur lors de la modification du jour");
    }
  }

  async function handleDeleteDay(dayId: string) {
    if (!token || !confirm("Supprimer ce jour ?")) return;
    try {
      await apiFetch(`/circuits/${id}/days/${dayId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimeout(() => loadCircuit(), 100);
    } catch (err: any) {
      if (err.message?.includes("404") || err.message?.includes("introuvable")) {
        loadCircuit();
      } else {
        setReserveError(err.message || "Erreur lors de la suppression du jour");
      }
    }
  }

  async function handleAddOption() {
    if (!token) return;
    try {
      await apiFetch(`/circuits/${id}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          option_type: optType,
          option_group: optGroup || undefined,
          extra_price: optPrice ? Number(optPrice) : undefined,
          is_included: optIncluded,
          is_required: optRequired,
        }),
      });
      setShowAddOption(false);
      setOptType("single_choice"); setOptGroup(""); setOptPrice(""); setOptIncluded(false); setOptRequired(false);
      loadCircuit();
    } catch (err: any) {
      setReserveError(err.message || "Erreur lors de l'ajout de l'option");
    }
  }

  async function handleEditProgram() {
    if (!token || !editProgramItem) return;
    try {
      await apiFetch(`/circuits/${id}/days/${editProgramItem.dayId}/program/${editProgramItem.item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: progTitle,
          description: progDesc || undefined,
          start_time: progStart || undefined,
          end_time: progEnd || undefined,
          emoji: progEmoji || undefined,
          duration_minutes: progDuration ? parseInt(progDuration) : undefined,
          distance_km: progDistance ? parseFloat(progDistance) : undefined,
          transport_mode: progTransport || undefined,
          guide_id: progWithGuide ? (progGuideId || null) : null,
          guide_name: progWithGuide ? (progGuideName || null) : null,
          linked_offer_item_id: progIsExternalRef ? null : (progLinkedOfferItemId || null),
          is_external_reference: progIsExternalRef ? true : undefined,
          external_reference: progIsExternalRef ? progExternalRef : undefined,
          category: progCategory || undefined,
          subtypes: progSubtypes.length > 0 ? progSubtypes : undefined,
          price: progPrice ? parseFloat(progPrice) : undefined,
          photos: progPhotos.length > 0 ? progPhotos : undefined,
          is_included: progIsIncluded,
          is_required: progIsRequired,
          fields: {
            ...(progGuideCost ? { guide_cost: parseFloat(progGuideCost) } : {}),
          },
        }),
      });
      setEditProgramItem(null);
      setProgGuideId(null); setProgGuideName(null); setProgWithGuide(false); setProgGuideCost("");
      setProgLinkedOfferItemId(null);
      loadCircuit();
    } catch (err: any) {
      setReserveError(err.message || "Erreur lors de la modification de l'activité");
    }
  }

  async function handleDeleteProgram(dayId: string, itemId: string) {
    if (!token || !confirm("Supprimer cette activité ?")) return;
    try {
      await apiFetch(`/circuits/${id}/days/${dayId}/program/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadCircuit();
    } catch (err: any) {
      setReserveError(err.message || "Erreur lors de la suppression de l'activité");
    }
  }

  async function handleAddProgram(dayId: string) {
    if (!token || !progTitle) return;
    try {
      await apiFetch(`/circuits/${id}/days/${dayId}/program`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: progTitle,
          description: progDesc || undefined,
          start_time: progStart || undefined,
          end_time: progEnd || undefined,
          emoji: progEmoji || undefined,
          duration_minutes: progDuration ? parseInt(progDuration) : undefined,
          distance_km: progDistance ? parseFloat(progDistance) : undefined,
          transport_mode: progTransport || undefined,
          guide_id: progWithGuide ? (progGuideId || undefined) : undefined,
          guide_name: progWithGuide ? (progGuideName || undefined) : undefined,
          linked_offer_item_id: progIsExternalRef ? null : (progLinkedOfferItemId || undefined),
          is_external_reference: progIsExternalRef ? true : undefined,
          external_reference: progIsExternalRef ? progExternalRef : undefined,
          category: progCategory || undefined,
          subtypes: progSubtypes.length > 0 ? progSubtypes : undefined,
          price: progPrice ? parseFloat(progPrice) : undefined,
          photos: progPhotos.length > 0 ? progPhotos : undefined,
          is_included: progIsIncluded,
          is_required: progIsRequired,
          fields: {
            ...(progGuideCost ? { guide_cost: parseFloat(progGuideCost) } : {}),
          },
        }),
      });
      setShowAddProgram(null);
      setProgTitle(""); setProgDesc(""); setProgStart(""); setProgEnd("");
      setProgEmoji("📍"); setProgDuration(""); setProgDistance(""); setProgTransport("");
      setProgGuideId(null); setProgGuideName(null); setProgWithGuide(false); setProgGuideCost("");
      setProgLinkedOfferItemId(null);
      setProgCategory("activite"); setProgSubtypes([]); setProgPrice(""); setProgPhotos([]);
      loadCircuit();
    } catch (err: any) {
      setReserveError(err.message || "Erreur lors de l'ajout du programme");
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/circuits/${id}`;
    const text = `Découvrez ce circuit: ${circuit?.title} ${url}`;
    router.push(`/messagerie?share=${encodeURIComponent(text)}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg font-semibold">Circuit introuvable</p>
          <p className="text-slate-400 text-sm mt-1">Ce circuit n&apos;existe pas ou n&apos;est pas encore publié.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-12">
      <AppNavbar title={circuit.title} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <BackToDashboard />
          <button
            onClick={() => router.push("/dashboard#Circuits")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={16} /> Tous les circuits
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {(() => {
            const allImages = circuit.cover_image
              ? [circuit.cover_image, ...(circuit.images || [])]
              : (circuit.images || []);
            if (allImages.length === 0) return null;
            return (
            <div className="relative h-64 bg-slate-900">
              <img src={allImages[galleryIdx]} alt={circuit.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setGalleryIdx((i) => (i - 1 + allImages.length) % allImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70"><ArrowLeft size={18} /></button>
                  <button onClick={() => setGalleryIdx((i) => (i + 1) % allImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70"><ArrowLeft size={18} className="rotate-180" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button key={i} onClick={() => setGalleryIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === galleryIdx ? "bg-white scale-125" : "bg-white/50"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>);
          })() || (
            <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
              <Leaf size={48} className="text-emerald-400 opacity-50" />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-slate-800">{circuit.title}</h1>
              {circuit.base_price !== null && (
                <div className="text-primary font-bold text-2xl flex items-center gap-1">
                  <DollarSign size={22} />
                  {Number(effectivePrice).toLocaleString()} <span className="text-sm font-normal text-slate-400">{circuit.currency}</span>
                </div>
              )}
            </div>

            {isAuthor && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => { setEditTitle(circuit.title); setEditDesc(circuit.description ?? ""); setEditPrice(String(circuit.base_price ?? "")); setEditRegion(circuit.region ?? ""); setEditDays(String(circuit.duration_days ?? "")); setEditNights(String(circuit.duration_nights ?? "")); setEditMax(String(circuit.max_participants ?? "")); setEditStartDate(circuit.start_date?.slice(0, 10) ?? ""); setEditEndDate(circuit.end_date?.slice(0, 10) ?? ""); setEditLat(circuit.lat ? Number(circuit.lat) : null); setEditLng(circuit.lng ? Number(circuit.lng) : null); setEditAddress(circuit.address ?? ""); setEditImages(circuit.images ?? []); setEditCoverImage(circuit.cover_image ?? ""); setEditInclusions(circuit.inclusions ?? ""); setEditExclusions(circuit.exclusions ?? ""); setEditConfirmationMode(circuit.confirmation_mode ?? "automatic"); setEditDifficultyLevel(circuit.difficulty_level ?? "moderate"); setEditBookingDeadlineDays(String(circuit.booking_deadline_days ?? "")); setEditCurrency(circuit.currency ?? "TND"); setShowEdit(true); }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100">
                  <Edit size={14} /> Modifier
                </button>
                <button onClick={() => { setShowAddDay(true); setDayTitle(""); setDayDesc(""); setDayNum(""); setDayDate(""); setDayLat(null); setDayLng(null); setDayLocationName(""); setShowDayMap(false); }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-primary border border-emerald-200 hover:bg-emerald-100">
                  <Plus size={14} /> Ajouter un jour
                </button>
                <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={handleShare} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100">
                <Share2 size={14} /> Partager
              </button>
              {user?.role === "eco_traveler" && (
                <button
                  onClick={toggleFavorite}
                  disabled={togglingFav}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    isFavorite
                      ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  <Heart size={14} fill={isFavorite ? "currentColor" : "none"} /> {isFavorite ? "Favori" : "Favori"}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
              {circuit.region && <span className="flex items-center gap-1"><MapPin size={14} /> {circuit.region}</span>}
              {circuit.difficulty_level && (
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${circuit.difficulty_level === "easy" ? "bg-emerald-100 text-emerald-700" : circuit.difficulty_level === "moderate" ? "bg-amber-100 text-amber-700" : circuit.difficulty_level === "hard" ? "bg-red-100 text-red-700" : "bg-slate-800 text-white"}`}>
                  {circuit.difficulty_level === "easy" ? "🟢 Facile" : circuit.difficulty_level === "moderate" ? "🟡 Modéré" : circuit.difficulty_level === "hard" ? "🔴 Difficile" : "⚫ Expert"}
                </span>
              )}
              {circuit.duration_days && (
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {circuit.duration_days} jour{circuit.duration_days > 1 ? "s" : ""}
                  {circuit.duration_nights ? ` / ${circuit.duration_nights} nuit${circuit.duration_nights > 1 ? "s" : ""}` : ""}
                </span>
              )}
              {circuit.max_participants && (
                <span className="flex items-center gap-1">
                  <Users size={14} /> Max {circuit.max_participants} pers.
                </span>
              )}
              {circuit.confirmation_mode === "automatic" ? (
                <span className="inline-flex items-center gap-1 text-xs text-primary bg-emerald-50 rounded-full px-2 py-0.5">
                  <Check size={12} /> Confirmation instantanée
                </span>
              ) : circuit.confirmation_mode === "manual" ? (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                  <Info size={12} /> Sur demande
                </span>
              ) : null}
              {circuit.booking_deadline_days !== null && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                  <Timer size={12} /> Délai : {circuit.booking_deadline_days}j
                </span>
              )}
            </div>

            {circuit.description && (
              <p className="text-slate-600 leading-relaxed mb-4 whitespace-pre-line">{circuit.description}</p>
            )}

            {/* ─── Dates, Distance & Délais ────────────────── */}
            {(circuit.start_date || circuit.end_date || circuit.booking_deadline_days !== null || totalDistance > 0) && (
              <div className="bg-blue-50 rounded-xl p-3 mb-4 text-sm space-y-1.5">
                {circuit.start_date && circuit.end_date && (
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <Calendar size={14} />
                    <span>
                      Du {new Date(circuit.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      {" au "}
                      {new Date(circuit.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      {circuit.duration_days ? ` (${circuit.duration_days}j)` : ""}
                    </span>
                  </div>
                )}
                {totalDistance > 0 && (
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <MapPin size={14} />
                    <span>Distance totale du circuit : ~{totalDistance.toFixed(1)} km</span>
                  </div>
                )}
                {circuit.booking_deadline_days !== null && (
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <Timer size={14} />
                    <span>Réservation obligatoire {circuit.booking_deadline_days} jour{circuit.booking_deadline_days > 1 ? "s" : ""} avant le départ</span>
                  </div>
                )}
              </div>
            )}

            {circuit.inclusions && (
              <div className="bg-emerald-50 rounded-xl p-3 mb-4 text-sm">
                <span className="font-medium text-emerald-600">Inclus :</span>
                <p className="text-primary mt-1 whitespace-pre-line">{circuit.inclusions}</p>
              </div>
            )}

            {circuit.exclusions && (
              <div className="bg-amber-50 rounded-xl p-3 mb-4 text-sm">
                <span className="font-medium text-amber-700">Non inclus :</span>
                <p className="text-amber-600 mt-1 whitespace-pre-line">{circuit.exclusions}</p>
              </div>
            )}

            {(circuit.lat || sortedDays.some((d) => d.lat)) && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <MapPin size={20} className="text-primary" /> Carte de l&apos;itinéraire
                </h2>
                <CircuitMap
                  circuitLat={circuit.lat ? Number(circuit.lat) : null}
                  circuitLng={circuit.lng ? Number(circuit.lng) : null}
                  days={sortedDays.map((d) => ({
                    day_number: d.day_number,
                    title: d.title,
                    lat: d.lat ? Number(d.lat) : null,
                    lng: d.lng ? Number(d.lng) : null,
                    location_name: d.location_name,
                  }))}
                  waypoints={(() => {
                    try { return circuit.waypoints ? JSON.parse(circuit.waypoints) : []; }
                    catch { return []; }
                  })()}
                />
              </div>
            )}

            {sortedDays.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-primary" /> Itinéraire
                </h2>
                <div className="space-y-3">
                  {sortedDays.map((day) => (
                    <div key={day.id} className="border border-slate-100 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{day.day_number}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">{day.title}</h3>
                          {day.description && (
                            <p className="text-sm text-slate-500 mt-1">{day.description}</p>
                          )}
                          {day.programItems && day.programItems.length > 0 && (
                            <div className="mt-2">
                              <TimelineView
                                entries={day.programItems.map((item, idx) => ({
                                  id: item.id,
                                  step_order: idx + 1,
                                  emoji: item.emoji ?? "📍",
                                  time_label: item.start_time ? `${item.start_time}${item.end_time ? `-${item.end_time}` : ""}` : "",
                                  title: item.title,
                                  description: item.description,
                                  duration_minutes: item.duration_minutes,
                                  distance_km: item.distance_km,
                                  transport_mode: item.transport_mode,
                                  guide_name: item.guide_name,
                                }))}
                                renderActions={
                                  isAuthor
                                    ? (_, i) => {
                                        const item = day.programItems![i];
                                        return (
                                          <>
                                            {item.is_included && (
                                              <span className="text-[10px] text-emerald-600 bg-emerald-50 rounded-full px-1.5 py-0 mr-1">Inclus</span>
                                            )}
                                            {item.is_required && (
                                              <span className="text-[10px] text-amber-600 bg-amber-50 rounded-full px-1.5 py-0 mr-1">Requis</span>
                                            )}
                                            <button
                                              onClick={() => { setEditProgramItem({ dayId: day.id, item }); setProgTitle(item.title); setProgDesc(item.description ?? ""); setProgStart(item.start_time ?? ""); setProgEnd(item.end_time ?? ""); setProgEmoji(item.emoji ?? "📍"); setProgDuration(item.duration_minutes?.toString() ?? ""); setProgDistance(item.distance_km?.toString() ?? ""); setProgTransport(item.transport_mode ?? ""); setProgGuideId(item.guide_id ?? null); setProgGuideName(item.guide_name ?? null); setProgWithGuide(!!item.guide_id); setProgLinkedOfferItemId(item.linked_offer_item_id ?? null); setProgCategory(item.category ?? "activite"); setProgSubtypes(item.subtypes ?? []); setProgPrice(item.price?.toString() ?? ""); setProgPhotos(item.photos ?? []); setProgGuideCost(item.fields?.guide_cost?.toString() ?? ""); setProgExternalRef(item.external_reference ?? null); setProgIsExternalRef(item.is_external_reference ?? false); setProgIsIncluded(item.is_included ?? true); setProgIsRequired(item.is_required ?? false); }}
                                              className="w-6 h-6 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-colors"
                                            >
                                              <Edit size={11} />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteProgram(day.id, item.id)}
                                              className="w-6 h-6 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                                            >
                                              <Trash2 size={11} />
                                            </button>
                                          </>
                                        );
                                      }
                                    : undefined
                                }
                              />
                            </div>
                          )}
                          {isAuthor && (
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => { setShowAddProgram(day.id); setProgTitle(""); setProgDesc(""); setProgStart(""); setProgEnd(""); setProgEmoji("📍"); setProgDuration(""); setProgDistance(""); setProgTransport(""); setProgLinkedOfferItemId(null); setProgExternalRef(null); setProgIsExternalRef(false); setProgCategory("activite"); setProgSubtypes([]); setProgPrice(""); setProgPhotos([]); setProgGuideId(null); setProgGuideName(null); setProgWithGuide(false); setProgGuideCost(""); }}
                                className="text-xs text-primary hover:text-primary flex items-center gap-1"
                              >
                                <Plus size={12} /> Ajouter une activité
                              </button>
                              <button
                                onClick={() => { setShowEditDay(day.id); setEditDayTitle(day.title); setEditDayDesc(day.description ?? ""); setEditDayNum(String(day.day_number)); setEditDayDate(day.date?.slice(0, 10) ?? ""); setEditDayLat(day.lat ? Number(day.lat) : null); setEditDayLng(day.lng ? Number(day.lng) : null); setEditDayLocationName(day.location_name ?? ""); setShowEditDayMap(false); }}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <Edit size={12} /> Modifier
                              </button>
                              <button
                                onClick={() => handleDeleteDay(day.id)}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                              >
                                <Trash2 size={12} /> Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableOptions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Tag size={18} className="text-primary" /> Options disponibles
                </h2>
                <div className="space-y-2">
                  {availableOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50 transition-all"
                    >
                      <input
                        type={option.option_type === "multiple_choice" ? "checkbox" : "radio"}
                        name="circuit-option"
                        checked={selectedOptionIds.includes(option.id)}
                        onChange={() => handleOptionToggle(option.id, option.option_type)}
                        className="accent-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-slate-800">
                            {OPTION_GROUP_LABELS[option.option_group ?? ""] ?? "Option"}
                          </span>
                          <div className="flex items-center gap-2">
                            {option.is_required && (
                              <span className="text-[10px] text-amber-600 bg-amber-50 rounded-full px-1.5 py-0.5 font-medium">Requis</span>
                            )}
                            {option.extra_price !== null && option.extra_price > 0 && (
                              <span className="text-sm font-semibold text-primary">
                                +{Number(option.extra_price).toLocaleString()} {circuit.currency}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Added to cart notification */}
            {showAddedToCart && (
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl z-50 flex items-center gap-2">
                <ShoppingCart size={16} /> Ajouté au panier !
              </div>
            )}

            {/* Budget summary */}
            {circuit.base_price !== null && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-slate-700 text-sm mb-2 flex items-center gap-1.5">
                  <DollarSign size={15} /> Budget estimé
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Prix de base</span>
                    <span>{Number(circuit.base_price).toLocaleString()} {circuit.currency}</span>
                  </div>
                  {selectedOptionIds.length > 0 && circuit.options?.filter(o => selectedOptionIds.includes(o.id) && o.status === "active").map(o => (
                    <div key={o.id} className="flex justify-between text-slate-500">
                      <span className="text-xs">{OPTION_GROUP_LABELS[o.option_group ?? ""] ?? "Option"}</span>
                      <span className="text-primary">+{Number(o.extra_price ?? 0).toLocaleString()} {circuit.currency}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-slate-800 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span className="text-primary">
                      {(
                        Number(circuit.base_price) +
                        (circuit.options ?? [])
                          .filter(o => selectedOptionIds.includes(o.id) && o.status === "active")
                          .reduce((s, o) => s + Number(o.extra_price ?? 0), 0)
                      ).toLocaleString()} {circuit.currency}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={addToCart}
              disabled={addingToCart}
              className="w-full py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              <ShoppingCart size={18} /> {addingToCart ? "Ajout en cours..." : "Ajouter au panier"}
            </button>

            {!user && !reserveSuccess && (
              <button
                onClick={() => router.push(`/auth/login?redirect=/circuits/${id}`)}
                className="w-full mt-3 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={18} /> Réserver ce circuit
              </button>
            )}

            {canReserve && myReservation && !reserveSuccess && (
              <div className="space-y-2">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-emerald-700 font-semibold text-sm">Déjà réservé</p>
                  <p className="text-emerald-600 text-xs mt-1">
                    {myReservation.participants_count} participant{myReservation.participants_count > 1 ? "s" : ""} &mdash; {Number(myReservation.final_total).toLocaleString()} {circuit?.currency || "TND"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 capitalize">Statut : {myReservation.status}</p>
                </div>
                {myReservation.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowModifyReservation(true)}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={handleCancelReservation}
                      className="py-2.5 px-4 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            )}

            {canReserve && !myReservation && !reserveSuccess && (
              <button
                onClick={() => setShowReserve(true)}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={18} /> Réserver ce circuit
              </button>
            )}
            {reserveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-emerald-600 font-semibold">Réservation confirmée !</p>
                <p className="text-primary text-sm mt-1">Vous recevrez une notification de confirmation.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modal Édition ─────────────────────────────── */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Modifier le circuit" maxWidth="max-w-xl">
        <div className="p-6 space-y-3 max-h-[75vh] overflow-y-auto">
          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Titre" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="Prix" type="number" min={0} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            <select value={editRegion} onChange={(e) => setEditRegion(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
              <option value="">Région</option>
              {TUNISIA_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input value={editDays} onChange={(e) => setEditDays(e.target.value)} placeholder="Jours" type="number" min={1} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            <input value={editNights} onChange={(e) => setEditNights(e.target.value)} placeholder="Nuits" type="number" min={0} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            <input value={editMax} onChange={(e) => setEditMax(e.target.value)} placeholder="Max participants" type="number" min={1} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Début</label>
              <input type="date" value={editStartDate} onChange={(e) => { setEditStartDate(e.target.value); if (e.target.value && editEndDate) { const diff = Math.ceil((new Date(editEndDate).getTime() - new Date(e.target.value).getTime()) / (1000*60*60*24)) + 1; if (diff > 0) setEditDays(String(diff)); } }} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Fin</label>
              <input type="date" value={editEndDate} onChange={(e) => { setEditEndDate(e.target.value); if (editStartDate && e.target.value) { const diff = Math.ceil((new Date(e.target.value).getTime() - new Date(editStartDate).getTime()) / (1000*60*60*24)) + 1; if (diff > 0) setEditDays(String(diff)); } }} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Délai réservation</label>
              <input type="number" min={0} value={editBookingDeadlineDays} onChange={(e) => setEditBookingDeadlineDays(e.target.value)} placeholder="Jours" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Devise</label>
              <select value={editCurrency} onChange={(e) => setEditCurrency(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                <option value="TND">TND</option><option value="EUR">EUR</option><option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Confirmation</label>
              <select value={editConfirmationMode} onChange={(e) => setEditConfirmationMode(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                <option value="automatic">Automatique</option><option value="manual">Manuelle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Difficulté</label>
              <select value={editDifficultyLevel} onChange={(e) => setEditDifficultyLevel(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                <option value="easy">🟢 Facile</option>
                <option value="moderate">🟡 Modéré</option>
                <option value="hard">🔴 Difficile</option>
                <option value="expert">⚫ Expert</option>
              </select>
            </div>
          </div>
          <textarea value={editInclusions} onChange={(e) => setEditInclusions(e.target.value)} placeholder="Inclus (ex: Transport, hébergement, guide...)" rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <textarea value={editExclusions} onChange={(e) => setEditExclusions(e.target.value)} placeholder="Non inclus (ex: Repas du soir...)" rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <ImageUploader images={editImages} onChange={setEditImages} maxImages={5} label="Images du circuit" />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Image de couverture (optionnelle)</label>
            <input value={editCoverImage} onChange={(e) => setEditCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-500">Localisation du circuit</label>
              <button type="button" onClick={() => setShowEditMap((v) => !v)} className="text-xs font-bold text-primary hover:underline">
                {showEditMap ? "Masquer la carte" : "Choisir sur la carte"}
              </button>
            </div>
            {editAddress && <p className="text-xs text-slate-400 mb-1 truncate">{editAddress}</p>}
            {showEditMap && (
              <div className="overflow-hidden rounded-xl">
                <MapPicker
                  lat={editLat}
                  lng={editLng}
                  onPick={(lat, lng, address) => { setEditLat(lat); setEditLng(lng); setEditAddress(address); }}
                />
              </div>
            )}
          </div>

          <button onClick={handleEdit} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600">
            Enregistrer les modifications
          </button>
        </div>
      </Modal>

      {/* ─── Modal Ajouter Jour ────────────────────────── */}
      <Modal open={showAddDay} onClose={() => setShowAddDay(false)} title="Ajouter un jour">
        <div className="p-6 space-y-3">
          <input value={dayNum} onChange={(e) => setDayNum(e.target.value)} placeholder="Numéro du jour (ex: 1)" type="number" min={1} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <input value={dayTitle} onChange={(e) => setDayTitle(e.target.value)} placeholder="Titre (ex: Arrivée)" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date (optionnel)</label>
            <input type="date" value={dayDate} onChange={(e) => setDayDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <textarea value={dayDesc} onChange={(e) => setDayDesc(e.target.value)} placeholder="Description" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" rows={2} />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-500">Lieu de la journée <span className="text-red-500">*</span></label>
              <button type="button" onClick={() => setShowDayMap((v) => !v)} className="text-xs font-bold text-primary hover:underline">
                {showDayMap ? "Masquer la carte" : "Choisir sur la carte"}
              </button>
            </div>
            {dayLat !== null && dayLng !== null && (
              <p className="text-xs text-emerald-600 mb-1">Coordonnées : {dayLat.toFixed(4)}, {dayLng.toFixed(4)}{dayLocationName ? ` — ${dayLocationName}` : ""}</p>
            )}
            {showDayMap && (
              <div className="overflow-hidden rounded-xl">
                <MapPicker
                  lat={dayLat}
                  lng={dayLng}
                  onPick={(lat, lng, name) => { setDayLat(lat); setDayLng(lng); setDayLocationName(name); }}
                />
              </div>
            )}
          </div>
          <button onClick={handleAddDay} disabled={!dayTitle || !dayNum || dayLat === null || dayLng === null} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50">
            Ajouter
          </button>
        </div>
      </Modal>

      {/* ─── Modal Modifier Jour ────────────────────────── */}
      <Modal open={!!showEditDay} onClose={() => setShowEditDay(null)} title="Modifier le jour">
        <div className="p-6 space-y-3">
          <input value={editDayNum} onChange={(e) => setEditDayNum(e.target.value)} placeholder="Numéro du jour (ex: 1)" type="number" min={1} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <input value={editDayTitle} onChange={(e) => setEditDayTitle(e.target.value)} placeholder="Titre (ex: Arrivée)" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date (optionnel)</label>
            <input type="date" value={editDayDate} onChange={(e) => setEditDayDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <textarea value={editDayDesc} onChange={(e) => setEditDayDesc(e.target.value)} placeholder="Description" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" rows={2} />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-500">Lieu de la journée <span className="text-red-500">*</span></label>
              <button type="button" onClick={() => setShowEditDayMap((v) => !v)} className="text-xs font-bold text-primary hover:underline">
                {showEditDayMap ? "Masquer la carte" : "Choisir sur la carte"}
              </button>
            </div>
            {editDayLat !== null && editDayLng !== null && (
              <p className="text-xs text-emerald-600 mb-1">Coordonnées : {editDayLat.toFixed(4)}, {editDayLng.toFixed(4)}{editDayLocationName ? ` — ${editDayLocationName}` : ""}</p>
            )}
            {showEditDayMap && (
              <div className="overflow-hidden rounded-xl">
                <MapPicker
                  lat={editDayLat}
                  lng={editDayLng}
                  onPick={(lat, lng, name) => { setEditDayLat(lat); setEditDayLng(lng); setEditDayLocationName(name); }}
                />
              </div>
            )}
          </div>
          <button onClick={() => showEditDay && handleEditDay(showEditDay)} disabled={!editDayTitle || !editDayNum || editDayLat === null || editDayLng === null} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50">
            Enregistrer
          </button>
        </div>
      </Modal>

      {/* ─── Modal Modifier Activité ────────────────────── */}
      <Modal open={!!editProgramItem} onClose={() => { setEditProgramItem(null); setProgLinkedOfferItemId(null); }} title="Modifier l'activité">
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button type="button" onClick={() => setShowProgEmojiPicker((v) => !v)}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-lg hover:border-primary/50 transition-colors">
                {progEmoji}
              </button>
              {showProgEmojiPicker && (
                <div className="absolute top-12 left-0 z-20 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 w-56">
                  <div className="grid grid-cols-5 gap-1">
                    {PROG_EMOJIS.map((e) => (
                      <button key={e} type="button" onClick={() => { setProgEmoji(e); setShowProgEmojiPicker(false); }}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm hover:bg-primary/10 transition-colors ${progEmoji === e ? "bg-primary/20 ring-2 ring-primary/30" : ""}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input value={progTitle} onChange={(e) => setProgTitle(e.target.value)} placeholder="Titre (ex: Randonnée)" className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          </div>

          {/* ─── Offer link ──────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Offre associée</label>
            {progLinkedOfferItemId || progIsExternalRef ? (
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2 border border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                  {progIsExternalRef ? (
                    <Globe size={14} className="text-amber-500 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                  <span className="text-sm text-slate-700 truncate">
                    {progIsExternalRef
                      ? progExternalRef?.provider_name || "Référence externe"
                      : progOfferItems.find((it) => it.id === progLinkedOfferItemId)?.name || "Offre personnelle"}
                  </span>
                </div>
                <button onClick={() => setShowExtOfferModal(true)} className="text-xs text-primary hover:bg-primary/5 px-2 py-1 rounded-lg font-medium shrink-0 ml-2">
                  Changer
                </button>
              </div>
            ) : (
              <button onClick={() => setShowExtOfferModal(true)} className="w-full border-2 border-dashed border-slate-200 rounded-xl p-3 text-sm text-slate-400 hover:border-primary/50 hover:text-primary transition-colors text-center">
                + Sélectionner une offre (personnelle, externe ou référence)
              </button>
            )}
          </div>

          <textarea value={progDesc} onChange={(e) => setProgDesc(e.target.value)} placeholder="Description" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Heure de début</label>
              <input type="time" value={progStart} onChange={(e) => setProgStart(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Heure de fin</label>
              <input type="time" value={progEnd} onChange={(e) => setProgEnd(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Durée (min)</label>
              <input type="number" min={0} value={progDuration} onChange={(e) => setProgDuration(e.target.value)} placeholder="ex: 90" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Distance (km)</label>
              <input type="number" min={0} step="0.1" value={progDistance} onChange={(e) => setProgDistance(e.target.value)} placeholder="ex: 5.2" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Transport</label>
              <select value={progTransport} onChange={(e) => setProgTransport(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600">
                {PROG_TRANSPORTS.map((t) => (
                  <option key={t} value={t.replace(/^[^\s]+\s/, "")}>{t || "—"}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ─── Catégorie, sous-types, prix, photos ──────── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Catégorie</label>
              <select value={progCategory} onChange={(e) => { setProgCategory(e.target.value); setProgSubtypes([]); }} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                {PROG_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Prix (optionnel)</label>
              <input type="number" min={0} step="0.01" value={progPrice} onChange={(e) => setProgPrice(e.target.value)} placeholder="ex: 25" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>

          {PROG_SUBTYPES[progCategory] && PROG_SUBTYPES[progCategory].length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Sous-types</label>
              <div className="flex flex-wrap gap-1.5">
                {PROG_SUBTYPES[progCategory].map((st) => (
                  <button key={st.value} type="button" onClick={() => {
                    setProgSubtypes((prev) => prev.includes(st.value) ? prev.filter((v) => v !== st.value) : [...prev, st.value]);
                  }} className={`text-xs px-2.5 py-1 rounded-full border transition-all ${progSubtypes.includes(st.value) ? "bg-primary/10 border-primary text-primary" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ImageUploader images={progPhotos} onChange={setProgPhotos} maxImages={5} label="Photos" />

          {/* ─── is_included / is_required ──────────────── */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={progIsIncluded} onChange={(e) => setProgIsIncluded(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary/30" />
              Inclus dans le prix
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={progIsRequired} onChange={(e) => setProgIsRequired(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary/30" />
              Obligatoire
            </label>
          </div>

          {/* ─── Guide optionnel (inline) ──────────────── */}
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={progWithGuide} onChange={(e) => { setProgWithGuide(e.target.checked); if (!e.target.checked) { setProgGuideId(null); setProgGuideName(null); } }} className="rounded border-slate-300 text-primary focus:ring-primary/30" />
            <Search size={14} /> Cette activité nécessite un guide
          </label>

          {progWithGuide && (
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              {progGuideName ? (
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">person</span>
                    <span className="text-sm font-medium text-slate-800">{progGuideName}</span>
                  </div>
                  <button onClick={() => { setProgGuideId(null); setProgGuideName(null); }} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg">
                    Retirer
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input value={guideSearchQuery} onChange={(e) => setGuideSearchQuery(e.target.value)}
                    placeholder="Nom du guide, région..." className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button onClick={async () => {
                    if (!guideSearchQuery.trim()) return;
                    setGuideSearchLoading(true);
                    try {
                      const res = await apiFetch<any[]>(`/guide/public/search?q=${encodeURIComponent(guideSearchQuery)}`);
                      setGuideSearchResults(res);
                    } catch { setGuideSearchResults([]); }
                    setGuideSearchLoading(false);
                  }} className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 flex items-center gap-1">
                    <Search size={14} /> Chercher
                  </button>
                </div>
              )}

              {guideSearchLoading && <div className="flex justify-center py-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" /></div>}

              {!progGuideName && guideSearchResults.length === 0 && guideSearchQuery && !guideSearchLoading && (
                <p className="text-sm text-slate-400 text-center py-2">Aucun guide trouvé</p>
              )}

              {!progGuideName && guideSearchResults.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {guideSearchResults.map((guide: any) => (
                    <button key={guide.user_id} onClick={() => { setProgGuideId(guide.user_id); setProgGuideName(guide.full_name); setGuideSearchResults([]); setGuideSearchQuery(""); }}
                      className="w-full flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200 hover:border-primary/50 text-left">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-xs">person</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{guide.full_name}</p>
                        {guide.zone && <p className="text-xs text-slate-400">{guide.zone}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {progWithGuide && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Prix facturé voyageur (guide)</label>
              <input type="number" min={0} step="0.01" value={progGuideCost}
                onChange={(e) => setProgGuideCost(e.target.value)}
                placeholder="ex: 50" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
          )}

          <button onClick={handleEditProgram} disabled={!progTitle} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50">
            Enregistrer
          </button>
        </div>
      </Modal>

      {/* ─── Modal Ajouter Activité ────────────────────── */}
      <Modal open={!!showAddProgram} onClose={() => { setShowAddProgram(null); setProgLinkedOfferItemId(null); }} title="Ajouter une activité">
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button type="button" onClick={() => setShowProgEmojiPicker((v) => !v)}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-lg hover:border-primary/50 transition-colors">
                {progEmoji}
              </button>
              {showProgEmojiPicker && (
                <div className="absolute top-12 left-0 z-20 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 w-56">
                  <div className="grid grid-cols-5 gap-1">
                    {PROG_EMOJIS.map((e) => (
                      <button key={e} type="button" onClick={() => { setProgEmoji(e); setShowProgEmojiPicker(false); }}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm hover:bg-primary/10 transition-colors ${progEmoji === e ? "bg-primary/20 ring-2 ring-primary/30" : ""}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input value={progTitle} onChange={(e) => setProgTitle(e.target.value)} placeholder="Titre (ex: Randonnée)" className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          </div>

          {/* ─── Offer link ──────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Offre associée</label>
            {progLinkedOfferItemId || progIsExternalRef ? (
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2 border border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                  {progIsExternalRef ? (
                    <Globe size={14} className="text-amber-500 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                  <span className="text-sm text-slate-700 truncate">
                    {progIsExternalRef
                      ? progExternalRef?.provider_name || "Référence externe"
                      : progOfferItems.find((it) => it.id === progLinkedOfferItemId)?.name || "Offre personnelle"}
                  </span>
                </div>
                <button onClick={() => setShowExtOfferModal(true)} className="text-xs text-primary hover:bg-primary/5 px-2 py-1 rounded-lg font-medium shrink-0 ml-2">
                  Changer
                </button>
              </div>
            ) : (
              <button onClick={() => setShowExtOfferModal(true)} className="w-full border-2 border-dashed border-slate-200 rounded-xl p-3 text-sm text-slate-400 hover:border-primary/50 hover:text-primary transition-colors text-center">
                + Sélectionner une offre (personnelle, externe ou référence)
              </button>
            )}
          </div>

          <textarea value={progDesc} onChange={(e) => setProgDesc(e.target.value)} placeholder="Description" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Heure de début</label>
              <input type="time" value={progStart} onChange={(e) => setProgStart(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Heure de fin</label>
              <input type="time" value={progEnd} onChange={(e) => setProgEnd(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Durée (min)</label>
              <input type="number" min={0} value={progDuration} onChange={(e) => setProgDuration(e.target.value)} placeholder="ex: 90" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Distance (km)</label>
              <input type="number" min={0} step="0.1" value={progDistance} onChange={(e) => setProgDistance(e.target.value)} placeholder="ex: 5.2" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Transport</label>
              <select value={progTransport} onChange={(e) => setProgTransport(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600">
                {PROG_TRANSPORTS.map((t) => (
                  <option key={t} value={t.replace(/^[^\s]+\s/, "")}>{t || "—"}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ─── Catégorie, sous-types, prix, photos ──────── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Catégorie</label>
              <select value={progCategory} onChange={(e) => { setProgCategory(e.target.value); setProgSubtypes([]); }} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                {PROG_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Prix (optionnel)</label>
              <input type="number" min={0} step="0.01" value={progPrice} onChange={(e) => setProgPrice(e.target.value)} placeholder="ex: 25" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>

          {PROG_SUBTYPES[progCategory] && PROG_SUBTYPES[progCategory].length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Sous-types</label>
              <div className="flex flex-wrap gap-1.5">
                {PROG_SUBTYPES[progCategory].map((st) => (
                  <button key={st.value} type="button" onClick={() => {
                    setProgSubtypes((prev) => prev.includes(st.value) ? prev.filter((v) => v !== st.value) : [...prev, st.value]);
                  }} className={`text-xs px-2.5 py-1 rounded-full border transition-all ${progSubtypes.includes(st.value) ? "bg-primary/10 border-primary text-primary" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ImageUploader images={progPhotos} onChange={setProgPhotos} maxImages={5} label="Photos" />

          {/* ─── is_included / is_required ──────────────── */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={progIsIncluded} onChange={(e) => setProgIsIncluded(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary/30" />
              Inclus dans le prix
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={progIsRequired} onChange={(e) => setProgIsRequired(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary/30" />
              Obligatoire
            </label>
          </div>

          {/* ─── Guide optionnel (inline) ──────────────── */}
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={progWithGuide} onChange={(e) => { setProgWithGuide(e.target.checked); if (!e.target.checked) { setProgGuideId(null); setProgGuideName(null); } }} className="rounded border-slate-300 text-primary focus:ring-primary/30" />
            <Search size={14} /> Cette activité nécessite un guide
          </label>

          {progWithGuide && (
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              {progGuideName ? (
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">person</span>
                    <span className="text-sm font-medium text-slate-800">{progGuideName}</span>
                  </div>
                  <button onClick={() => { setProgGuideId(null); setProgGuideName(null); }} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg">
                    Retirer
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input value={guideSearchQuery} onChange={(e) => setGuideSearchQuery(e.target.value)}
                    placeholder="Nom du guide, région..." className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button onClick={async () => {
                    if (!guideSearchQuery.trim()) return;
                    setGuideSearchLoading(true);
                    try {
                      const res = await apiFetch<any[]>(`/guide/public/search?q=${encodeURIComponent(guideSearchQuery)}`);
                      setGuideSearchResults(res);
                    } catch { setGuideSearchResults([]); }
                    setGuideSearchLoading(false);
                  }} className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 flex items-center gap-1">
                    <Search size={14} /> Chercher
                  </button>
                </div>
              )}

              {guideSearchLoading && <div className="flex justify-center py-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" /></div>}

              {!progGuideName && guideSearchResults.length === 0 && guideSearchQuery && !guideSearchLoading && (
                <p className="text-sm text-slate-400 text-center py-2">Aucun guide trouvé</p>
              )}

              {!progGuideName && guideSearchResults.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {guideSearchResults.map((guide: any) => (
                    <button key={guide.user_id} onClick={() => { setProgGuideId(guide.user_id); setProgGuideName(guide.full_name); setGuideSearchResults([]); setGuideSearchQuery(""); }}
                      className="w-full flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200 hover:border-primary/50 text-left">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-xs">person</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{guide.full_name}</p>
                        {guide.zone && <p className="text-xs text-slate-400">{guide.zone}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {progWithGuide && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Prix facturé voyageur (guide)</label>
              <input type="number" min={0} step="0.01" value={progGuideCost}
                onChange={(e) => setProgGuideCost(e.target.value)}
                placeholder="ex: 50" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </div>
          )}

          <button onClick={() => handleAddProgram(showAddProgram!)} disabled={!progTitle} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50">
            Ajouter
          </button>
        </div>
      </Modal>

      {/* ─── Modal Modifier Réservation ──────────────────── */}
      <Modal open={showModifyReservation} onClose={() => setShowModifyReservation(false)} title="Modifier la réservation">
        <div className="p-6 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Nombre de participants</label>
            <input
              type="number"
              min={1}
              max={circuit?.max_participants || 99}
              value={modifyParticipants}
              onChange={(e) => setModifyParticipants(Math.max(1, Number(e.target.value)))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <p className="text-sm text-slate-600">
            Total : <span className="font-bold text-primary">{Number(effectivePrice * modifyParticipants).toLocaleString()} {circuit?.currency || "TND"}</span>
          </p>
          <button
            onClick={handleModifyReservation}
            disabled={modifySubmitting}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50"
          >
            {modifySubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </Modal>

      {/* ─── Modal Réservation Circuit ──────────────────── */}
      <Modal open={showReserve} onClose={() => setShowReserve(false)} title="Réserver ce circuit">
        <div className="p-6 space-y-3">
          {reserveError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{reserveError}</div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Nombre de participants</label>
            <input
              type="number"
              min={1}
              max={circuit?.max_participants ?? 50}
              value={reserveParticipants}
              onChange={(e) => setReserveParticipants(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />
            {circuit?.max_participants && (
              <p className="text-xs text-slate-400 mt-1">Max {circuit.max_participants} participants</p>
            )}
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Prix de base × {reserveParticipants}</span>
              <span className="font-semibold text-primary">{(effectivePrice * reserveParticipants).toLocaleString()} {circuit?.currency}</span>
            </div>
            {selectedOptionIds.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-200">
                {circuit?.options
                  ?.filter((o) => selectedOptionIds.includes(o.id) && o.status === "active")
                  .map((o) => (
                    <div key={o.id} className="flex justify-between text-xs text-slate-500">
                      <span>{OPTION_GROUP_LABELS[o.option_group ?? ""] ?? "Option"}</span>
                      <span>+{Number(o.extra_price ?? 0).toLocaleString()} {circuit?.currency}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <button
            onClick={handleReserve}
            disabled={reserveSubmitting}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50"
          >
            {reserveSubmitting ? "Réservation en cours..." : "Confirmer la réservation"}
          </button>
        </div>
      </Modal>

      {/* ─── External Offer Modal ────────────────────── */}
      {(() => {
        const ctxDay = circuit?.days?.find((d) =>
          editProgramItem ? d.id === editProgramItem.dayId :
          showAddProgram ? d.id === showAddProgram : null
        );
        return (
          <ExternalOfferModal
            open={showExtOfferModal}
            onClose={() => setShowExtOfferModal(false)}
            myOfferItems={progOfferItems}
            selectedMyOfferId={progLinkedOfferItemId}
            onSelectMyOffer={(id, price) => {
              setProgLinkedOfferItemId(id);
              setProgIsExternalRef(false);
              setProgExternalRef(null);
              if (price) {
                setProgSelectedOfferPrice(price);
                setProgPrice(price);
              }
            }}
            externalRef={progExternalRef}
            onExternalRefChange={(ref) => {
              setProgExternalRef(ref);
              setProgIsExternalRef(!!ref);
              if (ref?.estimated_price) setProgPrice(String(ref.estimated_price));
            }}
            dayLat={ctxDay?.lat ?? null}
            dayLng={ctxDay?.lng ?? null}
            excludeAuthorId={userId || ""}
            dayLabel={ctxDay ? `Jour ${ctxDay.day_number} — ${ctxDay.title}` : undefined}
          />
        );
      })()}
    </div>
  );
}
