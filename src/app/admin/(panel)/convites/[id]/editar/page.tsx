import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import type { InvitationType } from "@/lib/rules";
import InviteForm from "../../InviteForm";
import { updateInvitation } from "../../actions";

export default async function EditInvitationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { wedding } = await requireAdmin();
  const inv = await db.invitation.findFirst({ where: { id, weddingId: wedding.id } });
  if (!inv) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Editar convite</h1>
      <InviteForm
        action={updateInvitation}
        initial={{
          id: inv.id,
          type: inv.type as InvitationType,
          displayName: inv.displayName,
          maxGuests: inv.maxGuests,
          favorCount: inv.favorCount,
        }}
      />
    </div>
  );
}
