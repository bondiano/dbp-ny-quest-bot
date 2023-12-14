export const br2nl = (string_: string) =>
  string_.trim().replaceAll(/<br\s*\/?>/gm, '\n');
