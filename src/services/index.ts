import { UserService } from './user.service';

export const createServicesContainer = () => {
  const user = new UserService();

  return Object.freeze({
    user,
  });
};

export type Services = ReturnType<typeof createServicesContainer>;
