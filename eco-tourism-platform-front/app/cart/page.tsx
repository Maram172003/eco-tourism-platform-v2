"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Plus, Minus, Loader2, ArrowRight, MapPin, LogIn } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface CartItem {
  id: string;
  quantity: number;
  unit_price: number | null;
  line_total: number | null;
  selected_date: string | null;
  offerItem: { id: string; name: string; item_type: string | null; offer: { title: string; region: string | null } | null; prices: { price: number; currency: string }[] } | null;
  circuit: { id: string; title: string; region: string | null; start_date: string | null; end_date: string | null; duration_days: number | null; base_price: number | null; currency: string } | null;
}

interface Cart { id: string; title: string; estimated_total: number | null; currency: string; items: CartItem[] }

function getGuestCart(): any[] {
  try { return JSON.parse(localStorage.getItem("guest_cart") || "[]"); } catch { return []; }
}
function saveGuestCart(items: any[]) { localStorage.setItem("guest_cart", JSON.stringify(items)); }

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export default function CartPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [guestItems, setGuestItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [converting, setConverting] = useState(false);
  const [syncResult, setSyncResult] = useState<{ planId: string } | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("access_token");
    const guest = getGuestCart();

    if (!t) {
      // Not logged in → show guest cart only
      setToken(null);
      setGuestItems(guest);
      setLoading(false);
      return;
    }

    // Logged in → try to load server cart, then sync guest items if any
    setToken(t);
    fetchCart(t)
      .then(() => {
        if (guest.length > 0) {
          syncGuestToServer(t, guest);
        }
      })
      .catch(() => {
        // Token invalid/expired → fall back to guest cart
        setToken(null);
        setGuestItems(guest);
        setLoading(false);
      });
  }, []);

  async function fetchCart(authToken: string) {
    setLoading(true);
    try {
      const data = await apiFetch<Cart>("/travel-carts/me", { headers: { Authorization: `Bearer ${authToken}` } });
      setCart(data);
    } catch {} finally { setLoading(false); }
  }

  async function removeItem(itemId: string) {
    if (!cart || !token) return;
    try {
      await apiFetch(`/travel-carts/${cart.id}/items/${itemId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      await fetchCart(token);
    } catch {}
  }

  async function updateQuantity(itemId: string, newQty: number) {
    if (!cart || !token || newQty < 1) return;
    try {
      await apiFetch(`/travel-carts/${cart.id}/items/${itemId}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ quantity: newQty }) });
      await fetchCart(token);
    } catch {}
  }

  async function syncGuestToServer(authToken: string, guestItems: any[]) {
    try {
      const serverCart = await apiFetch<Cart>("/travel-carts/me", { headers: { Authorization: `Bearer ${authToken}` } });
      const failed: any[] = [];
      const synced: any[] = [];
      for (const gi of guestItems) {
        const body: any = { quantity: gi.quantity || 1 };
        if (gi.type === "offer_item") {
          if (!isValidUUID(gi.ref_id)) { failed.push(gi); continue; }
          body.offer_item_id = gi.ref_id;
        } else if (gi.type === "circuit") {
          if (!isValidUUID(gi.ref_id)) { failed.push(gi); continue; }
          body.circuit_id = gi.ref_id;
        } else { failed.push(gi); continue; }
        try {
          await apiFetch(`/travel-carts/${serverCart.id}/items`, {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}` },
            body: JSON.stringify(body),
          });
          synced.push(gi);
        } catch {
          failed.push(gi);
        }
      }
      // Only keep failed items in localStorage
      saveGuestCart(failed);
      setGuestItems(failed);
      if (synced.length > 0) {
        await fetchCart(authToken);
      }
    } catch {}
  }

  function removeGuestItem(idx: number) {
    const items = [...guestItems];
    items.splice(idx, 1);
    saveGuestCart(items);
    setGuestItems(items);
  }

  function updateGuestQuantity(idx: number, delta: number) {
    const items = [...guestItems];
    items[idx].quantity = Math.max(1, (items[idx].quantity || 1) + delta);
    saveGuestCart(items);
    setGuestItems(items);
  }

  async function syncAndConvert() {
    const t = localStorage.getItem("access_token");
    if (!t) {
      router.push("/auth/login?redirect=/cart");
      return;
    }
    setToken(t);
    setSyncing(true);
    try {
      const serverCart = await apiFetch<Cart>("/travel-carts/me", { headers: { Authorization: `Bearer ${t}` } });

      const guestCart = getGuestCart();
      const syncedIds: string[] = [];
      for (const gi of guestCart) {
        const body: any = { quantity: gi.quantity || 1 };
        if (gi.type === "offer_item") {
          if (!isValidUUID(gi.ref_id)) continue;
          body.offer_item_id = gi.ref_id;
        } else if (gi.type === "circuit") {
          if (!isValidUUID(gi.ref_id)) continue;
          body.circuit_id = gi.ref_id;
        } else continue;
        try {
          await apiFetch(`/travel-carts/${serverCart.id}/items`, {
            method: "POST",
            headers: { Authorization: `Bearer ${t}` },
            body: JSON.stringify(body),
          });
          syncedIds.push(gi.id);
        } catch {}
      }

      // Only remove synced items from localStorage
      if (syncedIds.length > 0) {
        const remaining = guestCart.filter((gi: any) => !syncedIds.includes(gi.id));
        saveGuestCart(remaining);
        setGuestItems(remaining);
      }

      const updatedCart = await apiFetch<Cart>("/travel-carts/me", { headers: { Authorization: `Bearer ${t}` } });
      setCart(updatedCart);

      if (updatedCart.items?.length > 0) {
        const plan = await apiFetch<any>(`/travel-carts/${updatedCart.id}/convert`, {
          method: "POST",
          headers: { Authorization: `Bearer ${t}` },
          body: JSON.stringify({ title: updatedCart.title || "Mon voyage" }),
        });
        // Clean up stale localStorage after successful conversion
        localStorage.removeItem("guest_cart");
        setGuestItems([]);
        setSyncResult({ planId: plan.id });
      }
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setSyncing(false);
    }
  }

  // If conversion succeeded, show success and redirect
  if (syncResult) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-slate-100">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 size={28} className="text-primary animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Voyage créé !</h2>
          <p className="text-sm text-slate-500 mb-4">Votre plan de voyage est prêt.</p>
          <button onClick={() => router.push(`/trip-plans/${syncResult.planId}`)} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 text-sm">
            Voir mon plan
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const displayGuestItems = guestItems;
  const displayCartItems = cart?.items ?? [];
  const hasGuestItems = displayGuestItems.length > 0;
  const hasCartItems = displayCartItems.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="text-primary" size={24} />
          <h1 className="text-2xl font-black text-slate-900">Mon panier</h1>
        </div>

        {/* ─── Guest Cart ─────────────────────── */}
        {!token && (
          <>
            {!hasGuestItems ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <ShoppingCart className="mx-auto text-slate-200 mb-3" size={48} />
                <p className="text-slate-400 font-medium">Votre panier est vide</p>
                <button onClick={() => router.push("/explore")} className="mt-4 px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-emerald-600">
                  Explorer les offres
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-amber-700 font-medium">
                    Connectez-vous pour sauvegarder votre panier et créer votre voyage.
                  </p>
                </div>

                {displayGuestItems.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          {item.type === "circuit" ? "Circuit" : "Offre"}
                        </span>
                        {item.name && <p className="text-sm font-semibold text-slate-800 mt-1">{item.name}</p>}
                        <p className="text-xs text-slate-400 mt-0.5">Réf: {item.ref_id.slice(0, 8)}…</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.unit_price != null && (
                          <p className="text-sm font-black text-primary">
                            {Number(item.unit_price * (item.quantity || 1)).toLocaleString()} {item.currency ?? "TND"}
                          </p>
                        )}
                        <button onClick={() => removeGuestItem(idx)} className="p-2 text-slate-300 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Participants</span>
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button onClick={() => updateGuestQuantity(idx, -1)} className="p-2 text-slate-400 hover:text-slate-600" disabled={(item.quantity || 1) <= 1}>
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold text-slate-700 w-6 text-center">{item.quantity || 1}</span>
                          <button onClick={() => updateGuestQuantity(idx, 1)} className="p-2 text-slate-400 hover:text-slate-600">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Guest cart total */}
                {(() => {
                  const guestTotal = displayGuestItems.reduce((sum: number, item: any) => {
                    if (item.unit_price != null) return sum + item.unit_price * (item.quantity || 1);
                    return sum;
                  }, 0);
                  if (guestTotal <= 0) return null;
                  return (
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-600">Total estimé</span>
                      <span className="text-lg font-black text-primary">{guestTotal.toLocaleString()} TND</span>
                    </div>
                  );
                })()}

                <button
                  onClick={() => router.push("/auth/login?redirect=/cart")}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 text-sm flex items-center justify-center gap-2"
                >
                  <LogIn size={16} /> Se connecter pour valider
                </button>
              </div>
            )}
          </>
        )}

        {/* ─── Authenticated Cart ─────────────── */}
        {token && (
          <>
            {!hasCartItems ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <ShoppingCart className="mx-auto text-slate-200 mb-3" size={48} />
                <p className="text-slate-400 font-medium">Votre panier est vide</p>
                <button onClick={() => router.push("/explore")} className="mt-4 px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-emerald-600">
                  Explorer les offres
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {displayCartItems.map((item) => {
                  const name = item.offerItem?.name ?? item.circuit?.title ?? "Élément";
                  const isOffer = !!item.offerItem;
                  const region = item.offerItem?.offer?.region ?? item.circuit?.region;
                  const circuitDays = item.circuit?.duration_days;
                  const circuitDates = item.circuit?.start_date && item.circuit?.end_date
                    ? `${item.circuit.start_date} → ${item.circuit.end_date}` : null;

                  return (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800">{name}</p>
                          {region && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {region}</p>}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOffer ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                              {isOffer ? "Offre" : "Circuit"}
                            </span>
                            {!isOffer && circuitDates && (
                              <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                📅 {circuitDates} {circuitDays ? `(${circuitDays}j)` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Participants</span>
                          <div className="flex items-center border border-slate-200 rounded-lg">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-slate-400 hover:text-slate-600" disabled={item.quantity <= 1}>
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold text-slate-700 w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-slate-400 hover:text-slate-600">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        {item.line_total != null && (
                          <p className="text-base font-black text-primary">{Number(item.line_total).toLocaleString()} {cart?.currency ?? "TND"}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {hasCartItems && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-4">
                {cart?.estimated_total != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">Total estimé</span>
                    <span className="text-2xl font-black text-primary">{Number(cart.estimated_total).toLocaleString()} {cart?.currency ?? "TND"}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => router.push("/explore")} className="py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-sm">
                    Continuer l&apos;exploration
                  </button>
                  <button
                    onClick={async () => {
                      if (!cart || !token) return;
                      setConverting(true);
                      try {
                        const plan = await apiFetch<any>(`/travel-carts/${cart.id}/convert`, {
                          method: "POST", headers: { Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ title: cart.title || "Mon voyage" }),
                        });
                        router.push("/trip-plans/" + plan.id);
                      } catch {} finally { setConverting(false); }
                    }}
                    disabled={converting}
                    className="py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {converting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    Valider le panier
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
