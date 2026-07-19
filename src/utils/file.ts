import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Create a file and write plain-text contents to it.
 *
 * Any missing parent directories are created first, so a nested path like
 * `my-app/src/main.ts` works without a separate mkdir step. By default an
 * existing file is left untouched; pass `overwrite: true` to replace it.
 */
export async function createFile(
  filePath: string,
  contents: string = "",
  { overwrite = false }: { overwrite?: boolean } = {},
): Promise<void> {
  try {
    // Ensure the parent directory exists before writing.
    await mkdir(dirname(filePath), { recursive: true });

    // `wx` fails if the file already exists; `w` truncates and overwrites.
    await writeFile(filePath, contents, { encoding: "utf8", flag: overwrite ? "w" : "wx" });
    console.log(`Created file: ${filePath}`);
  } catch (error: any) {
    if (error?.code === "EEXIST") {
      console.log(`File already exists, skipping: ${filePath}`);
      return;
    }
    console.error("Error creating the file:", error?.message ?? error);
  }
}
