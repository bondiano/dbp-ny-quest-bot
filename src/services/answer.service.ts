import { prisma } from '@quiz-bot/prisma.js';

export interface SaveUserAnswerDto {
  questionId: number;
  userId: number;
  isCorrect: boolean;
  answer: string;
}

export class AnswerService {
  saveUserAnswer({ questionId, userId, isCorrect, answer }: SaveUserAnswerDto) {
    return prisma.user.update({
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

  async isCorrectAnswer(questionId: number, answer: string) {
    const normalizedAnswer = answer.toLowerCase().trim();

    const question = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    return question?.answer.toLowerCase().trim() === normalizedAnswer;
  }
}
