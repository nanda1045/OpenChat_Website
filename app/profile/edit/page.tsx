import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth";
import { EditForm } from "@/components/profile/EditForm";

export const metadata = { title: "Edit profile — OpenChat" };

export default async function EditProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Edit profile
      </h1>
      <EditForm
        defaultHandle={profile.handle}
        defaultDisplayName={profile.displayName}
        defaultBio={profile.bio ?? ""}
      />
    </main>
  );
}
