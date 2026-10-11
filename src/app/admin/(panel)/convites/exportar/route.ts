import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { TYPE_LABEL, type InvitationType } from "@/lib/rules";

export async function GET() {
  const { wedding } = await requireAdmin();

  const invitations = await db.invitation.findMany({
    where: { weddingId: wedding.id },
    include: {
      rsvp: true,
      favorAnswers: {
        include: {
          question: true,
        },
      },
    },
    orderBy: { displayName: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistema de Casamento";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Convidados");

  worksheet.columns = [
    { header: "Nome do convite", key: "displayName", width: 30 },
    { header: "Tipo", key: "type", width: 22 },
    { header: "Limite", key: "maxGuests", width: 10 },
    { header: "Adultos", key: "adults", width: 10 },
    { header: "Crianças", key: "children", width: 10 },
    { header: "Total", key: "total", width: 10 },
    { header: "Status", key: "status", width: 16 },
    { header: "Qtd. Lembrancinhas", key: "favorCount", width: 18 },
    { header: "Respostas das Lembrancinhas", key: "favorAnswers", width: 45 },
    { header: "Arquivado", key: "archived", width: 12 },
  ];

  // Estilizando o cabeçalho
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
  };

  for (const inv of invitations) {
    const isConfirmed = inv.rsvp?.status === "CONFIRMED";
    const isDeclined = inv.rsvp?.status === "DECLINED";
    const adults = isConfirmed ? inv.rsvp!.adults : 0;
    const children = isConfirmed ? inv.rsvp!.children : 0;
    const total = isConfirmed ? adults + children : 0;

    let statusText = "Não respondeu";
    if (isConfirmed) statusText = inv.rsvp?.changed ? "Confirmado (alterado)" : "Confirmado";
    if (isDeclined) statusText = "Recusado";

    const answersText = inv.favorAnswers
      .map((a) => `[Item ${a.itemIndex}] ${a.question.label}: ${a.value}`)
      .join(" | ");

    worksheet.addRow({
      displayName: inv.displayName,
      type: TYPE_LABEL[inv.type as InvitationType] ?? inv.type,
      maxGuests: inv.maxGuests,
      adults: isConfirmed ? adults : "–",
      children: isConfirmed ? children : "–",
      total: isConfirmed ? total : "–",
      status: statusText,
      favorCount: inv.favorCount,
      favorAnswers: answersText || "–",
      archived: inv.archivedAt ? "Sim" : "Não",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="convidados-${wedding.slug}.xlsx"`,
    },
  });
}
