```ts
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // ============================================
  // DEFAULT ADMIN
  // ============================================

  const newAdminPassword = "Rocks-123";

  let admin = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  if (!admin) {
    const passwordHash = await bcrypt.hash(newAdminPassword, 12);

    admin = await prisma.user.create({
      data: {
        email: "admin@example.com",
        username: "admin",
        displayName: "Admin",
        passwordHash,
        role: "ADMIN",
        creditScore: 1000,
        profile: {
          create: {
            bio: "Platform administrator",
          },
        },
        wallet: {
          create: {},
        },
      },
    });

    console.log("Created default admin:", admin.email);
  } else {
    // Update password for existing admin
    const passwordHash = await bcrypt.hash(newAdminPassword, 12);

    admin = await prisma.user.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        role: "ADMIN",
      },
    });

    console.log("Updated admin password:", admin.email);
  }

  // ============================================
  // DEFAULT REFERRAL CODE
  // ============================================

  const code = await prisma.referralCode.upsert({
    where: {
      code: "LOVEBIRDS",
    },
    update: {
      createdById: admin.id,
    },
    create: {
      code: "LOVEBIRDS",
      maxUses: 1000,
      createdById: admin.id,
    },
  });

  console.log("Default referral code ready:", code.code);
}

main()
  .catch((e) => {
    console.error("Defaults setup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```
