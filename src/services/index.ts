import { AnswerService } from './answer.service';
import { QuizService } from './quiz.service';
import { UserQuizService } from './user-quiz.service';
import { UserService } from './user.service';

export const createServicesContainer = () => {
  const user = new UserService();
  const quiz = new QuizService();
  const userQuiz = new UserQuizService();
  const answer = new AnswerService();

  return Object.freeze({
    user,
    answer,
    quiz,
    userQuiz,
  });
};

export type Services = ReturnType<typeof createServicesContainer>;
