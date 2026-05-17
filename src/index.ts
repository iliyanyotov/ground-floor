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

export const readPackageJson = (cwd: string): Promise<string> => {
  return Bun.file(`${cwd}/package.json`).text();
};
