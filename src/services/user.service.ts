import { User } from '@prisma/client';

import { prisma } from '@quiz-bot/prisma';

export class UserService {
  async getUserInfo(telegramId: string) {
    return await prisma.user.findUnique({
      where: {
        telegramId,
      },
    });
  }

  async createUser(telegramId: string, email: string) {
    return await prisma.user.create({
      data: {
        telegramId,
        email,
      },
    });
  }

  async updateUser(userId: number, data: Partial<User>) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data,
    });
  }
}
