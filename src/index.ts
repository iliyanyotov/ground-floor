import { join } from 'node:path';

export type GreetingOptions = {
  name: string;
  greeting?: string;
};

export const greet = ({
  name,
  greeting = 'Hello',
}: GreetingOptions): string => {
  return `${greeting}, ${name}!`;
};

export const readPackageJson = async (cwd: string): Promise<string> => {
  return Bun.file(join(cwd, 'package.json')).text();
};
