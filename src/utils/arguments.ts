export function getArguments(): string[] {
  const args = process.argv.slice(2);
  return args;
}
