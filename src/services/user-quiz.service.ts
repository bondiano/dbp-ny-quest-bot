import { UserQuiz } from '@prisma/client';
import { StateMachine } from 'fsmoothy';
import _ from 'lodash';

import { prisma } from '@quiz-bot/prisma';

import { QuestionStatus } from './question.service';

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

  async getUserQuizByUserIdAndQuizId(userId: number, quizId: number) {
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
                question: true,
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
      throw new Error(`User quiz with id ${userQuizId} not found`);
    }

    const { quiz, user } = userQuiz;

    const notAnsweredQuestions = quiz.questions.filter(
      (question) =>
        !user.answers.some((answer) => answer.questionId === question.id),
    );

    if (notAnsweredQuestions.length === 0) {
      return null;
    }

    const sortedQuestions = _.sortBy(notAnsweredQuestions, 'order');

    return sortedQuestions.at(0) ?? null;
  }
}
