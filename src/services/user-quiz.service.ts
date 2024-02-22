import { StateMachine } from '@fsmoothy/core';
import { UserQuiz } from '@prisma/client';
import _ from 'lodash';

import { prisma } from '@quiz-bot/prisma.js';

import { QuestionStatus } from './question.service.js';

export enum UserQuizStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum UserQuizEvents {
  Start = 'start',
  Stop = 'stop',
}

export class UserQuizStatusFSM extends StateMachine<
  UserQuizStatus,
  UserQuizEvents
> {
  constructor(private userQuiz: UserQuiz) {
    super({
      initial: userQuiz.status as UserQuizStatus,
    });

    this.addTransition(
      UserQuizStatus.Inactive,
      UserQuizEvents.Start,
      UserQuizStatus.Active,
      {
        onExit: this.onStart,
      },
    );

    this.addTransition(
      UserQuizStatus.Active,
      UserQuizEvents.Stop,
      UserQuizStatus.Inactive,
      {
        onExit: this.onStop,
      },
    );
  }

  async onStart() {
    await prisma.userQuiz.update({
      where: {
        id: this.userQuiz.id,
      },
      data: {
        status: UserQuizStatus.Active,
      },
    });
  }

  async onStop() {
    await prisma.userQuiz.update({
      where: {
        id: this.userQuiz.id,
      },
      data: {
        status: UserQuizStatus.Inactive,
      },
    });
  }
}

export class UserQuizService {
  async getById(id: number) {
    return await prisma.userQuiz.findUnique({
      where: {
        id,
      },
    });
  }

  async getQuestion(quizId: number) {
    return await prisma.userQuiz.findFirst({
      where: {
        quizId,
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    medias: {
                      include: {
                        media: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: {
          include: {
            answers: true,
          },
        },
      },
    });
  }

  async start(quizId: number, userId: number) {
    const userQuiz = await prisma.userQuiz.create({
      data: {
        quizId,
        userId,
        status: UserQuizStatus.Inactive,
      },
    });

    const userQuizFSM = new UserQuizStatusFSM(userQuiz);

    await userQuizFSM.start();

    return userQuiz;
  }

  async stop(quizId: number, userId: number) {
    const userQuiz = await prisma.userQuiz.findFirst({
      where: {
        quizId,
        userId,
      },
    });

    if (!userQuiz) {
      throw new Error('User quiz not found');
    }

    const userQuizFSM = new UserQuizStatusFSM(userQuiz);

    await userQuizFSM.stop();
  }

  async getByUserIdAndQuizId(userId: number, quizId: number) {
    return await prisma.userQuiz.findFirst({
      where: {
        userId,
        quizId,
        status: UserQuizStatus.Active,
      },
    });
  }

  async getNextQuestion(userQuizId: number) {
    const userQuiz = await prisma.userQuiz.findUnique({
      where: {
        id: userQuizId,
        quiz: {
          questions: {
            some: {
              question: {
                status: QuestionStatus.Active,
              },
            },
          },
        },
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    medias: {
                      include: {
                        media: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!userQuiz) {
      return null;
    }

    const { quiz, user } = userQuiz;

    const notAnsweredQuestions = quiz.questions.filter(
      (question) =>
        !user.answers.some(
          (answer) => answer.questionId === question.id && answer.isCorrect,
        ),
    );

    if (notAnsweredQuestions.length === 0) {
      return null;
    }

    const sortedQuestions = _.sortBy(notAnsweredQuestions, 'order');

    return sortedQuestions.at(0) ?? null;
  }

  async getLeaderboard(quizId: number, userId: number) {
    const leaderboard = await prisma.userQuiz.findMany({
      where: {
        quizId,
        status: UserQuizStatus.Active,
      },
      include: {
        user: {
          include: {
            answers: true,
          },
        },
      },
    });

    const leaderBoardWithoutAdmin = leaderboard.filter(
      (userQuiz) => userQuiz.user.role !== 'admin',
    );

    const sortedLeaderboard = _.sortBy(leaderBoardWithoutAdmin, (userQuiz) => {
      const user = userQuiz.user;

      const correctAnswersCount = user.answers.filter(
        (answer) => answer.isCorrect,
      ).length;

      const answersDates = user.answers.map((answer) => answer.createdAt);

      const lastAnswerAt = _.max(answersDates) ?? new Date();

      return correctAnswersCount * 1_000_000_000_000 - lastAnswerAt.getTime();
    })
      .reverse()
      .map((userQuiz) => {
        const user = userQuiz.user;

        const correctAnswersCount = user.answers.filter(
          (answer) => answer.isCorrect,
        ).length;

        return {
          userId: user.id,
          slackName: user.slackName,
          correctAnswersCount,
        };
      });

    const userQuizIndex = sortedLeaderboard.findIndex(
      (userQuiz) => userQuiz.userId === userId,
    );

    if (userQuizIndex === -1) {
      return {
        leaderboard: sortedLeaderboard,
        user: null,
      };
    }

    const user = {
      index: userQuizIndex,
      correctAnswersCount: sortedLeaderboard[userQuizIndex].correctAnswersCount,
    };

    return {
      leaderboard: sortedLeaderboard,
      user,
    };
  }
}
