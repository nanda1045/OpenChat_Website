"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { createPost, type PostActionState } from "@/app/actions/social";

/**
 * Post / reply composer. When `parentId` is set it posts a reply. On success we
 * clear the textarea and refresh server data so the new post appears.
 */
export function Composer({
  parentId,
  placeholder = "What's happening?",
  autoFocus = false,
  onPosted,
}: {
  parentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onPosted?: () => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<PostActionState, FormData>(
    createPost,
    {},
  );

  // Clear + refresh after a successful submit (no error, not pending).
  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
      router.refresh();
      onPosted?.();
    }
    // Only react to action settling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pending]);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-2 border-b border-black/[.08] px-4 py-4 dark:border-white/[.1]"
    >
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <textarea
        name="content"
        rows={parentId ? 2 : 3}
        maxLength={500}
        required
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-zinc-400"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-red-600 dark:text-red-400">
          {state.error}
        </span>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Posting…" : parentId ? "Reply" : "Post"}
        </button>
      </div>
    </form>
  );
}
