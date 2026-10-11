import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import SettingsForm from "./SettingsForm";
import AlbumManager from "./AlbumManager";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const { wedding } = await requireAdmin();

  const settings = await db.weddingSettings.findUnique({
    where: { weddingId: wedding.id },
  });

  const photos = await db.galleryPhoto.findMany({
    where: { weddingId: wedding.id },
    orderBy: { position: "asc" },
  });

  let dateStr = "";
  let timeStr = "";
  if (settings?.eventAt) {
    const d = settings.eventAt;
    // Formatar data em YYYY-MM-DD para input type=date (fuso America/Sao_Paulo)
    dateStr = d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
    const parts = d.toLocaleTimeString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    timeStr = parts;
  }

  const initialSettings = {
    groomName: settings?.groomName ?? "Gustavo",
    brideName: settings?.brideName ?? "Débora",
    dateStr,
    timeStr,
    venueName: settings?.venueName ?? "",
    address: settings?.address ?? "",
    mapsUrl: settings?.mapsUrl ?? "",
    dressCode: settings?.dressCode ?? "",
    welcomeMessage: settings?.welcomeMessage ?? "",
    story: settings?.story ?? "",
    rsvpMessage: settings?.rsvpMessage ?? "",
    finalMessage: settings?.finalMessage ?? "",
    pixKey: settings?.pixKey ?? "",
    heroPhotoUrl: settings?.heroPhotoUrl ?? "",
  };

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Configurações do Casamento</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie todos os dados oficiais, textos, informações da cerimônia e imagens do convite.
        </p>
      </div>

      <SettingsForm initial={initialSettings} />

      <AlbumManager photos={photos} />
    </div>
  );
}
