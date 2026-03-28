import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'superadmin@roommate.com' },
  });

  if (existing) {
    console.log('Super admin already exists, skipping...');
    return;
  }

  const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@roommate.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Super admin created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
