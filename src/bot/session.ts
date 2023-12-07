import { User } from '@prisma/client';
import { ScenesSessionData } from 'grammy-scenes';

export interface SessionData extends ScenesSessionData {
  user: User | null;
}

export const initialSessionData = (): SessionData => ({
  user: null,
  scenes: {
    stack: [],
  },
});
