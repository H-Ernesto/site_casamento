import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HistoriaRootPage() {
  const cookieStore = await cookies();
  const lastInvite = cookieStore.get("gd_last_invite")?.value;

  if (lastInvite && lastInvite.startsWith("/")) {
    const parts = lastInvite.split("/").filter(Boolean);
    if (parts.length >= 1) {
      const weddingSlug = parts[0];
      const inviteSlug = parts[1];
      redirect(`/${weddingSlug}/historia${inviteSlug ? `?convite=${inviteSlug}` : ""}`);
    }
  }

  const wedding = await db.wedding.findFirst();
  if (wedding) {
    redirect(`/${wedding.slug}/historia`);
  }

  redirect("/");
}
