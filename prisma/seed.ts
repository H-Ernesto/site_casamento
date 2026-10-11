import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const WELCOME = `Olá, queridos convidados!

É uma alegria imensa poder compartilhar esse momento tão especial com cada um de vocês. Estamos preparando tudo com muito carinho para celebrar o nosso amor ao lado das pessoas que fazem parte da nossa história.

Criamos este cantinho para dividir os detalhes desse dia tão esperado, fiquem à vontade para explorar o nosso site e conferir todas as informações. Será uma alegria ter vocês ao nosso lado para celebrar esse amor!

Com carinho,

Gustavo & Débora`;

const STORY = `Nossa história começou através de uma pessoa muito especial para nós dois. Foi por meio dela que nossos caminhos se cruzaram e, desde então, fomos nos aproximando cada vez mais.

Com paciência, fé e companheirismo, nosso amor foi sendo construído. Entre orações, jantares, cultos, conversas e sorvetes, fomos descobrindo um ao outro e permitindo que esse amor florescesse e crescesse forte.

Hoje, com o coração cheio de gratidão, celebramos a história que Deus nos permitiu construir juntos.`;

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: "GDadmin" } });
  if (existing) {
    console.log("Seed já aplicado.");
    return;
  }

  const user = await prisma.user.create({
    data: {
      username: "GDadmin",
      passwordHash: await bcrypt.hash("12345678", 12),
      mustChangePassword: true,
    },
  });

  const wedding = await prisma.wedding.create({
    data: {
      slug: "gustavo-e-debora",
      ownerId: user.id,
      settings: {
        create: {
          groomName: "Gustavo",
          brideName: "Débora",
          eventAt: new Date("2027-07-03T16:30:00-03:00"),
          welcomeMessage: WELCOME,
          story: STORY,
          rsvpMessage: "Confirme sua presença até breve. Sua resposta é muito importante para nós!",
          finalMessage: "Obrigado por fazer parte da nossa história.",
          heroPhotoUrl: "/images/hero.jpg",
        },
      },
      photos: {
        create: [1, 2, 3, 4, 5].map((n, i) => ({
          url: `/images/gallery/${String(n).padStart(2, "0")}.jpg`,
          position: i,
          isCover: i === 0,
        })),
      },
    },
  });

  console.log("Seed criado para o casamento:", wedding.slug);
}

main().finally(() => prisma.$disconnect());
