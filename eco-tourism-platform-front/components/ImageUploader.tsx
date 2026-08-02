"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export default function ImageUploader({ images, onChange, maxImages = 10, label = "Images" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token") || ""}` },
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Upload error:", res.status, body);
        setError(`Upload échoué (${res.status}): ${body.message || "Erreur inconnue"}`);
        return null;
      }
      const data = await res.json();
      return data.url;
    } catch (e: any) {
      console.error("Upload network error:", e);
      setError(`Erreur réseau: ${e.message}`);
      return null;
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const remaining = maxImages - images.length;
    if (remaining <= 0) return;
    const toUpload = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, remaining);
    if (toUpload.length === 0) return;
    setUploading(true);
    setError(null);
    setUploadProgress({ current: 0, total: toUpload.length });
    const urls: string[] = [];
    for (let i = 0; i < toUpload.length; i++) {
      setUploadProgress({ current: i + 1, total: toUpload.length });
      const url = await uploadFile(toUpload[i]);
      if (url) urls.push(url);
    }
    if (urls.length > 0) onChange([...images, ...urls]);
    setUploading(false);
    setUploadProgress(null);
    // Reset file input so re-uploading same file works
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          uploading ? "border-amber-300 bg-amber-50 cursor-wait" : dragOver ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/50 hover:bg-slate-50 cursor-pointer"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-amber-600">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm font-medium">
              Upload {uploadProgress ? `${uploadProgress.current}/${uploadProgress.total}` : "..."}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="text-slate-400" size={28} />
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-primary">Cliquez pour ajouter</span> ou glissez-deposez
            </p>
            <p className="text-xs text-slate-400">JPG, PNG, WebP — Max 10 Mo — jusqu'a {maxImages} images</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-red-500 bg-red-50 rounded-lg px-2 py-1.5">
          <AlertCircle size={13} />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={12} /></button>
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
              <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-medium">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400">
        {images.length}/{maxImages} images — La premiere image sera affichee en premier
      </p>
    </div>
  );
}
