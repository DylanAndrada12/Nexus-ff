"use client";

import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

export function ImageUploadField({
  name,
  label,
  initialUrl = "",
  hint = "PNG, JPG o WEBP. Máximo 2 MB.",
  aspect = "square",
}: {
  name: string;
  label: string;
  initialUrl?: string | null;
  hint?: string;
  aspect?: "square" | "wide";
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Formato no permitido. Usá PNG, JPG o WEBP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen supera los 2 MB.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error ?? "No se pudo subir la imagen.");
        return;
      }
      setUrl(data.url);
    } catch {
      setError("Error de conexión al subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="field">
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={url} />
      {url ? (
        <div className="relative inline-flex w-fit items-start gap-3 border border-line bg-surface p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Vista previa"
            className={
              aspect === "square"
                ? "h-20 w-20 object-cover"
                : "h-24 w-full max-w-xs object-cover"
            }
          />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="grid h-7 w-7 place-items-center border border-line text-muted hover:border-white hover:text-white"
            aria-label="Quitar imagen"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <label className="flex w-fit cursor-pointer items-center gap-2 border border-line bg-surface px-4 py-3 text-sm text-muted transition-colors hover:border-white hover:text-white">
          {uploading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <ImagePlus size={15} />
          )}
          {uploading ? "Subiendo…" : "Subir imagen"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0])}
            disabled={uploading}
          />
        </label>
      )}
      <span className="hint">{hint}</span>
      {error ? <span className="error-text">{error}</span> : null}
    </div>
  );
}
