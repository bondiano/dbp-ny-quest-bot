import { Question, Quiz, UserQuiz } from '@prisma/client';
import { Composer } from 'grammy';
import { Scene } from 'grammy-scenes';
import _ from 'lodash';

import { chatAction } from '@grammyjs/auto-chat-action';

import { Context } from '@quiz-bot/bot/context.js';
import { logHandle } from '@quiz-bot/bot/helpers/logging.js';
import { br2nl } from '@quiz-bot/utils.js';

import { quizData } from '../callback-data/quiz.js';
import {
  QuizKeyboardOptions,
  createUserQuizKeyboard,
} from '../keyboards/user-quiz.js';
import { scenes } from '../scenes.js';

export const UserQuizzesScene = 'user-quizzes';

const composer = new Composer<Context>();

const feature = composer.chatType('private');

export interface UserQuizzesSceneState {
  quiz: Quiz;
  userQuiz?: UserQuiz | null;
  question?: Question | null;
}

const userQuizScene = new Scene<Context, UserQuizzesSceneState>(
  UserQuizzesScene,
);
scenes.scene(userQuizScene);

userQuizScene.always().do(chatAction('typing'));

feature.lazy(async (context) => {
  const quizzes = await context.services.quiz.getAvailableQuizzes();

  const slugs = quizzes.map((quiz) => quiz.slug);
  const quizCommands = slugs.map((slug) => `quiz_${slug}`);

  const quizComposer = new Composer<Context>();

  quizComposer.command(
    quizCommands,
    logHandle('command-quiz'),
    chatAction('typing'),
    async (context) => {
      const slug = context.message!.text!.replace('/quiz_', '');

      const quiz = await context.services.quiz.getQuizBySlug(slug);

      if (!quiz) {
        await context.reply(context.t('quiz.not-found'));
        return;
      }

      await context.scenes.enter(UserQuizzesScene, {
        quiz,
      });
    },
  );

  return quizComposer;
});

userQuizScene.step(async (context) => {
  const { quiz } = context.scene.arg as UserQuizzesSceneState;
  context.scene.session = { quiz };

  if (!context.session.user) {
    await context.reply(context.t('quiz.not-found'));
    return;
  }

  const userQuiz = await context.services.userQuiz.getByUserIdAndQuizId(
    context.session.user.id,
    quiz!.id,
  );

  return await context.reply(quiz.description, {
    reply_markup: await createUserQuizKeyboard(context, userQuiz),
  });
});

userQuizScene
  .wait('command')
  .callbackQuery(
    quizData.filter(),
    logHandle('keyboard-quiz-select'),
    async (context) => {
      const { quiz } = context.scene.session;

      const { option } = quizData.unpack(context.callbackQuery.data);

      switch (option) {
        case QuizKeyboardOptions.Start: {
          context.scene.session.userQuiz =
            await context.services.userQuiz.start(
              quiz.id,
              context.session.user!.id,
            );
          break;
        }
        case QuizKeyboardOptions.Stop: {
          await context.services.userQuiz.stop(
            quiz.id,
            context.session.user!.id,
          );
          await context.scene.exit();
          break;
        }
        case QuizKeyboardOptions.Continue: {
          const userQuiz = await context.services.userQuiz.getByUserIdAndQuizId(
            context.session.user!.id,
            quiz.id,
          );

          context.scene.session.userQuiz = userQuiz;
          break;
        }
        case QuizKeyboardOptions.Leaderboard: {
          const leaderboard = await context.services.userQuiz.getLeaderboard(
            quiz.id,
            context.session.user!.id,
          );

          const leaderboardText = leaderboard.leaderboard
            .map((board, index) => {
              return `${index + 1}. <b>${board.slackName}</b> - ${
                board.correctAnswersCount
              }`;
            })
            .splice(0, 10);

          if (leaderboard.user && leaderboard.user.index > 10) {
            leaderboardText.push(
              `... ${leaderboard.user.index + 1}. ${
                context.session.user!.slackName
              } - ${leaderboard.user.correctAnswersCount}`,
            );
          }

          await context.editMessageText(quiz.description);
          await context.reply(leaderboardText.join('\n'));
          await context.scene.exit();

          return;
        }
      }

      await context.editMessageText(quiz.description);
      context.scene.resume();
    },
  );

userQuizScene.label('next-question');

userQuizScene.step(async (context) => {
  const { userQuiz } = context.scene.session;

  if (!userQuiz) {
    await context.reply(context.t('quiz.not-found'));
    await context.scene.exit();
    return;
  }

  const nextQuestion = await context.services.userQuiz.getNextQuestion(
    userQuiz.id,
  );

  if (!nextQuestion) {
    await context.reply(context.t('question.new-not-found'));
    await context.scene.exit();
    return;
  }

  context.scene.session.question = nextQuestion.question;

  const questionText = br2nl(nextQuestion.question.text);

  const { medias } = nextQuestion.question;
  if (!_.isEmpty(medias)) {
    const mediaGroup = medias.map(({ media }) => ({
      media: media.telegramMediaId,
      type: media.telegramMediaType as 'photo' | 'video',
    }));

    await context.replyWithMediaGroup(mediaGroup);
  }

  await context.reply(
    context.t('question.next', {
      question: questionText,
    }),
  );
});

userQuizScene.wait('answer').on('message', async (context) => {
  const { userQuiz, question } = context.scene.session;

  if (!userQuiz || !question) {
    await context.reply(context.t('quiz.not-found'));
    await context.scene.exit();
    return;
  }

  const isCorrect = await context.services.answer.isCorrectAnswer(
    question.id,
    context.message!.text!,
  );

  await context.services.answer.saveUserAnswer({
    questionId: question.id,
    userId: context.session.user!.id,
    isCorrect,
    answer: context.message!.text!,
  });

  if (!isCorrect) {
    await context.reply(context.t('answer.incorrect'));
    return;
  }

  await context.reply(context.t('answer.correct'));

  const nextQuestion = await context.services.userQuiz.getNextQuestion(
    userQuiz.id,
  );

  if (!nextQuestion) {
    await context.reply(context.t('question.new-not-found'));
    return context.scene.exit();
  }

  context.scene.goto('next-question');
});

export { composer as userQuizzesFeature };
