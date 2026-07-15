import { execSync } from "child_process";

export function createNodeProject(userAgent: string | null, projectName: string = ""): void {
  if (!userAgent || !projectName) {
    console.log("[ERROR] Please enter the command in the proper order. Example: npm node-ts <project_name>");
    return;
  }

  execSync(`mkdir ${projectName} && (cd ${projectName} && ${userAgent} init -y)`);
  console.log("Project file created");
}
