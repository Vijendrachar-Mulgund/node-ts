import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";
import { getExecCommand, getInstallCommand } from "./utils/user-agent.ts";

export function createNodeProject(userAgent: string | null, projectName: string = ""): void {
  try {
    if (!userAgent || !projectName) {
      console.log("[ERROR] Please enter the command in the proper order. Example: npm node-ts <project_name>");
      return;
    }

    execSync(`mkdir ${projectName} && (cd ${projectName} && ${userAgent} init -y)`, { stdio: "inherit" });
    console.log("Project file created and package.json initialized");

    // pnpm (v10+) does not run dependency build scripts by default and exits with
    // code 1 (ERR_PNPM_IGNORED_BUILDS) when it skips one. tsx pulls in esbuild,
    // which ships a build script, so pre-approve it or the install below "fails"
    // even though the packages installed fine. package.json's `pnpm` field is
    // ignored in v11, so the setting has to live in pnpm-workspace.yaml.
    if (userAgent === "pnpm") {
      writeFileSync(join(projectName, "pnpm-workspace.yaml"), "allowBuilds:\n  esbuild: true\n");
    }

    const installCmd = `${userAgent} ${getInstallCommand(userAgent)} -D @types/node tsx typescript`;
    console.log("Installing dependencies!", `(cd ${projectName} && ${installCmd})`);
    execSync(`(cd ${projectName} && ${installCmd})`, { stdio: "inherit" });

    console.log("Initializing Typescript");
    execSync(`(cd ${projectName} && ${userAgent} ${getExecCommand(userAgent)} tsc --init)`, { stdio: "inherit" });
    console.log("Typescript initialized!");

    // Update the Tsconfig file and package.json files
    console.log("Dependencies installed!");
  } catch (error: any) {
    console.error("An error Occurred: ", error?.message ?? error);
  }
}
