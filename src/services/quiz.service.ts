import { Quiz } from '@prisma/client';
import { StateMachine } from 'fsmoothy';

import { prisma } from '@quiz-bot/prisma';

export enum QuizStatus {
  Active = 'active',
  Inactive = 'inactive',
  Draft = 'draft',
}

export enum QuizEvents {
  Publish = 'publish',
  Unpublish = 'unpublish',
}

export class QuizStatusFSM extends StateMachine<QuizStatus, QuizEvents> {
  constructor(private quiz: Quiz) {
    super({
      initial: quiz.status as QuizStatus,
    });

    this.addTransition(
      QuizStatus.Active,
      QuizEvents.Unpublish,
      QuizStatus.Inactive,
      {
        onExit: this.onUnpublish,
      },
    );

    this.addTransition(
      QuizStatus.Inactive,
      QuizEvents.Publish,
      QuizStatus.Active,
      {
        onExit: this.onPublish,
      },
    );

    this.addTransition(
      QuizStatus.Draft,
      QuizEvents.Publish,
      QuizStatus.Active,
      {
        onExit: this.onPublish,
      },
    );
  }

  async onPublish() {
    await prisma.quiz.update({
      where: {
        id: this.quiz.id,
      },
      data: {
        status: QuizStatus.Active,
      },
    });
  }

  async onUnpublish() {
    await prisma.quiz.update({
      where: {
        id: this.quiz.id,
      },
      data: {
        status: QuizStatus.Inactive,
      },
    });
  }
}

export class QuizService {
  async getAvailableQuizzes() {
    return await prisma.quiz.findMany({
      where: {
        status: QuizStatus.Active,
      },
    });
  }

  async getQuizBySlug(slug: string) {
    return await prisma.quiz.findUnique({
      where: {
        slug,
      },
    });
  }

  async hasUserQuiz(userId: number, quizId: number) {
    const userQuiz = await prisma.userQuiz.findFirst({
      where: {
        userId,
        quizId,
      },
    });

    return Boolean(userQuiz);
  }

  async publish(slug: string) {
    const quiz = await this.getQuizBySlug(slug);

    if (!quiz) {
      throw new Error(`Quiz with slug "${slug}" not found`);
    }

    const fsm = new QuizStatusFSM(quiz);
    return await fsm.publish();
  }

  async unpublish(slug: string) {
    const quiz = await this.getQuizBySlug(slug);

    if (!quiz) {
      throw new Error(`Quiz with slug "${slug}" not found`);
    }

    const fsm = new QuizStatusFSM(quiz);
    return await fsm.unpublish();
  }
}
