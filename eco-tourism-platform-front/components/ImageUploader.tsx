"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export default function ImageUploader({ images, onChange, maxImages = 10, label = "Images" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
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
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url;
    } catch {
      return null;
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const remaining = maxImages - images.length;
    if (remaining <= 0) return;
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    const urls: string[] = [];
    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) continue;
      const url = await uploadFile(file);
      if (url) urls.push(url);
    }
    if (urls.length > 0) onChange([...images, ...urls]);
    setUploading(false);
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
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/50 hover:bg-slate-50"
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
          <div className="flex items-center justify-center gap-2 text-primary">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm font-medium">Upload en cours...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="text-slate-400" size={28} />
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-primary">Cliquez pour ajouter</span> ou glissez-deposez
            </p>
            <p className="text-xs text-slate-400">JPG, PNG, WebP — Max 10 Mo</p>
          </div>
        )}
      </div>

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
