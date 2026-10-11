import InviteForm from "../InviteForm";
import { createInvitation } from "../actions";

export default function NewInvitationPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Novo convite</h1>
      <InviteForm action={createInvitation} />
    </div>
  );
}
