"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { removeAvatar, updateAvatar } from "@/app/profile/edit/actions";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Avatar upload to Supabase Storage (S3-compatible). The file is uploaded
 * client-side with the user's session — storage RLS restricts writes to the
 * user's own `{userId}/` folder — then a server action persists the public URL
 * to `profiles.avatar_url`.
 */
export function AvatarUpload({
  userId,
  currentUrl,
  fallback,
}: {
  userId: string;
  currentUrl: string | null;
  fallback: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 2 MB or smaller.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      // One file per user; overwrite on re-upload.
      const path = `${userId}/avatar`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust so the new image shows immediately (path is stable).
      const url = `${data.publicUrl}?v=${Date.now()}`;

      const res = await updateAvatar(url);
      if (res.error) throw new Error(res.error);

      setPreview(url);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onRemove() {
    setBusy(true);
    setError(null);
    try {
      const res = await removeAvatar();
      if (res.error) throw new Error(res.error);
      setPreview(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove avatar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        <Image
          src={preview}
          alt="Your avatar"
          width={64}
          height={64}
          className="h-16 w-16 rounded-full object-cover"
          unoptimized
        />
      ) : (
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 text-xl dark:bg-zinc-700">
          {fallback.charAt(0).toUpperCase()}
        </span>
      )}

      <div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-full border border-black/[.12] px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.16] dark:hover:bg-white/[.06]"
          >
            {busy ? "Working…" : "Change avatar"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
            >
              Remove
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-500">JPG, PNG, or GIF · up to 2 MB</p>
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onSelect}
        className="hidden"
      />
    </div>
  );
}
