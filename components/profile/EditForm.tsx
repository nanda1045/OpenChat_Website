"use client";

import { useActionState } from "react";

import {
  updateProfile,
  type EditState,
} from "@/app/profile/edit/actions";

type Props = {
  defaultHandle: string;
  defaultDisplayName: string;
  defaultBio: string;
};

export function EditForm({
  defaultHandle,
  defaultDisplayName,
  defaultBio,
}: Props) {
  const [state, formAction, pending] = useActionState<EditState, FormData>(
    updateProfile,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="handle" className="text-sm font-medium">
          Handle
        </label>
        <div className="flex items-center rounded-lg border border-black/[.12] focus-within:border-foreground dark:border-white/[.16]">
          <span className="pl-3 text-zinc-500">@</span>
          <input
            id="handle"
            name="handle"
            defaultValue={defaultHandle}
            maxLength={20}
            required
            className="w-full bg-transparent px-1 py-2 outline-none"
          />
        </div>
        <p className="text-xs text-zinc-500">
          Lowercase letters, numbers, and underscores. 3–20 characters.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="displayName" className="text-sm font-medium">
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          defaultValue={defaultDisplayName}
          maxLength={50}
          required
          className="w-full rounded-lg border border-black/[.12] bg-transparent px-3 py-2 outline-none focus:border-foreground dark:border-white/[.16]"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={defaultBio}
          maxLength={280}
          rows={3}
          className="w-full resize-none rounded-lg border border-black/[.12] bg-transparent px-3 py-2 outline-none focus:border-foreground dark:border-white/[.16]"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
