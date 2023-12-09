import { Context } from '../context';

export const isAdmin = (context: Context) => {
  const user = context.session.user;

  if (!user) {
    return false;
  }

  return user.role === 'admin';
};
