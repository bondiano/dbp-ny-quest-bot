import { prisma } from '@quiz-bot/prisma.js';

export interface SaveMediaDataDto {
  type: string;
  mediaId: string;
}

export class MediaService {
  async saveMedia(mediaDto: SaveMediaDataDto) {
    return await prisma.media.create({
      data: {
        telegramMediaId: mediaDto.mediaId,
        telegramMediaType: mediaDto.type,
      },
    });
  }

  getMediaById(id: number) {
    return prisma.media.findUnique({
      where: {
        id,
      },
    });
  }

  getMediaByTelegramId(telegramMediaId: string) {
    return prisma.media.findUnique({
      where: {
        telegramMediaId,
      },
    });
  }
}
