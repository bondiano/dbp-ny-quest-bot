import { QuizService } from './quiz.service';
import { UserService } from './user.service';

export const createServicesContainer = () => {
  const user = new UserService();
  const quiz = new QuizService();

  return Object.freeze({
    user,
    quiz,
  });
};

export type Services = ReturnType<typeof createServicesContainer>;
