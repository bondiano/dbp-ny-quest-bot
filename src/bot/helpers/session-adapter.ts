import { type StorageAdapter } from 'grammy';

import { prisma } from '@quiz-bot/prisma';

export class PrismaAdapter<T> implements StorageAdapter<T> {
  async read(key: string) {
    const session = await prisma.session.findUnique({ where: { key } });

    return session?.value ? (JSON.parse(session.value) as T) : undefined;
  }

  async write(key: string, data: T) {
    const value = JSON.stringify(data);

    await prisma.session.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async delete(key: string) {
    await prisma.session.delete({ where: { key } }).catch((error) => {
      // Record does not exist in database
      if (error?.code === 'P2025') {
        return;
      }
      throw error;
    });
  }
}
