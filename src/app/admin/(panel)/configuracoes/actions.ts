"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

async function saveUploadedFile(file: File): Promise<string> {
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error("Formato de imagem inválido. Use JPG, PNG, WEBP ou AVIF.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("A imagem não pode ultrapassar 15MB.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  return `/uploads/${filename}`;
}

export async function updateWeddingSettings(
  _: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const { wedding } = await requireAdmin();

  const groomName = String(formData.get("groomName") ?? "").trim();
  const brideName = String(formData.get("brideName") ?? "").trim();
  const dateStr = String(formData.get("date") ?? "").trim();
  const timeStr = String(formData.get("time") ?? "").trim();
  const venueName = String(formData.get("venueName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const mapsUrl = String(formData.get("mapsUrl") ?? "").trim();
  const dressCode = String(formData.get("dressCode") ?? "").trim();
  const welcomeMessage = String(formData.get("welcomeMessage") ?? "").trim();
  const story = String(formData.get("story") ?? "").trim();
  const rsvpMessage = String(formData.get("rsvpMessage") ?? "").trim();
  const finalMessage = String(formData.get("finalMessage") ?? "").trim();
  const pixKey = String(formData.get("pixKey") ?? "").trim();

  if (!groomName || !brideName) {
    return { error: "Os nomes do noivo e da noiva são obrigatórios." };
  }

  let eventAt: Date | null = null;
  if (dateStr) {
    const combined = `${dateStr}T${timeStr || "16:30"}:00-03:00`;
    eventAt = new Date(combined);
    if (isNaN(eventAt.getTime())) {
      return { error: "Data ou horário inválidos." };
    }
  }

  let heroPhotoUrl = String(formData.get("currentHeroPhotoUrl") ?? "").trim();
  const heroFile = formData.get("heroPhoto") as File | null;
  if (heroFile && heroFile.size > 0) {
    try {
      heroPhotoUrl = await saveUploadedFile(heroFile);
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  await db.weddingSettings.update({
    where: { weddingId: wedding.id },
    data: {
      groomName,
      brideName,
      eventAt,
      venueName,
      address,
      mapsUrl,
      dressCode,
      welcomeMessage,
      story,
      rsvpMessage,
      finalMessage,
      pixKey,
      heroPhotoUrl,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function addPhotoToAlbum(formData: FormData) {
  const { wedding } = await requireAdmin();

  const file = formData.get("photo") as File | null;
  const photoUrlInput = String(formData.get("photoUrl") ?? "").trim();

  let finalUrl = photoUrlInput;
  if (file && file.size > 0) {
    try {
      finalUrl = await saveUploadedFile(file);
    } catch {
      return;
    }
  }

  if (!finalUrl) return;

  const count = await db.galleryPhoto.count({
    where: { weddingId: wedding.id },
  });

  await db.galleryPhoto.create({
    data: {
      weddingId: wedding.id,
      url: finalUrl,
      position: count,
      isCover: count === 0, // primeira foto vira capa por padrão se não houver outra
    },
  });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
}

export async function deletePhoto(formData: FormData) {
  const { wedding } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const photo = await db.galleryPhoto.findFirst({
    where: { id, weddingId: wedding.id },
  });
  if (!photo) return;

  await db.galleryPhoto.delete({
    where: { id: photo.id },
  });

  // Se for upload local, tenta apagar do disco
  if (photo.url.startsWith("/uploads/")) {
    try {
      await unlink(join(process.cwd(), "public", photo.url.replace(/^\//, "")));
    } catch {
      // ignora se já não existir no disco
    }
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
}

export async function setCoverPhoto(formData: FormData) {
  const { wedding } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  await db.$transaction([
    db.galleryPhoto.updateMany({
      where: { weddingId: wedding.id },
      data: { isCover: false },
    }),
    db.galleryPhoto.update({
      where: { id },
      data: { isCover: true },
    }),
  ]);

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
}

export async function movePhotoOrder(formData: FormData) {
  const { wedding } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const direction = formData.get("direction") === "up" ? -1 : 1;

  const photos = await db.galleryPhoto.findMany({
    where: { weddingId: wedding.id },
    orderBy: { position: "asc" },
  });

  const currentIndex = photos.findIndex((p) => p.id === id);
  const targetIndex = currentIndex + direction;

  if (currentIndex === -1 || targetIndex < 0 || targetIndex >= photos.length) {
    return;
  }

  const currentPhoto = photos[currentIndex];
  const targetPhoto = photos[targetIndex];

  await db.$transaction([
    db.galleryPhoto.update({
      where: { id: currentPhoto.id },
      data: { position: targetPhoto.position },
    }),
    db.galleryPhoto.update({
      where: { id: targetPhoto.id },
      data: { position: currentPhoto.position },
    }),
  ]);

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
}
