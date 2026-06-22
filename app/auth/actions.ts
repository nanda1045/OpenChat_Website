"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** Sign out and return home. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
