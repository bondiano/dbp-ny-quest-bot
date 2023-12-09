import { prisma } from '@quiz-bot/prisma';

export interface SaveUserAnswerDto {
  questionId: number;
  userId: number;
  isCorrect: boolean;
  answer: string;
}

export class AnswerService {
  async saveUserAnswer({
    questionId,
    userId,
    isCorrect,
    answer,
  }: SaveUserAnswerDto) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastAnswerAt: new Date(),
        answers: {
          create: {
            isCorrect,
            answer,
            question: {
              connect: {
                id: questionId,
              },
            },
          },
        },
      },
    });
  }
}
