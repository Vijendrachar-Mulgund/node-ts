#!/usr/bin/env node
"useStrict";
import { detectFromUserAgent } from "./utils/user-agent.ts";
import { getArguments } from "./utils/arguments.ts";
import { createNodeProject } from "./index.ts";

try {
  // Capture the package manager that the user is using and use it throughout the process
  const userAgent: string | null = detectFromUserAgent();
  const projectName: string | undefined = getArguments()[0];
  createNodeProject(userAgent, projectName);
} catch (err: any) {
  console.error(err?.message);
  process.exit(1);
}
