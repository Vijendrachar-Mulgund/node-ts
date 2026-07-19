import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";
import { getExecCommand, getInstallCommand } from "./utils/user-agent.ts";
import { replaceJsonKey } from "./utils/json-file.ts";
import { createFile } from "./utils/file.ts";

export async function createNodeProject(userAgent: string | null, projectName: string = ""): Promise<void> {
  try {
    if (!userAgent || !projectName) {
      console.log("[ERROR] Please enter the command in the proper order. Example: npm node-ts <project_name>");
      return;
    }

    execSync(`mkdir ${projectName} && (cd ${projectName} && ${userAgent} init -y)`, { stdio: "inherit" });
    console.log("Project file created and package.json initialized");

    if (userAgent === "pnpm") {
      writeFileSync(join(projectName, "pnpm-workspace.yaml"), "allowBuilds:\n  esbuild: true\n");
    }

    const installCmd = `${userAgent} ${getInstallCommand(userAgent)} -D @types/node tsx typescript`;
    console.log("Installing dependencies!", `(cd ${projectName} && ${installCmd})`);
    execSync(`(cd ${projectName} && ${installCmd})`, { stdio: "inherit" });
    console.log("Dependencies installed! 🚀");

    console.log("Initializing Typescript");
    // The `--` stops the package manager from parsing `--init` as its own flag;
    // `npm exec tsc --init` (no separator) silently swallows it and never writes tsconfig.json.
    execSync(`(cd ${projectName} && ${userAgent} ${getExecCommand(userAgent)} -- tsc --init)`, { stdio: "inherit" });
    console.log("Typescript initialized!");

    // Update the package.json files
    await replaceJsonKey(`${join(projectName, "package.json")}`, "scripts", "scripts", {
      dev: "tsx watch src/main.ts",
      build: "tsc",
      start: "node dist/main.js",
    });

    // Update the TS config file
    await replaceJsonKey(`${join(projectName, "tsconfig.json")}`, "compilerOptions", "compilerOptions", {
      // File Layout
      rootDir: "./src",
      outDir: "./dist",

      // Environment Settings
      target: "esnext",
      module: "nodenext",
      types: ["node"],

      // Other Outputs
      sourceMap: true,
      declaration: true,
      declarationMap: true,

      // Stricter Typechecking Options
      noUncheckedIndexedAccess: true,
      exactOptionalPropertyTypes: true,

      // Recommended Options
      strict: true,
      jsx: "react-jsx",
      verbatimModuleSyntax: true,
      isolatedModules: true,
      noUncheckedSideEffectImports: true,
      esModuleInterop: true,
      moduleDetection: "force",
      skipLibCheck: true,
    });

    // Update the TS config file
    await replaceJsonKey(`${projectName}/tsconfig.json`, "", "include", ["src/**/*"]);

    // Create new files and folders
    await createFile(
      `${projectName}/src/main.ts`,

      `
      class Main {
        public static main(): void {
          console.log("Hello Node TS!");
        }
      }
      Main.main();
      `,
    );

    console.log("All files updated! 📜");
  } catch (error: any) {
    console.error("An error Occurred: ", error?.message ?? error);
  }
}
