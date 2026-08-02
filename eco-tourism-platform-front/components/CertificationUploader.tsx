"use client";

import { useState, useRef, useEffect } from "react";

const CERT_CATEGORIES = [
  { value: "formation", label: "Formation professionnelle", icon: "school" },
  { value: "iso", label: "Certification ISO", icon: "verified" },
  { value: "quality", label: "Label qualité", icon: "workspace_premium" },
  { value: "eco_label", label: "Éco-label", icon: "eco" },
  { value: "safety", label: "Sécurité / Habilitation", icon: "health_and_safety" },
  { value: "first_aid", label: "Premiers secours", icon: "medical_services" },
  { value: "other", label: "Autre", icon: "description" },
];

interface Certification {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  proof_url: string | null;
  file_url: string | null;
  issued_by: string | null;
  issued_at: string | null;
  expires_at: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
}

export default function CertificationUploader({ token }: { token: string }) {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    category: "formation",
    description: "",
    issued_by: "",
    issued_at: "",
    expires_at: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState("");

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const fetchCerts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/certifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCerts(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCerts(); }, [token]);

  const handleUploadFile = async (): Promise<string | null> => {
    if (!file) return null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${apiBase}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        return data.url || data.path || null;
      }
    } finally {
      setUploading(false);
    }
    return null;
  };

  const handleEdit = (cert: Certification) => {
    setEditId(cert.id);
    setForm({
      name: cert.name,
      category: cert.category || "formation",
      description: cert.description || "",
      issued_by: cert.issued_by || "",
      issued_at: cert.issued_at || "",
      expires_at: cert.expires_at || "",
    });
    setProofUrl(cert.proof_url || "");
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.issued_at || !token) return;
    const needsExpiry = ["iso", "eco_label", "safety", "first_aid"].includes(form.category);
    if (needsExpiry && !form.expires_at) return;
    setSubmitting(true);
    try {
      let fileUrl: string | null = editId && !file ? (certs.find(c => c.id === editId)?.file_url || null) : null;
      if (file) {
        fileUrl = await handleUploadFile();
      }

      const body = {
        name: form.name,
        category: form.category,
        description: form.description || null,
        proof_url: proofUrl || null,
        file_url: fileUrl,
        issued_by: form.issued_by || null,
        issued_at: form.issued_at || null,
        expires_at: form.expires_at || null,
      };

      const isEdit = !!editId;
      const res = await fetch(`${apiBase}/certifications${isEdit ? `/${editId}` : ""}`, {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const result = await res.json();
        if (isEdit) {
          setCerts((prev) => prev.map((c) => c.id === editId ? result : c));
        } else {
          setCerts((prev) => [result, ...prev]);
        }
        resetForm();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ name: "", category: "formation", description: "", issued_by: "", issued_at: "", expires_at: "" });
    setFile(null);
    setProofUrl("");
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Supprimer cette certification ?")) return;
    const res = await fetch(`${apiBase}/certifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setCerts((prev) => prev.filter((c) => c.id !== id));
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "En attente", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    approved: { label: "Approuvée", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    rejected: { label: "Refusée", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  };

  const getCategoryInfo = (cat: string | null) =>
    CERT_CATEGORIES.find((c) => c.value === cat) || CERT_CATEGORIES[6];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Mes certifications</h3>
          <p className="text-sm text-slate-500">Formations, labels, habilitations, documents officiels</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h4 className="text-base font-bold text-slate-800">{editId ? "Modifier la certification" : "Nouvelle certification"}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nom de la certification *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="ex: Guide certifié Éco-Voyage"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {CERT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Décrivez votre certification..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Organisme émetteur</label>
              <input
                type="text"
                value={form.issued_by}
                onChange={(e) => setForm({ ...form, issued_by: e.target.value })}
                placeholder="ex: Institut Tunisien du Tourisme"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Date d&apos;émission *</label>
              <input
                type="date"
                value={form.issued_at}
                onChange={(e) => setForm({ ...form, issued_at: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            {["iso", "eco_label", "safety", "first_aid"].includes(form.category) && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Date d&apos;expiration *</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Lien URL du document (optionnel)</label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://example.com/certificat.pdf"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Ou télécharger un fichier</label>
            <div className="flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl text-sm text-slate-600 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                {file ? file.name : "Choisir un fichier"}
              </button>
              {file && (
                <button onClick={() => setFile(null)} className="text-red-500 text-xs">Retirer</button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG, DOC — Max 10 Mo</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim() || !form.issued_at || (["iso", "eco_label", "safety", "first_aid"].includes(form.category) && !form.expires_at) || submitting}
              className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {submitting ? "Envoi..." : editId ? "Enregistrer" : "Soumettre"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : certs.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">school</span>
          <p className="text-slate-400 text-sm">Aucune certification ajoutée</p>
          <p className="text-slate-300 text-xs mt-1">Ajoutez vos formations, labels et habilitations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map((cert) => {
            const st = statusConfig[cert.status] || statusConfig.pending;
            const catInfo = getCategoryInfo(cert.category);
            return (
              <div key={cert.id} className={`bg-white rounded-2xl border p-4 ${st.bg}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">{catInfo.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{cert.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.color} border`}>
                        {st.label}
                      </span>
                    </div>
                    {cert.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cert.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-slate-400">
                      <span>{catInfo.label}</span>
                      {cert.issued_by && <span>• {cert.issued_by}</span>}
                      {cert.issued_at && <span>• Émis le {cert.issued_at}</span>}
                      {cert.expires_at && <span>• Expire le {cert.expires_at}</span>}
                    </div>
                    {cert.status === "rejected" && cert.rejection_reason && (
                      <p className="text-xs text-red-600 mt-2 bg-red-50 rounded-lg p-2">
                        ❌ Refus : {cert.rejection_reason}
                      </p>
                    )}
                    {(cert.file_url || cert.proof_url) && (
                      <a
                        href={cert.file_url || cert.proof_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        Voir le document
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {(cert.status === "pending" || cert.status === "rejected") && (
                      <button
                        onClick={() => handleEdit(cert)}
                        className="text-slate-300 hover:text-primary transition-colors p-1"
                        title="Modifier"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(cert.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Supprimer"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
