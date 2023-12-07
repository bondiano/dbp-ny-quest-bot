import { ScenesComposer } from 'grammy-scenes';

import { Context } from './context';
import { onboardingScene } from './features';

export const scenes = new ScenesComposer<Context>(onboardingScene);
