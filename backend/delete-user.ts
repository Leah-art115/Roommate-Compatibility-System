import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'jane@gmail.com';

  // Delete User and all related records
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.answer.deleteMany({ where: { userId: user.id } });
    await prisma.roomAllocation.deleteMany({ where: { userId: user.id } });
    await prisma.roomSwitchRequest.deleteMany({ where: { userId: user.id } });
    await prisma.complaint.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log(`✓ Deleted user record for ${email}`);
  } else {
    console.log(`No user record found for ${email}`);
  }

  // Delete Invite (exists whether or not they registered)
  const deleted = await prisma.invite.deleteMany({ where: { email } });
  if (deleted.count > 0) {
    console.log(`✓ Deleted invite record for ${email}`);
  } else {
    console.log(`No invite record found for ${email}`);
  }

  console.log(`✓ Done — ${email} is completely removed`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
