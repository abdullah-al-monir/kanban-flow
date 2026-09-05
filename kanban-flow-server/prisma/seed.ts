import { PrismaClient, BoardRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', passwordHash, fullName: 'Alice Kim' },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { email: 'bob@example.com', passwordHash, fullName: 'Bob Nguyen' },
  });

  const existingBoard = await prisma.board.findFirst({ where: { title: 'Product Launch Q1' } });
  if (existingBoard) {
    console.log('Seed data already present, skipping.');
    return;
  }

  const board = await prisma.board.create({
    data: {
      title: 'Product Launch Q1',
      description: 'Everything needed to ship the Q1 release.',
      ownerId: alice.id,
      members: {
        create: [
          { userId: alice.id, role: BoardRole.OWNER },
          { userId: bob.id, role: BoardRole.EDITOR },
        ],
      },
      columns: {
        create: [
          {
            title: 'To Do',
            position: 1000,
            tasks: {
              create: [
                { title: 'Draft launch announcement', position: 1000, creatorId: alice.id },
                { title: 'Finalize pricing page', position: 2000, creatorId: alice.id, assigneeId: bob.id },
              ],
            },
          },
          {
            title: 'In Progress',
            position: 2000,
            tasks: {
              create: [{ title: 'Build onboarding flow', position: 1000, creatorId: bob.id, assigneeId: bob.id }],
            },
          },
          { title: 'Done', position: 3000, tasks: { create: [] } },
        ],
      },
    },
  });

  console.log(`Seeded board "${board.title}" with users alice@example.com / bob@example.com (password: Password123!)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
