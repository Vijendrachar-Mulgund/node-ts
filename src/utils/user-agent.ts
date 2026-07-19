export function detectFromUserAgent(): "npm" | "yarn" | "pnpm" | "bun" | null {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("yarn")) return "yarn";
  if (ua.startsWith("npm")) return "npm";
  return null;
}

export function getInstallCommand(userAgent: string | null) {
  if (!userAgent) return;
  switch (userAgent) {
    case "pnpm":
    case "yarn":
      return "add";
    case "npm":
      return "install";
    default:
      return null;
  }
}

export function getExecCommand(userAgent: string | null) {
  if (!userAgent) return;

  switch (userAgent) {
    case "pnpm":
    case "yarn":
    case "npm":
      return "exec";
    default:
      return null;
  }
}
